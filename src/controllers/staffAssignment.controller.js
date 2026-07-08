import * as staffAssignmentService from "../services/staffAssignment.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ASSIGN STAFF TO A SERVICE CENTER
const assignStaff = asyncHandler(async (req, res) => {
    const assignment = await staffAssignmentService.assignStaffService(
        req.body
    );

    return res
        .status(201)
        .json(new ApiResponse(201, assignment, "Staff assigned successfully"));
});

const getAllStaffAssignmentsList = asyncHandler(async (req, res) => {
    const assignments =
        await staffAssignmentService.getAllStaffAssignmentsListService();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                assignments,
                "Staff assignment list fetched successfully"
            )
        );
});

// GET ALL STAFFS ASSIGNED TO ONE SERVICE CENTER
const getStaffsByServiceCenter = asyncHandler(async (req, res) => {
    const { serviceCenterId } = req.params;

    const staffs = await staffAssignmentService.getStaffsByServiceCenterService(
        serviceCenterId,
        req.user
    );

    return res
        .status(200)
        .json(new ApiResponse(200, staffs, "Staffs fetched successfully"));
});

// GET ALL STAFFS ASSIGNED TO ALL SERVICE CENTERS
const getAllStaffAssignments = asyncHandler(async (req, res) => {
    const assignments =
        await staffAssignmentService.getAllStaffAssignmentsService();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                assignments,
                "Staff assignments fetched successfully"
            )
        );
});

// GET ALL SERVICE CENTERS ASSIGNED TO ONE STAFF MEMBER
const getServiceCentersByStaff = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const serviceCenters =
        await staffAssignmentService.getServiceCentersByStaffService(
            userId,
            req.user
        );

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

// GET ALL SERVICE CENTERS ASSIGNED TO ALL STAFF MEMBERS
const getAllServiceCentersByStaffs = asyncHandler(async (req, res) => {
    const serviceCenters =
        await staffAssignmentService.getAllServiceCentersByStaffsService();

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

// REMOVE STAFF ASSIGNMENT
const removeStaffAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await staffAssignmentService.removeStaffAssignmentService(id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Staff assignment removed successfully")
        );
});

export {
    assignStaff,
    getAllStaffAssignmentsList,
    getStaffsByServiceCenter,
    getAllStaffAssignments,
    getServiceCentersByStaff,
    getAllServiceCentersByStaffs,
    removeStaffAssignment,
};
