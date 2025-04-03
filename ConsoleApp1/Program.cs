using System.Management;
using System.Linq;
using System;
using System.Threading;

namespace ConsoleApp1
{
    internal class Program
    {
        private static SystemDetails systemDetails;
        static void Main(string[] args)
        {
            SendData();
        }
        private static void SendData()
        {
            while (true)
            {
                var client = new System.Net.WebClient();
                try
                {
                    CollectSystemDetails();
                    
                    client.Headers[System.Net.HttpRequestHeader.ContentType] = "application/json";
                    string json = systemDetails.SerializeToJson();
                    string response = client.UploadString("http://192.168.1.32:3000/data", "POST", json);
                    systemDetails.PrintDetails();
                    client.Dispose();
                    Environment.Exit(0);
                }
                catch (Exception ex)
                {
                    client.Dispose();
                    Console.WriteLine("Error: " + ex.Message);
                    Console.WriteLine("Retrying in 5 minutes...");
                    Thread.Sleep(1000);
                }
            }
        }
        private static void CollectSystemDetails() 
        {
            systemDetails = new SystemDetails();
            GetOSDetails();
            GetSerialNo();
            GetIPAddress();
            GetMacAddress();
            GetLoggedUser();
            GetHostname();
            GetCPUDetails();
            GetStorageDetails();
            GetRAMDetails();
            GetGPUDetails();
            GetMonitorDetails();
            GetSystemInformation();
        }
        private static void GetOSDetails()
        {
            try
            {
                var searcher = new ManagementObjectSearcher("SELECT LastBootUpTime, Caption, SerialNumber, Version FROM Win32_OperatingSystem");
                var osInfo = searcher.Get().Cast<ManagementObject>().FirstOrDefault();

                systemDetails.OSVersion = osInfo?["Caption"]?.ToString() ?? "Unknown";
                systemDetails.OSRelease= osInfo?["Version"]?.ToString() ?? "N/A";
                systemDetails.OSArch = Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit";
                systemDetails.OSSerial = osInfo?["SerialNumber"]?.ToString() ?? "Unknown";

                if (osInfo != null && osInfo["LastBootUpTime"] != null)
                {
                    string bootTimeStr = osInfo["LastBootUpTime"].ToString();
                    DateTime bootTime = ManagementDateTimeConverter.ToDateTime(bootTimeStr);
                    systemDetails.BootDateTime = bootTime;
                }
                else
                {
                    Console.WriteLine("Unable to retrieve login time.");
                }

                searcher.Dispose(); 
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error retrieving OS details: " + ex.Message);
            }
        }
        private static void GetSerialNo()
        {
            var searcher = new ManagementObjectSearcher("SELECT SerialNumber FROM Win32_BIOS");
            var biosInfo = searcher.Get().Cast<ManagementObject>().FirstOrDefault();

            string serialNumber = biosInfo?["SerialNumber"]?.ToString()?.Trim() ?? "Unknown";

            // Ensure a valid serial number
            if (!string.IsNullOrEmpty(serialNumber) &&
                !serialNumber.Equals("none", StringComparison.OrdinalIgnoreCase) &&
                !serialNumber.Equals("n/a", StringComparison.OrdinalIgnoreCase))
            {
                systemDetails.SerialNo = string.IsNullOrEmpty(serialNumber) ? "Unknown" : serialNumber;
            }
            searcher.Dispose();
        }
        private static void GetIPAddress()
        {
            string ipAddress = string.Empty;

            // Get all network interfaces
            foreach (var networkInterface in System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces())
            {
                // Check if the interface is up and has an IPv4 address
                if (networkInterface.OperationalStatus == System.Net.NetworkInformation.OperationalStatus.Up)
                {
                    foreach (var unicastAddress in networkInterface.GetIPProperties().UnicastAddresses)
                    {
                        if (unicastAddress.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                        {
                            ipAddress = unicastAddress.Address.ToString();
                            break;
                        }
                    }
                }

                if (!string.IsNullOrEmpty(ipAddress))
                    break;
            }

            systemDetails.IPAddress = string.IsNullOrEmpty(ipAddress) ? "N/A" : ipAddress;
        }
        private static void GetMacAddress()
        {
            var macAddress = System.Net.NetworkInformation.NetworkInterface
                .GetAllNetworkInterfaces()
                .Where(nic => nic.OperationalStatus == System.Net.NetworkInformation.OperationalStatus.Up &&
                              nic.NetworkInterfaceType != System.Net.NetworkInformation.NetworkInterfaceType.Loopback)
                .Select(nic => nic.GetPhysicalAddress().ToString())
                .FirstOrDefault();

            systemDetails.MACAddress = string.IsNullOrEmpty(macAddress) ? "N/A" : FormatMacAddress(macAddress);
        }
        private static void GetLoggedUser()
        {
            systemDetails.LoggedUser = Environment.UserName; 
        }
        private static void GetHostname()
        {
            systemDetails.Hostname = Environment.UserDomainName;
        }
        private static void GetCPUDetails()
        {
            try
            {
                var searcher = new ManagementObjectSearcher("SELECT NumberOfLogicalProcessors, Name, NumberOfCores, MaxClockSpeed FROM Win32_Processor");
                var cpuInfo = searcher.Get().Cast<ManagementObject>().FirstOrDefault();

                if (cpuInfo != null)
                {
                    
                    systemDetails.CPUBrand = cpuInfo["Name"]?.ToString() ?? "Unknown";
                    systemDetails.CPUPhysicalCores = cpuInfo["NumberOfCores"] != null ? Convert.ToInt32(cpuInfo["NumberOfCores"]) : 0;
                    systemDetails.CPULogicalCores = cpuInfo["NumberOfLogicalProcessors"] != null ? Convert.ToInt32(cpuInfo["NumberOfLogicalProcessors"]) : 0;
                    systemDetails.CPUSpeed = cpuInfo["MaxClockSpeed"] != null ? Convert.ToDouble(cpuInfo["MaxClockSpeed"]) : 0.0;
                }
                else
                {
                    Console.WriteLine("CPU details not found.");
                }
                searcher.Dispose();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error retrieving CPU details: " + ex.Message);
            }
        }
        private static void GetStorageDetails()
        {
            try
            {
                ManagementScope scope = new ManagementScope(@"\\.\root\microsoft\windows\storage");
                scope.Connect();
                ManagementObjectSearcher searcher = new ManagementObjectSearcher(scope, new ObjectQuery("SELECT DeviceID, Model, MediaType, Size, SerialNumber FROM MSFT_PhysicalDisk"));
                foreach (ManagementObject disk in searcher.Get())
                {

                    string slot = disk["DeviceID"]?.ToString() ?? "Unknown";
                    string serialNumber = disk["SerialNumber"]?.ToString() ?? "N/A";
                    string name = disk["Model"]?.ToString() ?? "Unknown";
                    double size = disk["Size"] != null ? Convert.ToDouble(disk["Size"]) : 0.0;
                    string mediaType = "Unknown";
                        switch (Convert.ToInt16(disk["MediaType"]))
                        {
                            case 3:
                                mediaType = "HDD";
                                break;
                            case 4:
                                mediaType = "SSD";
                                break;
                            case 5:
                                mediaType = "SCM (Storage Class Memory)";
                                break;
                            default:
                                mediaType = "Unspecified";
                                break;
                    }
                    StorageDevice storageDevice = new StorageDevice
                    {
                        Slot = slot,
                        SerialNumber = serialNumber,
                        Name = name,
                        Size = size,
                        MediaType = mediaType
                    };
                    systemDetails.StorageDevices.Add(storageDevice);
                }
                searcher.Dispose();
            }
            catch (Exception)
            {
                Console.WriteLine("MSFT_PhysicalDisk not found. Falling back to Win32_DiskDrive (Windows 7).");
                try
                {
                    // Windows 7 Compatible Method
                    ManagementObjectSearcher searcher = new ManagementObjectSearcher(
                        "SELECT DeviceID, Model, Size, SerialNumber FROM Win32_DiskDrive");
                    int slotNo = 0;
                    foreach (ManagementObject disk in searcher.Get())
                    {
                        string slot = slotNo.ToString();
                        string name = disk["Model"]?.ToString() ?? "Unknown";
                        string serialNumber = disk["SerialNumber"]?.ToString() ?? "N/A"; // Serial number might not be available
                        double size = disk["Size"] != null ? Convert.ToDouble(disk["Size"]) : 0.0;
                        string mediaType = "HDD"; // Windows 7 does not provide MediaType

                        StorageDevice storageDevice = new StorageDevice
                        {
                            Slot = slot,
                            SerialNumber = serialNumber,
                            Name = name,
                            Size = size,
                            MediaType = mediaType
                        };
                        systemDetails.StorageDevices.Add(storageDevice);
                        slotNo++;
                    }
                    searcher.Dispose();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error retrieving storage details: " + ex.Message);
                }
            }
        }
        private static void GetRAMDetails()
        {
            try
            {
                var searcher = new ManagementObjectSearcher("SELECT BankLabel, Manufacturer, DeviceLocator, SerialNumber, Capacity FROM Win32_PhysicalMemory");
                int slot = 1;
                foreach (ManagementObject ram in searcher.Get())
                {
                    string manufacturer = ram["Manufacturer"]?.ToString() ?? "Unknown";
                    string locator = ram["DeviceLocator"]?.ToString() ?? "Unknown";
                    string serialNumber = ram["SerialNumber"]?.ToString() ?? "N/A";
                    double capacity = ram["Capacity"] != null ? Convert.ToDouble(ram["Capacity"]) : 0.00;
                    // Print RAM details
                    RamDetails ramDetails = new RamDetails
                    {
                        Slot = slot,
                        Name = manufacturer,
                        Locator = locator,
                        SerialNumber = serialNumber,
                        Capacity = capacity
                    };
                    systemDetails.RamDetails.Add(ramDetails);
                    slot++;  // Increment slot count
                }
                searcher.Dispose();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error retrieving RAM details: " + ex.Message);
            }
        }
        private static void GetGPUDetails()
        {
            try
            {
                var searcher = new ManagementObjectSearcher("SELECT Name, VideoModeDescription, AdapterRAM FROM Win32_VideoController");
                int slot = 1;
                foreach (ManagementObject gpu in searcher.Get())
                {
                    string name = gpu["Name"]?.ToString() ?? "Unknown";
                    string description = gpu["VideoModeDescription"]?.ToString() ?? "Unknown";
                    double ram = gpu["AdapterRAM"] != null ? Convert.ToDouble(gpu["AdapterRAM"]) : 0.0;

                    GpuDevice gpuDevice = new GpuDevice
                    {
                        Slot = slot,
                        Name = name,
                        Description = description,
                        Ram = ram
                    };

                    systemDetails.GpuDevices.Add(gpuDevice);
                    slot++;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error retrieving RAM details: " + ex.Message);
            }
        }
        private static void GetMonitorDetails()
        {
            try
            {
                ManagementObjectSearcher searcher = new ManagementObjectSearcher(@"root\WMI", "SELECT * FROM WMIMonitorID");
                foreach (ManagementObject monitor in searcher.Get())
                {
                    string manufacturer = GetStringFromByteArray(monitor["ManufacturerName"]);
                    string model = GetStringFromByteArray(monitor["UserFriendlyName"]);
                    string serialNumber = GetStringFromByteArray(monitor["SerialNumberID"]);

                    MonitorDevice monitorDevice = new MonitorDevice
                    {
                        Name = manufacturer,
                        Model = model,
                        SerialNumber = serialNumber
                    };
                    systemDetails.MonitorDevices.Add(monitorDevice);
                }
            }
            catch (Exception)
            {
                Console.WriteLine("WMIMonitorID not found. Falling back to Win32_DesktopMonitor (Windows 7).");

                try
                {
                    // Windows 7 Compatible Method
                    ManagementObjectSearcher searcher = new ManagementObjectSearcher(@"root\CIMV2", "SELECT * FROM Win32_DesktopMonitor");

                    foreach (ManagementObject monitor in searcher.Get())
                    {
                        string name = monitor["Name"]?.ToString() ?? "Unknown";
                        string model = monitor["MonitorType"]?.ToString() ?? "Unknown";
                        string serialNumber = "N/A"; // Win32_DesktopMonitor does not provide SerialNumber

                        MonitorDevice monitorDevice = new MonitorDevice
                        {
                            Name = name,
                            Model = model,
                            SerialNumber = serialNumber
                        };
                        systemDetails.MonitorDevices.Add(monitorDevice);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error retrieving monitor details: " + ex.Message);
                }
            }
        }
        private static void GetSystemInformation()
        {
            try
            {
                // Create ManagementObjectSearcher for retrieving system information
                ManagementObjectSearcher searcher = new ManagementObjectSearcher(@"root\wmi", "SELECT * FROM MS_SystemInformation");

                foreach (ManagementObject system in searcher.Get())
                {
                    // Extracting information from WMI
                    string manufacturer = system["SystemManufacturer"]?.ToString() ?? "Unknown";
                    string model = system["SystemProductName"]?.ToString() ?? "Unknown";
                    string sku = system["SystemSKU"]?.ToString() ?? "Unknown";
                    string manufactureDate = system["BIOSReleaseDate"]?.ToString() ?? "Unknown";

                    systemDetails.Manufacturer = manufacturer;
                    systemDetails.Model = model;
                    systemDetails.SKU = sku;
                    systemDetails.ManufactureDate = manufactureDate;
                }
            }
            catch (Exception)
            {
                Console.WriteLine("Error retrieving system information from MS_SystemInformation. Falling back to Win32_ComputerSystem and Win32_BIOS.");
                try
                {
                    // Get manufacturer and model from Win32_ComputerSystem
                    ManagementObjectSearcher systemSearcher = new ManagementObjectSearcher("SELECT Manufacturer, Model FROM Win32_ComputerSystem");
                    foreach (ManagementObject system in systemSearcher.Get())
                    {
                        systemDetails.Manufacturer = system["Manufacturer"]?.ToString() ?? "Unknown";
                        systemDetails.Model = system["Model"]?.ToString() ?? "Unknown";
                    }

                    // Get SKU and manufacture date from Win32_BIOS
                    ManagementObjectSearcher biosSearcher = new ManagementObjectSearcher("SELECT SerialNumber, ReleaseDate FROM Win32_BIOS");
                    foreach (ManagementObject bios in biosSearcher.Get())
                    {
                        systemDetails.SKU = bios["SerialNumber"]?.ToString() ?? "Unknown";
                        systemDetails.ManufactureDate = bios["ReleaseDate"]?.ToString() ?? "Unknown";
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error retrieving system information (Windows 7 fallback): " + ex.Message);
                }
            }
        }

        private static string GetStringFromByteArray(object byteArray)
        {
            if (byteArray is UInt16[] uint16Array)
            {
                return new string(Array.ConvertAll(uint16Array, Convert.ToChar)).TrimEnd('\0');
            }
            return "Unknown";
        }
        private static string FormatMacAddress(string mac)
        {
            return string.Join(":", Enumerable.Range(0, mac.Length / 2)
                                              .Select(i => mac.Substring(i * 2, 2)));
        }
    }
}
