import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getAllUsers,
    updateAccountDetails,
} from "../controllers/User.controller.js"

const router = Router()

router.route("/users/register").post(registerUser)
router.route("/users/login").post(loginUser)
router.route("/users/logout").post(verifyJWT, logoutUser)
router.route("/users").get(verifyJWT, getAllUsers)
router.route("/users/refresh-token").post(refreshAccessToken)
router.route("/users/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/users/me").get(verifyJWT, getCurrentUser)
router.route("/users/me").patch(verifyJWT, updateAccountDetails)

export default router;