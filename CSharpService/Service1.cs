using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.ServiceProcess;
using System.Threading;
using System.Timers;

namespace service
{
    public partial class Service1 : ServiceBase
    {

        private void WriteLog(string message)
        {
            string logFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ServiceLog.txt");

            try
            {
                using (StreamWriter writer = new StreamWriter(logFilePath, true))
                {
                    writer.WriteLine($"{DateTime.Now}: {message}");
                }
            }
            catch
            {
                // Ignore logging errors to avoid crash loops
            }
        }

        private System.Timers.Timer timer;
        private readonly string exePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "downloaded_app.exe");
        private readonly string downloadUrl = "http://192.168.1.32:3000/latest";
        private Process process;

        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            try
            {
                WriteLog("Service Starting...");

                timer = new System.Timers.Timer
                {
                    Interval =  1 * 60 * 1000,
                    AutoReset = true
                };

                timer.Elapsed += Timer_Elapsed;
                timer.Start();
                StartProcess();
            }
            catch (Exception ex)
            {
                WriteLog($"Error in OnStart: {ex.Message}");
                Stop();
            }
        }

        protected override void OnStop()
        {
            timer.Stop();
            WriteLog("Service stopping...");
            ExitCode = 0;
        }

        private void Timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            StartProcess();
        }

        private void StartProcess()
        {
            try
            {
                WriteLog("Downloading latest exe...");

                using (var client = new WebClient())
                {
                    client.DownloadFile(downloadUrl, exePath);
                }
                WriteLog("Download complete.");

                WriteLog("Download complete. Starting application...");

                process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = exePath,
                        UseShellExecute = true
                    }
                };

                process.Start();
                WriteLog($"Application started with PID {process.Id}");

                // Stop the timer if the process started successfully
                timer.Stop();
                this.Stop();
            }
            catch (Exception ex)
            {
                WriteLog($"Error: {ex.Message}. Retrying in 5 minutes...");
                timer.Start(); // Restart timer to retry in 5 minutes
            }
        }
    }
}
