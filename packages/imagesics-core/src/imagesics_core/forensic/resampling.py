import cv2
import numpy as np
import matplotlib.pyplot as plt
import io
from typing import List, Tuple, Optional
from pydantic import BaseModel

class ResamplingRequest(BaseModel):
    filter_5x5: bool = False
    # ROI points (x,y)
    selected_points: List[Tuple[int, int]] = [] 
    
    # Fourier options
    compute_fourier: bool = True
    hanning: bool = True
    upsample: bool = True
    center_four: bool = False
    highpass_1: bool = True
    gamma: float = 4.0
    rescale: bool = True

def build_matrices_for_processing_3x3(I):
    k = 0
    rows = I.shape[0] - 2
    cols = I.shape[1] - 2
    F = np.zeros((rows * cols, 8))
    f = np.zeros(rows * cols)
    
    # Vectorized approach is much harder for the specific neighbor selection relative to loop
    # Sticking to loop for correctness port, but optimized slightly might mean just clean python
    # For performance, this really should be C++ or Numba. 
    # Python Loop for 3x3 over large image is SLOW.
    # We will use the original implementation logic but warn about speed.
    
    # Use generic sliding window view?
    # View as windows of 3x3
    # I_windows = np.lib.stride_tricks.sliding_window_view(I, (3,3))
    # Shape: (Rows-2, Cols-2, 3, 3)
    # F columns are: (0,0), (0,1), (0,2), (1,0), (1,2), (2,0), (2,1), (2,2)
    # f is (1,1)
    
    # Let's try to optimize:
    # TopRow: I[:-2, :-2], I[:-2, 1:-1], I[:-2, 2:]
    # MidRow: I[1:-1, :-2], [SKIP CENTER], I[1:-1, 2:]
    # BotRow: I[2:, :-2], I[2:, 1:-1], I[2:, 2:]
    
    y_end, x_end = I.shape[0], I.shape[1]
    
    fn = []
    # Row 0 local
    fn.append(I[0:y_end-2, 0:x_end-2].flatten()) # 0,0
    fn.append(I[0:y_end-2, 1:x_end-1].flatten()) # 0,1
    fn.append(I[0:y_end-2, 2:x_end  ].flatten()) # 0,2
    # Row 1 local
    fn.append(I[1:y_end-1, 0:x_end-2].flatten()) # 1,0
    # Center skipped
    fn.append(I[1:y_end-1, 2:x_end  ].flatten()) # 1,2
    # Row 2 local
    fn.append(I[2:y_end  , 0:x_end-2].flatten()) # 2,0
    fn.append(I[2:y_end  , 1:x_end-1].flatten()) # 2,1
    fn.append(I[2:y_end  , 2:x_end  ].flatten()) # 2,2
    
    F = np.column_stack(fn)
    f = I[1:y_end-1, 1:x_end-1].flatten()
    
    return F, f

def compute_probability_map_3x3(process_part):
    a = np.random.rand(8)
    a = a / a.sum()
    s = 0.005
    d = 0.1
    F, f = build_matrices_for_processing_3x3(process_part)
    
    w = np.zeros(F.shape[0])
    
    # This iterative EM-like algorithm is heavy.
    # Max iterations 100.
    for c in range(50): # Limit to 50 for web safety
        # Compute r = |f - F*a|
        r = np.abs(f - F @ a)
        
        # Update w
        # g = exp(-(r^2)/s)
        # w = g / (g + d)
        r2 = r ** 2
        g = np.exp(-r2 / s)
        w = g / (g + d)
        
        # Update s
        # s2 = sum(w * r^2)
        s2 = np.sum(w * r2)
        s = s2 / w.sum()
        if s < 1e-9: s = 1e-9
        
        # Update a
        # a2 = inv(F.T @ W @ F) @ F.T @ W @ f
        # Where W is diag(w*w) ? Original: F.T * w * w @ F
        # Original: np.linalg.inv(F.T * w * w @ F) @ F.T * w * w @ f
        # Note: w*w is element wise square of weights?
        # Yes, original code: w * w.
        
        # Weighted Least Squares
        # F_weighted = F * w[:, None]
        # f_weighted = f * w
        # But wait, original code is `F.T * w * w @ F`. This implies weighting by w^2?
        # Let's trust original code structure.
        w2 = w * w
        # Broadcasting w2 to rows for F.T mult?
        # F.T is (8, N). w is (N,). F.T * w -> (8, N) * (N,) -> works in numpy?
        # Numpy broadcasting: (8, N) * (N,) -> Matches last dim. Yes.
        
        FT_W2 = F.T * w2
        LHS = FT_W2 @ F
        RHS = FT_W2 @ f
        
        try:
            a2 = np.linalg.solve(LHS, RHS)
        except np.linalg.LinAlgError:
            break
            
        if np.linalg.norm(a - a2) < 0.01:
            a = a2
            break
        a = a2
        
    return w.reshape(process_part.shape[0] - 2, process_part.shape[1] - 2)

def compute_resampling_analysis(image: np.ndarray, params: ResamplingRequest) -> bytes:
    """
    Perform probability map and fourier analysis. Returns plotted result image.
    """
    # Grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # Normalize 0-1
    gray = (gray - gray.min()) / (gray.max() - gray.min() + 1e-5)
    
    # Region selection not implemented in backend-only for now, 
    # we assume full image if no points, or backend handles cropping if points provided?
    # For simplification, we process the whole image or the center crop if too large.
    # To avoid timeout: if > 1000px, crop center 512x512?
    
    start_y, start_x = 0, 0
    h, w = gray.shape
    if h > 800 or w > 800:
        # Crop to center
        cy, cx = h // 2, w // 2
        gray = gray[cy-256:cy+256, cx-256:cx+256]
    
    # Probability MAP
    prob_map = compute_probability_map_3x3(gray)
    
    # Fourier
    if params.compute_fourier:
        # Hanning
        if params.hanning:
             hanning_window = np.hanning(prob_map.shape[0])[:, None] * np.hanning(prob_map.shape[1])
             windowed = prob_map * hanning_window
        else:
             windowed = prob_map
             
        if params.upsample:
            upsampled = cv2.pyrUp(windowed)
        else:
            upsampled = windowed
            
        dft = np.fft.fft2(upsampled)
        fourier = np.fft.fftshift(dft)
        
        # Highpass?
        if params.highpass_1:
            rh, rw = fourier.shape
            cy, cx = rh // 2, rw // 2
            rad = int(0.1 * min(rh, rw) / 2)
            Y, X = np.ogrid[:rh, :rw]
            mask = (X - cx)**2 + (Y - cy)**2 <= rad**2
            fourier[mask] = 0
            
        magnitude = np.abs(fourier)
        # Gamma
        # Scale 0-1
        magnitude = (magnitude - magnitude.min()) / (magnitude.max() - magnitude.min() + 1e-9)
        magnitude = np.power(magnitude, params.gamma)
    
    # Plot
    fig = plt.figure(figsize=(10, 5))
    ax1 = plt.subplot(1, 2, 1)
    ax1.imshow(prob_map, cmap="gray", vmin=0, vmax=1)
    ax1.set_title("Probability Map (p-map)")
    ax1.axis("off")
    
    if params.compute_fourier:
        ax2 = plt.subplot(1, 2, 2)
        ax2.imshow(magnitude, cmap="gray", vmin=0, vmax=1)
        ax2.set_title("Fourier of p-map")
        ax2.axis("off")
        
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg', dpi=150)
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()
