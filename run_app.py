import os
import sys
import subprocess
import webbrowser
import time

def check_dependencies():
    print("[1/3] Checking environment dependencies...")
    try:
        import fastapi
        import uvicorn
        import sklearn
        import rank_bm25
        import pydantic
        print("  - Python backend dependencies: OK")
    except ImportError as e:
        print(f"  - Missing package: {e}")
        print("  - Installing requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def check_frontend():
    print("[2/3] Checking frontend build assets...")
    dist_index = os.path.join("frontend", "dist", "index.html")
    if not os.path.exists(dist_index):
        print("  - Frontend build not found. Compiling React frontend...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        subprocess.check_call([npm_cmd, "run", "build"], cwd="frontend")
        print("  - Frontend build: OK")
    else:
        print("  - Frontend build assets: OK (found in frontend/dist)")

def start_server(host="0.0.0.0", port=8000, open_browser=True):
    print(f"[3/3] Launching Healthcare Text Intelligence Server on http://localhost:{port} ...")
    if open_browser:
        def open_tab():
            time.sleep(1.5)
            webbrowser.open(f"http://localhost:{port}")
        import threading
        threading.Thread(target=open_tab, daemon=True).start()

    import uvicorn
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    print("=================================================================")
    print("   Healthcare Text Intelligence System - Launcher (Group 6)")
    print("=================================================================")
    check_dependencies()
    check_frontend()
    start_server()
