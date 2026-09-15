import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  relatedTask = null,
  relatedProject = null,
  relatedWorkspace = null,
}) => {
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    relatedTask,
    relatedProject,
    relatedWorkspace,
  });

  return notification;
};

export const getUserNotifications = async ({
  userId,
  page,
  limit,
  unreadOnly = false,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);

  const currentLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (currentPage - 1) * currentLimit;

  const filter = {
    recipient: userId,
  };

  if (unreadOnly === true || unreadOnly === "true") {
    filter.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate("sender", "name email avatar")
      .populate("relatedTask", "title status")
      .populate("relatedProject", "name status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();
  }

  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};
