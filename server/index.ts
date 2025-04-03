import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { DataTypes, Model, Sequelize } from "sequelize";
import moment from "moment";

// Database connection
// @ts-ignore
const sequelize = new Sequelize(process.env.WEB_CREDINTIALS_DB_URL);

// Define the SystemInfo model
const SystemInfo = sequelize.define("MachineDetail", {
    Manufacturer: { type: DataTypes.STRING },
    ManufactureDate: { type: DataTypes.STRING },
    Model: { type: DataTypes.STRING },
    SKU: { type: DataTypes.STRING },
    SerialNo: { type: DataTypes.STRING },
    IPAddress: { type: DataTypes.STRING },
    MACAddress: { type: DataTypes.STRING },
    LoggedUser: { type: DataTypes.STRING },
    BootDateTime: { type: DataTypes.STRING },
    Hostname: { type: DataTypes.STRING },
    OSVersion: { type: DataTypes.STRING },
    OSArch: { type: DataTypes.STRING },
    OSSerial: { type: DataTypes.STRING },
    OSRelease: { type: DataTypes.STRING },
    CPUBrand: { type: DataTypes.STRING },
    CPULogicalCores: { type: DataTypes.STRING },
    CPUPhysicalCores: { type: DataTypes.STRING },
    CPUSpeed: { type: DataTypes.STRING },
    StorageDevices: {
        type: DataTypes.TEXT,
        get() {
            return JSON.parse(this.getDataValue("StorageDevices") || "[]");
        },
        set(value) {
            this.setDataValue("StorageDevices", JSON.stringify(value));
        },
    },
    RamDetails: {
        type: DataTypes.TEXT,
        get() {
            return JSON.parse(this.getDataValue("RamDetails") || "[]");
        },
        set(value) {
            this.setDataValue("RamDetails", JSON.stringify(value));
        },
    },
    GpuDevices: {
        type: DataTypes.TEXT,
        get() {
            return JSON.parse(this.getDataValue("GpuDevices") || "[]");
        },
        set(value) {
            this.setDataValue("GpuDevices", JSON.stringify(value));
        },
    },
    MonitorDevices: {
        type: DataTypes.TEXT,
        get() {
            return JSON.parse(this.getDataValue("MonitorDevices") || "[]");
        },
        set(value) {
            this.setDataValue("MonitorDevices", JSON.stringify(value));
        },
    },
    lastSent: { type: DataTypes.STRING },
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
    Manufacturer: string;
    ManufactureDate: string;
    Model: string;
    SKU: string;
    SerialNo: string;
    IPAddress: string;
    MACAddress: string;
    LoggedUser: string;
    BootDateTime: string;
    Hostname: string;
    OSVersion: string;
    OSArch: string;
    OSSerial: string;
    OSRelease: string;
    CPUBrand: string;
    CPULogicalCores: string;
    CPUPhysicalCores: string;
    CPUSpeed: string;
    StorageDevices: {
        Slot: string;
        MediaType: string;
        SerialNumber: string;
        Name: string;
        Size: number;
    };
    RamDetails: {
        Slot: string;
        Name: string;
        Locator: string;
        SerialNumber: string;
        Capacity: number;
    };
    GpuDevices: {
        Slot: string;
        Name: string;
        Description: string;
        Ram: number;
    };
    MonitorDevices: {
        Name: string;
        Model: string;
        SerialNumber: string;
    };
    lastSent: string;
};

app.post("/data", async (req, res) => {
    const data: SystemInfoType = req.body;

    try {
        console.log(data);
        await SystemInfo.create({
            Manufacturer: data.Manufacturer,
            ManufactureDate: data.ManufactureDate,
            Model: data.Model,
            SKU: data.SKU,
            SerialNo: data.SerialNo,
            IPAddress: data.IPAddress,
            MACAddress: data.MACAddress,
            LoggedUser: data.LoggedUser,
            BootDateTime: data.BootDateTime,
            Hostname: data.Hostname,
            OSVersion: data.OSVersion,
            OSArch: data.OSArch,
            OSSerial: data.OSSerial,
            OSRelease: data.OSRelease,
            CPUBrand: data.CPUBrand,
            CPULogicalCores: data.CPULogicalCores,
            CPUPhysicalCores: data.CPUPhysicalCores,
            CPUSpeed: data.CPUSpeed,
            StorageDevices: data.StorageDevices,
            RamDetails: data.RamDetails,
            GpuDevices: data.GpuDevices,
            MonitorDevices: data.MonitorDevices,
        });
        console.log("System info saved for:", data.MACAddress);
        res.send();
    } catch (error: any) {
        console.log("Error saving data for:", data.MACAddress);
        console.error(error);
        res.status(500).send();
    }
});

app.get("/machines", async (req, res) => {
    try {
        const [latestMachines] = await sequelize.query(`
            SELECT * FROM MachineDetails m1
            WHERE createdAt = (
                SELECT MAX(createdAt) FROM MachineDetails m2
                WHERE m1.macAddress = m2.macAddress
            )
        `);

        const modifiedMachines = latestMachines.map((machine: any) => {
            const timeAgo = moment(machine.timestamp).fromNow();
            return {
                ...machine,
                os: JSON.parse(machine.os),
                cpu: JSON.parse(machine.cpu),
                disks: JSON.parse(machine.disks),
                rams: JSON.parse(machine.rams),
                gpu: JSON.parse(machine.gpu),
                monitors: JSON.parse(machine.monitors),
                battery: JSON.parse(machine.battery),
                systemInfo: JSON.parse(machine.systemInfo),
                lastSent: timeAgo,
                timestamp: moment(machine.timestamp).format("YYYY/MM/DD HH:mm"),
            };
        });

        res.send(modifiedMachines);
    } catch (error) {
        console.error("Error fetching machine details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/machines/total", async (req, res) => {
    try {
        const [result] = await sequelize.query(`
            SELECT COUNT(DISTINCT serial) AS total FROM MachineDetails
        `);

        const totalMachines = result[0]?.total || 0; // Extract count safely

        console.log("Total Machines:", totalMachines);
        res.send({ total: totalMachines });
    } catch (error) {
        console.error("Error fetching total machines:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/machines/inactive", async (req, res) => {
    try {
        const [result] = await sequelize.query(`
            SELECT COUNT(*) AS inactiveCount 
            FROM MachineDetails
            WHERE timestamp < NOW() - INTERVAL 2 DAY
        `);

        res.json({ inactiveCount: result[0].inactiveCount });
    } catch (error) {
        console.error("Error fetching inactive machine count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/machines/ram-distribution", async (req, res) => {
    try {
        const [latestMachines] = await sequelize.query(`
            WITH RankedMachines AS (
                SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY serial ORDER BY createdAt DESC) AS rn
                FROM MachineDetails
            )
            SELECT JSON_UNQUOTE(JSON_EXTRACT(rams, '$[0].capacity')) AS ram
            FROM RankedMachines
            WHERE rn = 1;
        `);

        const ramCounts = latestMachines.reduce(
            (acc: Record<string, number>, machine: any) => {
                const ramSize = machine.ram + "GB";
                acc[ramSize] = (acc[ramSize] || 0) + 1;
                return acc;
            },
            {}
        );

        const formattedData = Object.entries(ramCounts).map(([ram, count]) => ({
            ram,
            count,
        }));

        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching RAM distribution:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/machines/:serial", async (req, res) => {
    const { serial } = req.params;

    try {
        // Query to get all records for a given serial
        const machines = await sequelize.query(
            `
            SELECT * FROM MachineDetails m1
            WHERE m1.serial = :serial
            ORDER BY m1.createdAt DESC
        `,
            {
                replacements: { serial },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Modify the data with necessary transformations
        const modifiedMachines = machines.map((machine: any) => {
            const timeAgo = moment(machine.timestamp).fromNow();
            return {
                ...machine,
                os: JSON.parse(machine.os),
                cpu: JSON.parse(machine.cpu),
                disks: JSON.parse(machine.disks),
                rams: JSON.parse(machine.rams),
                gpu: JSON.parse(machine.gpu),
                monitors: JSON.parse(machine.monitors),
                battery: JSON.parse(machine.battery),
                systemInfo: JSON.parse(machine.systemInfo),
                lastSent: timeAgo, // Display time since last sent
                timestamp: moment(machine.timestamp).format("YYYY/MM/DD HH:mm"), // Format timestamp
            };
        });

        res.send(modifiedMachines);
    } catch (error) {
        console.error("Error fetching machine details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
