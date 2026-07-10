import { stat } from "node:fs";
import * as queueService from "../services/queue.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// JOIN QUEUE
const createQueueEntry = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.body;
    const { id } = req.user;

    const queue = await queueService.createQueueEntryService(
        id,
        serviceCenterId
    );

    return res
        .status(201)
        .json(new ApiResponse(201, queue, "Queue ticket created successfully"));
});

// GET MY ACTIVE QUEUE
const getMyQueue = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const myQueue = await queueService.getMyQueueService(id);

    return res
        .status(200)
        .json(new ApiResponse(200, myQueue, "My Queue fetched successfully"));
});

// GET MY QUEUE HISTORY
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

// GET QUEUE BY ID (owner can view it, admin can view it, assigned staff can view it)
const getQueueById = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const queue = await queueService.getQueueByIdService(queueId, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, queue, "Queue fetched successfully"));
});

// GET QUEUE OF ONE SERVICE CENTER (Admin->all, Assigned staff-> only assigned center)

// GET ALL QUEUE
const getAllQueue = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const queues = await queueService.getAllQueueService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, queues, "Queue fetched successfully"));
});

// CHECK IN (checkedIn=true)

// CALL NEXT CUSTOMER
const callNextCustomer = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.body;

    const customer =
        await queueService.callNextCustomerService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Next customer called"));
});

// COMPLETE QUEUE
const completeCustomer = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const customer = await queueService.completeCustomerService(queueId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Customer completed"));
});

// CANCEL QUEUE

// MARK NO SHOW

// EXPIRE QUEUE

// GET CURRENT TOKEN
const getCurrentToken = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const token = await queueService.getCurrentTokenService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, token, "Current token fetched"));
});

// GET QUEUE POSITION
const getQueuePosition = asyncHandler(async (req, res) => {
    const { serviceCenterId, queueId } = req.params;

    const position = await queueService.getQueuePositionService(
        serviceCenterId,
        queueId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, position, "Queue position fetched"));
});

// DISPLAY QUEUE DATA
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
                "Display data fetched successfully"
            )
        );
});

// QUEUE STATS
const getQueueStats = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const stats = await queueService.getQueueStatsService(serviceCenterId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, stats, "Queue Stats displayed successfully")
        );
});

// RESET QUEUE
const resetQueue = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    await queueService.resetQueueService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Queue reset successfully"));
});

// UPDATE PRIORITY FOR EMERGENCY OR VIP

export {
    createQueueEntry,
    getMyQueue,getMyQueueHistory,

    getQueueById,
    getAllQueue,
    callNextCustomer,
    completeCustomer,
    getCurrentToken,
    getQueuePosition,
    getDisplayQueueData,
    getQueueStats,
    resetQueue,
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
