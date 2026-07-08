import { stat } from "node:fs";
import * as queueService from "../services/queue.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createQueueEntry = asyncHandler(async (req, res) => {
    const {  serviceCenterId } = req.body;

    const queue = await queueService.createQueueEntryService(req.user.id, serviceCenterId);

    return res
        .status(201)
        .json(new ApiResponse(201, queue, "Queue ticket created successfully"));
});

const getAllQueue = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const queues = await queueService.getAllQueueService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, queues, "Queue fetched successfully"));
});

const callNextCustomer = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.body;

    const customer = await queueService.callNextCustomerService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Next customer called"));
});

const completeCustomer = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const customer = await queueService.completeCustomerService(queueId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Customer completed"));
});

const getCurrentToken = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const token = await queueService.getCurrentTokenService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, token, "Current token fetched"));
});

const getQueuePosition = asyncHandler(async (req, res) => {
    const { serviceCenterId, queueId } = req.params;

    const position = await queueService.getQueuePositionService(serviceCenterId, queueId);

    return res
        .status(200)
        .json(new ApiResponse(200, position, "Queue position fetched"));
});

const getDisplayQueueData = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const displayData = await queueService.getDisplayQueueDataService(serviceCenterId);

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

const getQueueStats = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const stats = await queueService.getQueueStatsService(serviceCenterId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, stats, "Queue Stats displayed successfully")
        );
});

const resetQueue = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    await queueService.resetQueueService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Queue reset successfully"));
});

export {
    createQueueEntry,
    getAllQueue,
    callNextCustomer,
    completeCustomer,
    getCurrentToken,
    getQueuePosition,
    getDisplayQueueData,
    getQueueStats,
    resetQueue,
};
