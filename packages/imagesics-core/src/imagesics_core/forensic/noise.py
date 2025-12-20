import cv2 as cv
import numpy as np
from imagesics_core.utils.processing import equalize_img, create_lut

def perform_noise_separation(
    image: np.ndarray,
    mode: str = "Median",
    radius: int = 1,
    sigma: int = 3,
    levels: int = 32,
    grayscale: bool = False,
    show_denoised: bool = False
) -> np.ndarray:
    
    if grayscale:
        original = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    else:
        original = image
        
    kernel = radius * 2 + 1
    
    denoised = None
    if mode == "Median":
        denoised = cv.medianBlur(original, kernel)
    elif mode == "Gaussian":
        denoised = cv.GaussianBlur(original, (kernel, kernel), 0)
    elif mode == "BoxBlur":
        denoised = cv.blur(original, (kernel, kernel))
    elif mode == "Bilateral":
        denoised = cv.bilateralFilter(original, kernel, sigma, sigma)
    elif mode == "NonLocal":
        if len(original.shape) == 2: # Gray
            denoised = cv.fastNlMeansDenoising(original, None, kernel)
        else:
            denoised = cv.fastNlMeansDenoisingColored(original, None, kernel, kernel)
            
    if denoised is None:
        return image

    if show_denoised:
        result = denoised
    else:
        noise = cv.absdiff(original, denoised)
        if levels == 0:
            if len(noise.shape) == 2:
                result = cv.equalizeHist(noise)
            else:
                result = equalize_img(noise)
        else:
            result = cv.LUT(noise, create_lut(0, 255 - levels))
            
    if len(result.shape) == 2 and not grayscale:
         result = cv.cvtColor(result, cv.COLOR_GRAY2BGR)
    elif len(result.shape) == 2 and grayscale: # Ensure it returns 3 channels BGR even if grayscale visual
         result = cv.cvtColor(result, cv.COLOR_GRAY2BGR)

    return result
