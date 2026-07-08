import { ApiError } from "../utils/ApiError.js";

const validateStaffAssignment = ({ userId, serviceCenterId }) => {
    if (!userId?.trim()) {
        throw new ApiError(400, "User ID is required");
    }

    if (!serviceCenterId?.trim()) {
        throw new ApiError(400, "Service Center ID is required");
    }
};

export { validateStaffAssignment };
