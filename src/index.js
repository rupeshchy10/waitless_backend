import "dotenv/config";
import { connectDB, disconnectDB } from "./db/dbConnect.js";
import { app } from "./app.js";
import "./utils/queueExpiry.js";

const port = process.env.PORT || 8000;

let server;

// FUNCTION TO GRACEFULLY SHUTDOWN SERVER
const shutdown = async (exitCode = 0) => {
    try {
        console.log("Shutting down gracefully...");

        if (server) {
            //  WAIT FOR SERVER TO CLOSE
            await new Promise((resolve) => server.close(resolve));
        }
        await disconnectDB();
    } catch (error) {
        console.error("Error during shutdown:", error);
    } finally {
        process.exit(exitCode);
    }
};

// START THE SERVER
const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}/api/v1`);
            console.log(
                `Docs available at http://localhost:${port}/api/v1/reference`
            );
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        await shutdown(1);
    }
};

startServer();

// GLOBAL ERROR HANDLERS
["unhandledRejection", "uncaughtException"].forEach((event) => {
    process.on(event, async (err) => {
        console.error(`${event}:`, err.stack || err);
        await shutdown(1);
    });
});

// GRACEFUL SHUTDOWN FOR TERMINATION SIGNALS
["SIGTERM", "SIGINT"].forEach((signal) => {
    process.on(signal, async () => {
        console.log(`${signal} received, shutting down...`);
        await shutdown(0);
    });
});
