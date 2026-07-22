import { ApiResponse } from "../utils/ApiResponse.js";
import * as userService from "../services/user.service.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// GET ALL USERS
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsersService();

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// GET USER BY ID
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await userService.getUserByIdService(id);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});

// GET OWN PROFILE
const getOwnProfile = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const user = await userService.getUserByIdService(id);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

// CREATE/REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
    let uploadedImage = null;
    if (req.file) {
        uploadedImage = await uploadOnCloudinary(
            req.file.path,
            "WaitLess/users"
        );
    }

    const requestedRole = req.body.role;
    const isAdminCaller = req.user?.role === "ADMIN";
    const resolvedRole = isAdminCaller ? requestedRole : undefined;

    const user = await userService.registerUserService({
        ...req.body,
        role: resolvedRole,
        profileImage: uploadedImage?.url,
        profileImageId: uploadedImage?.publicId,
    });

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

    let uploadedImage = null;
    if (req.file) {
        uploadedImage = await uploadOnCloudinary(
            req.file.path,
            "WaitLess/users"
        );
    }

    const user = await userService.updateUserService(id, {
        ...req.body,
        ...(uploadedImage && {
            profileImage: uploadedImage.url,
            profileImageId: uploadedImage.publicId,
        }),
    });

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

// LOGOUT USER
const logout = asyncHandler(async (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

// FORGOT PASSWORD — request an OTP
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
 
    await userService.forgotPasswordService(email);
 
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "If an account exists for this email, a reset code has been sent."
            )
        );
});
 
// RESET PASSWORD — verify the OTP and set a new password
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
 
    await userService.resetPasswordService({ email, otp, newPassword });
 
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset successfully"));
});

export {
    getAllUsers,
    getUserById,
    registerUser,
    loginUser,
    getOwnProfile,
    updateUser,
    deleteUser,
    logout,
    forgotPassword,
    resetPassword
};
