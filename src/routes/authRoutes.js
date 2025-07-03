import express from 'express';
import {
  register,
  verifyRegistrationOtp,
  login,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleRegister,
} from '../controllers/AuthController.js'
import passport from 'passport';
import '../config/passport.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { subresetPassword, supforgotPassword, suplogin, supregister, verifyEmail } from '../controllers/SupplierAuthController.js';
dotenv.config();

const router = express.Router();

/* ---- Local ---- */
router.post('/register', register);
router.post('/verifyRegister_Otp', verifyRegistrationOtp);
router.post('/resent_Otp', resendOtp);
router.post('/forgot_Password', forgotPassword);
router.post('/reset_Password', resetPassword);
router.post('/login', login);
// router.post('/login', login);
router.post("/googleAuth",googleLogin)
router.post("/googleAuth_register",googleRegister)

// Suplier Api 
router.post('/sup_register', supregister);
router.post('/sup_login', suplogin);
router.post('/sup_forgot_Password', supforgotPassword);
router.post('/sup_reset_Password', subresetPassword);
router.post('/Verify_Email', verifyEmail);














export default router;
