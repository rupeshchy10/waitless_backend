import { stat } from "node:fs";
import {
    createQueueEntry,
    getQueue,
    callNextCustomer,
    completeCustomer,
    getCurrentToken,
    getQueuePosition,
    getDisplayData,
    getQueueStats,
} from "../services/queue.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCustomer = asyncHandler(async (req, res) => {
    const { customerName, serviceCenterId } = req.body;

    const queue = await createQueueEntry(customerName, serviceCenterId);

    return res
        .status(201)
        .json(new ApiResponse(201, queue, "Customer added to queue"));
});

const getAllQueue = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const queues = await getQueue(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, queues, "Queue fetched successfully"));
});

const nextCustomer = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.body;

    const customer = await callNextCustomer(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Next customer called"));
});

const completedCurrentCustomer = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const customer = await completeCustomer(queueId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Customer completed"));
});

const currentToken = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const token = await getCurrentToken(serviceCenterId);

    return res
        .status(200)
        .json(new ApiResponse(200, token, "Current token fetched"));
});

const queuePosition = asyncHandler(async (req, res) => {
    const { serviceCenterId, queueId } = req.params;

    const position = await getQueuePosition(serviceCenterId, queueId);

    return res
        .status(200)
        .json(new ApiResponse(200, position, "Queue position fetched"));
});

const displayQueue = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const displayData = await getDisplayData(serviceCenterId);

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

const queueStats = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const stats = await getQueueStats(serviceCenterId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                stats,
                "Queue Stats displayed successfully"
            )
        );
});

export {
    addCustomer,
    getAllQueue,
    nextCustomer,
    completedCurrentCustomer,
    currentToken,
    queuePosition,
    displayQueue,
    queueStats
};
