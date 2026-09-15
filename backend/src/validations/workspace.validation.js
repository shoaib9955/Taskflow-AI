import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createWorkspaceSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Workspace name is required",
      "string.min": "Workspace name must be at least 2 characters",
      "string.max": "Workspace name cannot exceed 100 characters",
      "any.required": "Workspace name is required",
    }),

    description: Joi.string().trim().max(500).allow("").default("").messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
  }).required(),
});

export const updateWorkspaceSchema = Joi.object({
  params: Joi.object({
    id: objectId.required().messages({
      "string.length": "Invalid workspace ID",
      "string.hex": "Invalid workspace ID",
      "any.required": "Workspace ID is required",
    }),
  }).required(),

  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).messages({
      "string.min": "Workspace name must be at least 2 characters",
      "string.max": "Workspace name cannot exceed 100 characters",
    }),

    description: Joi.string().trim().max(500).allow("").messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
  })
    .min(1)
    .required(),
});

export const workspaceIdSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),
});

export const memberSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
    userId: objectId.required(),
  }).required(),

  body: Joi.object({
    role: Joi.string().valid("admin", "manager", "member").required().messages({
      "any.only": "Role must be admin, manager, or member",
      "any.required": "Role is required",
    }),
  }).required(),
});

export const addMemberSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),

  body: Joi.object({
    userId: objectId.required().messages({
      "any.required": "User ID is required",
    }),

    role: Joi.string().valid("admin", "manager", "member").default("member"),
  }).required(),
});
