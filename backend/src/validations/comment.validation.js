import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createCommentSchema = Joi.object({
  body: Joi.object({
    task: objectId.required().messages({
      "any.required": "Task ID is required",
      "string.length": "Invalid task ID",
      "string.hex": "Invalid task ID",
    }),

    content: Joi.string().trim().min(1).max(2000).required().messages({
      "string.empty": "Comment content is required",
      "string.min": "Comment cannot be empty",
      "string.max": "Comment cannot exceed 2000 characters",
      "any.required": "Comment content is required",
    }),
  }).required(),
});

export const getCommentsSchema = Joi.object({
  params: Joi.object({
    taskId: objectId.required().messages({
      "any.required": "Task ID is required",
      "string.length": "Invalid task ID",
      "string.hex": "Invalid task ID",
    }),
  }).required(),
});

export const updateCommentSchema = Joi.object({
  params: Joi.object({
    id: objectId.required().messages({
      "any.required": "Comment ID is required",
      "string.length": "Invalid comment ID",
      "string.hex": "Invalid comment ID",
    }),
  }).required(),

  body: Joi.object({
    content: Joi.string().trim().min(1).max(2000).required().messages({
      "string.empty": "Comment content is required",
      "string.min": "Comment cannot be empty",
      "string.max": "Comment cannot exceed 2000 characters",
      "any.required": "Comment content is required",
    }),
  }).required(),
});

export const commentIdSchema = Joi.object({
  params: Joi.object({
    id: objectId.required().messages({
      "any.required": "Comment ID is required",
      "string.length": "Invalid comment ID",
      "string.hex": "Invalid comment ID",
    }),
  }).required(),
});
