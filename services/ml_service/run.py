import uvicorn
import os
import sys

# Ensure the services/ml_service directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Re-export app so that running either 'uvicorn main:app' OR 'uvicorn run:app' works!
from main import app  # noqa: F401

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting MindLoom Local ML Service on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
