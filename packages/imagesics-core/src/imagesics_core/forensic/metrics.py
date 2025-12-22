"""
Image comparison and similarity metrics for forensic analysis.
"""

import cv2 as cv
import numpy as np
from typing import Dict, Tuple


def compare_images(img1: np.ndarray, img2: np.ndarray) -> Dict[str, float]:
    """
    Compare two images using multiple similarity metrics.
    
    Args:
        img1: First image (numpy array)
        img2: Second image (numpy array)
    
    Returns:
        Dictionary containing various similarity metrics
    """
    # Ensure images are the same size
    if img1.shape != img2.shape:
        # Resize img2 to match img1
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))
    
    # Convert to grayscale for some metrics
    gray1 = cv.cvtColor(img1, cv.COLOR_BGR2GRAY) if len(img1.shape) == 3 else img1
    gray2 = cv.cvtColor(img2, cv.COLOR_BGR2GRAY) if len(img2.shape) == 3 else img2
    
    metrics = {}
    
    # 1. Mean Squared Error (MSE)
    mse = np.mean((img1.astype(float) - img2.astype(float)) ** 2)
    metrics['mse'] = float(mse)
    
    # 2. Peak Signal-to-Noise Ratio (PSNR)
    if mse == 0:
        metrics['psnr'] = 100.0  # Perfect match, use max value instead of infinity
    else:
        max_pixel = 255.0
        psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
        metrics['psnr'] = float(psnr)
    
    # 3. Structural Similarity Index (SSIM)
    ssim = compute_ssim(gray1, gray2)
    metrics['ssim'] = float(ssim)
    
    # 4. Normalized Cross-Correlation
    ncc = compute_ncc(gray1, gray2)
    metrics['ncc'] = float(ncc)
    
    # 5. Histogram Correlation
    hist_corr = compute_histogram_correlation(img1, img2)
    metrics['histogram_correlation'] = float(hist_corr)
    
    # 6. Mean Absolute Error (MAE)
    mae = np.mean(np.abs(img1.astype(float) - img2.astype(float)))
    metrics['mae'] = float(mae)
    
    # 7. Overall similarity percentage (based on SSIM)
    metrics['similarity_percent'] = float((ssim + 1) * 50)  # Convert from [-1,1] to [0,100]
    
    return metrics


def compute_ssim(img1: np.ndarray, img2: np.ndarray) -> float:
    """
    Compute Structural Similarity Index (SSIM) between two grayscale images.
    
    Args:
        img1: First grayscale image
        img2: Second grayscale image
    
    Returns:
        SSIM value between -1 and 1 (1 means identical)
    """
    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2
    
    img1 = img1.astype(np.float64)
    img2 = img2.astype(np.float64)
    
    # Means
    mu1 = cv.GaussianBlur(img1, (11, 11), 1.5)
    mu2 = cv.GaussianBlur(img2, (11, 11), 1.5)
    
    mu1_sq = mu1 ** 2
    mu2_sq = mu2 ** 2
    mu1_mu2 = mu1 * mu2
    
    # Variances and covariance
    sigma1_sq = cv.GaussianBlur(img1 ** 2, (11, 11), 1.5) - mu1_sq
    sigma2_sq = cv.GaussianBlur(img2 ** 2, (11, 11), 1.5) - mu2_sq
    sigma12 = cv.GaussianBlur(img1 * img2, (11, 11), 1.5) - mu1_mu2
    
    # SSIM formula
    ssim_map = ((2 * mu1_mu2 + C1) * (2 * sigma12 + C2)) / \
               ((mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2))
    
    return float(np.mean(ssim_map))


def compute_ncc(img1: np.ndarray, img2: np.ndarray) -> float:
    """
    Compute Normalized Cross-Correlation between two images.
    
    Args:
        img1: First image
        img2: Second image
    
    Returns:
        NCC value between -1 and 1
    """
    img1_norm = (img1 - np.mean(img1)) / (np.std(img1) + 1e-10)
    img2_norm = (img2 - np.mean(img2)) / (np.std(img2) + 1e-10)
    
    ncc = np.mean(img1_norm * img2_norm)
    return float(np.clip(ncc, -1, 1))


def compute_histogram_correlation(img1: np.ndarray, img2: np.ndarray) -> float:
    """
    Compute histogram correlation between two images.
    
    Args:
        img1: First image
        img2: Second image
    
    Returns:
        Correlation value between 0 and 1
    """
    # Convert to grayscale if needed
    if len(img1.shape) == 3:
        img1 = cv.cvtColor(img1, cv.COLOR_BGR2GRAY)
    if len(img2.shape) == 3:
        img2 = cv.cvtColor(img2, cv.COLOR_BGR2GRAY)
    
    # Compute histograms
    hist1 = cv.calcHist([img1], [0], None, [256], [0, 256])
    hist2 = cv.calcHist([img2], [0], None, [256], [0, 256])
    
    # Normalize
    hist1 = cv.normalize(hist1, hist1).flatten()
    hist2 = cv.normalize(hist2, hist2).flatten()
    
    # Compute correlation
    correlation = cv.compareHist(hist1, hist2, cv.HISTCMP_CORREL)
    
    return float(correlation)


def compute_difference_image(img1: np.ndarray, img2: np.ndarray) -> np.ndarray:
    """
    Compute absolute difference between two images.
    
    Args:
        img1: First image
        img2: Second image
    
    Returns:
        Difference image (amplified for visibility)
    """
    # Ensure same size
    if img1.shape != img2.shape:
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))
    
    # Compute absolute difference
    diff = cv.absdiff(img1, img2)
    
    # Amplify differences for better visibility
    diff = cv.convertScaleAbs(diff, alpha=3.0)
    
    return diff
