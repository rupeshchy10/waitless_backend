import { Router } from "express";
import {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    getAllUsers,
    getUserById,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    validateRegister,
    validateLogin,
    validateUpdate,
} from "../validators/user.validator.js";
import { validate } from "../middlewares/userValidate.middleware.js";

const router = Router();

router.post("/register", validate(validateRegister), registerUser);
router.post("/login", validate(validateLogin), loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/:id", validate(validateUpdate), updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);

export default router;
