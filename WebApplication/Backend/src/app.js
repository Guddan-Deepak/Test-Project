import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Monitoring Middleware
import { monitorRequest } from "./controllers/monitoring.controller.js";
app.use(monitorRequest);

// routes import
import logRouter from './routes/log.routes.js'

// routes declaration
app.use("/api/v1/logs", logRouter)

export { app }
