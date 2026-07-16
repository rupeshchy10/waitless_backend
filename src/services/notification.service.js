import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import {
    formatMultipleNotificationOutputs,
    formatNotificationOutput,
} from "../utils/formatNepalOutput.js";

// GET MY NOTIFICATIONS
const getMyNotificationsService = async (userId) => {
    const [notifications, unreadCount] = await prisma.$transaction([
        prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        }),
    ]);

    return {
        unreadCount,
        totalNotifications: notifications.length,
        notifications: formatMultipleNotificationOutputs(notifications),
    };
};

// 2. GET NOTIFICATION BY NOTIFICATION ID
const getNotificationByIdService = async (notificationId, userId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return formatNotificationOutput(notification);
};

// 3. MARK ONE NOTIFICATION AS READ
const markNotificationAsReadService = async (notificationId, userId) => {
    // Find notification
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    // Already read?
    if (notification.isRead) {
        throw new ApiError(409, "Notification is already marked as read");
    }

    // Update
    const updatedNotification = await prisma.notification.update({
        where: {
            id: notification.id,
        },
        data: {
            isRead: true,
        },
    });

    return formatNotificationOutput(updatedNotification);
};

// 4. MARK ALL NOTIFICATIONS AS READ
const markAllNotificationsAsReadService = async (userId) => {
    const unreadCount = await prisma.notification.count({
        where: {
            userId,
            isRead: false,
        },
    });

    if (unreadCount === 0) {
        throw new ApiError(404, "No unread notifications found");
    }

    const updatedNotifications = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });

    return {
        updatedCount: updatedNotifications.count,
    };
};

// 5. DELETE ONE NOTIFICATION
const deleteNotificationService = async (notificationId, userId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    // Delete notification
    const deletedNotification = await prisma.notification.delete({
        where: {
            id: notification.id,
        },
    });

    return formatNotificationOutput(deletedNotification);
};

// 6. DELETE ALL NOTIFICATIONS
const deleteAllNotificationsService = async (userId) => {
    const deletedNotifications = await prisma.notification.deleteMany({
        where: {
            userId,
        },
    });

    if (deletedNotifications.count === 0) {
        throw new ApiError(404, "No notifications found");
    }

    return {
        deletedCount: deletedNotifications.count,
    };
};

export {
    getMyNotificationsService,
    getNotificationByIdService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteNotificationService,
    deleteAllNotificationsService,
};
