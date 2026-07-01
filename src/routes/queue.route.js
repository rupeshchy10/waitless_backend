import { Router } from "express";

import {
  createQueueEntryController,
    getAllQueueController,
    callNextCustomerController,
    completeCustomerController,
    getCurrentTokenController,
    getQueuePositionController,
    getDisplayQueueDataController,
    getQueueStatsController,
    resetQueueController,
} from "../controllers/queue.controller.js";

const router = Router();

router.post("/", createQueueEntryController);
router.get("/:serviceCenterId", getAllQueueController);
router.patch("/next", callNextCustomerController);
router.patch("/:queueId/complete", completeCustomerController);
router.get("/current-token/:serviceCenterId", getCurrentTokenController);
router.get("/position/:serviceCenterId/:queueId", getQueuePositionController);
router.get("/display/:serviceCenterId", getDisplayQueueDataController);
router.get("/stats/:serviceCenterId", getQueueStatsController);
router.delete("/reset/:serviceCenterId", resetQueueController);

export default router;
