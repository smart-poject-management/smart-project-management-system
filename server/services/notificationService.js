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
  entityId = null,
  entityType = "system",
) => {
  return await createNotification({
    user: userId,
    message,
    type,
    link,
    priority,
    sender,
    receiverRole,
    entityId,
    entityType,
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
  referenceId = null,
) => {
  const notifications = userIds.map((id) => ({
    user: id,
    message,
    type,
    link,
    priority,
    sender,
    receiverRole,
    referenceId,
  }));

  return await Notification.insertMany(notifications);
};

export const notifyAllAdmins = async (
  message,
  type = "request",
  link = null,
  priority = "medium",
  sender = null,
  entityId = null, // 🔥 FIX
  entityType = "system",
) => {
  const admins = await User.find({ role: "Admin" }).select("_id").lean();

  if (!admins.length) return [];

  return await Promise.all(
    admins.map((admin) =>
      createNotification({
        user: admin._id,
        message,
        type,
        link,
        priority,
        sender,
        receiverRole: "admin",
        entityId, // ✅ IMPORTANT
        entityType,
      }),
    ),
  );
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("sender", "name email")
    .populate("entityId", "name email");
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
