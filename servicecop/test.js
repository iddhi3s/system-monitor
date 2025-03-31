const { app, ipcMain } = require("electron");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ps = require("ps-node");
const { exec } = require("child_process");

const CONFIG_FILE = path.join(__dirname, "app_config.json");
const LOCATION = "C:\\Service\\";
// Check if the process is running
function isAppRunning(service_name) {
    return new Promise((resolve, reject) => {
        ps.lookup({ command: service_name }, (err, resultList) => {
            if (err) reject(err);
            else resolve(resultList.length > 0);
        });
    });
}

// save configurations
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4));
    } catch (err) {
        console.error("Error Saving Config", err);
        app.quit();
    }
}

// load the configurations
function loadConfig() {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            const defaultConfig = {
                current_version: "0.0.0",
                base_url: "http://192.168.1.32:3000",
                service_name: "3S_Server_Client.exe",
            };
            saveConfig(defaultConfig);
        }
        const configData = fs.readFileSync(CONFIG_FILE);
        return JSON.parse(configData);
    } catch (error) {
        console.error("Error reading config: ", err);
        app.quit();
    }
}

// Check app Version
async function checkAppVersion(current_version, base_url) {
    try {
        const response = await axios.get(`${base_url}/app/${current_version}`);
        if (response.data.message === "NEW_UPDATE") {
            return response.data.new_version;
        }
        return null;
    } catch (error) {
        console.error("Error checking version", error);
        return null;
    }
}

// Download Latest Exe
function downloadLatestExe(service_name, base_url) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(LOCATION, service_name);

        axios
            .get(`${base_url}/latest`, { responseType: "stream" })
            .then((response) => {
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on("finish", () => {
                    console.log("Latest Version Downloaded");
                    resolve(filePath);
                });

                writer.on("error", (err) => {
                    reject(`Error writing file: ${err.message}`);
                });
            })
            .catch((error) => {
                reject(`Error downloading executable: ${error.message}`);
            });
    });
}

// Kill running process
function killRunningProcess(service_name) {
    return new Promise((resolve, reject) => {
        isAppRunning(service_name)
            .then((result) => {
                if (result) {
                    console.log("Killing Process");
                    exec(
                        `taskkill /IM ${service_name} /F`,
                        (error, stdout, stderr) => {
                            if (error) {
                                console.error(
                                    `Error killing process: ${stderr}`
                                );
                                reject(`Error killing process: ${stderr}`);
                                return;
                            }
                            console.log(`Process ${service_name} terminated`);
                            resolve(stdout);
                        }
                    );
                } else {
                    console.log("Process not running");
                    resolve("Process not running");
                }
            })
            .catch((err) => {
                reject(`Error checking process: ${err}`);
            });
    });
}
// Start new process
function startNewProcess(exe_path) {
    return new Promise((resolve, reject) => {
        console.log("Starting Software");
        exec(`"${exe_path}"`, (error) => {
            if (error) {
                console.error(`Error starting process: ${error.message}`);
                reject(`Error starting process: ${error.message}`);
            } else {
                console.log("Started Software");
                resolve("Process started");
            }
        });
    });
}

app.whenReady().then(async () => {
    try {
        const config = loadConfig();

        // check for update
        const newVersion = await checkAppVersion(
            config.current_version,
            config.base_url
        );

        if (newVersion) {
            config.current_version = newVersion;

            // kill running process
            await killRunningProcess(config.service_name);

            // Download and run the new Version
            const exePath = await downloadLatestExe(
                config.service_name,
                config.base_url
            );
            if (exePath) {
                await startNewProcess(exePath);
                saveConfig(config);
                console.log("Updated to new version");
            }
        }

        const isRunning = await isAppRunning(config.service_name);
        if (!isRunning) {
            const exePath = path.join(LOCATION, config.service_name);
            await startNewProcess(exePath);
        } else {
            console.log("app is already running");
        }
        app.quit();
    } catch (error) {
        console.log(error);
        app.quit();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
