import random
import time
from datetime import datetime

import requests

URL = "http://127.0.0.1:5000/logs"
COMMON_IPS = [f"192.168.1.{i}" for i in range(10, 60)]
USERS = ["alice", "bob", "charlie", "dave", "eve", "service", "admin"]
NORMAL_EVENTS = ["successful_login", "failed_login"]


def build_log(event, ip, username, status="failed"):
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event": event,
        "ip": ip,
        "username": username,
        "status": status
    }


def send_log(log):
    try:
        response = requests.post(URL, json=log, timeout=5)
        response_data = response.json() if response.headers.get("Content-Type", "").startswith("application/json") else {}
        if response.ok:
            alerts = response_data.get("alerts", [])
            if alerts:
                for alert in alerts:
                    print("ALERT:", alert)
            else:
                print(f"No threat detected: {log}")
        else:
            print(f"Server error {response.status_code}: {response_data}")
    except requests.RequestException as error:
        print(f"Connection error sending log: {error}")


def normal_activity():
    ip = random.choice(COMMON_IPS)
    username = random.choice(USERS)
    event = random.choice(NORMAL_EVENTS)
    status = "success" if event == "successful_login" else random.choice(["failed", "success", "failed"])
    return build_log(event, ip, username, status)


def brute_force_sequence():
    attacker_ip = random.choice(COMMON_IPS)
    username = random.choice(["admin", "root", "sysadmin"])
    return [build_log("failed_login", attacker_ip, username, status="failed") for _ in range(5)]


def port_scan_event():
    ip = random.choice(COMMON_IPS)
    return build_log("port_scan", ip, random.choice(USERS), status="failed")


def malware_event():
    ip = random.choice(COMMON_IPS)
    return build_log("malware_detected", ip, random.choice(USERS), status="failed")


def simulate():
    scenario = random.random()
    if scenario < 0.55:
        return [normal_activity()]
    if scenario < 0.75:
        return brute_force_sequence()
    if scenario < 0.9:
        return [port_scan_event()]
    return [malware_event()]


def main():
    print("Starting automated SOC log generator...")
    while True:
        logs = simulate()
        for log in logs:
            send_log(log)
            time.sleep(random.uniform(0.2, 0.6))
        time.sleep(random.uniform(1.0, 2.0))


if __name__ == "__main__":
    main()
