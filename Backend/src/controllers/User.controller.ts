import { UserModel } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { UserZodSchema, LoginZodSchema, PasswordChangeSchema } from "../validators/user.schema.js"
import jwt from "jsonwebtoken"

// declared accessTokenOptions & refreshTokenOptions globally for usage in every needed scenario
// maxAge is used for longer mortality of tokens. now the cookie won't die when browser closes. (Sufficient for users)

const accessTokenOptions = {
    httpOnly: true, // Cookies with httpOnly are safe
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 3 * 60 * 60 * 1000 // accessToken expiry duration
}

const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // refreshToken expiry duration
}

const generateAccessAndRefreshTokens = async (userId: string) => {

    // Initially, used to authorize user
    // renew tokens for longer duration

    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found", [], "")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        if (error instanceof ApiError) throw error
        throw new ApiError(500, "Something went wrong while generating access & refresh tokens", [], "")
    }
}

// POST /users/register
const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation by required property - should not be empty
    // check if user exists or not: email / phone / username
    // create user object & entries in database
    // remove password & refreshToken field from response
    // return response
    console.log(req.body)
    const parsed = UserZodSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error?.issues[0]?.message || "Validation failed", [], "")
    }

    const { email, phone, username } = parsed.data

    // Checks email/phone AND username — username is unique on the model
    // too, so a duplicate username used to skip this clean check entirely
    // and crash into a raw MongoDB E11000 error instead of a friendly 409.
    const existedUser = await UserModel.findOne({
        $or: [{ email }, { phone }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email, phone, or username already exists", [], "")
    }

    const filteredData = Object.fromEntries(
        Object.entries(parsed.data).filter(([_, value]) => value !== undefined)
    )

    const createdUser = await UserModel.create(filteredData)

    // .create() throws on failure rather than resolving falsy, so a
    // post-hoc `if (!createdUser)` check here would be unreachable dead
    // code. The model's own toJSON/toObject transform already strips
    // password/refreshToken/emailVerificationToken/resetPasswordOTP/
    // resetPasswordOTPExpiry, so no manual destructuring is needed either.
    const userResponse = createdUser.toObject()

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                userResponse,
                "User registered successfully"
            )
        )

})

// POST /users/login
const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    // email or phone
    // user validation
    // password check
    // access and refresh token
    // send cookie

    const parsed = LoginZodSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed", [], "")
    }

    const { email, phone, password } = parsed.data

    const orConditions = []
    if (email) orConditions.push({ email })
    if (phone) orConditions.push({ phone })

    // `password` has `select: false` on the model — without explicitly
    // re-selecting it here, `user.password` is undefined and
    // isPasswordCorrect() below fails for every login attempt, valid or not.
    const user = await UserModel.findOne({
        $or: orConditions
    }).select("+password")

    if (!user) {
        throw new ApiError(401, "Invalid credentials", [], "")
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "Invalid User Credentials", [], "")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString())

    const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken
                },
                "User logged in successfully"
            )
        )
})

// POST /users/logout
const logoutUser = asyncHandler(async (req, res) => {

    // $unset: {refreshToken} is used to remove the field from document

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", accessTokenOptions)
        .clearCookie("refreshToken", refreshTokenOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// POST /users/refresh-token
const refreshAccessToken = asyncHandler(async (req, res) => {

    // validation for refreshToken before expiry
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request", [], "")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as jwt.JwtPayload

        // `refreshToken` has `select: false` too — same bug as password
        // above. Without this, user.refreshToken is always undefined, so
        // the comparison below rejects every valid refresh token.
        const user = await UserModel.findById(decodedToken?._id).select("+refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token", [], "")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used", [], "")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString())

        return res
            .status(200)
            .cookie("accessToken", accessToken, accessTokenOptions)
            .cookie("refreshToken", refreshToken, refreshTokenOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        // Preserve the original ApiError (status code + message) instead of
        // flattening everything to a generic 401 — mirrors the pattern
        // already used in generateAccessAndRefreshTokens above.
        if (error instanceof ApiError) throw error
        throw new ApiError(401, (error as Error)?.message || "Invalid refresh token", [], "")
    }
})

// POST /users/change-password
const changeCurrentPassword = asyncHandler(async (req, res) => {

    const parsed = PasswordChangeSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message, [], "")
    }

    const { oldPassword, newPassword } = parsed.data

    // Same select: false issue as login — without this, isPasswordCorrect
    // always fails and nobody can ever change their password.
    const user = await UserModel.findById(req.user?._id).select("+password")

    if (!user) {
        throw new ApiError(404, "User not found", [], "")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password", [], "")
    }

    const isSamePassword = await user.isPasswordCorrect(newPassword)
    if (isSamePassword) {
        throw new ApiError(400, "New password cannot be same as old password", [], "")
    }

    // Now, bcrypt will do its job automatically so validation won't work after hashing

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

// GET /users/me
const getCurrentUser = asyncHandler(async (req, res) => {

    // current user details for UI
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

// PATCH /users/me
const updateAccountDetails = asyncHandler(async (req, res) => {

    // Was manual truthiness checks with no format validation — "not-an-email"
    // used to sail straight through. Reuse the same field-level rules as
    // registration instead of duplicating ad-hoc checks.
    const parsed = UserZodSchema.pick({ fullname: true, email: true, phone: true }).safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed", [], "")
    }

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const { fullname, email, phone } = parsed.data

    // $ne excludes the current user from the duplicate check
    const existingUser = await UserModel.findOne({
        $or: [{ email }, { phone }],
        _id: { $ne: req.user._id }
    })

    if (existingUser) {
        throw new ApiError(409, "Email or phone already in use", [], "")
    }

    const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email,
                phone
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))

})

// GET /users
const getAllUsers = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(403, "Unauthorized Request", [], "")
    }

    const users = await UserModel.find().sort({ createdAt: -1 })

    if (users.length === 0) {
        throw new ApiError(400, "No users found", [], "")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, users, "Fetch all all the users successfully")
        )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getAllUsers
}