import cv2 as cv
import numpy as np
from imagesics_core.utils.processing import create_lut, desaturate
from imagesics_core.forensic.jpeg import compress_jpg

def perform_ela(
    image: np.ndarray,
    quality: int = 75,
    scale: int = 50,
    contrast: int = 20,
    linear: bool = False,
    grayscale: bool = False
) -> np.ndarray:
    """
    Perform Error Level Analysis (ELA).
    
    Args:
        image: Input BGR image.
        quality: JPEG quality for reference compression (1-100).
        scale: Amplification scale.
        contrast: Contrast enhancement (0-100).
        linear: Use linear difference instead of absdiff.
        grayscale: Output grayscale result.
        
    Returns:
        ELA processed BGR image.
    """
    original = image.astype(np.float32) / 255
    compressed = compress_jpg(image, quality)
    
    contrast_val = int(contrast / 100 * 128)
    
    if not linear:
        difference = cv.absdiff(
            original, compressed.astype(np.float32) / 255
        )
        ela = cv.convertScaleAbs(cv.sqrt(difference) * 255, None, scale / 20)
    else:
        # Note: Original code had logic: cv.convertScaleAbs(cv.subtract(self.compressed, self.image), None, scale)
        # But wait, self.compressed is uint8 (from compress_jpg), self.image is uint8. 
        # cv.subtract handles saturation.
        ela = cv.convertScaleAbs(
            cv.subtract(compressed, image), None, scale
        )

    ela = cv.LUT(ela, create_lut(contrast_val, contrast_val))
    
    if grayscale:
        ela = desaturate(ela)
        
    return ela
