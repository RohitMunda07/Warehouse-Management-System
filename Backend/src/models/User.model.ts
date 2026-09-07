import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";

/* -------------------------------------------------------------------------- */
/*                                   ENUMS                                    */
/* -------------------------------------------------------------------------- */

export enum UserRole {
    USER = "user",
    ADMIN = "admin"
}

export enum UserStatus {
    PENDING = "pending",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    BLOCKED = "blocked"
}

/* -------------------------------------------------------------------------- */
/*                                 INTERFACE                                  */
/* -------------------------------------------------------------------------- */

export interface UserDocument extends Document {
    fullname: string;
    email: string;
    password: string;
    phone: string;

    avatar: {
        url: string;
        publicId: string;
    };

    company?: string;
    designation?: string;
    website?: string;
    bio?: string;

    role: UserRole;
    status: UserStatus;

    isVerified: boolean;
    isActive: boolean;

    refreshToken: string | null;

    emailVerificationToken: string | null;

    resetPasswordOTP: string | null;
    resetPasswordOTPExpiry: Date | null;

    lastLogin: Date | null;
    lastSeen: Date | null;
    loginCount: number;

    isPasswordCorrect(password: string): Promise<boolean>;

    generateAccessToken(): string;

    generateRefreshToken(): string;
}

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */

const UserDbSchema = new Schema<UserDocument>(
    {
        fullname: {
            type: String,
            trim: true,
            required: [true, "Full name is required"],
            index: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
            required: [true, "Email is required"]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false
        },

        phone: {
            type: String,
            unique: true,
            required: [true, "Phone number is required"]
        },

        avatar: {
            url: {
                type: String,
                default: ""
            },

            publicId: {
                type: String,
                default: ""
            }
        },

        company: {
            type: String,
            trim: true,
            default: ""
        },

        designation: {
            type: String,
            trim: true,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER
        },

        status: {
            type: String,
            enum: Object.values(UserStatus),
            default: UserStatus.PENDING
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        refreshToken: {
            type: String,
            default: null,
            select: false
        },

        emailVerificationToken: {
            type: String,
            default: null,
            select: false
        },

        resetPasswordOTP: {
            type: String,
            default: null,
            select: false
        },

        resetPasswordOTPExpiry: {
            type: Date,
            default: null,
            select: false
        },

        lastLogin: {
            type: Date,
            default: null
        },

        lastSeen: {
            type: Date,
            default: null
        },

        loginCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/* -------------------------------------------------------------------------- */
/*                                  INDEXES                                   */
/* -------------------------------------------------------------------------- */

UserDbSchema.index({
    fullname: "text",
    company: "text"
});

/* -------------------------------------------------------------------------- */
/*                               PRE SAVE HOOK                                */
/* -------------------------------------------------------------------------- */

UserDbSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

/* -------------------------------------------------------------------------- */
/*                              INSTANCE METHODS                              */
/* -------------------------------------------------------------------------- */

UserDbSchema.methods.isPasswordCorrect = async function (
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

UserDbSchema.methods.generateAccessToken = function (): string {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!accessTokenSecret) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined.");
    }

    const options: SignOptions = {
        expiresIn:
            (process.env.ACCESS_TOKEN_EXPIRY as StringValue) || "15m"
    };

    return jwt.sign(
        {
            _id: this._id,
            fullname: this.fullname,
            email: this.email,
            role: this.role
        },
        accessTokenSecret,
        options
    );
};

UserDbSchema.methods.generateRefreshToken = function (): string {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!refreshTokenSecret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined.");
    }

    const options: SignOptions = {
        expiresIn:
            (process.env.REFRESH_TOKEN_EXPIRY as StringValue) || "7d"
    };

    return jwt.sign(
        {
            _id: this._id
        },
        refreshTokenSecret,
        options
    );
};

/* -------------------------------------------------------------------------- */
/*                              JSON TRANSFORM                                */
/* -------------------------------------------------------------------------- */

UserDbSchema.set("toJSON", {
    virtuals: true,
    transform: (_, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.emailVerificationToken;
        delete ret.resetPasswordOTP;
        delete ret.resetPasswordOTPExpiry;
        delete ret.__v;

        return ret;
    }
});

UserDbSchema.set("toObject", {
    virtuals: true,
    transform: (_, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.emailVerificationToken;
        delete ret.resetPasswordOTP;
        delete ret.resetPasswordOTPExpiry;
        delete ret.__v;

        return ret;
    }
});

/* -------------------------------------------------------------------------- */
/*                                  MODEL                                    */
/* -------------------------------------------------------------------------- */

export const UserModel = mongoose.model<UserDocument>(
    "UserModel",
    UserDbSchema
);

// Drop old username index if it exists
UserModel.collection.dropIndex("username_1").catch(() => {
    // Index doesn't exist, that's fine
});