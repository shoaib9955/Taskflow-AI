import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const notificationIdSchema = Joi.object({
  params: Joi.object({
    id: objectId.required().messages({
      "any.required": "Notification ID is required",
      "string.length": "Invalid notification ID",
      "string.hex": "Invalid notification ID",
    }),
  }).required(),
});
