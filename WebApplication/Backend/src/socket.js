import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
    console.log(`[Socket.IO] Initializing with CORS origin: ${corsOrigin}`);

    io = new Server(server, {
        cors: {
            origin: [corsOrigin, "http://localhost:5174"],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling'], // Explicitly set transports
        allowEIO3: true, // Allow Engine.IO v3 clients
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] New client connected: ${socket.id}`);
        console.log(`[Socket.IO] Total connected clients: ${io.sockets.sockets.size}`);

        socket.on("disconnect", (reason) => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`);
            console.log(`[Socket.IO] Remaining connected clients: ${io.sockets.sockets.size}`);
        });

        socket.on("error", (error) => {
            console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
        });
    });

    io.engine.on("connection_error", (err) => {
        console.error("[Socket.IO] Engine connection error:", err.message);
        console.error("[Socket.IO] Error details:", err);
    });

    console.log("[Socket.IO] Socket.IO server initialized successfully");
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

