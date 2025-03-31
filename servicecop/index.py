import requests
import sys
import json
import os
import psutil
import subprocess
import time

CONFIG_FILE = 'app_config.json'

location = "C:\\Service\\"

def is_app_running(service_name):
    for proc in psutil.process_iter(['pid', 'name']):
        if service_name.lower() in proc.info['name'].lower():
            return True
    return False

def load_config():
    """
    Load configuration from file
    """
    try:
        if not os.path.exists(CONFIG_FILE):
            # Create default config if file doesn't exist
            default_config = {
                "current_version": "0.0.0",
                "base_url": "http://192.168.1.32:3000",
                "service_name": "3S_Server_Client.exe"
            }
            save_config(default_config)
            return default_config
        
        with open(CONFIG_FILE, 'r') as file:
            return json.load(file)
    except (IOError, json.JSONDecodeError) as e:
        print(f"Error reading config file: {e}")
        sys.exit(1)

def save_config(config):
    """
    Save configuration to file
    """
    try:
        with open(CONFIG_FILE, 'w') as file:
            json.dump(config, file, indent=4)
    except IOError as e:
        print(f"Error saving config file: {e}")
        sys.exit(1)

def check_app_version(current_version, base_url):
    """
    Check if a new version is available
    
    Args:
        current_version (str): Current app version
        base_url (str): Base URL of the server
    """
    try:
        response = requests.get(f'{base_url}/app/{current_version}')
        response.raise_for_status()
        data = response.json()
        
        if data.get('message') == "NEW_UPDATE":
            return data.get('new_version')
        return None
    except requests.RequestException as e:
        print(f"Error checking Version: {e}")
        sys.exit(1)

def download_latest_exe(exe_filename, base_url):
    """
    Download the latest executable
    
    Returns:
        str: Path to downloaded executable
    """
    try:
        # Download the file
        download_url = f'{base_url}/latest'
        response = requests.get(download_url, stream=True)
        response.raise_for_status()
        
        # Save the file
        with open(exe_filename, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        
        print(f"Downloaded: {exe_filename}")
        return f'"{location + exe_filename}"'
    
    except requests.RequestException as e:
        print(f"Error downloading executable: {e}")
        sys.exit(1)

def kill_running_process(service_name):
    """
    Kill the running process if found by service name.
    
    Args:
        service_name (str): The name of the service/application to kill.
    """
    for proc in psutil.process_iter(['pid', 'name']):
        if service_name.lower() in proc.info['name'].lower():
            try:
                print(f"Terminating process: {proc.info['name']} (PID: {proc.info['pid']})")
                proc.terminate()  # Terminates the process
                proc.wait(timeout=3)  # Waits for the process to terminate
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as e:
                print(f"Error terminating process: {e}")
    return True

def main():
    # Load existing configuration
    config = load_config()
    
    # Check for updates
    new_version = check_app_version(
        config['current_version'], 
        config['base_url']
    )
    
    if new_version:
        config['current_version'] = new_version
        # get the new version exe from the server
        if is_app_running(config["service_name"]):
            kill_running_process(config["service_name"])
        # Run the exe file before running it check if the exe already running then exit it 
        exe_path = download_latest_exe(config["service_name"], config['base_url'])
        subprocess.Popen(exe_path, shell=False)

        # Update version in config
        save_config(config)
        
        print(f"Updated to latest version: {new_version}")
        sys.exit(0)
    else:
        if not is_app_running(config["service_name"]):
            exe_path = download_latest_exe(config["service_name"], config['base_url'])
            print(exe_path)
            subprocess.Popen(exe_path, shell=False)
        else:
            print("Service already running")
        sys.exit(0)

if __name__ == '__main__':
    main()

