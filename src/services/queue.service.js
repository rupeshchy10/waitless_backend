import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const createQueueEntryService = async (userId, serviceCenterId) => {
    // 1. VALIDATE INPUT
    if (!serviceCenterId) {
        throw new ApiError(400, "Service center id is required");
    }

    // 2. CHECK IF SERVICE CENTER EXISTS
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 3. CHECK IF USER ALREADY HAS AN ACTIVE QUEUE
    const existingQueue = await prisma.queue.findFirst({
        where: {
            userId,
            serviceCenterId,
            status: {
                in: ["WAITING", "SERVING"],
            },
        },
    });

    if (existingQueue) {
        throw new ApiError(
            409,
            "You already have an active queue ticket for this service center"
        );
    }

    // 4. CREATE QUEUE INSIDE A TRANSACTION
    const queueEntry = await prisma.$transaction(async (tx) => {
        // FIND LAST TOKEN
        const lastToken = await tx.queue.findFirst({
            where: {
                serviceCenterId,
            },
            orderBy: {
                tokenNumber: "desc",
            },
        });

        const nextToken = lastToken ? lastToken.tokenNumber + 1 : 1;

        // EXPIRY TIME
        // const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 3);

        await tx.queue.create({
            data: {
                userId,
                serviceCenterId,
                tokenNumber: nextToken,
                // expiresAt,
            },
        });
    });

    // 5. RETURN DIGITAL TICKET
    return {
        queueId: queueEntry.id,
        ticketNumber: queueEntry.tokenNumber,
        status: queueEntry.status,
        serviceCenter: serviceCenter.name,
        joinedAt: queueEntry.createdAt,
        // expiresAt: queueEntry.expiresAt,
    };
};

const getAllQueueService = async (serviceCenterId) => {
    return await prisma.queue.findMany({
        where: {
            serviceCenterId,
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });
};

const callNextCustomerService = async (serviceCenterId) => {
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

const completeCustomerService = async (queueId) => {
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

const getCurrentTokenService = async (serviceCenterId) => {
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

const getQueuePositionService = async (serviceCenterId, queueId) => {
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

const getDisplayQueueDataService = async (serviceCenterId) => {
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

const getQueueStatsService = async (serviceCenterId) => {
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

const resetQueueService = async (serviceCenterId) => {
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
    createQueueEntryService,
    getAllQueueService,
    callNextCustomerService,
    completeCustomerService,
    getCurrentTokenService,
    getQueuePositionService,
    getDisplayQueueDataService,
    getQueueStatsService,
    resetQueueService,
};
