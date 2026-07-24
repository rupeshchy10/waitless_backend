import { Router } from "express";

import {
    joinQueueEntry,
    getMyQueue,
    getMyQueueHistory,
    getQueueByServiceCenter,
    getQueueById,
    getAllQueue,
    checkedInQueue,
    getCheckedInList,
    updateQueuePriority,
    callNextUser,
    completeQueue,
    markNoShowUser,
    cancelQueue,
    getQueuePosition,
    getDisplayQueueData,
    getQueueStats,
    closeDay,
} from "../controllers/queue.controller.js";
import {
    authMiddleware,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/join/:serviceCenterId",
    authMiddleware,
    authorizeRoles("USER"),
    joinQueueEntry
);
router.get("/my-queue", authMiddleware, authorizeRoles("USER"), getMyQueue);
router.get(
    "/history",
    authMiddleware,
    authorizeRoles("USER"),
    getMyQueueHistory
);
router.get(
    "/service-center/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getQueueByServiceCenter
);
router.get(
    "/:queueId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF", "USER"),
    getQueueById
);
router.get("/", getAllQueue);
router.patch(
    "/checked-in",
    authMiddleware,
    authorizeRoles("USER"),
    checkedInQueue
);
router.get(
    "/checked-in/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getCheckedInList
);
router.patch(
    "/priority/:queueId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    updateQueuePriority
);

router.patch(
    "/call-next/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    callNextUser
);
router.patch(
    "/complete/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    completeQueue
);
router.patch(
    "/no-show/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    markNoShowUser
);
router.patch(
    "/cancel/:queueId",
    authMiddleware,
    authorizeRoles("USER"),
    cancelQueue
);
router.get(
    "/position/:queueId",
    authMiddleware,
    authorizeRoles("USER", "ADMIN", "STAFF"),
    getQueuePosition
);
router.get("/display/:serviceCenterId", getDisplayQueueData);
router.get(
    "/stats/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getQueueStats
);
router.patch(
    "/close-day/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    closeDay
);

export default router;
