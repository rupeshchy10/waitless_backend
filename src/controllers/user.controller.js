import { ApiResponse } from "../utils/ApiResponse.js";
import * as userService from "../services/user.service.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET ALL USERS
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsersService();

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await userService.getUserByIdService(id);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});

// CREATE/REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
    // validateRegister(req.body);

    const user = await userService.registerUserService(req.body);

    const token = generateToken(user.id, res);

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user,
                token,
            },
            "User registered successfully"
        )
    );
});

// LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
    // validateLogin(req.body);

    const user = await userService.loginUserService(req.body);

    const token = generateToken(user.id, res);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
                token,
            },
            "User logged in successfully"
        )
    );
});

// UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // validateUpdate(req.body);

    const user = await userService.updateUserService(id, req.body);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User updated successfully"));
});

// DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await userService.deleteUserService(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "User deleted successfully"));
});

// CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        );
});

export {
    getAllUsers,
    getUserById,
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getCurrentUser,
};
