import { Router } from "express";

import {
    addCustomer,
    getAllQueue,
    nextCustomer,
    completedCurrentCustomer,
    currentToken,
    queuePosition,
    displayQueue,
    queueStats,
    resetQueueController,
} from "../controllers/queue.controller.js";

const router = Router();

router.post("/", addCustomer);
router.get("/:serviceCenterId", getAllQueue);
router.patch("/next", nextCustomer);
router.patch("/:queueId/complete", completedCurrentCustomer);
router.get("/current-token/:serviceCenterId", currentToken);
router.get("/position/:serviceCenterId/:queueId", queuePosition);
router.get("/display/:serviceCenterId", displayQueue);
router.get("/stats/:serviceCenterId", queueStats);

router.delete("/reset/:serviceCenterId", resetQueueController);

export default router;
