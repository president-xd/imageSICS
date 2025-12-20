import cv2
import numpy as np

def adjust_image(image: np.ndarray, brightness: float = 0, contrast: float = 1.0, gamma: float = 1.0) -> np.ndarray:
    """
    Apply global adjustments.
    brightness: -255 to 255
    contrast: 0.1 to 3.0
    gamma: 0.1 to 3.0
    """
    # Contrast and Brightness: output = input * contrast + brightness
    res = cv2.convertScaleAbs(image, alpha=contrast, beta=brightness)
    
    # Gamma
    if gamma != 1.0:
        invGamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        res = cv2.LUT(res, table)
        
    return res

def enhance_contrast(image: np.ndarray, method: str = 'clahe') -> np.ndarray:
    """
    Enhance contrast using CLAHE or HIST_EQ.
    """
    if len(image.shape) == 3:
        # Convert to LAB, apply to L channel
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        if method == 'clahe':
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            l = clahe.apply(l)
        else: # hist eq
            l = cv2.equalizeHist(l)
            
        merged = cv2.merge((l,a,b))
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    else:
        if method == 'clahe':
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            return clahe.apply(image)
        else:
            return cv2.equalizeHist(image)

def apply_median_filter(image: np.ndarray, ksize: int = 3) -> np.ndarray:
    if ksize % 2 == 0: ksize += 1
    return cv2.medianBlur(image, ksize)

def apply_echo_edge(image: np.ndarray) -> np.ndarray:
    """
    Echo edge filter: difference between image and median filtered version?
    Or convolution?
    Sherloq Echo is typically a high-pass / derivative.
    "Echo" usually refers to re-exposing edges via difference.
    """
    # Simple logic based on common practices if source unavailable
    # Logic: |Img - Median(Img)| often reveals noise/edges
    median = cv2.medianBlur(image, 3)
    diff = cv2.absdiff(image, median)
    return cv2.normalize(diff, None, 0, 255, cv2.NORM_MINMAX)

def apply_gradient(image: np.ndarray, axis: str = 'x') -> np.ndarray:
    """
    Luminance gradient.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    if axis == 'x':
        grad = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    else:
        grad = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        
    abs_grad = np.absolute(grad)
    return np.uint8(abs_grad)
