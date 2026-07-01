import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    // 1. GET TOKEN FROM COOKIE
    if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    // 2. OR GET TOKEN FROM AUTHORIZATION HEADER
    const authHeader = req.headers.authorization;
    if (!token && authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired");
        }
        throw new ApiError(401, "Invalid token");
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
        },
    });

    if (!user) {
        throw new ApiError(401, "User no longer exists");
    }

    req.user = user;

    next();
});

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "Forbidden");
        }

        next();
    };
};

export { authMiddleware, authorizeRoles };
