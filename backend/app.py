import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors
from flask_socketio import SocketIO

from detection.engine import detect_threat

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI or not DB_NAME:
    raise RuntimeError("MONGO_URI and DB_NAME must be set in the backend/.env file")

app = Flask(__name__)
CORS(app)

# 🔥 SocketIO init
socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB Connection
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]

    logs_collection = db["logs"]
    alerts_collection = db["alerts"]

    client.admin.command("ping")

except errors.PyMongoError as error:
    raise RuntimeError(f"Unable to connect to MongoDB: {error}")


# 🧪 Health Check
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "SOC Backend is running"
    }), 200


# 📥 Log Ingestion + Detection
@app.route("/logs", methods=["POST"])
def add_log():
    data = request.get_json(force=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object expected"}), 400

    required_fields = ["event", "ip"]
    missing_fields = [field for field in required_fields if not data.get(field)]

    if missing_fields:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing_fields)}"
        }), 400

    # Auto timestamp
    if not data.get("timestamp"):
        data["timestamp"] = datetime.now().isoformat()

    try:
        logs_collection.insert_one(data)
    except errors.PyMongoError as error:
        return jsonify({
            "error": "Failed to store log",
            "details": str(error)
        }), 500

    # 🔍 Detect threats
    alerts = detect_threat(data)

    print("ALERTS DEBUG:", alerts)

    # ✅ Safe copy (avoid ObjectId issue)
    alerts_to_return = [dict(alert) for alert in alerts]

    # 💾 Store alerts in DB
    if alerts:
        try:
            if isinstance(alerts, dict):
                alerts = [alerts]

            alerts_collection.insert_many(alerts)

            # 🚀 Emit alerts in real-time
            socketio.emit("new_alert", alerts_to_return)

        except Exception as e:
            print("Error storing alerts:", e)

    return jsonify({
        "message": "Log stored successfully",
        "alerts": alerts_to_return
    }), 201


# 📤 Get Logs
@app.route("/logs", methods=["GET"])
def get_logs():
    try:
        logs = list(logs_collection.find({}, {"_id": 0}))
    except errors.PyMongoError as error:
        return jsonify({
            "error": "Failed to fetch logs",
            "details": str(error)
        }), 500

    return jsonify(logs), 200


# 🚨 Get Alerts
@app.route("/alerts", methods=["GET"])
def get_alerts():
    try:
        alerts = list(alerts_collection.find({}, {"_id": 0}))
        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ▶️ Run Server (SocketIO)
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, use_reloader=False)