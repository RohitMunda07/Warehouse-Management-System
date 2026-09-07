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

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", verifyJWT, logoutUser)
router.get("/", verifyJWT, getAllUsers)
router.post("/refresh-token", refreshAccessToken)
router.post("/change-password", verifyJWT, changeCurrentPassword)
router.get("/me", verifyJWT, getCurrentUser)
router.patch("/me", verifyJWT, updateAccountDetails)

export default router;