import subprocess
import time
import os
import sys
import signal

print("🚀 Starting SOC Backend System...\n")

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

processes = []
stop_requested = False


def request_stop(signum, _frame):
    global stop_requested
    stop_requested = True
    print(f"\n🛑 Signal {signum} received. Stopping all services...")


def stop_all_processes():
    for p in processes:
        if p.poll() is not None:
            continue
        try:
            if os.name == "nt":
                p.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                p.terminate()
            p.wait(timeout=5)
        except Exception:
            p.kill()

def start_process(command, name):
    try:
        creation_flags = 0
        if os.name == "nt":
            # Keep each child in its own process group so Ctrl+C cleanup can signal it.
            creation_flags = subprocess.CREATE_NEW_PROCESS_GROUP

        p = subprocess.Popen(
            command,
            cwd=BACKEND_DIR,
            shell=False,
            creationflags=creation_flags
        )

        time.sleep(2)

        if p.poll() is not None:
            print(f"❌ {name} FAILED.\n")
            return

        print(f"✅ {name} is running")
        processes.append(p)

    except Exception as e:
        print(f"❌ Failed to start {name}: {e}")
        sys.exit(1)


start_process([sys.executable, "app.py"], "Backend API")
start_process([sys.executable, "log_generator.py"], "Log Generator")
start_process([sys.executable, "live_monitor.py"], "Live Monitor")

print("\n🔥 All services started!\n")

signal.signal(signal.SIGINT, request_stop)
if hasattr(signal, "SIGTERM"):
    signal.signal(signal.SIGTERM, request_stop)

try:
    while not stop_requested:
        all_stopped = True
        for p in processes:
            if p.poll() is None:
                all_stopped = False
                break
        if all_stopped:
            break
        time.sleep(0.5)
except KeyboardInterrupt:
    print("\n🛑 Keyboard interrupt received. Stopping all services...")
finally:
    stop_all_processes()
    print("✅ All services stopped.")