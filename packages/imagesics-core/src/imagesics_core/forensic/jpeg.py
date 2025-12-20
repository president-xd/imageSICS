import cv2 as cv
import numpy as np
from typing import Tuple, List, Optional

DCT_SIZE = 8
TABLE_SIZE = DCT_SIZE ** 2
ZIG_ZAG = [
    [0, 0],
    [0, 1],
    [1, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [2, 1],
    [3, 0],
    [4, 0],
    [3, 1],
    [2, 2],
    [1, 3],
    [0, 4],
    [0, 5],
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
    [5, 0],
    [6, 0],
    [5, 1],
    [4, 2],
    [3, 3],
    [2, 4],
    [1, 5],
    [0, 6],
    [0, 7],
    [1, 6],
    [2, 5],
    [3, 4],
    [4, 3],
    [5, 2],
    [6, 1],
    [7, 0],
    [7, 1],
    [6, 2],
    [5, 3],
    [4, 4],
    [3, 5],
    [2, 6],
    [1, 7],
    [2, 7],
    [3, 6],
    [4, 5],
    [5, 4],
    [6, 3],
    [7, 2],
    [7, 3],
    [6, 4],
    [5, 5],
    [4, 6],
    [3, 7],
    [4, 7],
    [5, 6],
    [6, 5],
    [7, 4],
    [7, 5],
    [6, 6],
    [5, 7],
    [6, 7],
    [7, 6],
    [7, 7],
]


def compress_jpg(image: np.ndarray, quality: int, color: bool = True) -> np.ndarray:
    """Compress and decompress image using JPEG."""
    _, buffer = cv.imencode(".jpg", image, [cv.IMWRITE_JPEG_QUALITY, quality])
    return cv.imdecode(buffer, cv.IMREAD_COLOR if color else cv.IMREAD_GRAYSCALE)


def loss_curve(image: np.ndarray, qualities: Tuple[int, ...] = tuple(range(1, 101)), normalize: bool = True) -> np.ndarray:
    """Compute error between original and compressed for different qualities."""
    x = cv.cvtColor(image, cv.COLOR_BGR2GRAY) if len(image.shape) > 2 else image
    c = np.array(
        [cv.mean(cv.absdiff(compress_jpg(x, q, False), x))[0] for q in qualities]
    )
    if normalize:
        c = cv.normalize(c, None, 0, 1, cv.NORM_MINMAX).flatten()
    return c


def estimate_qf(image: np.ndarray) -> int:
    """Estimate the original Quality Factor (QF) of the image."""
    return int(np.argmin(loss_curve(image))) + 1 # +1 because range starts at 1? Verify utility.


def get_tables(quality: int) -> np.ndarray:
    """Get JPEG quantization tables."""
    luma = np.array(
        [
            [16, 11, 10, 16, 24, 40, 51, 61],
            [12, 12, 14, 19, 26, 58, 60, 55],
            [14, 13, 16, 24, 40, 57, 69, 56],
            [14, 17, 22, 29, 51, 87, 80, 62],
            [18, 22, 37, 56, 68, 109, 103, 77],
            [24, 35, 55, 64, 81, 104, 113, 92],
            [49, 64, 78, 87, 103, 121, 120, 101],
            [72, 92, 95, 98, 112, 100, 103, 99],
        ]
    )
    chroma = np.array(
        [
            [17, 18, 24, 47, 99, 99, 99, 99],
            [18, 21, 26, 66, 99, 99, 99, 99],
            [24, 26, 56, 99, 99, 99, 99, 99],
            [47, 66, 99, 99, 99, 99, 99, 99],
            [99, 99, 99, 99, 99, 99, 99, 99],
            [99, 99, 99, 99, 99, 99, 99, 99],
            [99, 99, 99, 99, 99, 99, 99, 99],
            [99, 99, 99, 99, 99, 99, 99, 99],
        ]
    )
    quality = np.clip(quality, 1, 100)
    if quality < 50:
        quality = 5000 / quality
    else:
        quality = 200 - quality * 2
    tables = np.concatenate((luma[:, :, np.newaxis], chroma[:, :, np.newaxis]), axis=2)
    tables = (tables * quality + 50) / 100
    return np.clip(tables, 1, 255).astype(int)
