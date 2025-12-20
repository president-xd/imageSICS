import cv2
import numpy as np
import io
import matplotlib.pyplot as plt

def compute_jpeg_quality_estimation(image: np.ndarray) -> dict:
    """
    Estimate JPEG Quality by re-compressing and measuring residuals.
    Returns: { "quality": q_factor, "plot": image_bytes }
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    errors = []
    qualities = list(range(101))
    
    for q in qualities:
        # Encoder params
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), q]
        # Encode
        _, enc = cv2.imencode('.jpg', gray, encode_param)
        # Decode
        dec = cv2.imdecode(enc, cv2.IMREAD_GRAYSCALE)
        
        # Mean absolute difference
        diff = cv2.absdiff(gray, dec)
        mae = np.mean(diff)
        errors.append(mae)
        
    # Find local minima? Or just return the plot.
    # Usually the local minimum (that isn't 100) nearest to actual quality.
    # Sherloq implementation just plots it.
    
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(qualities, errors)
    ax.set_title("residuals vs quality")
    ax.set_xlabel("JPEG Quality")
    ax.set_ylabel("Error (MAE)")
    ax.grid(True)
    
    buf = io.BytesIO()
    plt.savefig(buf, format='jpg')
    plt.close(fig)
    buf.seek(0)
    
    return {"plot": buf.getvalue()}
