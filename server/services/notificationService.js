import { Notification } from "../models/notifications.js";
import { User } from "../models/user.js";

//create notification
export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

//single user notify
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

// multiple users notify
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

// notify all admins
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

// get notifications
export const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 }); // latest first
};

// mark one
export const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true },
  );
};

// mark all
export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
};

// delete one
export const deleteNotification = async (notificationId, userId) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
};
