import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const safeServiceCenterSelect = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    address: true,
    logo: true,
    openingTime: true,
    closingTime: true,
    averageServiceTime: true,
    createdAt: true,
    updatedAt: true,
};

// GET ALL SERVICE CENTERS
const getAllServiceCentersService = async () => {
    const users = await prisma.user.findMany({
        where: {
            serviceCenters: {
                some: {},
            },
        },

        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            serviceCenters: {
                orderBy: {
                    createdAt: "desc",
                },
                select: safeServiceCenterSelect,
            },
        },
    });
    return users;
};

// GET MY SERVICE CENTERS
const getMyServiceCentersService = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            serviceCenters: {
                orderBy: {
                    createdAt: "desc",
                },
                select: safeServiceCenterSelect,
            },
        },
    });
    return user;
};

// GET SERVICE CENTER BY ID
const getServiceCenterByIdService = async (id) => {
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    return serviceCenter;
};

// REGISTER SERVICE CENTER
const registerServiceCenterService = async (
    userId,
    {
        name,
        email,
        phoneNumber,
        address,
        logo,
        openingTime,
        closingTime,
        averageServiceTime,
    }
) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingServiceCenter = await prisma.serviceCenter.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingServiceCenter) {
        throw new ApiError(409, "Email already exists");
    }
    const newServiceCenter = await prisma.serviceCenter.create({
        data: {
            userId,
            name: name.trim(),
            email: normalizedEmail,
            phoneNumber: phoneNumber.trim(),
            address: address.trim(),
            logo,
            openingTime,
            closingTime,
            averageServiceTime,
        },
    });

    return newServiceCenter;
};

// UPDATE SERVICE CENTER
const updateServiceCenterService = async (
    id,
    {
        name,
        email,
        phoneNumber,
        address,
        logo,
        openingTime,
        closingTime,
        averageServiceTime,
    }
) => {
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    const updateData = {};

    if (name !== undefined) {
        updateData.name = name.trim();
    }

    if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();

        const existingServiceCenter = await prisma.serviceCenter.findFirst({
            where: {
                email: normalizedEmail,
                NOT: {
                    id,
                },
            },
        });

        if (existingServiceCenter) {
            throw new ApiError(409, "Email already exists");
        }

        updateData.email = normalizedEmail;
    }

    if (phoneNumber !== undefined) {
        updateData.phoneNumber = phoneNumber.trim();
    }

    if (address !== undefined) {
        updateData.address = address.trim();
    }

    if (logo !== undefined) {
        updateData.logo = logo;
    }
    if (openingTime !== undefined) {
        updateData.openingTime = openingTime;
    }
    if (closingTime !== undefined) {
        updateData.closingTime = closingTime;
    }
    if (averageServiceTime !== undefined) {
        updateData.averageServiceTime = averageServiceTime;
    }

    const updatedServiceCenter = await prisma.serviceCenter.update({
        where: { id },
        data: updateData,
    });

    return updatedServiceCenter;
};

// DELETE SERVICE CENTER
const deleteServiceCenterService = async (id) => {
    const existingServiceCenter = await prisma.serviceCenter.findUnique({
        where: { id },
    });

    if (!existingServiceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    await prisma.serviceCenter.delete({
        where: { id },
    });

    return true;
};

export {
    getAllServiceCentersService,
    getMyServiceCentersService,
    getServiceCenterByIdService,
    registerServiceCenterService,
    updateServiceCenterService,
    deleteServiceCenterService,
};
