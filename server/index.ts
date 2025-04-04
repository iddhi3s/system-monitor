import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { DataTypes, Model, Op, Sequelize } from "sequelize";
import moment from "moment";

// Database connection
// @ts-ignore
const sequelize = new Sequelize(process.env.WEB_CREDINTIALS_DB_URL, {
    logging: false,
});

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

// Check if new release available
// app.get("/app/:version", (req, res) => {
//     const appVer = req.params.version;

//     if (appVer === appVersion) {
//         res.send({ message: "NO_UPDATE" });
//         re
// turn;
//     }

//     res.send({ message: "NEW_UPDATE", new_version: appVersion });
// });

// Send the latest exe file
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
    }[];
    RamDetails: {
        Slot: string;
        Name: string;
        Locator: string;
        SerialNumber: string;
        Capacity: number;
    }[];
    GpuDevices: {
        Slot: string;
        Name: string;
        Description: string;
        Ram: number;
    }[];
    MonitorDevices: {
        Name: string;
        Model: string;
        SerialNumber: string;
    }[];
    createdAt: any;
    updatedAt: any;
};

// Recieve the system information to here
app.post("/data", async (req, res) => {
    const data: SystemInfoType = req.body;

    try {
        const exist = await SystemInfo.findOne({
            where: {
                MACAddress: data.MACAddress,
            },
        });
        if (exist) {
            await exist.update({
                Manufacturer: data.Manufacturer,
                ManufactureDate: data.ManufactureDate,
                Model: data.Model,
                SKU: data.SKU,
                SerialNo: data.SerialNo,
                IPAddress: data.IPAddress,
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
            console.log("System info updated for:", data.MACAddress);
        } else {
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
        }
        res.send();
    } catch (error: any) {
        console.log("Error saving data for:", data.MACAddress);
        console.error(error);
        res.status(500).send();
    }
});

// Send all the machines
app.get("/machines", async (req, res) => {
    try {
        const latestMachines = await SystemInfo.findAll({
            attributes: ["IPAddress", "updatedAt", "Hostname", "MACAddress"],
        });

        const modifiedMachines = latestMachines.map((machine: any) => {
            const timeAgo = moment(machine.updatedAt).fromNow();
            return {
                IPAddress: machine.IPAddress,
                Hostname: machine.Hostname,
                MACAddress: machine.MACAddress,
                lastSent: timeAgo,
                updatedAt: moment(machine.updatedAt).format("YYYY/MM/DD HH:mm"),
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
        const total = await SystemInfo.count();

        res.send({ total });
    } catch (error) {
        console.error("Error fetching total machines:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/machines/inactive", async (req, res) => {
    try {
        const total = await SystemInfo.count({
            where: {
                updatedAt: {
                    [Op.lt]: Sequelize.literal("NOW() - INTERVAL 3 DAY"),
                },
            },
        });

        res.json({ total });
    } catch (error) {
        console.error("Error fetching inactive machine count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/machines/os-distribution", async (req, res) => {
    try {
        const machines = await SystemInfo.findAll({
            attributes: ["OSVersion"],
        });
        const osCounts: Record<string, number> = {};

        machines.forEach((machine) => {
            const version = machine.OSVersion || "Unknown";
            osCounts[version] = (osCounts[version] || 0) + 1;
        });
        const distribution = Object.entries(osCounts).map(([name, count]) => ({
            name,
            count,
        }));
        res.json(distribution);
    } catch (error) {
        console.error("Error fetching RAM distribution:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get single machine by MAC Address
app.get("/machines/:mac", async (req, res) => {
    const { mac } = req.params;

    try {
        const machine: any = await SystemInfo.findOne({
            where: {
                MACAddress: mac,
            },
        });
        if (!machine) {
            res.status(404).send("Machine not found");
            return;
        }
        // @ts-ignore
        const timeAgo = moment(machine.updatedAt).fromNow();
        machine.RamDetails = machine.RamDetails.map((ram: any) => ({
            ...ram,
            Capacity: `${ram.Capacity} GB`,
        }));
        machine.GpuDevices = machine.GpuDevices.map((gpu: any) => ({
            ...gpu,
            Ram: `${Math.round(gpu.Ram)} GB`,
        }));
        res.send({
            Manufacturer: machine.Manufacturer,
            ManufactureDate: machine.ManufactureDate,
            Model: machine.Model,
            SKU: machine.SKU,
            SerialNo: machine.SerialNo,
            IPAddress: machine.IPAddress,
            MACAddress: machine.MACAddress,
            LoggedUser: machine.LoggedUser,
            BootDateTime: machine.BootDateTime,
            Hostname: machine.Hostname,
            OSVersion: machine.OSVersion,
            OSArch: machine.OSArch,
            OSSerial: machine.OSSerial,
            OSRelease: machine.OSRelease,
            CPUBrand: machine.CPUBrand,
            CPULogicalCores: machine.CPULogicalCores,
            CPUPhysicalCores: machine.CPUPhysicalCores,
            CPUSpeed: `${Math.floor(machine.CPUSpeed / 10) / 100} GHz`,
            StorageDevices: machine.StorageDevices,
            RamDetails: machine.RamDetails,
            GpuDevices: machine.GpuDevices,
            MonitorDevices: machine.MonitorDevices,
            lastSent: timeAgo,
            updatedAt: moment(machine.updatedAt).format("YYYY/MM/DD HH:mm"),
        });
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
