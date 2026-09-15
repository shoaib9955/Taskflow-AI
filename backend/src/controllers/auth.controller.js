import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  res.cookie("token", result.token, cookieOptions);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: result.user },
        "User registered successfully",
      ),
    );
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  res.cookie("token", result.token, cookieOptions);

  res
    .status(200)
    .json(new ApiResponse(200, { user: result.user }, "Login successful"));
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", cookieOptions);

  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});
