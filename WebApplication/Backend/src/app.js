import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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

// routes declaration
app.use("/api/v1/logs", logRouter)
app.use("/api/v1/auth", authRouter)

export { app }
