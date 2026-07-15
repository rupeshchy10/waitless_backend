import { formatNepalTime } from "./time.js";

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

export { formatOutput, formatMultipleOutputs };
