# 🚨 SOC Command Center Dashboard

A real-time **Security Operations Center (SOC) Dashboard** that simulates, detects, and visualizes cybersecurity threats using a full-stack architecture.

---

## 🔥 Overview

This project is a **mini SIEM + SOC system** that:

* Simulates real-world security events
* Detects threats (Brute Force, Port Scan, Malware)
* Stores logs and alerts in MongoDB
* Streams alerts in real-time using WebSockets
* Displays data in a cyberpunk-themed dashboard

---

## 🧠 Features

### ⚙️ Backend (Flask + MongoDB)

* REST API for log ingestion (`/logs`)
* Threat detection engine integration
* MongoDB storage for logs and alerts
* Real-time alert broadcasting using Socket.IO
* Health check endpoint (`/`)

---

### 🔄 Log Generator

* Simulates realistic network activity:

  * Normal login events
  * Brute force attacks
  * Port scanning
  * Malware detection

---

### 📡 Real-Time Monitoring

* Live alert streaming via Socket.IO
* Python-based SOC monitor for debugging alerts

---

### 🎨 Frontend (React + TailwindCSS)

* Cyberpunk UI (Orbitron font + neon effects)
* Live alerts panel
* Event timeline (logs)
* Stats dashboard:

  * Total alerts
  * High severity alerts
  * Unique IPs
* Alert type visualization (charts)

---

## 🏗️ Architecture

```
Log Generator → Flask API → Detection Engine → MongoDB
                          ↓
                   Socket.IO (Real-time)
                          ↓
                  React Dashboard UI
```

---

## 📁 Project Structure

```
soc-project/
│
├── backend/
│   ├── app.py
│   ├── run_backend.py
│   ├── log_generator.py
│   ├── live_monitor.py
│   ├── detection/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│
├── README.md
└── .gitignore
```

---

## ⚙️ Installation

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install flask flask-cors pymongo python-dotenv flask-socketio eventlet python-socketio requests
```

---

### 2️⃣ Environment Variables

Create a `.env` file inside `backend/`:

```
MONGO_URI=your_mongodb_uri
DB_NAME=soc_db
```

---

### 3️⃣ Run Backend (Single Command)

```bash
python run_backend.py
```

---

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🧪 How It Works

1. Log generator simulates activity
2. Logs are sent to `/logs` API
3. Detection engine analyzes events
4. Alerts are generated and stored
5. Alerts are broadcast in real-time
6. Dashboard updates instantly

---

## 💀 Sample Alert

```json
{
  "type": "Brute Force Attack",
  "severity": "High",
  "ip": "192.168.1.33"
}
```

---

## 🎯 Use Cases

* SOC analyst training simulation
* SIEM system demonstration
* Cybersecurity portfolio project
* Real-time event monitoring

---

## 🚀 Future Enhancements

* 🌍 IP Geolocation map
* 📊 Advanced analytics dashboard
* 🔴 Radar-based threat visualization
* 🧠 AI anomaly detection
* 🔐 Authentication system

---

## 👨‍💻 Author

**Krathan N Shetty**
Cybersecurity Enthusiast | Security Analyst | Web Developer

---

## ⭐ Final Note

This project demonstrates:

* Real-time system design
* Cybersecurity threat detection
* Full-stack development integration

👉 Built to simulate how modern SOC platforms operate
