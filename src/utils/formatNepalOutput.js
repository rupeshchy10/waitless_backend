import { formatNepalTime } from "./time.js";

// FORMAT OUTPUT IN NEPAL TIME
const formatOutput = (output) => {
    if (!output) return null;

    return {
        ...output,
        nepalTime: {
            createdAtNepalTime: formatNepalTime(output.createdAt),
            updatedAtNepalTime: formatNepalTime(output.updatedAt),
            expiresAtNepalTime: formatNepalTime(output.expiresAt),
            servedAtNepalTime: formatNepalTime(output.servedAt),
            completedAtNepalTime: formatNepalTime(output.completedAt),
            cancelledAtNepalTime: formatNepalTime(output.cancelledAt),
        },
    };
};

const formatMultipleOutputs = (outputs) => {
    if (!outputs) return [];

    return outputs.map(formatOutput);
};

// FORMAT NOTIFICATION OUTPUT IN NEPAL TIME
const formatNotificationOutput = (notification) => {
    if (!notification) return null;

    return {
        ...notification,
        nepalTime: {
            createdAtNepalTime: formatNepalTime(notification.createdAt),
            updatedAtNepalTime: formatNepalTime(notification.updatedAt),
        },
    };
};

const formatMultipleNotificationOutputs = (notifications) => {
    if (!notifications) return [];

    return notifications.map(formatNotificationOutput);
};

export {
    formatOutput,
    formatMultipleOutputs,
    formatNotificationOutput,
    formatMultipleNotificationOutputs,
};
