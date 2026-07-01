import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";

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
            role: "USER",
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
    { fullName, email, password, phoneNumber, address, profileImage }
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
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: safeUserSelect,
    });

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

    return true;
};

export {
    getAllUsersService,
    getUserByIdService,
    registerUserService,
    loginUserService,
    updateUserService,
    deleteUserService,
};
