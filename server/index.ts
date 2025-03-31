import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";

// Define interfaces for type safety
interface SystemInfo {
    cpuUsage: number;
    memoryUsage: number;
    timestamp: string;
}

const appVersion = "1.0.0";

// Validate system information
function validateSystemInfo(data: SystemInfo): boolean {
    return (
        data &&
        typeof data.cpuUsage === "number" &&
        typeof data.memoryUsage === "number" &&
        typeof data.timestamp === "string"
    );
}

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
    },
});

// CORS configuration
app.use(
    cors({
        origin: "*",
    })
);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), "public")));

// Health check route
app.get("/", (req, res) => {
    console.log("Health called");
    res.json({ status: "Server is running" });
});
app.get("/app/:version", (req, res) => {
    const appVer = req.params.version;

    if (appVer === appVersion) {
        res.send({ message: "NO_UPDATE" });
        return;
    }

    res.send({ message: "NEW_UPDATE", new_version: appVersion });
});
app.get("/latest", (req, res) => {
    const exeFileName = `3S_Server_Client ${appVersion}.exe`;
    const filePath = path.join(process.cwd(), "public", exeFileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "NOT_FOUND",
            fileName: exeFileName,
        });
    }

    // Set headers for file download
    res.download(filePath, exeFileName, (err) => {
        if (err) {
            // Handle any errors during download
            console.error("Download error:", err);

            if (!res.headersSent) {
                res.status(500).json({
                    message: "Error downloading file",
                    error: err.message,
                });
            }
        }
    });
});

// Handle incoming WebSocket connections
io.on("connection", (socket) => {
    console.log("A client connected");

    // Handle system information event with type safety
    socket.on("system_info", (data: SystemInfo) => {
        console.log("Received system info:", data);

        // Validate incoming data
        if (validateSystemInfo(data)) {
            // Process the incoming data
            socket.emit("status", {
                message: "Data received successfully",
                receivedAt: new Date().toISOString(),
            });
        } else {
            // Send error if data is invalid
            socket.emit("error", {
                message: "Invalid system info data",
                receivedData: data,
            });
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A client disconnected");
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
