
import UserRegistration from '../models/User.js';
import Counter from '../models/Counter.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { OAuth2Client } from "google-auth-library";
import generateToken from '../utils/token.js';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  try {
    const { name, email, password, number, location } = req.body;

    const existingUser = await UserRegistration.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Increment and fetch the next userId
    const counter = await Counter.findOneAndUpdate(
      { name: 'userId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    // Generate 6-digit OTP and hash it
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await UserRegistration.create({
      userId: counter.value,
      name,
      email,
      password,
      number,
      location,
      otpCode: hashedOtp,
      otpExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send OTP to user's email
    await sendEmail(
      email,
      'OTP Verification',
      `Hello ${name},\n\nYour OTP code is: ${otp}\nThis code will expire in 10 minutes.`
    );

    res.status(201).json({ message: 'OTP sent to your email for verification' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


/* -------- Local Login -------- */
 export const login = async (req, res) => {
   const { email, password } = req.body;  
   console.log("email, password",email, password)
   try {
     const user = await UserRegistration.findOne({ email });
     console.log("newuser",user)
     if (!user) return res.status(400).json({ message: 'User not found' })
      if (!user.isEmailVerified) {
        return res.status(401).json({ message: 'Please verify your email to log in.' });
      }
      if (user.authProvider === 'google') {
        return res.status(400).json({
          message: 'This account is registered via Google. Please use "Sign in with Google" to log in.',
        });
      }
     if (user.authProvider !== 'local')
       return res.status(400).json({ message: `Use ${user.authProvider} to log in` })
     const ok = await bcrypt.compare(password, user.password);
     if (!ok) return res.status(400).json({ message: 'Wrong password' })
     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ token, user: user });
   } catch (err) {
     res.status(500).json({ message: 'Server error' });
   }
 };


 export const verifyRegistrationOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await UserRegistration.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email or OTP' });

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  if (
    user.otpCode !== hashedOtp ||
    !user.otpExpire ||
    user.otpExpire < Date.now()
  ) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpire = undefined;
  user.otpVerified = true;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
};



export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserRegistration.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP and hash
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(newOtp).digest('hex');

    user.otpCode = hashedOtp;
    user.otpExpire = Date.now() + 2 * 60 * 1000;
    await user.save();

    // Send new OTP
    await sendEmail(
      email,
      'Your New OTP Code',
      `Your new OTP code is: ${newOtp}\nThis code will expire in 10 minutes.`
    );

    res.status(200).json({ message: 'OTP has been resent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//  forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await UserRegistration.findOne({ email });
  if (!user) return res.status(400).json({ message: 'There is no acount found with this email' });

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 2 * 60 * 1000; 
  await user.save();
  console.log("useremail",user.email)

  const resetLink = `${process.env.FRONTEND_URL}/reset_Password/${token}`;
  console.log("resetLink",resetLink)
  await sendEmail(user.email, 'Reset Password', `Reset your password using this link: ${resetLink}`);

  res.status(200).json({ message: 'Reset link sent if account exists' });
};


export const resetPassword = async (req, res) => {
  const { password, token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is missing" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserRegistration.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};

export const googleLogin = async (req, res) => {
  const { googleId, email, name } = req.body;

  // Find user by email
  console.log("googleId, email, name ",googleId, email, name )

  let user = await UserRegistration.findOne({ email });
console.log("userrrr",user)
  // If user doesn't exist
  if (!user) {
    return res.status(400).json({ message: "You need to register first using Google!" });
  }

  // If user exists but wasn't registered via Google
  if (user.authProvider !== 'google') {
    return res.status(400).json({ message: "This email is registered using email/password. Please login that way." });
  }

  const token = generateToken(user._id); // ✅ Pass only user ID
  res.json({
    message: "Login successful",
    token,
    user,
  });
};


export const googleRegister = async (req, res) => {
  const { googleId, email, name } = req.body;

  let user = await UserRegistration.findOne({ email });

  if (user) {
    return res.status(400).json({ message: "User already exists. Please log in." });
  }

  const counterDoc = await Counter.findOneAndUpdate(
    { name: 'userId' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  user = new UserRegistration({
    userId: counterDoc.value,
    isEmailVerified:true,
    email,
    name,
    authProvider: 'google',
    googleId,
  });

  await user.save();

  const token = generateToken(user._id);

  res.status(201).json({
    message: "User registered successfully",
    token,
    user,
  });
};


