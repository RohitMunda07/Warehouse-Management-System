import { asyncHandler, ApiError } from "../utils/modules.js";
import jwt from "jsonwebtoken"
import { UserModel } from "../models/User.model.js"

export const verifyJWT = asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload

    const user = await UserModel.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(401, "Invalid Access Token", [], "")
    }

    req.user = user
    next()
})
