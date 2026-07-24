import { Router } from "express";
import {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getOwnProfile,
    getAllUsers,
    getUserById,
    logout,
    forgotPassword,
    resetPassword,
} from "../controllers/user.controller.js";
import {
    authMiddleware,
    optionalAuth,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
    validateUserRegister,
    validateUserLogin,
    validateUserUpdate,
    validateForgotPassword,
    validateResetPassword,
} from "../validators/user.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
    "/register",
    optionalAuth,
    upload.single("profileImage"),
    validate(validateUserRegister),
    registerUser
);
router.post("/login", validate(validateUserLogin), loginUser);
router.post(
    "/forgot-password",
    validate(validateForgotPassword),
    forgotPassword
);
router.post("/reset-password", validate(validateResetPassword), resetPassword);
router.get(
    "/all-lists",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getAllUsers
);
router.get("/profile", authMiddleware, getOwnProfile);
router.post("/logout", authMiddleware, logout);

router.patch(
    "/update/:id",
    authMiddleware,
    upload.single("profileImage"),
    validate(validateUserUpdate),
    updateUser
);
router.delete("/delete/:id", authMiddleware, deleteUser);
router.get(
    "/info/:id",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getUserById
);

export default router;
