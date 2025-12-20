import cv2
import numpy as np
import math

# Try importing sewar for advanced metrics
try:
    import sewar # type: ignore
    SEWAR_AVAIL = True
except ImportError:
    SEWAR_AVAIL = False

def compute_metrics(ref: np.ndarray, target: np.ndarray) -> dict:
    """
    Compute Full-Reference metrics between two images.
    """
    # Ensure same size
    if ref.shape != target.shape:
        # Resize target to ref
        target = cv2.resize(target, (ref.shape[1], ref.shape[0]))
        
    metrics = {}
    
    # MSE/PSNR
    mse = np.mean((ref - target) ** 2)
    metrics["MSE"] = float(mse)
    if mse == 0:
        metrics["PSNR"] = 100.0 # Infinite
    else:
        metrics["PSNR"] = 20.0 * math.log10(255.0 / math.sqrt(mse))
        
    # SSIM (OpenCV basic)
    # sewar has better ssim
    if SEWAR_AVAIL:
        metrics["SSIM"] = float(sewar.ssim(ref, target)[0])
        metrics["UQI"] = float(sewar.uqi(ref, target))
        metrics["ERGAS"] = float(sewar.ergas(ref, target))
        metrics["SCC"] = float(sewar.scc(ref, target))
        metrics["RASE"] = float(sewar.rase(ref, target))
        metrics["SAM"] = float(sewar.sam(ref, target))
        metrics["MSSSIM"] = float(sewar.msssim(ref, target).real)
        metrics["VIFP"] = float(sewar.vifp(ref, target))
    else:
        metrics["SSIM"] = "Install 'sewar' for advanced metrics"
    
    # Histogram Comparison Metrics (Sherloq Parity)
    # Convert to standard color (BGR) if not already, though calcHist handles it
    # We use 3 channels, 256 bins
    try:
        # Ensure images are uint8
        if ref.dtype != np.uint8:
            ref = (ref * 255).astype(np.uint8)
        if target.dtype != np.uint8:
            target = (target * 255).astype(np.uint8)
            
        hist1 = cv2.calcHist([ref], [0, 1, 2], None, [256, 256, 256], [0, 256, 0, 256, 0, 256])
        hist2 = cv2.calcHist([target], [0, 1, 2], None, [256, 256, 256], [0, 256, 0, 256, 0, 256])
        
        # Normalize hists? Sherloq doesn't explicitly normalize before compareHist in the snippet shown,
        # but compareHist often works better with normalized. 
        # Sherloq snippet: cv.calcHist -> cv.compareHist. We follow that.
        
        metrics["Hist_Correlation"] = float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL))
        metrics["Hist_ChiSquare"] = float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_CHISQR))
        metrics["Hist_Intersection"] = float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_INTERSECT))
        metrics["Hist_Hellinger"] = float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_HELLINGER))
        # cv2.HISTCMP_KL_DIV is often available
        metrics["Hist_KLDivergence"] = float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_KL_DIV))
    except Exception as e:
        metrics["Hist_Error"] = str(e)

    return metrics
