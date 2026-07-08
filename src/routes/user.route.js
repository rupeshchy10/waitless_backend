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
} from "../controllers/user.controller.js";
import {
    authMiddleware,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
    validateUserRegister,
    validateUserLogin,
    validateUserUpdate,
} from "../validators/user.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/register", validate(validateUserRegister), registerUser);
router.post("/login", validate(validateUserLogin), loginUser);
router.get("/", authMiddleware, authorizeRoles("ADMIN", "STAFF"), getAllUsers);
router.get("/profile", authMiddleware, getOwnProfile);
router.post("/logout", authMiddleware, logout);

router.put("/:id", validate(validateUserUpdate), authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("ADMIN", "STAFF"),
    getUserById
);

export default router;
