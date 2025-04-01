import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { DataTypes, Sequelize } from "sequelize";

// Database connection
// @ts-ignore
const sequelize = new Sequelize(process.env.WEB_CREDINTIALS_DB_URL);

// Define the SystemInfo model
const SystemInfo = sequelize.define("MachineDetail", {
    ipAddress: { type: DataTypes.STRING },
    macAddress: { type: DataTypes.STRING },
    loggedInUser: { type: DataTypes.STRING },
    loggedDate: { type: DataTypes.STRING },
    loggedTime: { type: DataTypes.STRING },
    os: { type: DataTypes.TEXT },
    cpu: { type: DataTypes.TEXT },
    disks: { type: DataTypes.TEXT },
    rams: { type: DataTypes.TEXT },
    gpu: { type: DataTypes.TEXT },
    monitors: { type: DataTypes.TEXT },
    battery: { type: DataTypes.TEXT },
    systemInfo: { type: DataTypes.TEXT },
    timestamp: { type: DataTypes.STRING },
});

sequelize
    .authenticate()
    .then(() => {
        sequelize.sync().then(() => console.log("Database synced"));
    })
    .catch((error) => {
        console.log("Error connecting to the databse: " + error.message);
        process.exit(1);
    });

const appVersion = "1.0.0";

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
type SystemInfoType = {
    ipAddress: string;
    macAddress: string;
    loggedInUser: string;
    loggedDate: string;
    loggedTime: string;
    os: {
        hostname: string;
        platform: string;
        version: string;
        arch: string;
        serial: string;
        release: string;
    };
    cpu: {
        manufacturer: string;
        brand: string;
        cores: number;
        speed: string;
    };
    disks: [
        {
            slot: number;
            interfaceType: string;
            serialNum: string;
            vendor: string;
            type: string;
            name: string;
            size: string;
        },
        {
            device: string;
            interfaceType: string;
            serialNum: string;
            vendor: string;
            type: string;
            name: string;
            size: string;
        }
    ];
    rams: [
        {
            slot: number;
            manufaturer: string;
            type: string;
            serialNo: string;
            capacity: string;
        }
    ];
    gpu: [
        {
            slot: number;
            vendor: string;
            model: string;
            vram: number;
        },
        {
            slot: number;
            vendor: string;
            model: string;
            vram: number;
        }
    ];
    monitors: [
        {
            slot: number;
            connection: string;
        },
        {
            slot: number;
            connection: string;
        }
    ];
    battery: {
        maxCapacity: string;
        voltage: string;
        model: string;
    };
    systemInfo: {
        manufacturer: string;
        model: string;
        version: string;
        serial: string;
        uuid: string;
        sku: string;
        virtual: boolean;
    };
    timestamp: string;
};

app.post("/data", async (req, res) => {
    const data: SystemInfoType = req.body;
    try {
        console.log(data);
        await SystemInfo.create({
            ipAddress: data.ipAddress,
            macAddress: data.macAddress,
            loggedInUser: data.loggedInUser,
            loggedDate: data.loggedDate,
            loggedTime: data.loggedTime,
            os: JSON.stringify(data.os),
            cpu: JSON.stringify(data.cpu),
            disks: JSON.stringify(data.disks),
            rams: JSON.stringify(data.rams),
            gpu: JSON.stringify(data.gpu),
            monitors: JSON.stringify(data.monitors),
            battery: JSON.stringify(data.battery),
            systemInfo: JSON.stringify(data.systemInfo),
            timestamp: data.timestamp,
        });
        console.log("System info saved for:", data.ipAddress);
        res.send();
    } catch (error: any) {
        console.log("Error saving data for:", data.ipAddress);
        console.error(error);
        res.status(500).send();
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
