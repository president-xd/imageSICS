from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from imagesics_api.routers import uploads, forensic
import os

app = FastAPI(title="imageSICS API", description="Backend for imageSICS forensic tool")

# Configure CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount storage for static access
STORAGE_DIR = os.getenv("IMAGESICS_STORAGE_DIR", "./storage") # Relative to CWD when running
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(forensic.router, prefix="/api/forensic", tags=["forensic"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
