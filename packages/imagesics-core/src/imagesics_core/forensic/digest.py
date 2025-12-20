import hashlib
import os
import magic
import re
import cv2 as cv
import numpy as np
from pathlib import Path
from datetime import datetime

def get_ballistics_info(filename: str) -> str:
    table = [
        ["^DSCN[0-9]{4}\\.JPG$", "Nikon Coolpix camera"],
        ["^DSC_[0-9]{4}\\.JPG$", "Nikon digital camera"],
        ["^FUJI[0-9]{4}\\.JPG$", "Fujifilm digital camera"],
        ["^IMG_[0-9]{4}\\.JPG$", "Canon DSLR or iPhone camera"],
        ["^PIC[0-9]{5}\\.JPG$", "Olympus D-600L camera"],
    ]
    for entry in table:
        if re.match(entry[0], filename, re.IGNORECASE) is not None:
            return entry[1]
    return "Unknown source or manually renamed"

def compute_hashes(data: bytes) -> dict:
    return {
        "MD5": hashlib.md5(data).hexdigest(),
        "SHA1": hashlib.sha1(data).hexdigest(),
        "SHA2-224": hashlib.sha224(data).hexdigest(),
        "SHA2-256": hashlib.sha256(data).hexdigest(),
        "SHA2-384": hashlib.sha384(data).hexdigest(),
        "SHA2-512": hashlib.sha512(data).hexdigest(),
        "SHA3-224": hashlib.sha3_224(data).hexdigest(),
        "SHA3-256": hashlib.sha3_256(data).hexdigest(),
        "SHA3-384": hashlib.sha3_384(data).hexdigest(),
        "SHA3-512": hashlib.sha3_512(data).hexdigest(),
    }

def compute_image_hashes(image: np.ndarray) -> dict:
    # Safely handle image hash availability
    hashes = {}
    try:
        ih = cv.img_hash
        hashes["Average"] = str(ih.averageHash(image)[0])
        hashes["Block mean"] = str(ih.blockMeanHash(image)[0])
        hashes["Color moments"] = str(ih.colorMomentHash(image)[0])
        hashes["Marr-Hildreth"] = str(ih.marrHildrethHash(image)[0])
        hashes["Perceptual"] = str(ih.pHash(image)[0])
        hashes["Radial variance"] = str(ih.radialVarianceHash(image)[0])
    except AttributeError:
        hashes["Error"] = "OpenCV Contrib 'img_hash' module not available"
    return hashes

def get_file_details(file_path: str) -> dict:
    p = Path(file_path)
    stat = p.stat()
    
    # Try to get birthtime, fallback to ctime
    try:
        creation = datetime.fromtimestamp(stat.st_birthtime)
    except AttributeError:
        creation = datetime.fromtimestamp(stat.st_ctime)

    return {
        "File name": p.name,
        "Parent folder": str(p.parent),
        "MIME type": magic.from_file(file_path, mime=True),
        "File size": stat.st_size,
        "Permissions": oct(stat.st_mode)[-3:],
        "Creation time": str(creation),
        "Last access": str(datetime.fromtimestamp(stat.st_atime)),
        "Last modified": str(datetime.fromtimestamp(stat.st_mtime)),
        "Metadata changed": str(datetime.fromtimestamp(stat.st_ctime)),
        "Name ballistics": get_ballistics_info(p.name)
    }

def generate_digest_report(file_path: str, image: np.ndarray) -> dict:
    """Generate comprehensive digest report for file and image."""
    with open(file_path, 'rb') as f:
        data = f.read()
    
    details = get_file_details(file_path)
    file_hashes = compute_hashes(data)
    img_hashes = compute_image_hashes(image)
    
    return {
        "details": details,
        "file_hashes": file_hashes,
        "image_hashes": img_hashes
    }
