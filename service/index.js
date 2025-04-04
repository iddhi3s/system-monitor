const { app } = require("electron");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");
const winston = require("winston");

const LOCATION = "C:\\Service\\";
const URL = "http://192.168.1.32:3000/latest";

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
            filename: path.join(LOCATION, "app.log"),
        }),
    ],
});

async function downloadLatestExe() {
    const filePath = path.join(LOCATION, "app.exe");

    while (true) {
        logger.info("Downloading EXE");

        try {
            const response = await axios.get(URL, {
                responseType: "stream",
            });
            const writer = fs.createWriteStream(filePath);

            const downloadResult = await new Promise((resolve, reject) => {
                response.data.pipe(writer);

                writer.on("finish", () => {
                    logger.info("Latest Version Downloaded");
                    resolve(true);
                });

                writer.on("error", (err) => {
                    logger.info(`Error writing file: ${err.message}`);
                    resolve(false); // Will retry
                });
            });

            if (downloadResult) return filePath;
        } catch (error) {
            logger.info("Download error: " + error.message);
        }

        logger.info("Waiting 5 minutes before retrying...");
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000)); // 5 minutes
    }
}

function startNewProcess(exe_path) {
    return new Promise((resolve, reject) => {
        logger.info("Starting Software as Administrator");

        const command = `runas /user:Administrator "${exe_path}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error starting process: ${error.message}`);
                reject(error);
            } else {
                logger.info("Process started successfully");
                resolve("success");
            }
        });
    });
}

app.whenReady().then(async () => {
    try {
        const exePath = await downloadLatestExe();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await startNewProcess(exePath);
        logger.info("Updated to new version");
        app.quit();
    } catch (error) {
        logger.info(error);
        app.quit();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
