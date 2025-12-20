import cv2
import numpy as np
from sklearn.decomposition import PCA
import io
import matplotlib.pyplot as plt

def get_channel(image: np.ndarray, space: str, channel: int) -> np.ndarray:
    """
    Convert to space and return single channel 0-mapped.
    Spaces: RGB, HSV, HLS, LAB, LUV, XYZ, YCrCb, CMYK, Gray
    """
    img_conv = image
    if space == 'RGB':
        img_conv = image # BGR in OpenCV
        # Channel 0=B, 1=G, 2=R. Sherloq UI might say RGB.
    elif space == 'HSV':
        img_conv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    elif space == 'HLS':
        img_conv = cv2.cvtColor(image, cv2.COLOR_BGR2HLS)
    elif space == 'LAB':
        img_conv = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    elif space == 'LUV':
        img_conv = cv2.cvtColor(image, cv2.COLOR_BGR2LUV)
    elif space == 'XYZ':
        img_conv = cv2.cvtColor(image, cv2.COLOR_BGR2XYZ)
    elif space == 'YCrCb':
        img_conv = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    elif space == 'Gray':
        # Gray only has 1 channel
        if len(image.shape) == 3:
             return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return image
    
    # Extract channel
    if len(img_conv.shape) == 3 and channel < 3:
        return img_conv[:, :, channel]
        
    return image

def compute_pca(image: np.ndarray) -> bytes:
    """
    Project RGB pixels onto PCA axes and visualize.
    """
    # 1. Reshape to (N, 3)
    if len(image.shape) != 3:
        return b""
        
    h, w, c = image.shape
    # Downsample for speed
    small = cv2.resize(image, (256, 256))
    flat = small.reshape(-1, 3)
    
    pca = PCA(n_components=3)
    projected = pca.fit_transform(flat)
    
    # Normalize to 0-255
    projected_norm = cv2.normalize(projected, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    # Reshape back to image
    pca_img = projected_norm.reshape(256, 256, 3)
    
    # Return as image bytes
    _, enc = cv2.imencode(".jpg", pca_img)
    return enc.tobytes()

def compute_frequency_split(image: np.ndarray) -> bytes:
    """
    Visualize FFT magnitude.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
    
    # Normalize
    mag_norm = cv2.normalize(magnitude_spectrum, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    # Color map
    color_mag = cv2.applyColorMap(mag_norm, cv2.COLORMAP_JET)
    
    _, enc = cv2.imencode(".jpg", color_mag)
    return enc.tobytes()
