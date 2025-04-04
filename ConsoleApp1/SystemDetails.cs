using System;
using System.Collections.Generic;
using System.Text;

namespace ConsoleApp1
{
    internal class SystemDetails
    {
        public string Manufacturer { get; set; }
        public string ManufactureDate { get; set; }
        public string Model { get; set; }
        public string SKU { get; set; }
        public string SerialNo { get; set; }
        public string IPAddress { get; set; }
        public string MACAddress { get; set; }
        public string LoggedUser { get; set; }
        public DateTime BootDateTime { get; set; }
        public string Hostname { get; set; }
        public string OSVersion { get; set; }
        public string OSArch { get; set; }
        public string OSSerial { get; set; }
        public string OSRelease { get; set; }
        public string CPUBrand { get; set; }
        public int CPULogicalCores { get; set; }
        public int CPUPhysicalCores { get; set; }
        public double CPUSpeed { get; set; }
        public List<StorageDevice> StorageDevices { get; set; } = new List<StorageDevice>();
        public List<RamDetails> RamDetails { get; set; } = new List<RamDetails>();
        public List<GpuDevice> GpuDevices { get; set; } = new List<GpuDevice>();
        public List<MonitorDevice> MonitorDevices { get; set; } = new List<MonitorDevice>();

        public SystemDetails()
        {
            Manufacturer = "Unknown";
            ManufactureDate = "Unknown";
            Model = "Unknown";
            SKU = "Unknown";
            SerialNo = "Unknown";
            IPAddress = "Unknown";
            MACAddress = "Unknown";
            LoggedUser = "Unknown";
            BootDateTime = new DateTime();
            Hostname = "Unknown";
            OSVersion = "Unknown";
            OSArch = "Unknown";
            OSSerial = "Unknown";
            OSRelease = "Unknown";
            CPUBrand = "Unknown";
            CPULogicalCores = 0;
            CPUPhysicalCores = 0;
            CPUSpeed = 0;
        }
        public void PrintDetails()
        {
            Writer writer = new Writer();
            writer.WriteLog("____________________");
            writer.WriteLog("Manufacturer: " + this.Manufacturer);
            writer.WriteLog("ManufactureDate: " + this.ManufactureDate);
            writer.WriteLog("Model Name: " + this.Model);
            writer.WriteLog("SKU: " + this.SKU);
            writer.WriteLog("____________________");
            writer.WriteLog("Serial No: " + this.SerialNo);
            writer.WriteLog("IP Address: " + this.IPAddress);
            writer.WriteLog("MAC Address: " + this.MACAddress);
            writer.WriteLog("Logged User: " + this.LoggedUser);
            writer.WriteLog("Boot Time: " + this.BootDateTime);
            writer.WriteLog("Hostname: " + this.Hostname);
            writer.WriteLog("____________________");
            writer.WriteLog("CPU Brand: " + this.CPUBrand);
            writer.WriteLog("CPU Logical: " + this.CPULogicalCores);
            writer.WriteLog("CPU Physical: " + this.CPUPhysicalCores);
            writer.WriteLog("CPU Speed: " + this.CPUSpeed/1000.00+"GHz");
            writer.WriteLog("____________________");
            writer.WriteLog("OS Version: " + this.OSVersion);
            writer.WriteLog("OS Release: " + this.OSRelease);
            writer.WriteLog("OS Arch: " + this.OSArch);
            writer.WriteLog("OS Serial: " + this.OSSerial);
            writer.WriteLog("____________________");
            writer.WriteLog("Storage Devices:");
            writer.WriteLog("____");
            foreach (var storage in this.StorageDevices)
            {
                writer.WriteLog($"Slot: {storage.Slot}");
                writer.WriteLog($"Type: {storage.MediaType}");
                writer.WriteLog($"Serial Number: {storage.SerialNumber}");
                writer.WriteLog($"Name: {storage.Name}");
                writer.WriteLog($"Size: {(storage.Size / (1024 * 1024 * 1024)):F2} GB");
                writer.WriteLog("____");
            }
            writer.WriteLog("____________________");
            writer.WriteLog("RAM Details:");
            writer.WriteLog("____");
            foreach (var ram in this.RamDetails)
            {
                writer.WriteLog($"Slot: {ram.Slot}");
                writer.WriteLog($"Name: {ram.Name}");
                writer.WriteLog($"Locator: {ram.Locator}");
                writer.WriteLog($"Serial Number: {ram.SerialNumber}");
                writer.WriteLog($"Capacity: {(ram.Capacity / (1024 * 1024 * 1024)):F2} GB");
                writer.WriteLog("____");
            }
            writer.WriteLog("____________________"); 
            writer.WriteLog("GPU Details:");
            writer.WriteLog("____");
            foreach (var gpu in this.GpuDevices)
            {
                writer.WriteLog($"Slot: {gpu.Slot}");
                writer.WriteLog($"Name: {gpu.Name}");
                writer.WriteLog($"Description: {gpu.Description}");
                writer.WriteLog($"Capacity: {(gpu.Ram/ (1024 * 1024 * 1024)):F2} GB");
                writer.WriteLog("____");
            }
            writer.WriteLog("____________________");
            writer.WriteLog("Monitor Details:");
            writer.WriteLog("____");
            foreach (var monitor in this.MonitorDevices)
            {
                writer.WriteLog($"Name: {monitor.Name}");
                writer.WriteLog($"Model: {monitor.Model}");
                writer.WriteLog($"Serial Number: {monitor.SerialNumber}");
                writer.WriteLog("____");
            }
            writer.WriteLog("____________________");
        }

        public string SerializeToJson()
        {
            var sb = new StringBuilder();
            sb.Append("{");

            sb.AppendFormat("\"Manufacturer\":\"{0}\",", this.Manufacturer);
            sb.AppendFormat("\"ManufactureDate\":\"{0}\",", this.ManufactureDate);
            sb.AppendFormat("\"Model\":\"{0}\",", this.Model);
            sb.AppendFormat("\"SKU\":\"{0}\",", this.SKU);
            sb.AppendFormat("\"SerialNo\":\"{0}\",", this.SerialNo);
            sb.AppendFormat("\"IPAddress\":\"{0}\",", this.IPAddress);
            sb.AppendFormat("\"MACAddress\":\"{0}\",", this.MACAddress);
            sb.AppendFormat("\"LoggedUser\":\"{0}\",", this.LoggedUser);
            sb.AppendFormat("\"BootDateTime\":\"{0}\",", this.BootDateTime.ToString("yyyy-MM-ddTHH:mm:ss"));
            sb.AppendFormat("\"Hostname\":\"{0}\",", this.Hostname);
            sb.AppendFormat("\"OSVersion\":\"{0}\",", this.OSVersion);
            sb.AppendFormat("\"OSArch\":\"{0}\",", this.OSArch);
            sb.AppendFormat("\"OSSerial\":\"{0}\",", this.OSSerial);
            sb.AppendFormat("\"OSRelease\":\"{0}\",", this.OSRelease);
            sb.AppendFormat("\"CPUBrand\":\"{0}\",", this.CPUBrand);
            sb.AppendFormat("\"CPULogicalCores\":{0},", this.CPULogicalCores);
            sb.AppendFormat("\"CPUPhysicalCores\":{0},", this.CPUPhysicalCores);
            sb.AppendFormat("\"CPUSpeed\":{0},", this.CPUSpeed);

            // **Serialize Storage Devices**
            sb.Append("\"StorageDevices\":[");
            for (int i = 0; i < this.StorageDevices.Count; i++)
            {
                var storage = this.StorageDevices[i];
                sb.Append("{");
                sb.AppendFormat("\"Slot\":\"{0}\",", storage.Slot);
                sb.AppendFormat("\"MediaType\":\"{0}\",", storage.MediaType);
                sb.AppendFormat("\"SerialNumber\":\"{0}\",", storage.SerialNumber);
                sb.AppendFormat("\"Name\":\"{0}\",", storage.Name);
                sb.AppendFormat("\"Size\":{0}", storage.Size / (1024 * 1024 * 1024)); // Convert bytes to GB
                sb.Append("}");
                if (i < this.StorageDevices.Count - 1) sb.Append(","); // Avoid trailing comma
            }
            sb.Append("],");

            // **Serialize RAM this**
            sb.Append("\"RamDetails\":[");
            for (int i = 0; i < this.RamDetails.Count; i++)
            {
                var ram = this.RamDetails[i];
                sb.Append("{");
                sb.AppendFormat("\"Slot\":\"{0}\",", ram.Slot);
                sb.AppendFormat("\"Name\":\"{0}\",", ram.Name);
                sb.AppendFormat("\"Locator\":\"{0}\",", ram.Locator);
                sb.AppendFormat("\"SerialNumber\":\"{0}\",", ram.SerialNumber);
                sb.AppendFormat("\"Capacity\":{0}", ram.Capacity / (1024 * 1024 * 1024)); // Convert bytes to GB
                sb.Append("}");
                if (i < this.RamDetails.Count - 1) sb.Append(",");
            }
            sb.Append("],");

            // **Serialize GPU Devices**
            sb.Append("\"GpuDevices\":[");
            for (int i = 0; i < this.GpuDevices.Count; i++)
            {
                var gpu = this.GpuDevices[i];
                sb.Append("{");
                sb.AppendFormat("\"Slot\":\"{0}\",", gpu.Slot);
                sb.AppendFormat("\"Name\":\"{0}\",", gpu.Name);
                sb.AppendFormat("\"Description\":\"{0}\",", gpu.Description);
                sb.AppendFormat("\"Ram\":{0}", gpu.Ram / (1024 * 1024 * 1024)); // Convert bytes to GB
                sb.Append("}");
                if (i < this.GpuDevices.Count - 1) sb.Append(",");
            }
            sb.Append("],");

            // **Serialize Monitor Devices**
            sb.Append("\"MonitorDevices\":[");
            for (int i = 0; i < this.MonitorDevices.Count; i++)
            {
                var monitor = this.MonitorDevices[i];
                sb.Append("{");
                sb.AppendFormat("\"Name\":\"{0}\",", monitor.Name);
                sb.AppendFormat("\"Model\":\"{0}\",", monitor.Model);
                sb.AppendFormat("\"SerialNumber\":\"{0}\"", monitor.SerialNumber);
                sb.Append("}");
                if (i < this.MonitorDevices.Count - 1) sb.Append(",");
            }
            sb.Append("]");

            sb.Append("}");

            return sb.ToString();
        }
    }
}
