import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/prisma.js";

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected via Prisma");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw new ApiError(
            500,
            process.env.NODE_ENV === "production"
                ? "Database connection failed"
                : `Database connection failed: ${error.message}`
        );
    }
};

const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log("Database disconnected successfully");
    } catch (error) {
        console.error("Error during DB disconnect:", error);
        throw new ApiError(
            500,
            process.env.NODE_ENV === "production"
                ? "Database disconnection failed"
                : `Database disconnection failed: ${error.message}`
        );
    }
};

export { connectDB, disconnectDB };
