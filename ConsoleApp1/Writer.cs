using System;
using System.IO;

namespace ConsoleApp1
{
    internal class Writer
    {
        public void WriteLog(string message)
        {
            Console.WriteLine(message);
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
    }
}
