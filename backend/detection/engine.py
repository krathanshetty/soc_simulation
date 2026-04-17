from collections import defaultdict

failed_logins = defaultdict(int)


def detect_threat(log):
    alerts = []
    ip = log.get("ip")
    event = log.get("event")
    timestamp = log.get("timestamp")
    status = log.get("status")

    if not ip or not event:
        return alerts

    if event == "failed_login" and status == "failed":
        failed_logins[ip] += 1
        if failed_logins[ip] == 5:
            alerts.append({
                "type": "Brute Force Attack",
                "severity": "High",
                "ip": ip,
                "timestamp": timestamp,
                "message": f"Detected 5 failed login attempts from {ip}."
            })
    elif event == "successful_login":
        failed_logins[ip] = 0

    if event == "port_scan":
        alerts.append({
            "type": "Port Scan",
            "severity": "Medium",
            "ip": ip,
            "timestamp": timestamp,
            "message": f"Port scan detected from {ip}."
        })

    if event == "malware_detected":
        alerts.append({
            "type": "Malware",
            "severity": "High",
            "ip": ip,
            "timestamp": timestamp,
            "message": f"Malware detected on host {ip}."
        })

    return alerts
