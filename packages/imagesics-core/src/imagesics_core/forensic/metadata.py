import cv2
import numpy as np
import subprocess
import json
from pathlib import Path
from imagesics_core.config.paths import get_exiftool_path

def get_exif_metadata(image_path: str) -> dict:
    """
    Get EXIF metadata using ExifTool.
    """
    exiftool = get_exiftool_path()
    try:
        # -j used for JSON output
        result = subprocess.run(
            [exiftool, "-j", image_path],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout)[0]
    except Exception as e:
        return {"error": str(e)}

def get_header_structure(image_path: str) -> str:
    """
    Get raw header structure (hex dump start).
    """
    try:
        with open(image_path, "rb") as f:
            header = f.read(512)
        # Simple hex dump
        return header.hex()
    except Exception as e:
        return str(e)

def analyze_thumbnail(image_path: str) -> dict:
    """
    Extract embedded thumbnails.
    """
    exiftool = get_exiftool_path()
    try:
        # Check if thumbnail exists
        result = subprocess.run(
            [exiftool, "-ThumbnailImage", "-b", image_path],
            capture_output=True
        )
        if len(result.stdout) > 0:
            return {"has_thumbnail": True, "size": len(result.stdout)}
        return {"has_thumbnail": False}
    except:
        return {"has_thumbnail": False, "error": "Failed to extract"}

def get_gps_coords(image_path: str) -> dict:
    exiftool = get_exiftool_path()
    try:
        # Extract Composite:GPSLatitude and Composite:GPSLongitude
        # -n for numeric
        result = subprocess.run(
            [exiftool, "-j", "-n", "-Composite:GPSLatitude", "-Composite:GPSLongitude", image_path],
            capture_output=True,
            text=True
        )
        data = json.loads(result.stdout)[0]
        lat = data.get("Composite:GPSLatitude")
        lon = data.get("Composite:GPSLongitude")
        if lat and lon:
            return {"lat": lat, "lon": lon}
        return {"error": "No GPS data"}
    except Exception as e:
        return {"error": str(e)}

def extract_thumbnail(image_path: str) -> bytes:
    exiftool = get_exiftool_path()
    try:
        # -b for binary, -ThumbnailImage
        result = subprocess.run(
            [exiftool, "-b", "-ThumbnailImage", image_path],
            capture_output=True
        )
        return result.stdout
    except:
        return b""
