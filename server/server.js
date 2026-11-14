import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Store online users: { userId: socketId }
export const userSocketMap = {};

// Socket.IO connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log("User Connected:", userId || "Unknown user");

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // Send online user IDs to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("User Disconnected:", userId || "Unknown user");

        // Prevent an old socket from deleting a newer connection
        if (userId && userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes setup
app.get("/", (req, res) => {
    res.send("Server is live");
});

app.use("/api/status", (req, res) => {
    res.send("Server is live");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB and start server
await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
});