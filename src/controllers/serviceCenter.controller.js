import * as serviceCenterService from "../services/serviceCenter.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// GET ALL SERVICE CENTERS
const getAllServiceCenters = asyncHandler(async (req, res) => {
    const serviceCenters =
        await serviceCenterService.getAllServiceCentersService();

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

// GET MY SERVICE CENTERS
const getMyServiceCenters = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const serviceCenters =
        await serviceCenterService.getMyServiceCentersService(id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                serviceCenters,
                "My service centers fetched successfully"
            )
        );
});

// GET SERVICE CENTER BY ID
const getServiceCenterById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const serviceCenter =
        await serviceCenterService.getServiceCenterByIdService(id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                serviceCenter,
                "Service center fetched successfully"
            )
        );
});

// REGISTER SERVICE CENTER
const registerServiceCenter = asyncHandler(async (req, res) => {
    const { id } = req.user;
 
    let uploadedLogo = null;
    if (req.file) {
        uploadedLogo = await uploadOnCloudinary(
            req.file.path,
            "waitless/service-centers"
        );
    }
 
    const serviceCenter = await serviceCenterService.registerServiceCenterService(
        id,
        {
            ...req.body,
            logo: uploadedLogo?.url,
            logoId: uploadedLogo?.publicId,
        }
    );
 
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                serviceCenter,
                "Service center created successfully"
            )
        );
});
 
// UPDATE SERVICE CENTER
const updateServiceCenter = asyncHandler(async (req, res) => {
    const { id } = req.params;
 
    let uploadedLogo = null;
    if (req.file) {
        uploadedLogo = await uploadOnCloudinary(
            req.file.path,
            "waitless/service-centers"
        );
    }
 
    const serviceCenter = await serviceCenterService.updateServiceCenterService(
        id,
        {
            ...req.body,
            ...(uploadedLogo && {
                logo: uploadedLogo.url,
                logoId: uploadedLogo.publicId,
            }),
        }
    );
 
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                serviceCenter,
                "Service center updated successfully"
            )
        );
});

// DELETE SERVICE CENTER
const deleteServiceCenter = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await serviceCenterService.deleteServiceCenterService(id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Service center deleted successfully")
        );
});

export {
    getAllServiceCenters,
    getMyServiceCenters,
    getServiceCenterById,
    registerServiceCenter,
    updateServiceCenter,
    deleteServiceCenter,
};
