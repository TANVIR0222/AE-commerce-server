import { Router } from "express";
import { forgotPassword, getSingleUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUseDeatils, verifyForgotPasswordOTP,  } from "../controller/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/update-information/:id').put(updateUseDeatils)
router.route('/single-user/:id').get(getSingleUser)
router.route('/forgot-password').put(forgotPassword)
router.route('/verify-forgot-password-otp').put(verifyForgotPasswordOTP)

// secured routes
router.route('/logout').post( verifyToken ,logoutUser)
router.route('/refresh-token').post( refreshAccessToken )

export default router;