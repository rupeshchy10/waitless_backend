import { stat } from "node:fs";
import * as queueService from "../services/queue.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. JOIN QUEUE
const joinQueueEntry = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { serviceCenterId } = req.params;

    const queue = await queueService.joinQueueEntryService(id, serviceCenterId);

    return res
        .status(201)
        .json(new ApiResponse(201, queue, "Queue joined successfully"));
});

// 2. GET MY ACTIVE QUEUE
const getMyQueue = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const myQueue = await queueService.getMyQueueService(id);

    return res
        .status(200)
        .json(new ApiResponse(200, myQueue, "My Queue fetched successfully"));
});

// 3. GET MY QUEUE HISTORY
const getMyQueueHistory = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const queueHistory = await queueService.getMyQueueHistoryService(id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                queueHistory,
                "Queue history fetched successfully"
            )
        );
});

// 4. GET QUEUE BY ID (owner can view it, admin can view it, assigned staff can view it)
const getQueueById = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const queue = await queueService.getQueueByIdService(queueId, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, queue, "Queue fetched successfully"));
});

// 5. GET QUEUE OF ONE SERVICE CENTER (Admin->all, Assigned staff-> only assigned center)
const getQueueByServiceCenter = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const queues = await queueService.getQueueByServiceCenterService(
        serviceCenterId,
        req.user
    );

    return res
        .status(200)
        .json(new ApiResponse(200, queues, "Queue fetched successfully"));
});

// 6. GET ALL QUEUE
const getAllQueue = asyncHandler(async (req, res) => {
    const queues = await queueService.getAllQueueService();

    return res
        .status(200)
        .json(new ApiResponse(200, queues, "Queue fetched successfully"));
});

// 7. CHECK IN (checkedIn=true)
const checkedInQueue = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const checkedIn = await queueService.checkedInQueueService(id);

    return res
        .status(200)
        .json(new ApiResponse(200, checkedIn, "Checked in done successfully"));
});

// 8. GET CHECKED-IN LIST BY SERVICE CENTER
const getCheckedInList = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const checkedInList = await queueService.getCheckedInListService(
        serviceCenterId,
        req.user
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                checkedInList,
                "Checked in list fetched successfully"
            )
        );
});

// 9. UPDATE PRIORITY FOR EMERGENCY OR VIP
const updateQueuePriority = asyncHandler(async (req, res) => {
    const { queueId } = req.params;
    const { priority } = req.body;

    const queue = await queueService.updateQueuePriorityService(
        queueId,
        priority,
        req.user
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, queue, "Queue priority updated successfully")
        );
});

// 10. CALL NEXT CUSTOMER (STATUS MUST BE "WAITING" AND CHECKEDIN MUST BE TRUE)
const callNextUser = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const queue = await queueService.callNextUserService(
        serviceCenterId,
        req.user
    );

    return res
        .status(200)
        .json(new ApiResponse(200, queue, "Next user called successfully"));
});

// 11. COMPLETE QUEUE
const completeQueue = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const completedQueue = await queueService.completeQueueService(
        serviceCenterId,
        req.user
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, completedQueue, "Queue completed successfully")
        );
});

// 12. MARK NO_SHOW (STAFF CALLED THE CHECKED_IN USER BUT THE USER NEVER ARRIVED)
const markNoShowUser = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const queue = await queueService.markNoShowUserService(
        serviceCenterId,
        req.user
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, queue, "User marked as no_show successfully")
        );
});

// 13. CANCEL QUEUE (ONLY QUEUE OWNER CAN CANCEL THEIR QUEUE BY ID)
const cancelQueue = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const cancelledQueue = await queueService.cancelQueueService(
        queueId,
        req.user
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, cancelledQueue, "Queue cancelled successfully")
        );
});

// 14. GET QUEUE POSITION
const getQueuePosition = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const queuePosition = await queueService.getQueuePositionService(
        queueId,
        req.user
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                queuePosition,
                "Queue position fetched successfully"
            )
        );
});

// 15. DISPLAY QUEUE DATA (PUBLICLY AVAILABLE SO THAT EVERYONE CAN SEE IT)
const getDisplayQueueData = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const displayData =
        await queueService.getDisplayQueueDataService(serviceCenterId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                displayData,
                "Queue display data fetched successfully"
            )
        );
});

// 16. QUEUE STATS
const getQueueStats = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const stats = await queueService.getQueueStatsService(serviceCenterId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                stats,
                "Queue statistics displayed successfully"
            )
        );
});

// 17. CLOSE DAY (IN CASE OF EMERGENCY CLOSING OFFICE)
const closeDay = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const result = await queueService.closeDayService(
        serviceCenterId,
        req.user
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Service center closed successfully")
        );
});

export {
    joinQueueEntry,
    getMyQueue,
    getMyQueueHistory,
    getQueueByServiceCenter,
    getQueueById,
    getAllQueue,
    checkedInQueue,
    getCheckedInList,
    updateQueuePriority,
    callNextUser,
    completeQueue,
    markNoShowUser,
    cancelQueue,
    getQueuePosition,
    getDisplayQueueData,
    getQueueStats,
    closeDay,
};

// JOIN QUEUE.....................
// GET MY QUEUES..................
// GET QUEUE BY ID................
// GET QUEUE OF ONE SERVICE CENTER.......
// GET ALL QUEUE..................
// CHECK IN ......................

// CALL NEXT CUSTOMER.............
// COMPLETE QUEUE.................
// CANCEL QUEUE...................
// MARK NO SHOW...................
// EXPIRE QUEUE...................
// GET CURRENT TOKEN..............
// GET QUEUE POSITION.............
// DISPLAY QUEUE DATA (rename to "DisplayLiveQueue").............
// QUEUE STATS....................
// RESET QUEUE (Scope Reset Queue to a specific service center)....................

// 1. Queue Creation
// POST /queues
// GET /queues/my
// GET /queues/:id
// GET /queues
// GET /queues/service-center/:serviceCenterId

// 2. Queue Operations
// PATCH /queues/:id/check-in
// PATCH /queues/service-center/:serviceCenterId/call-next
// PATCH /queues/:id/complete
// PATCH /queues/:id/cancel
// PATCH /queues/:id/no-show
// PATCH /queues/:id/expire
// PATCH /queues/:id/priority
// POST /queues/service-center/:serviceCenterId/reset

// 3. Queue Information
// GET /queues/:id/position
// GET /queues/service-center/:serviceCenterId/current
// GET /queues/service-center/:serviceCenterId/live
// GET /queues/stats
