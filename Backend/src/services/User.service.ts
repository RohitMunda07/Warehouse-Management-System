import { UserModel } from "../models/User.model.js";
import ApiError from "../utils/apiError.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/index.js";
import { FindOptions, UserFilter } from "../interfaces/index.js";

/* -------------------------------------------------------------------------- */
/*                          USER SERVICE                                    */
/* -------------------------------------------------------------------------- */

export class UserService {
    /**
     * Get user by email
     */
    static async getUserByEmail(email: string) {
        try {
            const user = await UserModel.findOne({ email });
            return user;
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(id: string) {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND, [], "");
            }
            return user;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Get all users
     */
    static async getAllUsers(filter: UserFilter = {}, options: FindOptions = {}) {
        try {
            const query: any = {};

            if (filter.status) query.status = filter.status;
            if (filter.role) query.role = filter.role;

            const skip = options.skip || 0;
            const limit = options.limit || 10;
            const sort = options.sort || { createdAt: -1 };

            const users = await UserModel
                .find(query)
                .select("-password -refreshToken")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await UserModel.countDocuments(query);

            return {
                success: true,
                data: users,
                pagination: {
                    skip,
                    limit,
                    total,
                },
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Update user profile
     */
    static async updateUserProfile(id: string, updateData: any) {
        try {
            // Don't allow updating sensitive fields
            const forbiddenFields = ["password", "refreshToken", "role", "status"];
            forbiddenFields.forEach((field) => {
                delete updateData[field];
            });

            const user = await UserModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select("-password -refreshToken");

            if (!user) {
                throw new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND, [], "");
            }

            return {
                success: true,
                data: user,
                message: SUCCESS_MESSAGES.PROFILE_UPDATED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Check if user exists by email/phone
     */
    static async checkUserExists(email?: string, phone?: string) {
        try {
            const query: any = { $or: [] };

            if (email) query.$or.push({ email });
            if (phone) query.$or.push({ phone });

            if (query.$or.length === 0) {
                return null;
            }

            const user = await UserModel.findOne(query);
            return user;
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Verify user password
     */
    static async verifyPassword(user: any, password: string) {
        try {
            return await user.isPasswordCorrect(password);
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }
}
