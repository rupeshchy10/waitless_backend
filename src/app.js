import express from "express";
import serviceCenterRouter from "./routes/serviceCenter.route.js";
import queueRouter from "./routes/queue.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/v1/service-centers", serviceCenterRouter);

app.use("/api/v1/queue", queueRouter);

app.use(errorMiddleware);

export { app };
