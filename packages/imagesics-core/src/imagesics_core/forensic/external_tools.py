import cv2
import numpy as np
import io
import os
import sys

# Try imports
try:
    from noiseprint.noiseprint import genNoiseprint
    NOISEPRINT_AVAIL = True
except ImportError:
    NOISEPRINT_AVAIL = False
    
try:
    # TruFor is usually a local folder import in Sherloq
    # We will assume it's set up similarly or unavailable
    TRUFOR_AVAIL = False
except ImportError:
    TRUFOR_AVAIL = False

def compute_splicing_noiseprint(image: np.ndarray) -> dict:
    if not NOISEPRINT_AVAIL:
        return {"error": "Noiseprint not installed. Please install 'noiseprint' package to use this feature."}
        
    # Placeholder for actual logic if installed
    # based on sherloq/gui/splicing.py
    try:
        from jpeg import estimate_qf
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
        qf = estimate_qf(image) # This needs imageSICS port of jpeg.estimate_qf
        
        # ... logic...
        return {"error": "Noiseprint integration pending environment setup."}
    except Exception as e:
        return {"error": str(e)}

def compute_trufor(image: np.ndarray, model_path: str = None) -> dict:
    if not TRUFOR_AVAIL:
        return {"error": "TruFor not found. Please set up TruFor weights and directory structure."}
        
    return {"error": "TruFor integration pending."}
