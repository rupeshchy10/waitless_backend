import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { formatNepalTime } from "../utils/time.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { parseClosedDays } from "../utils/closedDays.js";

// Numeric fields arrive as strings whenever the request is multipart/form-data
const toNumber = (value) =>
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;

const safeServiceCenterSelect = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    address: true,
    logo: true,
    openingHour: true,
    openingMinute: true,
    closingHour: true,
    closingMinute: true,
    averageServiceTime: true,
    counterNumber: true,
    closedDays: true,
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

    const formattedUser = users.map((user) => ({
        ...user,
        serviceCenters: user.serviceCenters.map((serviceCenter) => ({
            ...serviceCenter,
            createdAtNepalTime: formatNepalTime(serviceCenter.createdAt),
            updatedAtNepalTime: formatNepalTime(serviceCenter.updatedAt),
        })),
    }));

    return formattedUser;
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

    const formattedUser = {
        ...user,
        serviceCenters: user.serviceCenters.map((serviceCenter) => ({
            ...serviceCenter,
            createdAtNepalTime: formatNepalTime(serviceCenter.createdAt),
            updatedAtNepalTime: formatNepalTime(serviceCenter.updatedAt),
        })),
    };

    return formattedUser;
};

// GET SERVICE CENTER BY ID
const getServiceCenterByIdService = async (id) => {
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    return {
        ...serviceCenter,
        createdAtNepalTime: formatNepalTime(serviceCenter.createdAt),
        updatedAtNepalTime: formatNepalTime(serviceCenter.updatedAt),
    };
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
        logoId,
        openingHour,
        openingMinute,
        closingHour,
        closingMinute,
        averageServiceTime,
        counterNumber,
        closedDays,
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
            logoId,
            openingHour: toNumber(openingHour),
            openingMinute: toNumber(openingMinute),
            closingHour: toNumber(closingHour),
            closingMinute: toNumber(closingMinute),
            averageServiceTime: toNumber(averageServiceTime),
            counterNumber: toNumber(counterNumber),
            closedDays: parseClosedDays(closedDays),
        },
    });

    return {
        ...newServiceCenter,
        createdAtNepalTime: formatNepalTime(newServiceCenter.createdAt),
        updatedAtNepalTime: formatNepalTime(newServiceCenter.updatedAt),
    };
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
        logoId,
        openingHour,
        openingMinute,
        closingHour,
        closingMinute,
        averageServiceTime,
        counterNumber,
        closedDays,
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
        updateData.logoId = logoId;
    }
    if (openingHour !== undefined) {
        updateData.openingHour = toNumber(openingHour);
    }
    if (openingMinute !== undefined) {
        updateData.openingMinute = toNumber(openingMinute);
    }
    if (closingHour !== undefined) {
        updateData.closingHour = toNumber(closingHour);
    }
    if (closingMinute !== undefined) {
        updateData.closingMinute = toNumber(closingMinute);
    }
    if (averageServiceTime !== undefined) {
        updateData.averageServiceTime = toNumber(averageServiceTime);
    }
    if (counterNumber !== undefined) {
        const numericCounterNumber = toNumber(counterNumber);
        if (
            !Number.isInteger(numericCounterNumber) ||
            numericCounterNumber < 1
        ) {
            throw new ApiError(400, "counterNumber must be a positive integer");
        }
        updateData.counterNumber = numericCounterNumber;
    }
    if (closedDays !== undefined) {
        updateData.closedDays = parseClosedDays(closedDays);
    }

    const updatedServiceCenter = await prisma.serviceCenter.update({
        where: { id },
        data: updateData,
    });

    // Remove old logo as new one is saved successfully
    if (logo !== undefined && serviceCenter.logoId) {
        await deleteFromCloudinary(serviceCenter.logoId);
    }

    return {
        ...updatedServiceCenter,
        createdAtNepalTime: formatNepalTime(serviceCenter.createdAt),
        updatedAtNepalTime: formatNepalTime(serviceCenter.updatedAt),
    };
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

    if (existingServiceCenter.logoId) {
        await deleteFromCloudinary(existingServiceCenter.logoId);
    }

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
