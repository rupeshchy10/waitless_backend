import { prisma } from "../utils/prisma.js";

const createServiceCenter = async (name) => {
    const serviceCenter = await prisma.serviceCenter.create({
        data: {
            name,
        },
    });

    return serviceCenter;
};

const getAllServiceCenters = async () => {
    const serviceCenters = await prisma.serviceCenter.findMany();

    return serviceCenters;
};

export { createServiceCenter, getAllServiceCenters };
