import SupplierRegistration from "../models/Supplier.js";
import Counter from "../models/Counter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";
import generateToken from "../utils/token.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const supregister = async (req, res) => {
  try {
    const { email, password, number } = req.body;

    const existingUser = await SupplierRegistration.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Increment and fetch the next userId
    const counter = await Counter.findOneAndUpdate(
      { name: "userId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    // Generate 6-digit OTP and hash it
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await SupplierRegistration.create({
      userId: counter.value,
      role: "Supplier",
      email,
      password,
      number,
      otpCode: hashedOtp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP to user's email
    await sendEmail(
      email,
      "OTP Verification",
      `Hello ,\n\nYour OTP code is: ${otp}\nThis code will expire in 10 minutes.`
    );

    res
      .status(201)
      .json({ message: "OTP sent to your email for verification" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const suplogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("email, password", email, password);
  try {
    const user = await SupplierRegistration.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    // if (!user.isEmailVerified) {
    //   return res.status(401).json({ message: 'Please verify your email to log in.' });
    // }

    if (!user.isEmailVerified) {
      // Generate token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      // Hash the token before saving
      const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
      user.otpCode = hashedToken;
      user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();
      // Send email with verification link
      const verifyUrl = `http://localhost:5173/verify-email?token=${verificationToken}&email=${user.email}`;

      // Example email sending function
      // await sendEmail({
      //   to: email,
      //   subject: "Verify your email",
      //   html: `<p>Please click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
      // });
      await sendEmail(
        user.email,
        "Verify your email",
        `Verify your email using this link: ${verifyUrl}`
      );

      return res.status(401).json({
        message:
          "Please verify your email. A new verification link has been sent to your email.",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        message:
          'This account is registered via Google. Please use "Sign in with Google" to log in.',
      });
    }
    if (user.authProvider !== "local")
      return res
        .status(400)
        .json({ message: `Use ${user.authProvider} to log in` });
    const ok = await bcrypt.compare(password, user.password);
    console.log(ok, "okyy");
    if (!ok) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, user: user });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({ message: "Server error" });
  }
};
export const supforgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await SupplierRegistration.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ message: "There is no acount found with this email" });

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 2 * 60 * 1000;
  await user.save();
  console.log("useremail", user.email);

  const resetLink = `${process.env.FRONTEND_URL}/reset_Password/${token}`;
  console.log("resetLink", resetLink);
  await sendEmail(
    user.email,
    "Reset Password",
    `Reset your password using this link: ${resetLink}`
  );

  res.status(200).json({ message: "Reset link sent if account exists" });
};
export const subresetPassword = async (req, res) => {
  const { password, token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is missing" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await SupplierRegistration.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};
export const verifyEmail = async (req, res) => {
  const { token, email } = req.body;
  try {
    const user = await SupplierRegistration.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    if (user.otpCode !== hashedToken || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.isEmailVerified = true;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();
    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", err });
  }
};
