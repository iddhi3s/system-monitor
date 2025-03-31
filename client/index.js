const { app } = require("electron");
const si = require("systeminformation");
const axios = require("axios");
const winston = require("winston");
const path = require("path");

const LOCATION = "C:\\Service\\";
const URL = "http://192.168.1.32:3000/data";

// Setup Winston Logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(LOCATION, "client.log"),
        }),
    ],
});

app.whenReady().then(async () => {
    // Do not create a window
    logger.info("Electron is running in background mode...");

    await sendSystemInfo();
    logger.info("Exit application");
    app.quit();
});

async function sendSystemInfo() {
    logger.info("Sending client data");
    try {
        const data = await getSystemInfo();
        await axios.post(URL, data);
        logger.info("System data sent");
    } catch (error) {
        logger.info("Error sending system info: " + error.message);
        logger.info("Retrying in 1 second");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await sendSystemInfo();
    }
}

async function getSystemInfo() {
    const diskInfo = await si.diskLayout();
    const networkInterfaces = await si.networkInterfaces();
    const batteryInfo = await si.battery();
    const systemInfo = await si.system();
    const osInfo = await si.osInfo();
    const ramModules = await si.memLayout();

    let ipAddress = "N/A";
    if (networkInterfaces.length > 0) {
        const activeInterface = networkInterfaces.find(
            (net) => net.ip4 && !net.internal
        );
        ipAddress = activeInterface ? activeInterface.ip4 : "N/A";
    }

    return {
        ipAddress,
        os: {
            hostname: osInfo.hostname,
            platform: osInfo.platform,
            version: osInfo.distro + " " + osInfo.release,
            arch: osInfo.arch,
            serial: osInfo.serial,
        },
        disks: diskInfo.map((disk) => ({
            device: disk.device || "Unknown",
            interfaceType: disk.interfaceType || "Unknown",
            serialNum: disk.serialNum || "Unknown",
            vendor: disk.vendor || "Unknown",
            type: disk.type || "Unknown",
            name: disk.name || "Unknown",
            size: (disk.size / 1e9).toFixed(2) + " GB",
        })),
        rams: ramModules.map((ram, index) => ({
            slot: index + 1,
            manufaturer: ram.manufacturer || "Unknown",
            type: ram.type || "Unknown",
            serialNo: ram.serialNum || "Unknown",
            capacity: (ram.size / 1e9).toFixed(2) + " GB",
        })),
        battery: batteryInfo.hasBattery
            ? {
                  maxCapacity: batteryInfo.maxCapacity
                      ? batteryInfo.maxCapacity + batteryInfo.capacityUnit
                      : "Unknown",
                  voltage: batteryInfo.voltage
                      ? batteryInfo.voltage + "V"
                      : "Unknown",
                  model: batteryInfo.model || "Unknown",
              }
            : "No battery detected",
        systemInfo,
        timestamp: new Date().toISOString(),
    };
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
