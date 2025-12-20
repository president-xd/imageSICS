import cv2
import numpy as np
import pywt
import io
import matplotlib.pyplot as plt

def compute_wavelet_analysis(image: np.ndarray, wavelet: str = 'db1', mode: str = 'periodization') -> bytes:
    """
    Compute 2D Discrete Wavelet Transform and visualize.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # PyWavelets 2D
    # cA, (cH, cV, cD) = pywt.dwt2(gray, wavelet, mode=mode)
    coeffs = pywt.dwt2(gray, wavelet, mode=mode)
    cA, (cH, cV, cD) = coeffs
    
    # Normalize for visualization
    def norm(arr):
        return cv2.normalize(arr, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
    cA_img = norm(cA)
    cH_img = norm(cH)
    cV_img = norm(cV)
    cD_img = norm(cD)
    
    # Stack them: 
    # cA | cH
    # ---+---
    # cV | cD
    
    top = np.hstack((cA_img, cH_img))
    bot = np.hstack((cV_img, cD_img))
    res = np.vstack((top, bot))
    
    # Apply colormap? Or keep gray? Sherloq usually keeps gray or uses specific map.
    # Let's return gray for structure clarity, or apply generic color map.
    res_color = cv2.applyColorMap(res, cv2.COLORMAP_DEEPGREEN)
    
    _, enc = cv2.imencode(".jpg", res_color)
    return enc.tobytes()
