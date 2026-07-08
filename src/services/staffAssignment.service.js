import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/prisma.js";

// ASSIGN STAFF TO A SERVICE CENTER
const assignStaffService = async ({ userId, serviceCenterId }) => {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 2. User must be STAFF
    if (user.role !== "STAFF") {
        throw new ApiError(
            400,
            "Only users with the STAFF role can be assigned"
        );
    }

    // 3. Check service center
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: { id: serviceCenterId },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 4. Check duplicate assignment
    const existingAssignment = await prisma.staffAssignment.findUnique({
        where: {
            userId_serviceCenterId: {
                userId,
                serviceCenterId,
            },
        },
    });

    if (existingAssignment) {
        throw new ApiError(
            409,
            "Staff is already assigned to this service center"
        );
    }

    // 5. Create assignment
    const assignment = await prisma.staffAssignment.create({
        data: {
            userId,
            serviceCenterId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            serviceCenter: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    return assignment;
};

// GET ALL STAFF ASSIGNMENT LIST
const getAllStaffAssignmentsListService = async () => {
    const assignments = await prisma.staffAssignment.findMany({
        orderBy: {
            user: {
                fullName: "asc",
            },
        },
        select: {
            id: true,
            userId: true,
            serviceCenterId: true,
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
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

    return assignments;
};

// GET ALL STAFFS ASSIGNED TO ONE SERVICE CENTER
const getStaffsByServiceCenterService = async (
    serviceCenterId,
    currentUser
) => {
    // 1. Check if service center exists
    const serviceCenter = await prisma.serviceCenter.findUnique({
        where: {
            id: serviceCenterId,
        },
    });

    if (!serviceCenter) {
        throw new ApiError(404, "Service center not found");
    }

    // 2. If STAFF, verify they are assigned to this service center
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
                "You are not assinged to this service center"
            );
        }
    }

    // 3. Fetch all staff assigned to this service center

    const staffs = await prisma.staffAssignment.findMany({
        where: { serviceCenterId },
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    address: true,
                    role: true,
                },
            },
        },
        orderBy: {
            user: {
                fullName: "asc",
            },
        },
    });

    return {
        serviceCenter: {
            id: serviceCenter.id,
            name: serviceCenter.name,
        },
        totalStaffs: staffs.length,
        staffs,
    };
};

// GET ALL STAFFS ASSIGNED TO ALL SERVICE CENTERS
const getAllStaffAssignmentsService = async () => {
    const serviceCenters = await prisma.serviceCenter.findMany({
        orderBy: {
            name: "asc",
        },
        select: {
            id: true,
            name: true,
            address: true,
            staffAssignments: {
                orderBy: {
                    user: {
                        fullName: "asc",
                    },
                },
                select: {
                    id: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            role: true,
                        },
                    },
                },
            },
        },
    });

    return serviceCenters.map((serviceCenter) => ({
        serviceCenterId: serviceCenter.id,
        name: serviceCenter.name,
        address: serviceCenter.address,
        totalStaffs: serviceCenter.staffAssignments.length,
        staffs: serviceCenter.staffAssignments.map(
            (assignment) => assignment.user
        ),
    }));
};

// GET ALL SERVICE CENTERS ASSIGNED TO ONE STAFF MEMBER
const getServiceCentersByStaffService = async (userId, currentUser) => {
    // 1. Check if staff exists
    const staff = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
        },
    });

    if (!staff) {
        throw new ApiError(404, "Staff not found");
    }

    // 2. Must be staff
    if (staff.role !== "STAFF") {
        throw new ApiError(400, "User is not a staff member");
    }

    // 3. STAFF can only view their own assignments
    if (currentUser.role === "STAFF" && currentUser.id !== userId) {
        throw new ApiError(403, "You can only view your own service centers");
    }
    // 4. Fetch assigned service centers
    const assignments = await prisma.staffAssignment.findMany({
        where: {
            userId,
        },
        select: {
            serviceCenter: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    email: true,
                    phoneNumber: true,
                    openingTime: true,
                    closingTime: true,
                    averageServiceTime: true,
                },
            },
        },
        orderBy: {
            serviceCenter: {
                name: "asc",
            },
        },
    });

    return {
        staff,
        totalServiceCenters: assignments.length,
        serviceCenters: assignments.map(
            (assignment) => assignment.serviceCenter
        ),
    };
};

// GET ALL SERVICE CENTERS ASSIGNED TO ALL STAFF MEMBERS
const getAllServiceCentersByStaffsService = async () => {
    const staffs = await prisma.user.findMany({
        where: {
            role: "STAFF",
            staffAssignments: {
                some: {}, // Only staffs having atleast one assignment
            },
        },
        orderBy: {
            fullName: "asc",
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            address: true,
            role: true,
            staffAssignments: {
                orderBy: {
                    serviceCenter: {
                        name: "asc",
                    },
                },
                select: {
                    serviceCenter: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            email: true,
                            phoneNumber: true,
                            openingTime: true,
                            closingTime: true,
                            averageServiceTime: true,
                        },
                    },
                },
            },
        },
    });
    return staffs.map((staff) => ({
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        phoneNumber: staff.phoneNumber,
        address: staff.address,
        role: staff.role,
        totalServiceCenters: staff.staffAssignments.length,
        serviceCenters: staff.staffAssignments.map(
            (assignment) => assignment.serviceCenter
        ),
    }));
};

// REMOVE A STAFF ASSIGNMENT
const removeStaffAssignmentService = async (id) => {
    // 1. Check if assignment exists
    const assignment = await prisma.staffAssignment.findUnique({
        where: {
            id,
        },
    });

    if (!assignment) {
        throw new ApiError(404, "Staff assignment not found");
    }

    // 2. Delete assignment
    await prisma.staffAssignment.delete({
        where: {
            id,
        },
    });

    return true;
};

export {
    assignStaffService,
    getAllStaffAssignmentsListService,
    getStaffsByServiceCenterService,
    getAllStaffAssignmentsService,
    getServiceCentersByStaffService,
    getAllServiceCentersByStaffsService,
    removeStaffAssignmentService,
};
