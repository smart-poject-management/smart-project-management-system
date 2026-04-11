import { Notification } from "../models/notifications.js";
import { User } from "../models/user.js";

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

export const notifyUser = async (
  userId,
  message,
  type = "general",
  link = null,
  priority = "low",
  sender = null,
  receiverRole = "student",
) => {
  return await createNotification({
    user: userId,
    message,
    type,
    link,
    priority,
    sender,
    receiverRole,
  });
};

export const notifyMultipleUsers = async (
  userIds,
  message,
  type = "general",
  link = null,
  priority = "low",
  sender = null,
  receiverRole = "student",
) => {
  const notifications = userIds.map((id) => ({
    user: id,
    message,
    type,
    link,
    priority,
    sender,
    receiverRole,
  }));

  return await Notification.insertMany(notifications);
};

export const notifyAllAdmins = async (
  message,
  type = "request",
  link = null,
  priority = "medium",
  sender = null,
) => {
  const admins = await User.find({ role: "Admin" }).select("_id").lean();

  if (!admins.length) return [];

  return Promise.all(
    admins.map((a) =>
      createNotification({
        user: a._id,
        message,
        type,
        link,
        priority,
        sender,
        receiverRole: "admin",
      }),
    ),
  );
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 }); // latest first
};

export const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true },
  );
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
};

export const deleteNotification = async (notificationId, userId) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
};
