import { Router } from "express";
import {
    deleteServiceCenter,
    getAllServiceCenters,
    getMyServiceCenters,
    getServiceCenterById,
    registerServiceCenter,
    updateServiceCenter,
} from "../controllers/serviceCenter.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    validateServiceCenterRegister,
    validateServiceCenterUpdate,
} from "../validators/serviceCenter.validator.js";
import {
    authMiddleware,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/register",
    validate(validateServiceCenterRegister),
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    registerServiceCenter
);
router.get(
    "/",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getAllServiceCenters
);
router.get(
    "/my",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getMyServiceCenters
);
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getServiceCenterById
);
router.put(
    "/:id",
    validate(validateServiceCenterUpdate),
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    updateServiceCenter
);
router.delete("/:id", authMiddleware, deleteServiceCenter);

export default router;
