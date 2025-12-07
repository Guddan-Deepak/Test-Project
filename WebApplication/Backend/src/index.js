import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'

import { createServer } from "http";
import { Server } from "socket.io";

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

// Update Express CORS too if needed, usually app.js handles it. 
// Assuming app.use(cors(...)) is in app.js. Let's check app.js next.

connectDB()
    .then(() => {
        httpServer.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
