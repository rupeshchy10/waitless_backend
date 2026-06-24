import { app } from "./app.js";
import { connectDB } from "./db/dbConnect.js";

const port = process.env.PORT || 8000;

let server;

const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(port, () => {
            console.log(`Server is running at port ${port}...`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
    }
};

startServer();