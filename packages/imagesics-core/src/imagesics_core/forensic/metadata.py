import cv2
import numpy as np
import subprocess
import json
import os
from pathlib import Path
from imagesics_core.config.paths import get_exiftool_path

def get_exif_metadata(image_path: str) -> dict:
    """
    Get EXIF metadata using ExifTool, with PIL/piexif fallback.
    """
    exiftool = get_exiftool_path()
    
    # Try exiftool first if it exists
    if exiftool and os.path.exists(exiftool):
        try:
            result = subprocess.run(
                [exiftool, "-j", image_path],
                capture_output=True,
                text=True,
                check=True,
                timeout=10
            )
            return json.loads(result.stdout)[0]
        except Exception as e:
            pass  # Fall through to PIL fallback
    
    # Fallback to PIL/piexif
    try:
        from PIL import Image
        import piexif
        
        img = Image.open(image_path)
        exif_dict = {}
        
        if hasattr(img, '_getexif') and img._getexif():
            exif_data = img._getexif()
            for tag_id, value in exif_data.items():
                tag = piexif.TAGS.get(tag_id, tag_id)
                exif_dict[str(tag)] = str(value)
        
        # Try piexif for more complete data
        if 'exif' in img.info:
            exif_bytes = img.info['exif']
            exif_data = piexif.load(exif_bytes)
            
            # Extract readable EXIF data
            for ifd in ("0th", "Exif", "GPS", "1st"):
                if ifd in exif_data:
                    for tag, value in exif_data[ifd].items():
                        tag_name = piexif.TAGS[ifd].get(tag, {}).get("name", str(tag))
                        exif_dict[tag_name] = str(value) if not isinstance(value, bytes) else value.decode('utf-8', errors='ignore')
        
        return exif_dict if exif_dict else {"info": "No EXIF data found"}
        
    except Exception as e:
        return {"error": f"Failed to read EXIF: {str(e)}"}

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
    
    # Try exiftool first
    if exiftool and os.path.exists(exiftool):
        try:
            result = subprocess.run(
                [exiftool, "-ThumbnailImage", "-b", image_path],
                capture_output=True,
                timeout=10
            )
            if len(result.stdout) > 0:
                return {"has_thumbnail": True, "size": len(result.stdout)}
        except:
            pass
    
    # Fallback to PIL/piexif
    try:
        from PIL import Image
        import piexif
        
        img = Image.open(image_path)
        
        if 'exif' in img.info:
            exif_dict = piexif.load(img.info['exif'])
            if 'thumbnail' in exif_dict and exif_dict['thumbnail']:
                return {"has_thumbnail": True, "size": len(exif_dict['thumbnail'])}
        
        return {"has_thumbnail": False}
    except:
        return {"has_thumbnail": False, "error": "Failed to extract"}

def get_gps_coords(image_path: str) -> dict:
    """
    Extract GPS coordinates with exiftool and PIL/piexif fallback.
    """
    exiftool = get_exiftool_path()
    
    # Try exiftool first
    if exiftool and os.path.exists(exiftool):
        try:
            result = subprocess.run(
                [exiftool, "-j", "-n", "-Composite:GPSLatitude", "-Composite:GPSLongitude", image_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            data = json.loads(result.stdout)[0]
            lat = data.get("Composite:GPSLatitude") or data.get("GPSLatitude")
            lon = data.get("Composite:GPSLongitude") or data.get("GPSLongitude")
            if lat and lon:
                return {"latitude": lat, "longitude": lon}
        except:
            pass
    
    # Fallback to PIL/piexif
    try:
        from PIL import Image
        import piexif
        
        img = Image.open(image_path)
        
        if 'exif' in img.info:
            exif_dict = piexif.load(img.info['exif'])
            
            if 'GPS' in exif_dict and exif_dict['GPS']:
                gps_data = exif_dict['GPS']
                
                # Extract latitude
                if piexif.GPSIFD.GPSLatitude in gps_data and piexif.GPSIFD.GPSLatitudeRef in gps_data:
                    lat = gps_data[piexif.GPSIFD.GPSLatitude]
                    lat_ref = gps_data[piexif.GPSIFD.GPSLatitudeRef].decode()
                    
                    # Convert to decimal degrees
                    lat_decimal = lat[0][0]/lat[0][1] + lat[1][0]/(lat[1][1]*60) + lat[2][0]/(lat[2][1]*3600)
                    if lat_ref == 'S':
                        lat_decimal = -lat_decimal
                    
                    # Extract longitude
                    if piexif.GPSIFD.GPSLongitude in gps_data and piexif.GPSIFD.GPSLongitudeRef in gps_data:
                        lon = gps_data[piexif.GPSIFD.GPSLongitude]
                        lon_ref = gps_data[piexif.GPSIFD.GPSLongitudeRef].decode()
                        
                        lon_decimal = lon[0][0]/lon[0][1] + lon[1][0]/(lon[1][1]*60) + lon[2][0]/(lon[2][1]*3600)
                        if lon_ref == 'W':
                            lon_decimal = -lon_decimal
                        
                        return {"latitude": lat_decimal, "longitude": lon_decimal}
        
        return {"error": "No GPS data"}
    except Exception as e:
        return {"error": str(e)}

def extract_thumbnail(image_path: str) -> bytes:
    """
    Extract thumbnail bytes with exiftool and PIL/piexif fallback.
    """
    exiftool = get_exiftool_path()
    
    # Try exiftool first
    if exiftool and os.path.exists(exiftool):
        try:
            result = subprocess.run(
                [exiftool, "-b", "-ThumbnailImage", image_path],
                capture_output=True,
                timeout=10
            )
            if len(result.stdout) > 0:
                return result.stdout
        except:
            pass
    
    # Fallback to PIL/piexif
    try:
        from PIL import Image
        import piexif
        
        img = Image.open(image_path)
        
        if 'exif' in img.info:
            exif_dict = piexif.load(img.info['exif'])
            if 'thumbnail' in exif_dict and exif_dict['thumbnail']:
                return exif_dict['thumbnail']
        
        return b""
    except:
        return b""
