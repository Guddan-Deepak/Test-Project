import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Monitoring Middleware
// Monitoring Middleware
import { blocklistMiddleware } from "./middlewares/blocklist.middleware.js";
import { monitorRequest } from "./middlewares/monitoring.middleware.js";

// app.use(blocklistMiddleware);
app.use(monitorRequest);

// routes import
import logRouter from './routes/log.routes.js'
import authRouter from './routes/auth.route.js'
import incidentRouter from './routes/incident.routes.js'
import adminRouter from './routes/admin.routes.js'

import chatbotRouter from './routes/chatbot.route.js';

// routes declaration

app.use("/api/v1/logs", logRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/incidents", incidentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/chat", chatbotRouter);

export { app };
