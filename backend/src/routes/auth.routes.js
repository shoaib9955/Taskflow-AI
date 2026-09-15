import express from "express";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";

import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
const router = express.Router();

router.post("/register", authRateLimiter, validate(registerSchema), register);

router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/logout", protect, logout);

router.get("/me", protect, getMe);

export default router;
