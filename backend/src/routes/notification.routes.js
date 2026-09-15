import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { notificationIdSchema } from "../validations/notification.validation.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);

router.patch(
  "/:id/read",
  validate(notificationIdSchema),
  markNotificationAsRead,
);

router.patch("/read-all", markAllNotificationsAsRead);

router.delete("/:id", validate(notificationIdSchema), deleteNotification);

export default router;
