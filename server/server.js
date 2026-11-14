
import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
const server = http.createServer(app);

const frontendUrl = process.env.CLIENT_URL;

const corsOptions = {
    origin: frontendUrl || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "4mb" }));

export const io = new Server(server, {
    cors: corsOptions,
});

export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log("Socket connected:", socket.id);
    console.log("User ID:", userId || "Unknown");

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);

        if (userId && userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Log Socket.IO handshake errors
io.engine.on("connection_error", (err) => {
    console.error("Socket.IO connection error:", {
        code: err.code,
        message: err.message,
        context: err.context,
    });
});

app.get("/", (req, res) => {
    res.send("Server is live");
});

app.use("/api/status", (req, res) => {
    res.send("Server is live");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
