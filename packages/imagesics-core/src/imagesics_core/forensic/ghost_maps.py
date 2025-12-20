import cv2
import numpy as np
import matplotlib.pyplot as plt
import io
import math
from typing import Tuple, List, Optional
from pydantic import BaseModel

class GhostMapRequest(BaseModel):
    qmin: int = 50
    qmax: int = 90
    qstep: int = 5
    xoffset: int = 0
    yoffset: int = 0
    grayscale: bool = True
    include_original: bool = False

def compute_ghost_maps(image: np.ndarray, params: GhostMapRequest) -> bytes:
    """
    Compute JPEG Ghost Maps and return the plotted image as bytes.
    """
    Qmin = params.qmin
    Qmax = params.qmax
    Qstep = params.qstep
    shift_x = params.xoffset
    shift_y = params.yoffset
    includeoriginal = params.include_original
    grayscale = params.grayscale
    
    averagingBlock = 16
    
    original = image.astype(np.float64)
    ydim, xdim, zdim = original.shape
    
    nQ = int((Qmax - Qmin) / Qstep) + 1
    
    ghostmap = np.zeros((ydim, xdim, nQ))
    
    idx = 0
    for quality in range(Qmin, Qmax + 1, Qstep):
        # Shift
        shifted_original = np.roll(original, shift_x, axis=1)
        shifted_original = np.roll(shifted_original, shift_y, axis=0)
        
        # Re-compress
        _, encoded = cv2.imencode(".jpg", shifted_original, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
        tmpResave = cv2.imdecode(encoded, cv2.IMREAD_ANYCOLOR).astype(np.float64)
        
        # Ensure sizes match (sometimes recompression might change size? unlikely for same size)
        
        # Difference
        diff = np.square(shifted_original - tmpResave)
        ghostmap[:, :, idx] = np.mean(diff, axis=2)
        idx += 1
        
    # Block averaging
    # Vectorized block averaging if possible, or simple loop
    # Original used loop, let's optimize slightly or stick to reliable loop
    # Optimization: using uniform filter (box blur) is effectively sliding window average, 
    # but we need non-overlapping block average.
    # We can reshape.
    
    # Trim to multiple of averagingBlock
    ny = (ydim // averagingBlock) * averagingBlock
    nx = (xdim // averagingBlock) * averagingBlock
    n_gy = ydim // averagingBlock
    n_gx = xdim // averagingBlock
    
    ghostmap_trimmed = ghostmap[:ny, :nx, :]
    
    # Reshape to (n_gy, block, n_gx, block, nQ) -> mean over axis 1 and 3
    reshaped = ghostmap_trimmed.reshape(n_gy, averagingBlock, n_gx, averagingBlock, nQ)
    blkE = np.mean(reshaped, axis=(1, 3)) # Result shape (n_gy, n_gx, nQ)
    
    # Normalize
    minval = np.min(blkE, axis=2, keepdims=True)
    maxval = np.max(blkE, axis=2, keepdims=True)
    
    # Avoid div by zero
    range_val = maxval - minval
    range_val[range_val == 0] = 1.0
    
    blkE = (blkE - minval) / range_val
    
    # Plotting
    fig_size = (12, 8)
    fig = plt.figure(figsize=fig_size)
    
    if includeoriginal:
        sp = math.ceil(math.sqrt(nQ + 1))
        # Original
        original_norm = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        ax = plt.subplot(sp, sp, 1)
        ax.imshow(original_norm)
        ax.set_title("Original Image")
        ax.axis("off")
        start_idx = 2
    else:
        sp = math.ceil(math.sqrt(nQ))
        start_idx = 1
        
    cmap = "gray" if grayscale else None
    
    for c in range(nQ):
        ax = plt.subplot(sp, sp, start_idx + c)
        ax.imshow(blkE[:, :, c], cmap=cmap, vmin=0, vmax=1)
        ax.axis("off")
        ax.set_title(f"Quality {Qmin + c * Qstep}")
        
    plt.suptitle(f"Ghost plots for grid offset X = {shift_x} and Y = {shift_y}")
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg', dpi=150)
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()
