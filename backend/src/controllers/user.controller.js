import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import User from "../models/User.js";

import bcrypt from "bcryptjs";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/upload.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new ApiError(409, "Email is already registered");
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from current password",
    );
  }

  user.password = await bcrypt.hash(newPassword, 12);

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

export const updateAvatar = asyncHandler(async (req, res) => {

  if (!req.file) {
    throw new ApiError(400, "Please select an avatar image");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const result = await uploadToCloudinary(req.file, "taskflow-ai/avatars");

  const newAvatarUrl = result.secure_url;

  if (user.avatar) {
    try {
      const oldPublicId = extractCloudinaryPublicId(user.avatar);

      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
    }
  }

  user.avatar = newAvatarUrl;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const extractCloudinaryPublicId = (url) => {
  try {
    const parsedUrl = new URL(url);

    const parts = parsedUrl.pathname.split("/");

    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    let publicIdParts = parts.slice(uploadIndex + 1);

    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    const publicId = publicIdParts.join("/");

    return publicId.replace(/\.[^/.]+$/, "");
  } catch (error) {
    return null;
  }
};
