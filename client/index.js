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
    const cpuInfo = await si.cpu();
    const users = await si.users();
    const graphicsInfo = await si.graphics();

    // Get IP and MAC Address
    let ipAddress = "N/A";
    let macAddress = "N/A";
    if (networkInterfaces.length > 0) {
        const activeInterface = networkInterfaces.find(
            (net) => net.ip4 && !net.internal
        );
        if (activeInterface) {
            ipAddress = activeInterface.ip4;
            macAddress = activeInterface.mac || "N/A";
        }
    }

    const data = {
        ipAddress,
        macAddress,
        loggedInUser: users.length > 0 ? users[0].user : "Unknown",
        loggedDate: users.length > 0 ? users[0].date : "Unknown",
        loggedTime: users.length > 0 ? users[0].time : "Unknown",
        os: {
            hostname: osInfo.hostname || "Unknown",
            platform: osInfo.platform || "Unknown",
            version: osInfo.distro + " " + osInfo.release,
            arch: osInfo.arch || "Unknown",
            serial: osInfo.serial || "Unknown",
            release: osInfo.release || "Unknown",
        },
        cpu: {
            manufacturer: cpuInfo.manufacturer,
            brand: cpuInfo.brand,
            cores: cpuInfo.cores,
            speed: cpuInfo.speed + "Ghz",
        },
        disks: diskInfo.map((disk, index) => ({
            slot: index + 1,
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
        gpu: graphicsInfo.controllers.map((controller, index) => ({
            slot: index + 1,
            vendor: controller.vendor || "Unknown",
            model: controller.model || "Unknown",
            vram: controller.vram || "Unknown",
        })),
        monitors: graphicsInfo.displays.map((display, index) => ({
            slot: index + 1,
            connection: display.connection,
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
        timestamp: new Date(),
    };

    return data;
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
