import { Router } from "express";

import {
    createQueueEntry,
    getAllQueue,
    callNextCustomer,
    completeCustomer,
    getCurrentToken,
    getQueuePosition,
    getDisplayQueueData,
    getQueueStats,
    resetQueue,
} from "../controllers/queue.controller.js";
import {
    authMiddleware,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, authorizeRoles("USER"), createQueueEntry);
router.get("/:serviceCenterId", getAllQueue);
router.patch("/next", callNextCustomer);
router.patch("/:queueId/complete", completeCustomer);
router.get("/current-token/:serviceCenterId", getCurrentToken);
router.get("/position/:serviceCenterId/:queueId", getQueuePosition);
router.get("/display/:serviceCenterId", getDisplayQueueData);
router.get("/stats/:serviceCenterId", getQueueStats);
router.delete("/reset/:serviceCenterId", resetQueue);

export default router;
