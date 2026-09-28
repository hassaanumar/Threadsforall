import asyncHandler from "express-async-handler";
import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";

// @desc   Log an admin in
// @route  POST /api/auth/login
// @access Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email?.toLowerCase() });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc   Get the logged-in admin's profile
// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.admin);
});
