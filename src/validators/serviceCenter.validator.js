import { ApiError } from "../utils/ApiError.js";
import { parseClosedDays } from "../utils/closedDays.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+[1-9]\d{7,14}$/;

// SERVICE CENTER REGISTER VALIDATION
const validateServiceCenterRegister = ({
    name,
    email,
    phoneNumber,
    address,
    closedDays,
}) => {
    if (!name?.trim()) {
        throw new ApiError(400, "Name is required");
    }

    if (name.trim().length < 3) {
        throw new ApiError(400, "Name must be at least 3 characters");
    }

    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Invalid email");
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

    parseClosedDays(closedDays);
};

// SERVICE CENTER UPDATE VALIDATION
const validateServiceCenterUpdate = ({
    name,
    email,
    phoneNumber,
    address,
    closedDays,
}) => {
    if (name !== undefined) {
        if (!name.trim()) {
            throw new ApiError(400, "Name cannot be empty");
        }

        if (name.trim().length < 3) {
            throw new ApiError(400, "Name must be atleast 3 characters");
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

    parseClosedDays(closedDays);
};

export { validateServiceCenterRegister, validateServiceCenterUpdate };
