import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const generateTaskSchema = Joi.object({
  body: Joi.object({
    projectId: objectId.required().messages({
      "any.required": "Project ID is required",
      "string.length": "Invalid project ID",
      "string.hex": "Invalid project ID",
    }),

    requirement: Joi.string().trim().min(10).max(5000).required().messages({
      "string.empty": "Requirement is required",
      "string.min": "Requirement must be at least 10 characters",
      "string.max": "Requirement cannot exceed 5000 characters",
      "any.required": "Requirement is required",
    }),
  }).required(),
});

export const generateTaskDescriptionSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).required().messages({
      "string.empty": "Task title is required",
      "string.min": "Task title must be at least 2 characters",
      "string.max": "Task title cannot exceed 200 characters",
      "any.required": "Task title is required",
    }),

    projectId: objectId.required().messages({
      "any.required": "Project ID is required",
      "string.length": "Invalid project ID",
      "string.hex": "Invalid project ID",
    }),
  }).required(),
});

export const summarizeProjectSchema = Joi.object({
  body: Joi.object({
    projectId: objectId.required().messages({
      "any.required": "Project ID is required",
      "string.length": "Invalid project ID",
      "string.hex": "Invalid project ID",
    }),
  }).required(),
});

export const meetingNotesToTasksSchema = Joi.object({
  body: Joi.object({
    projectId: objectId.required().messages({
      "any.required": "Project ID is required",
      "string.length": "Invalid project ID",
      "string.hex": "Invalid project ID",
    }),

    notes: Joi.string().trim().min(20).max(10000).required().messages({
      "string.empty": "Meeting notes are required",
      "string.min": "Meeting notes must be at least 20 characters",
      "string.max": "Meeting notes cannot exceed 10000 characters",
      "any.required": "Meeting notes are required",
    }),
  }).required(),
});

export const projectAssistantSchema = Joi.object({
  body: Joi.object({
    projectId: objectId.required().messages({
      "any.required": "Project ID is required",
      "string.length": "Invalid project ID",
      "string.hex": "Invalid project ID",
    }),

    question: Joi.string().trim().min(2).max(5000).required().messages({
      "string.empty": "Question is required",
      "string.min": "Question must be at least 2 characters",
      "string.max": "Question cannot exceed 5000 characters",
      "any.required": "Question is required",
    }),
  }).required(),
});
