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
            Console.WriteLine("____________________");
            Console.WriteLine("Manufacturer: " + this.Manufacturer);
            Console.WriteLine("ManufactureDate: " + this.ManufactureDate);
            Console.WriteLine("Model Name: " + this.Model);
            Console.WriteLine("SKU: " + this.SKU);
            Console.WriteLine("____________________");
            Console.WriteLine("Serial No: " + this.SerialNo);
            Console.WriteLine("IP Address: " + this.IPAddress);
            Console.WriteLine("MAC Address: " + this.MACAddress);
            Console.WriteLine("Logged User: " + this.LoggedUser);
            Console.WriteLine("Boot Time: " + this.BootDateTime);
            Console.WriteLine("Hostname: " + this.Hostname);
            Console.WriteLine("____________________");
            Console.WriteLine("CPU Brand: " + this.CPUBrand);
            Console.WriteLine("CPU Logical: " + this.CPULogicalCores);
            Console.WriteLine("CPU Physical: " + this.CPUPhysicalCores);
            Console.WriteLine("CPU Speed: " + this.CPUSpeed/1000.00+"GHz");
            Console.WriteLine("____________________");
            Console.WriteLine("OS Version: " + this.OSVersion);
            Console.WriteLine("OS Release: " + this.OSRelease);
            Console.WriteLine("OS Arch: " + this.OSArch);
            Console.WriteLine("OS Serial: " + this.OSSerial);
            Console.WriteLine("____________________");
            Console.WriteLine("Storage Devices:");
            Console.WriteLine("____");
            foreach (var storage in this.StorageDevices)
            {
                Console.WriteLine($"Slot: {storage.Slot}");
                Console.WriteLine($"Type: {storage.MediaType}");
                Console.WriteLine($"Serial Number: {storage.SerialNumber}");
                Console.WriteLine($"Name: {storage.Name}");
                Console.WriteLine($"Size: {(storage.Size / (1024 * 1024 * 1024)):F2} GB");
                Console.WriteLine("____");
            }
            Console.WriteLine("____________________");
            Console.WriteLine("RAM Details:");
            Console.WriteLine("____");
            foreach (var ram in this.RamDetails)
            {
                Console.WriteLine($"Slot: {ram.Slot}");
                Console.WriteLine($"Name: {ram.Name}");
                Console.WriteLine($"Locator: {ram.Locator}");
                Console.WriteLine($"Serial Number: {ram.SerialNumber}");
                Console.WriteLine($"Capacity: {(ram.Capacity / (1024 * 1024 * 1024)):F2} GB");
                Console.WriteLine("____");
            }
            Console.WriteLine("____________________"); 
            Console.WriteLine("GPU Details:");
            Console.WriteLine("____");
            foreach (var gpu in this.GpuDevices)
            {
                Console.WriteLine($"Slot: {gpu.Slot}");
                Console.WriteLine($"Name: {gpu.Name}");
                Console.WriteLine($"Description: {gpu.Description}");
                Console.WriteLine($"Capacity: {(gpu.Ram/ (1024 * 1024 * 1024)):F2} GB");
                Console.WriteLine("____");
            }
            Console.WriteLine("____________________");
            Console.WriteLine("Monitor Details:");
            Console.WriteLine("____");
            foreach (var monitor in this.MonitorDevices)
            {
                Console.WriteLine($"Name: {monitor.Name}");
                Console.WriteLine($"Model: {monitor.Model}");
                Console.WriteLine($"Serial Number: {monitor.SerialNumber}");
                Console.WriteLine("____");
            }
            Console.WriteLine("____________________");
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
