import { ApiError } from "../utils/ApiError.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+[1-9]\d{7,14}$/;
const otpRegex = /^\d{6}$/;
const ROLES = ["USER", "STAFF", "ADMIN"];

// USER REGISTER VALIDATION
const validateUserRegister = ({
    fullName,
    email,
    password,
    phoneNumber,
    address,
}) => {
    if (!fullName?.trim()) {
        throw new ApiError(400, "Full name is required");
    }

    if (fullName.trim().length < 3) {
        throw new ApiError(400, "Full name must be at least 3 characters");
    }

    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Invalid email");
    }

    if (!password?.trim()) {
        throw new ApiError(400, "Password is required");
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters");
    }

    if (!phoneNumber?.trim()) {
        throw new ApiError(400, "Phone number is required");
    }

    if (!phoneRegex.test(phoneNumber.trim())) {
        throw new ApiError(
            400,
            "Phone number must be in international format (e.g. +9779812345678)"
        );
    }

    if (!address?.trim()) {
        throw new ApiError(400, "Address is required");
    }

    if (role !== undefined && !ROLES.includes(role)) {
        throw new ApiError(400, `Role must be one of: ${ROLES.join(", ")}`);
    }
};

// USER LOGIN VALIDATION
const validateUserLogin = ({ email, password }) => {
    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Invalid email");
    }

    if (!password?.trim()) {
        throw new ApiError(400, "Password is required");
    }
};

// USER UPDATE VALIDATION
const validateUserUpdate = ({
    fullName,
    email,
    password,
    phoneNumber,
    address,
}) => {
    if (fullName !== undefined) {
        if (!fullName.trim()) {
            throw new ApiError(400, "Full name cannot be empty");
        }

        if (fullName.trim().length < 3) {
            throw new ApiError(400, "Full name must be atleast 3 characters");
        }
    }

    if (email !== undefined) {
        if (!email.trim()) {
            throw new ApiError(400, "Email cannot be empty");
        }

        if (!emailRegex.test(email.trim())) {
            throw new ApiError(400, "Invalid email");
        }
    }

    if (password !== undefined) {
        if (password.length < 8) {
            throw new ApiError(400, "Password must be atleast 8 characters");
        }
    }

    if (phoneNumber !== undefined) {
        if (!phoneRegex.test(phoneNumber.trim())) {
            throw new ApiError(
                400,
                "Phone number must be in international format (e.g. +9779812345678)"
            );
        }
    }

    if (address !== undefined) {
        if (!address.trim()) {
            throw new ApiError(400, "Address cannot be empty");
        }
    }
};

// FORGOT PASSWORD VALIDATION
const validateForgotPassword = ({ email }) => {
    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Invalid email");
    }
};

// RESET PASSWORD VALIDATION
const validateResetPassword = ({ email, otp, newPassword }) => {
    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Invalid email");
    }

    if (!otp?.trim()) {
        throw new ApiError(400, "OTP is required");
    }

    if (!otpRegex.test(otp.trim())) {
        throw new ApiError(400, "OTP must be a 6-digit code");
    }

    if (!newPassword?.trim()) {
        throw new ApiError(400, "New password is required");
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters");
    }
};

export {
    validateUserRegister,
    validateUserLogin,
    validateUserUpdate,
    validateForgotPassword,
    validateResetPassword,
};
