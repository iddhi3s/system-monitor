import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import morgan from "morgan";

const appVersion = "1.0.0";

// Database Connection
mongoose.connect("mongodb://localhost:27017/system_data");

const db = mongoose.connection;

db.on("error", (error) => {
    console.log(error);
    process.exit(1);
});
db.once("open", () => console.log("Connected to MongoDB"));

// Define Mongoose Schema & Model
const systemSchema = new mongoose.Schema({
    ipAddress: String,
    os: {
        hostname: String,
        platform: String,
        version: String,
        arch: String,
        serial: String,
    },
    disks: [
        {
            device: String,
            interfaceType: String,
            serialNum: String,
            vendor: String,
            type: String,
            name: String,
            size: String,
        },
    ],
    rams: [
        {
            slot: Number,
            manufacturer: String,
            type: String,
            serialNo: String,
            capacity: String,
        },
    ],
    battery: {
        maxCapacity: String,
        voltage: String,
        model: String,
    },
    systemInfo: Object,
    timestamp: String,
});
const SystemInfo = mongoose.model("SystemInfo", systemSchema);

// Create Express app
const app = express();

// CORS configuration
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(morgan("tiny"));

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
app.get("/latest", (_, res) => {
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

app.post("/data", async (req, res) => {
    try {
        const data = req.body;
        const systemData = new SystemInfo(data);
        await systemData.save();
        console.log("System info saved:", data);
        res.send({ message: "Data saved successfully" });
    } catch (error: any) {
        console.error("Error saving data:", error);
        res.status(500).send({
            message: "Error saving data",
            error: error.message,
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
