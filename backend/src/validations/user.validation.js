import Joi from "joi";

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
    }),

    email: Joi.string().trim().lowercase().email().max(100).messages({
      "string.email": "Please provide a valid email",
      "string.max": "Email cannot exceed 100 characters",
    }),
  })
    .min(1)
    .required(),
});
