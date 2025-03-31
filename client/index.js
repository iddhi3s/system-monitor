const { app } = require("electron");
const io = require("socket.io-client");
const os = require("os");
const si = require("systeminformation");

let socket;

app.whenReady().then(() => {
    // Do not create a window
    console.log("Electron is running in background mode...");

    socket = io("ws://192.168.1.32:3000");

    socket.on("connect", () => {
        console.log("Connected to server");
        // Send initial system data
        sendSystemInfo();
    });

    socket.on("change", (message) => {
        console.log(message); // Should log "Data received successfully"
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from server");
    });

    // Start background service to send system info periodically
    runBackgroundService();
});

function runBackgroundService() {
    // Send system info every 5 seconds
    setInterval(() => {
        sendSystemInfo();
    }, 5000); // Send every 5 seconds
}

async function sendSystemInfo() {
    const systemInfo = await getSystemInfo();
    socket.emit("system_info", systemInfo);
    console.log("Sent system info:", systemInfo);
}

async function getSystemInfo() {
    const cpuUsage = await si.currentLoad();
    const memoryUsage = await si.mem();
    const uptime = os.uptime();
    const hostname = os.hostname();
    const osType = os.type(); // e.g., 'Linux', 'Darwin', 'Windows_NT'
    const osPlatform = os.platform(); // e.g., 'win32', 'linux', 'darwin'
    const osRelease = os.release(); // e.g., '10.0.18363'

    return {
        cpu: cpuUsage.currentLoad,
        memory: (memoryUsage.used / memoryUsage.total) * 100, // Memory usage percentage
        uptime: uptime,
        hostname: hostname,
        osType: osType,
        osPlatform: osPlatform,
        osRelease: osRelease,
        timestamp: new Date().toISOString(),
    };
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
