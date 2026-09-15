import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const getActivitiesSchema = Joi.object({
  query: Joi.object({
    workspace: objectId,

    project: objectId,

    task: objectId,

    user: objectId,

    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),
  }).required(),
});

export const activityIdSchema = Joi.object({
  params: Joi.object({
    id: objectId.required().messages({
      "any.required": "Activity ID is required",

      "string.length": "Invalid activity ID",

      "string.hex": "Invalid activity ID",
    }),
  }).required(),
});
