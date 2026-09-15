import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createTaskSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).required().messages({
      "string.empty": "Task title is required",
      "string.min": "Task title must be at least 2 characters",
      "string.max": "Task title cannot exceed 200 characters",
      "any.required": "Task title is required",
    }),

    description: Joi.string().trim().max(5000).allow("").default("").messages({
      "string.max": "Description cannot exceed 5000 characters",
    }),

    project: objectId.required().messages({
      "any.required": "Project ID is required",
    }),

    workspace: objectId.required().messages({
      "any.required": "Workspace ID is required",
    }),

    assignedTo: objectId.allow(null).default(null),

    status: Joi.string()
      .valid("todo", "in-progress", "in-review", "completed")
      .default("todo"),

    priority: Joi.string()
      .valid("low", "medium", "high", "urgent")
      .default("medium"),

    dueDate: Joi.date().iso().allow(null).default(null),

    tags: Joi.array().items(Joi.string().trim().max(50)).default([]),
  }).required(),
});

export const updateTaskSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),

  body: Joi.object({
    title: Joi.string().trim().min(2).max(200),

    description: Joi.string().trim().max(5000).allow(""),

    assignedTo: objectId.allow(null),

    status: Joi.string().valid("todo", "in-progress", "in-review", "completed"),

    priority: Joi.string().valid("low", "medium", "high", "urgent"),

    dueDate: Joi.date().iso().allow(null),

    tags: Joi.array().items(Joi.string().trim().max(50)),

    attachments: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          publicId: Joi.string().required(),
          originalName: Joi.string().required(),
          mimeType: Joi.string().required(),
          size: Joi.number().positive().required(),
        }),
      )
      .max(5),
  })
    .min(1)
    .required(),
});

export const assignTaskSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),

  body: Joi.object({
    assignedTo: objectId.allow(null).required().messages({
      "any.required": "Assigned user ID is required",
    }),
  }).required(),
});

export const updateTaskStatusSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),

  body: Joi.object({
    status: Joi.string()
      .valid("todo", "in-progress", "in-review", "completed")
      .required()
      .messages({
        "any.only": "Invalid task status",
        "any.required": "Task status is required",
      }),
  }).required(),
});
export const deleteTaskAttachmentSchema = Joi.object({
  params: Joi.object({
    taskId: objectId.required().messages({
      "any.required": "Task ID is required",
    }),

    attachmentId: objectId.required().messages({
      "any.required": "Attachment ID is required",
    }),
  }).required(),
});

export const taskIdSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }).required(),
});
