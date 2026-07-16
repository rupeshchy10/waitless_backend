import { ApiError } from "./ApiError.js";
import { prisma } from "./prisma.js";

const createNotification = async ({ userId, title, message }) => {
    if (!userId || !title || !message) {
        throw new ApiError(
            400,
            "userId, title and message are required to create a notification"
        );
    }

    return prisma.notification.create({
        data: {
            userId,
            title,
            message,
        },
    });
};

export default createNotification;
