import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification as deleteNotificationService,
} from "../services/notification.service.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await getUserNotifications({
    userId: req.user._id,
    ...req.query,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await markAllAsRead(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, result, "All notifications marked as read"));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await deleteNotificationService(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully"));
});
