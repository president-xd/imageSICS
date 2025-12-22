"""
Various forensic analysis tools.
"""
import cv2
import numpy as np
import matplotlib.pyplot as plt
import io
from typing import Tuple, Dict

def apply_median_filter(image: np.ndarray, kernel_size: int = 5) -> bytes:
    """
    Apply median filtering for noise reduction.
    
    Args:
        image: Input image
        kernel_size: Size of median filter kernel (must be odd)
    
    Returns:
        Bytes of comparison image (original vs filtered)
    """
    # Ensure kernel size is odd
    if kernel_size % 2 == 0:
        kernel_size += 1
    
    # Apply median filter
    filtered = cv2.medianBlur(image, kernel_size)
    
    # Create side-by-side comparison
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))
    
    # Original
    if len(image.shape) == 3:
        axes[0].imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    else:
        axes[0].imshow(image, cmap='gray')
    axes[0].set_title(f'Original Image')
    axes[0].axis('off')
    
    # Filtered
    if len(filtered.shape) == 3:
        axes[1].imshow(cv2.cvtColor(filtered, cv2.COLOR_BGR2RGB))
    else:
        axes[1].imshow(filtered, cmap='gray')
    axes[1].set_title(f'Median Filtered (kernel={kernel_size})')
    axes[1].axis('off')
    
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg', dpi=150, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()


def estimate_illuminant_map(image: np.ndarray) -> bytes:
    """
    Estimate illumination map using gray-world algorithm.
    
    Args:
        image: Input BGR image
    
    Returns:
        Bytes of illuminant map visualization
    """
    # Convert to float
    img_float = image.astype(np.float32) / 255.0
    
    # Gray-world assumption: average of each channel should be gray
    avg_b = np.mean(img_float[:, :, 0])
    avg_g = np.mean(img_float[:, :, 1])
    avg_r = np.mean(img_float[:, :, 2])
    
    # Estimate illuminant color
    gray_avg = (avg_b + avg_g + avg_r) / 3.0
    
    # Illuminant gains
    gain_b = gray_avg / (avg_b + 1e-6)
    gain_g = gray_avg / (avg_g + 1e-6)
    gain_r = gray_avg / (avg_r + 1e-6)
    
    # Apply white balance
    balanced = img_float.copy()
    balanced[:, :, 0] *= gain_b
    balanced[:, :, 1] *= gain_g
    balanced[:, :, 2] *= gain_r
    balanced = np.clip(balanced, 0, 1)
    
    # Create illumination map (intensity)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    illumination = cv2.GaussianBlur(gray, (51, 51), 0)
    
    # Visualization
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    # Original
    axes[0, 0].imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    axes[0, 0].set_title('Original Image')
    axes[0, 0].axis('off')
    
    # White balanced
    axes[0, 1].imshow(cv2.cvtColor((balanced * 255).astype(np.uint8), cv2.COLOR_BGR2RGB))
    axes[0, 1].set_title('White Balanced')
    axes[0, 1].axis('off')
    
    # Illumination map
    im = axes[1, 0].imshow(illumination, cmap='hot')
    axes[1, 0].set_title('Illumination Map')
    axes[1, 0].axis('off')
    plt.colorbar(im, ax=axes[1, 0])
    
    # Illuminant color
    illuminant_color = np.ones((100, 100, 3), dtype=np.uint8)
    illuminant_color[:, :, 0] = int(avg_b * 255)
    illuminant_color[:, :, 1] = int(avg_g * 255)
    illuminant_color[:, :, 2] = int(avg_r * 255)
    axes[1, 1].imshow(cv2.cvtColor(illuminant_color, cv2.COLOR_BGR2RGB))
    axes[1, 1].set_title(f'Estimated Illuminant\nRGB: ({int(avg_r*255)}, {int(avg_g*255)}, {int(avg_b*255)})')
    axes[1, 1].axis('off')
    
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg', dpi=150, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()


def detect_dead_hot_pixels(image: np.ndarray, threshold: float = 50.0) -> Tuple[bytes, Dict]:
    """
    Detect dead (always black) and hot (always white) pixels.
    
    Args:
        image: Input image
        threshold: Sensitivity threshold
    
    Returns:
        Tuple of (visualization bytes, statistics dict)
    """
    # Convert to grayscale for analysis
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    # Detect dead pixels (very dark)
    dead_mask = gray < threshold
    
    # Detect hot pixels (very bright)
    hot_mask = gray > (255 - threshold)
    
    # Count pixels
    dead_count = np.sum(dead_mask)
    hot_count = np.sum(hot_mask)
    total_pixels = gray.shape[0] * gray.shape[1]
    
    # Create visualization
    result = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR) if len(image.shape) == 2 else image.copy()
    
    # Mark dead pixels in blue
    result[dead_mask] = [255, 0, 0]  # Blue
    
    # Mark hot pixels in red
    result[hot_mask] = [0, 0, 255]  # Red
    
    # Create figure
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))
    
    # Original
    if len(image.shape) == 3:
        axes[0].imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    else:
        axes[0].imshow(image, cmap='gray')
    axes[0].set_title('Original Image')
    axes[0].axis('off')
    
    # Marked
    axes[1].imshow(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
    axes[1].set_title(f'Dead/Hot Pixels Detected\nDead: {dead_count} (blue) | Hot: {hot_count} (red)')
    axes[1].axis('off')
    
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg', dpi=150, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    
    stats = {
        "dead_pixels": int(dead_count),
        "hot_pixels": int(hot_count),
        "total_pixels": int(total_pixels),
        "dead_percentage": float(dead_count / total_pixels * 100),
        "hot_percentage": float(hot_count / total_pixels * 100)
    }
    
    return buf.getvalue(), stats


def decode_stereogram(image: np.ndarray) -> bytes:
    """
    Decode autostereogram to reveal hidden 3D image.
    
    Args:
        image: Input stereogram image
    
    Returns:
        Bytes of decoded depth map
    """
    # Convert to grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    h, w = gray.shape
    
    # Try to detect repeating pattern
    # Use autocorrelation to find pattern width
    depth_map = np.zeros_like(gray, dtype=np.float32)
    
    # Simple pattern detection: look for horizontal repetition
    for y in range(h):
        row = gray[y, :]
        
        # Try different shift amounts
        best_shift = 0
        best_correlation = 0
        
        for shift in range(10, min(w // 4, 100)):
            if w - shift < shift:
                break
            
            # Compute correlation
            corr = np.corrcoef(row[:-shift], row[shift:])[0, 1]
            
            if not np.isnan(corr) and corr > best_correlation:
                best_correlation = corr
                best_shift = shift
        
        # Create depth map based on shift
        if best_shift > 0:
            for x in range(w - best_shift):
                diff = abs(int(row[x]) - int(row[x + best_shift]))
                depth_map[y, x] = diff
    
    # Normalize depth map
    if depth_map.max() > 0:
        depth_map = (depth_map / depth_map.max() * 255).astype(np.uint8)
    else:
        depth_map = depth_map.astype(np.uint8)
    
    # Apply colormap for better visualization
    depth_colored = cv2.applyColorMap(depth_map, cv2.COLORMAP_JET)
    
    # Create visualization
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Original stereogram
    if len(image.shape) == 3:
        axes[0].imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    else:
        axes[0].imshow(image, cmap='gray')
    axes[0].set_title('Original Stereogram')
    axes[0].axis('off')
    
    # Decoded depth map
    axes[1].imshow(cv2.cvtColor(depth_colored, cv2.COLOR_BGR2RGB))
    axes[1].set_title('Decoded Depth Map')
    axes[1].axis('off')
    
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg', dpi=150, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()
