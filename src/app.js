import express from "express";
import serviceCenterRoutes from "./routes/serviceCenter.route.js";
import queueRoutes from "./routes/queue.route.js";
import userRoutes from "./routes/user.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";
import cookieParser from "cookie-parser";

const app = express();

// BODY PARSING
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

app.use(cookieParser());

// STATIC FILES
app.use(express.static("public"));

// Health check for testing system is running or not
app.get("/test", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "WaitLess API is running",
    });
    console.log("WaitLess API is running...");
});

// API ROUTES
app.use("/api/v1/service-centers", serviceCenterRoutes);
app.use("/api/v1/queue", queueRoutes);
app.use("/api/v1/user", userRoutes);

// 404 HANDLER
// PUT THIS ALWAYS AFTER API ROUTES, OTHERWISE ROUTES WILL BE NEVER FOUND
app.use((req, res, next) => {
    next(new ApiError(404, "Route not found"));
});

// GLOBAL ERROR HANDLER
app.use(errorMiddleware);

export { app };
