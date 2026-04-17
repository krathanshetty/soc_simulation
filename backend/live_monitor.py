import socketio

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to SOC server")

@sio.on("new_alert")
def handle_alert(data):
    print("\n🚨 LIVE ALERT RECEIVED 🚨")
    print(data)

sio.connect("http://127.0.0.1:5000")

sio.wait()