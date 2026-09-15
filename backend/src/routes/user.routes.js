import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
} from "../controllers/user.controller.js";

import protect from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import { updateProfileSchema } from "../validations/user.validation.js";

import { changePasswordSchema } from "../validations/auth.validation.js";

import { uploadSingle } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);

router.patch("/profile", validate(updateProfileSchema), updateProfile);

router.patch(
  "/change-password",
  validate(changePasswordSchema),
  changePassword,
);

router.patch("/avatar", uploadSingle("avatar"), updateAvatar);

export default router;
