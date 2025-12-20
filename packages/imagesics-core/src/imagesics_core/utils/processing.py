import cv2 as cv
import numpy as np

def create_lut(low: int, high: int) -> np.ndarray:
    """Create a look-up table for contrast stretching."""
    if low >= 0:
        p1 = (+low, 0)
    else:
        p1 = (0, -low)
    if high >= 0:
        p2 = (255 - high, 255)
    else:
        p2 = (255, 255 + high)
    if p1[0] == p2[0]:
        return np.full(256, 255, np.uint8)
    lut = [
        (x * (p1[1] - p2[1]) + p1[0] * p2[1] - p1[1] * p2[0]) / (p1[0] - p2[0])
        for x in range(256)
    ]
    return np.clip(np.array(lut), 0, 255).astype(np.uint8)

def compute_hist(image: np.ndarray, normalize: bool = False) -> np.ndarray:
    """Compute histogram of an image."""
    hist = np.array(
        [h[0] for h in cv.calcHist([image], [0], None, [256], [0, 256])], int
    )
    return hist / image.size if normalize else hist

def auto_lut(image: np.ndarray, centile: int) -> np.ndarray:
    """Calculate LUT based on histogram percentiles."""
    hist = compute_hist(image, normalize=True)
    if centile == 0:
        nonzero = np.nonzero(hist)[0]
        low = nonzero[0]
        high = nonzero[-1]
    else:
        low_sum = high_sum = 0
        low = 0
        high = 255
        for i, h in enumerate(hist):
            low_sum += h
            if low_sum >= centile:
                low = i
                break
        for i, h in enumerate(np.flip(hist)):
            high_sum += h
            if high_sum >= centile:
                high = i
                break
    return create_lut(low, high)

def desaturate(image: np.ndarray) -> np.ndarray:
    """Convert BGR image to Grayscale BGR."""
    return cv.cvtColor(cv.cvtColor(image, cv.COLOR_BGR2GRAY), cv.COLOR_GRAY2BGR)

def equalize_img(image: np.ndarray) -> np.ndarray:
    """Equalize histogram of each channel."""
    return cv.merge([cv.equalizeHist(c) for c in cv.split(image)])

def norm_mat(matrix: np.ndarray, to_bgr: bool = False) -> np.ndarray:
    """Normalize matrix to 0-255 range."""
    norm = cv.normalize(matrix, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
    if not to_bgr:
        return norm
    return cv.cvtColor(norm, cv.COLOR_GRAY2BGR)

def norm_img(image: np.ndarray) -> np.ndarray:
    """Normalize each channel of the image."""
    return cv.merge([norm_mat(c) for c in cv.split(image)])
