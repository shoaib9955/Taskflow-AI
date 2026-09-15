import Joi from "joi";

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
    }),

    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .max(100)
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email",
        "string.max": "Email cannot exceed 100 characters",
        "any.required": "Email is required",
      }),

    password: Joi.string().min(8).max(128).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 128 characters",
      "any.required": "Password is required",
    }),
  }).required(),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),

    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  }).required(),
});

export const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
      "any.required": "Current password is required",
    }),

    newPassword: Joi.string().min(8).max(128).required().messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 8 characters",
      "string.max": "New password cannot exceed 128 characters",
      "any.required": "New password is required",
    }),
  }).required(),
});
