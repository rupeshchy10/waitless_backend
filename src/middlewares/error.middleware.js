export const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    console.error("Error:", err.stack);

    res.status(statusCode).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Something went wrong"
                : err.message,
        errors: err.errors || [],
    });
};
