import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createProjectSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Project name is required",
      "string.min": "Project name must be at least 2 characters",
      "string.max": "Project name cannot exceed 100 characters",
      "any.required": "Project name is required",
    }),

    description: Joi.string().trim().max(2000).allow("").default("").messages({
      "string.max": "Description cannot exceed 2000 characters",
    }),

    workspace: objectId.required().messages({
      "any.required": "Workspace ID is required",
    }),

    members: Joi.array().items(objectId).default([]),

    status: Joi.string()
      .valid("planning", "active", "on-hold", "completed", "archived")
      .default("planning"),

    priority: Joi.string()
      .valid("low", "medium", "high", "urgent")
      .default("medium"),

    startDate: Joi.date().iso().allow(null).default(null),

    dueDate: Joi.date().iso().allow(null).default(null),
  }).required(),
});

export const updateProjectSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),

  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),

    description: Joi.string().trim().max(2000).allow(""),

    members: Joi.array().items(objectId),

    status: Joi.string().valid(
      "planning",
      "active",
      "on-hold",
      "completed",
      "archived",
    ),

    priority: Joi.string().valid("low", "medium", "high", "urgent"),

    startDate: Joi.date().iso().allow(null),

    dueDate: Joi.date().iso().allow(null),

    isArchived: Joi.boolean(),
  })
    .min(1)
    .required(),
});

export const projectIdSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),
});
