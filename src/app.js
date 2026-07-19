import express from "express";
import userRoutes from "./routes/user.route.js";
import serviceCenterRoutes from "./routes/serviceCenter.route.js";
import staffAssignmentRoutes from "./routes/staffAssignment.route.js";
import queueRoutes from "./routes/queue.route.js";
import notificationRoutes from "./routes/notification.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";
import cookieParser from "cookie-parser";

import path from "path";
import { apiReference } from "@scalar/express-api-reference";
import YAML from "yamljs";

const app = express();

// BODY PARSING
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

app.use(cookieParser());

// STATIC FILES
app.use(express.static("public"));

// SCALAR MIDDLEWARE
app.use("/api/v1/reference", (req, res, next) => {
    try {
        // 1. Resolve the absolute workspace location of the API specification file
        const yamlPath = path.resolve("src/docs/openapi.yaml");
        // 2. Read and parse the raw YAML content into a standard JavaScript object live
        const freshDocument = YAML.load(yamlPath);
        // 3. Re-initialize a clean instance of Scalar, passing the freshly loaded spec data
        const renderReference = apiReference({
            theme: "saturn", // Layout themes available: 'saturn', 'purple', 'moon', 'solarized', etc.
            spec: {
                content: freshDocument, // Pure object injection prevents front-end rendering loop locks
            },
        });

        // 4. Fire the initialized Scalar renderer engine to handle the browser response
        return renderReference(req, res, next);
    } catch (error) {
        // Graceful error tracking fallback for when the YAML file has broken formatting or syntax typos
        console.error("Error reloading OpenAPI spec:", error);
        res.status(500).send("Error loading API documentation specifications.");
    }
});

// HOME ROUTE
// app.get("/", (req, res) => {
//     res.redirect("/api-docs");
// });

// Root Endpoint
app.get("/api/v1", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.status(200).json({
        name: "WaitLess",
        version: "1.0.0",
        status: "Running",
        message: "API information returned successfully",
        documentation: `${baseUrl}/reference`,
        health: `${baseUrl}/api/v1/health`,
    });
});

// Health check for testing system is running or not
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "WaitLess API is running",
        timestamp: new Date().toISOString(),
    });
});

// API ROUTES
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/service-centers", serviceCenterRoutes);
app.use("/api/v1/staff-assignment", staffAssignmentRoutes);
app.use("/api/v1/queue", queueRoutes);
app.use("/api/v1/notification", notificationRoutes);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 HANDLER
// PUT THIS ALWAYS AFTER API ROUTES, OTHERWISE ROUTES WILL BE NEVER FOUND
app.use((req, res, next) => {
    next(new ApiError(404, "Route not found"));
});

// GLOBAL ERROR HANDLER
app.use(errorMiddleware);

export { app };
