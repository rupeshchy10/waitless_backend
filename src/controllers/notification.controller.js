import * as notificationService from "../services/notification.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. GET MY NOTIFICATION
const getMyNotifications = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const notifications =
        await notificationService.getMyNotificationsService(id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notifications,
                "Notification fetched successfully"
            )
        );
});

// 2. GET NOTIFICATION BY NOTIFICATION ID (USER IS ONLY ABLE TO READ THEIR OWN NOTIFICATIONS)
const getNotificationById = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const { id: userId } = req.user;

    const notification = await notificationService.getNotificationByIdService(
        notificationId,
        userId
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notification,
                "Notification fetched successfully"
            )
        );
});

// 3. MARK ONE NOTIFICATION AS READ
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { notificationId } = req.params;

    const notification =
        await notificationService.markNotificationAsReadService(
            notificationId,
            userId
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notification,
                "Notification marked as read successfully"
            )
        );
});

// 4. MARK ALL NOTIFICATIONS AS READ
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;

    const result =
        await notificationService.markAllNotificationsAsReadService(userId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "All notifications marked as read successfully"
            )
        );
});

// 5. DELETE ONE NOTIFICATION
const deleteNotification = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { notificationId } = req.params;

    const notification = await notificationService.deleteNotificationService(
        notificationId,
        userId
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notification,
                "Notification deleted successfully"
            )
        );
});

// 6. DELETE ALL NOTIFICATIONS
const deleteAllNotifications = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;

    const result =
        await notificationService.deleteAllNotificationsService(userId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "All notifications deleted successfully"
            )
        );
});

export {
    getMyNotifications,
    getNotificationById,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications
};
