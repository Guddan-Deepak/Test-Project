import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'

import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket.js";
import { startLogCleanup } from "./utils/cleanupService.js";
import { seedKnowledgeBase } from "./services/rag.service.js";

dotenv.config({
    path: './.env'
})
const httpServer = createServer(app);

const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000"
];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

app.set("io", io);


connectDB()
    .then(async () => {
        const server = createServer(app);
        initSocket(server);
        startLogCleanup();

        // Seed RAG Data
        try {
            await seedKnowledgeBase();
        } catch (err) {
            console.error("Seeding Failed:", err);
        }

        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
