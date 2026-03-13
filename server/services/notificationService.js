import { Notification } from '../models/notifications.js';

export const createNotification = async (notificationData) => {
    const notication = new Notification(notificationData);
    return await notication.save();
};

export const notifyUser = async (
    userId,
    message,
    type = "general",
    link = null,
    priority = "low"
) => {
    return await createNotification({
        user: userId,
        message,
        type,
        link,
        priority
    });
};