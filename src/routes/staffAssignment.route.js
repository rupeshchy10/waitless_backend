import { Router } from "express";
import {
    authMiddleware,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
    assignStaff,
    getAllStaffAssignmentsList,
    getAllStaffAssignments,
    getAllServiceCentersByStaffs,
    getStaffsByServiceCenter,
    getServiceCentersByStaff,
    removeStaffAssignment,
} from "../controllers/staffAssignment.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateStaffAssignment } from "../validators/staffAssignment.validator.js";

const router = Router();

router.post(
    "/assign",
    validate(validateStaffAssignment),
    authMiddleware,
    authorizeRoles("ADMIN"),
    assignStaff
);
router.get(
    "/",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getAllStaffAssignmentsList
);
router.get(
    "/all-staffs",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getAllStaffAssignments
);
router.get(
    "/all-service-centers",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getAllServiceCentersByStaffs
);
router.get(
    "/staffs/:serviceCenterId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getStaffsByServiceCenter
);
router.get(
    "/service-centers/:userId",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getServiceCentersByStaff
);
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("ADMIN"),
    removeStaffAssignment
);

export default router;
