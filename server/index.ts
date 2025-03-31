import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";

const appVersion = "1.0.0";

// Create Express app
const app = express();

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
        res.status(404).json({
            message: "NOT_FOUND",
            fileName: exeFileName,
        });
        return;
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
type SystemData = {
    ipAddress: string;
    os: {
        hostname: string;
        platform: string;
        version: string;
        arch: string;
        serial: string;
    };
    disks: {
        device: string;
        interfaceType: string;
        serialNum: string;
        vendor: string;
        type: string;
        name: string;
        size: string;
    }[];
    rams: {
        slot: number;
        manufacturer: string;
        type: string;
        serialNo: string;
        capacity: string;
    }[];
    battery:
        | {
              maxCapacity: string;
              voltage: string;
              model: string;
          }
        | "No battery detected";
    systemInfo: any; // You can replace `any` with a more specific type if needed
    timestamp: string;
};

app.post("/data", (req, res) => {
    const data: SystemData = req.body;
    console.log(data);
    res.send();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
