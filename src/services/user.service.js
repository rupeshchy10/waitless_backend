import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { generateOtp, hashOtp, getOtpExpiry } from "../utils/otp.js";
import { sendEmail } from "../utils/email.js";

const ROLES = ["USER", "STAFF", "ADMIN"];

const safeUserSelect = {
    id: true,
    fullName: true,
    email: true,
    phoneNumber: true,
    address: true,
    profileImage: true,
    role: true,
    createdAt: true,
    updatedAt: true,
};

// GET ALL USERS
const getAllUsersService = async () => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: safeUserSelect,
    });

    return users;
};

// GET USER BY ID
const getUserByIdService = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: safeUserSelect,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

// REGISTER USER
const registerUserService = async ({
    fullName,
    email,
    password,
    phoneNumber,
    address,
    profileImage,
    profileImageId,
    role,
}) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        throw new ApiError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phoneNumber: phoneNumber.trim(),
            address: address.trim(),
            profileImage,
            profileImageId,
            role: ROLES.includes(role) ? role : "USER",
        },
        select: safeUserSelect,
    });

    return newUser;
};

// LOGIN USER
const loginUserService = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { password: _, ...safeUser } = user;

    return safeUser;
};

// UPDATE USER
const updateUserService = async (
    id,
    {
        fullName,
        email,
        password,
        phoneNumber,
        address,
        profileImage,
        profileImageId,
    }
) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const updateData = {};

    if (fullName !== undefined) {
        updateData.fullName = fullName.trim();
    }

    if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findFirst({
            where: {
                email: normalizedEmail,
                NOT: {
                    id,
                },
            },
        });

        if (existingUser) {
            throw new ApiError(409, "Email already exists");
        }

        updateData.email = normalizedEmail;
    }

    if (password !== undefined) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    if (phoneNumber !== undefined) {
        updateData.phoneNumber = phoneNumber.trim();
    }

    if (address !== undefined) {
        updateData.address = address.trim();
    }

    if (profileImage !== undefined) {
        updateData.profileImage = profileImage;
        updateData.profileImageId = profileImageId;
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: safeUserSelect,
    });

    // Remove old profile image as new one is saved successfully
    if (profileImage !== undefined && user.profileImageId) {
        await deleteFromCloudinary(user.profileImageId);
    }

    return updatedUser;
};

// DELETE USER
const deleteUserService = async (id) => {
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    await prisma.user.delete({
        where: { id },
    });

    if (existingUser.profileImageId) {
        await deleteFromCloudinary(existingUser.profileImageId);
    }

    return true;
};

// FORGOT PASSWORD
const forgotPasswordService = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (!user) return;

    const otp = generateOtp();

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetOtpHash: hashOtp(otp),
            passwordResetOtpExpiresAt: getOtpExpiry(),
        },
    });

    await sendEmail({
        to: user.email,
        subject: "Your WaitLess password reset code",
        html: `
            <p>Hi ${user.fullName},</p>
            <p>Your password reset code is:</p>
            <h2 style="letter-spacing: 4px;">${otp}</h2>
            <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        `,
    });
};

// RESET PASSWORD — verify the OTP and set a new password
const resetPasswordService = async ({ email, otp, newPassword }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    const genericError = () =>
        new ApiError(400, "Invalid or expired OTP. Please request a new one.");

    if (
        !user ||
        !user.passwordResetOtpHash ||
        !user.passwordResetOtpExpiresAt
    ) {
        throw genericError();
    }

    if (user.passwordResetOtpExpiresAt < new Date()) {
        throw genericError();
    }

    if (user.passwordResetOtpHash !== hashOtp(otp.trim())) {
        throw genericError();
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            // Single-use: clear it immediately so this exact OTP can never
            // be replayed, even within its original 10-minute window.
            passwordResetOtpHash: null,
            passwordResetOtpExpiresAt: null,
        },
    });
};

export {
    getAllUsersService,
    getUserByIdService,
    registerUserService,
    loginUserService,
    updateUserService,
    deleteUserService,
    forgotPasswordService,
    resetPasswordService,
};
