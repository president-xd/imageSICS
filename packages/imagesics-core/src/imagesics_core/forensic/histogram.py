import cv2 as cv
import numpy as np
from typing import Dict, List, Tuple
from pydantic import BaseModel
from imagesics_core.utils.processing import compute_hist

class HistogramStats(BaseModel):
    least_frequent: int
    most_frequent: int
    average_level: float
    median_level: int
    deviation: float
    pixel_count: int
    percentile: float
    nonzero_range: Tuple[int, int]
    empty_bins: int
    fullness: float
    smoothness: float

def get_unique_colors_info(image: np.ndarray) -> Tuple[int, float]:
    rows, cols, chans = image.shape
    pixels = rows * cols
    unique_colors = np.unique(
        np.reshape(image, (pixels, chans)), axis=0
    ).shape[0]
    unique_ratio = np.round(unique_colors / pixels * 100, 2)
    return int(unique_colors), float(unique_ratio)

def calculate_stats(hist: np.ndarray, start: int = 0, end: int = 255) -> HistogramStats:
    total = np.sum(hist)
    
    # Clip range
    if end <= start:
        end = start + 1
    elif start >= end:
        start = end - 1
        
    x = np.arange(256)[start : end + 1]
    y = hist[start : end + 1]
    count = np.sum(y)

    if count == 0:
        return HistogramStats(
            least_frequent=0, most_frequent=0, average_level=0, median_level=0,
            deviation=0, pixel_count=0, percentile=0, nonzero_range=(0, 0),
            empty_bins=0, fullness=0, smoothness=0
        )

    argmin = int(np.argmin(y) + start)
    argmax = int(np.argmax(y) + start)
    mean = np.round(np.sum(x * y) / count, 2)
    stddev = np.round(np.sqrt(np.sum(((x - mean) ** 2) * y) / count), 2)
    # Median
    # cumsum > count/2
    cumsum = np.cumsum(y)
    median_idx = np.argmax(cumsum > count / 2)
    median = int(median_idx + start)
    
    percent = np.round(count / total * 100, 2)
    
    nonzero_indices = np.nonzero(y)[0]
    if len(nonzero_indices) > 0:
        nonzero_range = (int(nonzero_indices[0] + start), int(nonzero_indices[-1] + start))
    else:
        nonzero_range = (0, 0)
        
    empty = len(x) - np.count_nonzero(y)
    
    max_val = np.max(y)
    fullness = 0.0
    if max_val > 0:
        fullness = np.round(count / (255 * max_val) * 100, 2)
        
    # Smoothness
    y_norm = y / max_val if max_val > 0 else y
    sweep = len(y_norm)
    smoothness_val = 0.0
    if sweep >= 5:
        for i in range(2, sweep - 2):
            yl = 2 * y_norm[i - 1] - y_norm[i - 2]
            yr = 2 * y_norm[i + 1] - y_norm[i + 2]
            smoothness_val += abs(y_norm[i] - (yl + yr) / 2)
        smoothness_val = np.round((1 - (smoothness_val / (sweep - 2))) * 100, 2)
        
    return HistogramStats(
        least_frequent=argmin,
        most_frequent=argmax,
        average_level=mean,
        median_level=median,
        deviation=stddev,
        pixel_count=int(count),
        percentile=percent,
        nonzero_range=nonzero_range,
        empty_bins=empty,
        fullness=fullness,
        smoothness=smoothness_val
    )

def compute_all_histograms(image: np.ndarray) -> Dict[str, List[int]]:
    channels = list(cv.split(cv.cvtColor(image, cv.COLOR_BGR2RGB)))
    channels.append(cv.cvtColor(image, cv.COLOR_BGR2GRAY))
    # Returns Red, Green, Blue, Value
    hists = [compute_hist(c).tolist() for c in channels]
    return {
        "red": hists[0],
        "green": hists[1],
        "blue": hists[2],
        "value": hists[3]
    }
