import cv2
import numpy as np
import matplotlib.pyplot as plt
import io

def compute_rgb_scatter(image: np.ndarray, color_space: str = 'RGB') -> bytes:
    """
    Compute 2D scatter plot of pixels.
    """
    # Downsample for performance
    small = cv2.resize(image, (0,0), fx=0.25, fy=0.25)
    
    # Convert if needed
    if color_space == 'HSV':
        data = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    else: # RGB
        data = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
        
    # Flat
    pixels = data.reshape(-1, 3)
    if color_space == 'RGB':
        colors = pixels / 255.0
    else:
        # For visualization color, convert back to RGB
        # Or just use the pixel values themselves as colors? 
        # Sherloq uses actual pixel color.
        rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
        colors = rgb_small.reshape(-1, 3) / 255.0
        
    fig = plt.figure(figsize=(6, 6))
    ax = fig.add_subplot(111, projection='3d')
    
    # Sample subset if too large
    if len(pixels) > 5000:
        idx = np.random.choice(len(pixels), 5000, replace=False)
        pixels = pixels[idx]
        colors = colors[idx]
        
    ax.scatter(pixels[:, 0], pixels[:, 1], pixels[:, 2], c=colors, marker='.')
    
    ax.set_xlabel('Ch 1')
    ax.set_ylabel('Ch 2')
    ax.set_zlabel('Ch 3')
    
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg', dpi=100)
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()
