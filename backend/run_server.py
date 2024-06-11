import uvicorn
import sys
import main
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--restart":
        # Restart the server
        uvicorn.run("main:app", host="localhost", port=8000, reload=True)
    else:
        # Start the server
        uvicorn.run("main:app", host="localhost", port=8000)