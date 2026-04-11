import asyncHandler from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { Notification } from "../models/notifications.js";
import * as notificationService from "../services/notificationService.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  // important fix: role + user filter
  const query = {
    user: userId,
    receiverRole: role.toLowerCase(), // student | teacher | admin
  };

  // Optional: Admin specific filtering
  if (role === "Admin") {
    query.type = { $in: ["request", "approval", "deadline"] };
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 });

  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.markAsRead(id, userId);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await notificationService.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

export const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.deleteNotification(id, userId);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});
