const { app } = require("electron");
const path = require("path");
const winston = require("winston");
const LOCATION = "C:\\Service\\";
const os = require("node-os-utils");

// Setup Winston Logger
const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(LOCATION, "test.log"),
        }),
    ],
});

app.whenReady().then(async () => {
    try {
        const cpu = os.cpu;
        console.log("CPU Usage:", cpu.model());

        const mem = os.mem;
        const memoryInfo = await mem.info();
        console.log("Memory Info:", memoryInfo);

        // const disk = os.drive;
        // const diskInfo = await disk.info();
        // console.log("Disk Info:", diskInfo);

        const network = os.network;
        const networkInfo = await network.inOut();
        console.log("Network Info:", networkInfo);
    } catch (error) {
        console.error("Error retrieving system information:", error);
    }

    app.exit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
