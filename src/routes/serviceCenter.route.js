import { Router } from "express";
import {
    createServiceCenterController,
    getAllServiceCentersController,
} from "../controllers/serviceCenter.controller.js";

const router = Router();

router.post("/", createServiceCenterController);
router.get("/", getAllServiceCentersController);

export default router;
