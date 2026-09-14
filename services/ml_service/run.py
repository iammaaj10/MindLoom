import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure the services/ml_service directory is in the path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    print("Starting MindLoom Local ML Service...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
