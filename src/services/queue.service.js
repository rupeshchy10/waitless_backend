import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { formatNepalTime, getTodayBounds } from "../utils/time.js";
import {
    formatOutput,
    formatMultipleOutputs,
} from "../utils/formatNepalOutput.js";

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
};

// 1. JOIN QUEUE
const joinQueueEntryService = async (userId, serviceCenterId) => {
    // 1.1. Validate input
    if (!serviceCenterId) {
        throw new ApiError(400, "Service center id is required");
    }

    // 1.2. Check if service center exists?
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
        select: safeServiceCenterSelect,
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 1.3. Current time
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const openingMinutes =
        serviceCenter.openingHour * 60 + serviceCenter.openingMinute;

    const closingMinutes =
        serviceCenter.closingHour * 60 + serviceCenter.closingMinute;

    // 1.4. Allow booking only after 12 am and before closing
    if (currentMinutes >= closingMinutes) {
        throw new ApiError(
            400,
            "Service center is closed. Please join after midnight"
        );
    }

    // 1.5. Today's range
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // 1.6. Already joined today?
    const existingQueue = await prisma.queue.findFirst({
        where: {
            userId,
            serviceCenterId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: {
                in: ["WAITING", "SERVING"],
            },
        },
    });

    if (existingQueue) {
        throw new ApiError(409, "You already joined this queue today.");
    }

    // 1.7. Transaction
    const queueEntry = await prisma.$transaction(async (tx) => {
        const lastToken = await tx.queue.findFirst({
            where: {
                serviceCenterId,

                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },

            orderBy: {
                tokenNumber: "desc",
            },
        });

        const nextToken = lastToken ? lastToken.tokenNumber + 1 : 1;

        // expires today at closing time
        const expiresAt = new Date(now);
        expiresAt.setHours(
            serviceCenter.closingHour,
            serviceCenter.closingMinute,
            0,
            0
        );

        return tx.queue.create({
            data: {
                userId,
                serviceCenterId,
                tokenNumber: nextToken,
                expiresAt,
            },
        });
    });

    // 1.8. People ahead
    const peopleAhead = await prisma.queue.count({
        where: {
            serviceCenterId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: "WAITING",
            tokenNumber: {
                lt: queueEntry.tokenNumber,
            },
        },
    });

    // 1.9. Estimated waiting time
    const estimatedWaitMinutes = peopleAhead * serviceCenter.averageServiceTime;

    // 1.10. Position
    const position = peopleAhead + 1;

    // 1.11. Digital Ticket
    return {
        queueId: queueEntry.id,
        tokenNumber: queueEntry.tokenNumber,
        position,
        peopleAhead,
        estimatedWaitMinutes,
        priority: queueEntry.priority,
        status: queueEntry.status,
        serviceCenter: {
            id: serviceCenter.id,
            name: serviceCenter.name,
            openingHour: serviceCenter.openingHour,
            openingMinute: serviceCenter.openingMinute,
            closingHour: serviceCenter.closingHour,
            closingMinute: serviceCenter.closingMinute,
        },
        joinedAt: queueEntry.createdAt,
        joinedAtNepalTime: formatNepalTime(queueEntry.createdAt),

        expiresAt: queueEntry.expiresAt,
        expiresAtNepalTime: formatNepalTime(queueEntry.expiresAt),
    };
};

// 2. GET MY ACTIVE QUEUE
const getMyQueueService = async (userId) => {
    const queue = await prisma.queue.findMany({
        where: {
            userId,
            status: {
                in: ["WAITING", "SERVING"],
            },
        },
        include: {
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!queue) {
        throw new ApiError(404, "No active queue found");
    }

    return formatMultipleOutputs(queue);
};

// 3. GET MY QUEUE HISTORY
const getMyQueueHistoryService = async (userId) => {
    const queueHistory = await prisma.queue.findMany({
        where: {
            userId,
            status: {
                in: ["COMPLETED", "CANCELLED", "EXPIRED", "NO_SHOW"],
            },
        },
        include: {
            serviceCenter: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    phoneNumber: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return formatMultipleOutputs(queueHistory);
};

// 4. GET QUEUE BY ID
const getQueueByIdService = async (queueId, currentUser) => {
    // 4.1. find queue
    const queue = await prisma.queue.findUnique({
        where: { id: queueId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    address: true,
                },
            },
            serviceCenter: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                },
            },
        },
    });

    if (!queue) {
        throw new ApiError(404, "Queue not found");
    }

    // 4.2. ADMIN can access any queue
    if (currentUser.role === "ADMIN") {
        return formatOutput(queue);
    }

    // 4.3. USER can access only their own queue
    if (currentUser.role === "USER") {
        if (queue.userId !== currentUser.id) {
            throw new ApiError(403, "You are not allowed to view this queue");
        }
        return formatOutput(queue);
    }

    // 4.4. STAFF must be assigned to this service center
    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId: queue.serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
        return formatOutput(queue);
    }
    throw new ApiError(403, "Forbidden");
};

// 5. GET QUEUE OF ONE SERVICE CENTER
const getQueueByServiceCenterService = async (serviceCenterId, currentUser) => {
    // 5.1. Check if service center exists
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id: serviceCenterId },
        select: {
            id: true,
            name: true,
            address: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError("Service center not found");
    }

    // 5.2. If STAFF, verify assignment
    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
    }

    // 5.3. Fetch queue
    const queues = await prisma.queue.findMany({
        where: { serviceCenterId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
        },
        orderBy: [
            {
                priority: "desc",
            },
            {
                tokenNumber: "asc",
            },
        ],
    });

    return {
        serviceCenter,
        totalQueues: queues.length,
        queues: formatMultipleOutputs(queues),
    };
};

// 6. GET ALL QUEUE
const getAllQueueService = async () => {
    const queues = await prisma.queue.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    address: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
        orderBy: {
            tokenNumber: "asc",
        },
    });

    return formatMultipleOutputs(queues);
};

// 7. CHECK IN
const checkedInQueueService = async (userId) => {
    const queue = await prisma.queue.findFirst({
        where: {
            userId,
            status: {
                in: ["WAITING", "SERVING"],
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!queue) {
        throw new ApiError(404, "No active waiting queue found");
    }

    if (queue.checkedIn) {
        throw new ApiError(409, "You have already checked in");
    }

    const updatedQueue = await prisma.queue.update({
        where: { id: queue.id },
        data: {
            checkedIn: true,
        },
    });

    const formattedQueue = {
        ...updatedQueue,
        nepalTime: {
            expiresAtNepalTime: formatNepalTime(updatedQueue.expiresAt),
            servedAtNepalTime: formatNepalTime(updatedQueue.servedAt),
            completedAtNepalTime: formatNepalTime(updatedQueue.completedAt),
            cancelledAtNepalTime: formatNepalTime(updatedQueue.cancelledAt),
            updatedAtNepalTime: formatNepalTime(updatedQueue.updatedAt),
        },
    };

    return formattedQueue;
};

// 8. GET CHECKED-IN LIST
const getCheckedInListService = async (serviceCenterId, currentUser) => {
    // 1. Check service center
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id: serviceCenterId },
        select: {
            id: true,
            name: true,
            address: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 2. Verify staff assignment
    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
    }

    // 3. Get checked-in queues
    const queues = await prisma.queue.findMany({
        where: {
            serviceCenterId,
            checkedIn: true,
            status: {
                in: ["WAITING", "SERVING"],
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    address: true,
                },
            },
        },
        orderBy: [
            {
                priority: "desc",
            },
            {
                tokenNumber: "asc",
            },
        ],
    });

    const formattedQueues = queues.map((queue) => ({
        ...queue,
        createdAtNepalTime: formatNepalTime(queue.createdAt),
        updatedAtNepalTime: formatNepalTime(queue.updatedAt),
        expiresAtNepalTime: formatNepalTime(queue.expiresAt),
    }));

    return {
        serviceCenter,
        totalCheckedIn: formattedQueues.length,
        checkedInQueues: formattedQueues,
    };
};

// 9. UPDATE QUEUE PRIORITY TO EMERGENCY OR VIP
const updateQueuePriorityService = async (queueId, priority, currentUser) => {
    // 9.1. Find queue
    const queue = await prisma.queue.findUnique({
        where: {
            id: queueId,
        },
    });

    if (!queue) {
        throw new ApiError(404, "Queue not found");
    }

    // 9.2. Queue must be waiting
    if (queue.status !== "WAITING") {
        throw new ApiError(
            400,
            "Only waiting queues can have their priority updated"
        );
    }

    // 9.3. Validate priority
    if (!["VIP", "EMERGENCY", "NORMAL"].includes(priority)) {
        throw new ApiError(
            400,
            "Priority must be either VIP or EMERGENCY or NORMAL"
        );
    }

    // 9.4. Already updated?
    if (queue.priority === priority) {
        throw new ApiError(409, `Queue is already ${priority}`);
    }

    // 9.5. STAFF permission
    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId: queue.serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
    }

    // 9.6. Update queue
    const updatedQueue = await prisma.queue.update({
        where: {
            id: queueId,
        },
        data: {
            priority,
        },
    });

    return formatOutput(updatedQueue);
};

// 10. CALL NEXT CUSTOMER
const callNextUserService = async (serviceCenterId, currentUser) => {
    // 10.1. Check service center
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id: serviceCenterId },
        select: {
            id: true,
            name: true,
            address: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 10.2. STAFF can only call users from their assigned service center
    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
    }

    // 10.3. Check if someone is already being served
    const currentServing = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
    });

    if (currentServing) {
        throw new ApiError(
            409,
            "Please complete the current user before calling the next one"
        );
    }

    // 10.4. Find next checked-in waiting user
    const waitingUser = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "WAITING",
            checkedIn: true,
        },
        orderBy: [{ priority: "desc" }, { tokenNumber: "asc" }],
    });

    if (!waitingUser) {
        throw new ApiError(404, "No checked-in user is waiting in queue");
    }

    // 10.5. Update status
    const updatedUser = await prisma.queue.update({
        where: {
            id: waitingUser.id,
        },
        data: {
            status: "SERVING",
            servedAt: new Date(),
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
    });

    return formatOutput(updatedUser);
};

// 11. COMPLETE QUEUE
const completeQueueService = async (serviceCenterId, currentUser) => {
    // 11.1. Find service center
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id: serviceCenterId },
        select: {
            id: true,
            name: true,
            address: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 11.2. STAFF can complete queues only from their assigned service center
    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
    }

    // 11.3. Find currently serving queue
    const servingUser = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
    });

    if (!servingUser) {
        throw new ApiError(404, "No user is currently being served");
    }

    // 11.4. Complete queue
    const CompletedUser = await prisma.queue.update({
        where: {
            id: servingUser.id,
        },
        data: {
            status: "COMPLETED",
            completedAt: new Date(),
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
    });

    return formatOutput(CompletedUser);
};

// 12. MARK NO_SHOW
const markNoShowUserService = async (serviceCenterId, currentUser) => {
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id: serviceCenterId },
        select: {
            id: true,
            name: true,
            address: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
    }

    const servingUser = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
    });

    if (!servingUser) {
        throw new ApiError(404, "No user is currently begin served");
    }

    const updatedQueue = await prisma.queue.update({
        where: {
            id: servingUser.id,
        },
        data: {
            status: "NO_SHOW",
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
    });

    return formatOutput(updatedQueue);
};

// 13. CANCEL QUEUE
const cancelQueueService = async (queueId, currentUser) => {
    // 13.1. Find active queue
    const queue = await prisma.queue.findFirst({
        where: {
            id: queueId,
            userId: currentUser.id,
            status: "WAITING",
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
    });

    if (!queue) {
        throw new ApiError(404, "Waiting queue not found");
    }

    // 13.2. Cancel queue
    const cancelledQueue = await prisma.queue.update({
        where: {
            id: queue.id,
        },
        data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
    });

    return formatOutput(cancelledQueue);
};

// 14. GET QUEUE POSITION
const getQueuePositionService = async (queueId, currentUser) => {
    const queue = await prisma.queue.findUnique({
        where: {
            id: queueId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            serviceCenter: {
                select: safeServiceCenterSelect,
            },
        },
    });

    if (!queue) {
        throw new ApiError(404, "Queue not found");
    }

    // Owner or admin/staff only
    if (currentUser.role === "USER" && queue.userId !== currentUser.id) {
        throw new ApiError(403, "You are not authorized to view this queue");
    }

    const currentServing = await prisma.queue.findFirst({
        where: {
            serviceCenterId: queue.serviceCenterId,
            status: "SERVING",
        },
    });

    const currentToken = currentServing ? currentServing.tokenNumber : null;

    const peopleAhead = await prisma.queue.count({
        where: {
            serviceCenterId: queue.serviceCenterId,
            status: { in: ["WAITING", "SERVING"] },
            tokenNumber: {
                lt: queue.tokenNumber,
            },
        },
    });

    return {
        queueId: queue.id,
        tokenNumber: queue.tokenNumber,
        user: queue.user.fullName,
        serviceCenter: {
            id: queue.serviceCenter.id,
            name: queue.serviceCenter.name,
            address: queue.serviceCenter.address,
        },
        status: queue.status,
        priority: queue.priority,
        currentToken,
        position: peopleAhead + 1,
        peopleAhead,
        estimatedWaitMinutes:
            peopleAhead * queue.serviceCenter.averageServiceTime,
    };
};

// 15. DISPLAY QUEUE DATA
const getDisplayQueueDataService = async (serviceCenterId) => {
    // 15.1. Check service center
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
        select: {
            id: true,
            name: true,
            address: true,
            averageServiceTime: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 15.2. Current serving user
    const nowServing = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
        },
    });

    // 15.3. Next user
    const nextUser = await prisma.queue.findFirst({
        where: {
            serviceCenterId,
            status: "WAITING",
            checkedIn: true,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
        },
        orderBy: [
            {
                priority: "desc",
            },
            {
                tokenNumber: "asc",
            },
        ],
    });

    // 15.4. Waiting count
    const waitingUsers = await prisma.queue.count({
        where: {
            serviceCenterId,
            status: "WAITING",
        },
    });

    // 15.5. Checked-in count
    const checkedInUsers = await prisma.queue.count({
        where: {
            serviceCenterId,
            status: "WAITING",
            checkedIn: true,
        },
    });

    return {
        serviceCenter,
        nowServing: nowServing
            ? {
                  tokenNumber: nowServing.tokenNumber,
                  user: nowServing.user.fullName,
                  priority: nowServing.priority,
              }
            : null,

        nextUser: nextUser
            ? {
                  tokenNumber: nextUser.tokenNumber,
                  user: nextUser.user.fullName,
                  priority: nextUser.priority,
              }
            : null,
        waitingUsers,
        checkedInUsers,
        averageServiceTime: serviceCenter.averageServiceTime,
        estimatedTotalWaitMinutes:
            waitingUsers * serviceCenter.averageServiceTime,
    };
};

// 16. QUEUE STATS
const getQueueStatsService = async (serviceCenterId) => {
    // 16.1. Check service center
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 16.2. Group queues by status
    const stats = await prisma.queue.groupBy({
        by: ["status"],
        where: {
            serviceCenterId,
        },
        _count: {
            status: true,
        },
    });

    // 16.3. Convert to object
    const queueStats = {
        WAITING: 0,
        SERVING: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        EXPIRED: 0,
        NO_SHOW: 0,
    };

    stats.forEach((item) => {
        queueStats[item.status] = item._count.status;
    });

    const totalQueues = Object.values(queueStats).reduce(
        (sum, value) => sum + value,
        0
    );

    return {
        serviceCenter,
        totalQueues,
        waiting: queueStats.WAITING,
        serving: queueStats.SERVING,
        completed: queueStats.COMPLETED,
        cancelled: queueStats.CANCELLED,
        expired: queueStats.EXPIRED,
        noShow: queueStats.NO_SHOW,
    };
};

// 17. CLOSE DAY
const closeDayService = async (serviceCenterId, currentUser) => {
    // 17.1. Check service center
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 17.2. STAFF can only close their assigned service center
    if (currentUser.role === "STAFF") {
        const assignment = await prisma.staffAssignment.findUnique({
            where: {
                userId_serviceCenterId: {
                    userId: currentUser.id,
                    serviceCenterId,
                },
            },
        });

        if (!assignment) {
            throw new ApiError(
                403,
                "You are not assigned to this service center"
            );
        }
    }

    // 17.3. Expire waiting queues
    const expiredQueues = await prisma.queue.updateMany({
        where: {
            serviceCenterId,
            status: "WAITING",
        },
        data: {
            status: "EXPIRED",
        },
    });

    // 17.4. Mark serving queue as NO_SHOW
    const noShowQueues = await prisma.queue.updateMany({
        where: {
            serviceCenterId,
            status: "SERVING",
        },
        data: {
            status: "NO_SHOW",
        },
    });

    return {
        serviceCenter: serviceCenter.name,
        expiredQueues: expiredQueues.count,
        noShowQueues: noShowQueues.count,
        message: "Day closed successfully",
    };
};

export {
    joinQueueEntryService,
    getMyQueueService,
    getQueueByIdService,
    getMyQueueHistoryService,
    checkedInQueueService,
    getCheckedInListService,
    getQueueByServiceCenterService,
    getAllQueueService,
    updateQueuePriorityService,
    callNextUserService,
    completeQueueService,
    markNoShowUserService,
    cancelQueueService,
    getQueuePositionService,
    getDisplayQueueDataService,
    getQueueStatsService,
    closeDayService,
};
