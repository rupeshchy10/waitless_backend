class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);

        // 1. CORE INFO
        this.statusCode = statusCode;
        this.success = false;

        // 2. MESSAGE AND DATA
        this.message = message; // safe, explicit, future-proof
        this.data = null;

        // 3. EXTRA DETAILS
        this.errors = errors;

        // 4. DEBUGGING
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
