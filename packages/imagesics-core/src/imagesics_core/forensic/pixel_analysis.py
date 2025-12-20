import cv2
import numpy as np
from scipy.stats import skew, kurtosis
from typing import Dict, Any

def compute_pixel_stats(image: np.ndarray) -> Dict[str, Any]:
    """
    Compute detailed pixel statistics for the image.
    """
    if len(image.shape) == 3:
        channels = cv2.split(image)
        colors = ['Blue', 'Green', 'Red']
    else:
        channels = [image]
        colors = ['Gray']
        
    stats = {}
    
    for i, c in enumerate(channels):
        flat = c.flatten()
        stats[colors[i]] = {
            "min": int(np.min(flat)),
            "max": int(np.max(flat)),
            "mean": float(np.mean(flat)),
            "std_dev": float(np.std(flat)),
            "median": float(np.median(flat)),
            "entropy": float(_entropy(flat))
        }
        
    return stats

def _entropy(signal):
    """lensignal=signal.size"""
    lensignal = signal.size
    sysmbols = np.unique(signal)
    probability = [np.size(signal[signal == i]) / (1.0 * lensignal) for i in sysmbols]
    return np.sum([p * np.log2(1.0 / p) for p in probability])

def compute_minmax_deviation(image: np.ndarray, window: int = 3) -> np.ndarray:
    """
    Compute Min/Max deviation map.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    kernel = np.ones((window, window), np.uint8)
    local_min = cv2.erode(gray, kernel)
    local_max = cv2.dilate(gray, kernel)
    
    # Deviation = Max - Min
    dev = cv2.absdiff(local_max, local_min)
    return cv2.applyColorMap(dev, cv2.COLORMAP_JET)

def get_bit_plane(image: np.ndarray, plane: int) -> np.ndarray:
    """
    Extract specific bit plane (0-7).
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # (img >> plane) & 1  -> 0 or 1
    # Scale to 255 for visibility
    bit_img = ((gray >> plane) & 1) * 255
    return bit_img.astype(np.uint8)
