import { stat } from "node:fs";
import {
    createQueueEntryService,
    getAllQueueService,
    callNextCustomerService,
    completeCustomerService,
    getCurrentTokenService,
    getQueuePositionService,
    getDisplayQueueDataService,
    getQueueStatsService,
    resetQueueService,
} from "../services/queue.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createQueueEntryController = asyncHandler(async (req, res) => {
    const { customerName, serviceCenterId } = req.body;

    const queue = await createQueueEntryService(customerName, serviceCenterId);

    return res
        .status(201)
        .json(new ApiResponse(201, queue, "Customer added to queue"));
});

const getAllQueueController = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const queues = await getAllQueueService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, queues, "Queue fetched successfully"));
});

const callNextCustomerController = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.body;

    const customer = await callNextCustomerService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Next customer called"));
});

const completeCustomerController = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const customer = await completeCustomerService(queueId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Customer completed"));
});

const getCurrentTokenController = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const token = await getCurrentTokenService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, token, "Current token fetched"));
});

const getQueuePositionController = asyncHandler(async (req, res) => {
    const { serviceCenterId, queueId } = req.params;

    const position = await getQueuePositionService(serviceCenterId, queueId);

    return res
        .status(200)
        .json(new ApiResponse(200, position, "Queue position fetched"));
});

const getDisplayQueueDataController = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const displayData = await getDisplayQueueDataService(serviceCenterId);

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

const getQueueStatsController = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const stats = await getQueueStatsService(serviceCenterId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, stats, "Queue Stats displayed successfully")
        );
});

const resetQueueController = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    await resetQueueService(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Queue reset successfully"));
});

export {
    createQueueEntryController,
    getAllQueueController,
    callNextCustomerController,
    completeCustomerController,
    getCurrentTokenController,
    getQueuePositionController,
    getDisplayQueueDataController,
    getQueueStatsController,
    resetQueueController,
};
