import { ApiError } from "./ApiError.js";

const parseClosedDays = (value) => {
    if (value === undefined) return undefined;

    let parsed = value;

    if (typeof value === "string") {
        try {
            parsed = JSON.parse(value);
        } catch {
            throw new ApiError(
                400,
                "closedDays must be a JSON array of numbers, e.g. [0,6]"
            );
        }
    }

    if (!Array.isArray(parsed)) {
        throw new ApiError(400, "closedDays must be an array");
    }

    const isValidDay = (n) => Number.isInteger(n) && n >= 0 && n <= 6;

    if (!parsed.every(isValidDay)) {
        throw new ApiError(
            400,
            "closedDays values must be integers 0-6 (0 = Sunday ... 6 = Saturday)"
        );
    }

    // De-duplicate — [6, 6, 0] and [0, 6] should behave identically.
    return [...new Set(parsed)];
};

export { parseClosedDays };