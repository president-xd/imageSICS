import cv2
import numpy as np

def compute_stereogram(image: np.ndarray, mode: str = 'pattern') -> bytes:
    """
    Detects stereogram hidden depth/pattern.
    Modes: pattern, silhouette, depth, shaded
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # Auto-detect offset using correlation
    small = cv2.resize(gray, (0,0), fx=0.5, fy=1.0) 
    # Logic from sherloq: check mean diff for shifts
    start = 10
    end = small.shape[1] // 3
    
    diffs = []
    for i in range(start, end):
        # Shift and diff
        d = cv2.absdiff(small[:, i:], small[:, :-i])
        diffs.append(cv2.mean(d)[0])
        
    diffs = np.array(diffs, dtype=np.float32)
    
    # 2nd derivative to find peak change? Sherloq used ediff1d and minmax
    ediff = np.ediff1d(diffs)
    _, maximum, _, argmax = cv2.minMaxLoc(ediff)
    
    if maximum < 2:
        # Failed to detect
        # Return error image or original?
        return b""
        
    offset = argmax[1] + start
    # Apply to original (width is 2x small, but offset on small needs double? No, resize was (1, 0.5) => Wait.
    # cv.resize(gray, None, None, 1, 0.5) -> fx=1, fy=0.5. So width is SAME. Height is half.
    # So offset is valid for X.
    
    a = image[:, offset:]
    b = image[:, :-offset]
    
    # Pattern
    diff_ab = cv2.absdiff(a, b)
    pattern = cv2.normalize(diff_ab, None, 0, 255, cv2.NORM_MINMAX)
    
    if mode == 'pattern':
        res = pattern
    elif mode == 'silhouette':
        temp = cv2.cvtColor(pattern, cv2.COLOR_BGR2GRAY)
        thr, _ = cv2.threshold(temp, 0, 255, cv2.THRESH_TRIANGLE)
        res = cv2.threshold(temp, thr, 255, cv2.THRESH_BINARY)[1]
        res = cv2.medianBlur(res, 3)
        res = cv2.cvtColor(res, cv2.COLOR_GRAY2BGR)
    elif mode == 'depth' or mode == 'shaded':
        # Optical Flow
        ag = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
        bg = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
        flow = cv2.calcOpticalFlowFarneback(ag, bg, None, 0.5, 5, 15, 5, 5, 1.2, 0)
        flow_x = flow[:, :, 0]
        
        depth = cv2.normalize(flow_x, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        depth_color = cv2.cvtColor(depth, cv2.COLOR_GRAY2BGR)
        
        if mode == 'depth':
             res = depth_color
        else:
             # Shaded
             flow_norm = cv2.normalize(flow_x, None, 0, 1, cv2.NORM_MINMAX)
             # Multiply pattern by flow intensity
             # Expand flow to 3 channels
             flow_3 = np.repeat(flow_norm[:, :, np.newaxis], 3, axis=2)
             shaded = pattern.astype(np.float32) * flow_3
             res = cv2.normalize(shaded, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    _, enc = cv2.imencode(".jpg", res)
    return enc.tobytes()
