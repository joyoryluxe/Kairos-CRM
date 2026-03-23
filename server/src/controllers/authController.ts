import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import crypto from "crypto";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";

// ─── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "manager", "sales_rep", "viewer"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const body = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: body.email });
  if (existing) {
    res.status(409).json({ success: false, message: "Email already in use" });
    return;
  }

  const user = await User.create(body);
  const token = signToken({ id: user._id.toString(), role: user.role });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const body = loginSchema.parse(req.body);

  const user = await User.findOne({ email: body.email }).select("+password");
  if (!user || !(await user.comparePassword(body.password))) {
    res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
    return;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ id: user._id.toString(), role: user.role });

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (
  req: Request & { user?: { id: string } },
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  res.json({ success: true, user });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (
  req: Request & { user?: { id: string } },
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  if (req.body.password) {
    if (req.body.password.length < 8) {
      res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
      return;
    }
    user.password = req.body.password;
  }

  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  if (!req.body.email) {
    res.status(400).json({ success: false, message: "Please provide an email" });
    return;
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).json({ success: false, message: "No user found with that email" });
    return;
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // For development, we return the token in the API response.
  res.status(200).json({
    success: true,
    message: "Reset token generated successfully.",
    resetToken,
  });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    return;
  }

  if (!req.body.password || req.body.password.length < 8) {
    res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    return;
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = signToken({ id: user._id.toString(), role: user.role });

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
