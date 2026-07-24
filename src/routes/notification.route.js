import { Router } from "express";

import {
    getMyNotifications,
    getNotificationById,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
} from "../controllers/notification.controller.js";
import {
    authMiddleware,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getMyNotifications);
router.get("/:notificationId", authMiddleware, getNotificationById);
router.patch("/read/:notificationId", authMiddleware, markNotificationAsRead);
router.patch("/read-all", authMiddleware, markAllNotificationsAsRead);
router.delete("/delete/:notificationId", authMiddleware, deleteNotification);
router.delete("/delete-all", authMiddleware, deleteAllNotifications);

export default router;
