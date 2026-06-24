import * as serviceCenter from "../services/serviceCenter.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createServiceCenterController = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const createserviceCenter = await serviceCenter.createServiceCenter(name);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createserviceCenter,
                "Service center created successfully"
            )
        );
});

const getAllServiceCentersController = asyncHandler(async (req, res) => {
    const serviceCenters = await serviceCenter.getAllServiceCenters();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                serviceCenters,
                "Service centers fetched successfully"
            )
        );
});

export { createServiceCenterController, getAllServiceCentersController };
