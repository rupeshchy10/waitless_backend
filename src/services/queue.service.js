import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const createQueueEntry = async (customerName, serviceCenterId) => {
    if (!customerName?.trim()) {
        throw new ApiError(400, "Customer name is required");
    }

    if (!serviceCenterId) {
        throw new ApiError(400, "Service center id is required");
    }

    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    const lastToken = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
        },
        orderBy: {
            tokenNumber: "desc",
        },
    });

    const nextToken = lastToken ? lastToken.tokenNumber + 1 : 1;

    const queueEntry = await prisma.queue.create({
        data: {
            customerName: customerName.trim(),
            tokenNumber: nextToken,
            serviceCenterId,
        },
    });

    return queueEntry;
};

const getQueue = async (serviceCenterId) => {
    return await prisma.queue.findMany({
        where: {
            serviceCenterId,
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });
};

const callNextCustomer = async (serviceCenterId) => {
    const currentServing = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });

    if (currentServing) {
        await prisma.queue.update({
            where: {
                id: currentServing.id,
            },
            data: {
                status: "COMPLETED",
            },
        });
    }

    const waitingCustomer = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "WAITING",
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });

    if (!waitingCustomer) {
        throw new ApiError(404, "No customer waiting in queue");
    }

    const updatedCustomer = await prisma.queue.update({
        where: {
            id: waitingCustomer.id,
        },
        data: {
            status: "SERVING",
        },
    });

    return updatedCustomer;
};

const completeCustomer = async (queueId) => {
    const queue = await prisma.queue.findUnique({
        where: {
            id: queueId,
        },
    });

    if (!queue) {
        throw new ApiError(404, "Queue entry not found");
    }

    return await prisma.queue.update({
        where: {
            id: queueId,
        },
        data: {
            status: "COMPLETED",
        },
    });
};

const getCurrentToken = async (serviceCenterId) => {
    const currentCustomer = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });

    if (!currentCustomer) {
        throw new ApiError(404, "No customer is currently begin served");
    }

    return {
        currentToken: currentCustomer.tokenNumber,
        customerName: currentCustomer.customerName,
        status: currentCustomer.status,
    };
};

const getQueuePosition = async (serviceCenterId, queueId) => {
    const customer = await prisma.queue.findUnique({
        where: {
            id: queueId,
        },
    });

    if (!customer) {
        throw new ApiError(404, "Customer not found in queue");
    }

    const currentServing = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
    });

    const currentToken = currentServing ? currentServing.tokenNumber : 0;

    const peopleAhead = await prisma.queue.count({
        where: {
            serviceCenterId,
            status: { in: ["WAITING", "SERVING"] },
            tokenNumber: {
                lt: customer.tokenNumber,
            },
        },
    });

    if (customer.status === "COMPLETED") {
        return {
            tokenNumber: customer.tokenNumber,
            customerName: customer.customerName,
            status: customer.status,
            message: "Service completed",
        };
    }

    if (customer.status === "SERVING") {
        return {
            tokenNumber: customer.tokenNumber,
            customerName: customer.customerName,
            status: customer.status,
            message: "You are currently being served",
        };
    }

    return {
        tokenNumber: customer.tokenNumber,
        customerName: customer.customerName,
        status: customer.status,
        currentToken,
        peopleAhead,
        estimatedWaitTime: peopleAhead * 10,
    };
};

const getDisplayData = async (serviceCenterId) => {
    const nowServing = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });

    const nextToken = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "WAITING",
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });

    return {
        nowServing: nowServing
            ? {
                  tokenNumber: nowServing.tokenNumber,
                  customerName: nowServing.customerName,
              }
            : null,
        nextToken: nextToken
            ? {
                  tokenNumber: nextToken.tokenNumber,
                  customerName: nextToken.customerName,
              }
            : null,
    };
};

const getQueueStats = async (serviceCenterId) => {
    const waiting = await prisma.queue.count({
        where: {
            serviceCenterId,
            status: "WAITING",
        },
    });

    const serving = await prisma.queue.count({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
    });

    const completed = await prisma.queue.count({
        where: {
            serviceCenterId,
            status: "COMPLETED",
        },
    });

    return {
        waiting,
        serving,
        completed,
        total: waiting + serving + completed,
    };
};

const resetQueue = async (serviceCenterId) => {
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    await prisma.queue.deleteMany({
        where: {
            serviceCenterId,
        },
    });

    return null;
};

export {
    createQueueEntry,
    getQueue,
    callNextCustomer,
    completeCustomer,
    getCurrentToken,
    getQueuePosition,
    getDisplayData,
    getQueueStats,
    resetQueue
};
