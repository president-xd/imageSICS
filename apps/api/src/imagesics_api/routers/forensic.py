from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
from pathlib import Path
import cv2 as cv
import numpy as np
import uuid
import os
from fastapi.responses import Response

from imagesics_core.forensic import (
    ela, cloning, noise, digest, histogram, jpeg, ghost_maps, resampling, 
    metadata, pixel_analysis, filters, transforms, stereogram, wavelets, 
    plots, jpeg_quality, external_tools, metrics
)

router = APIRouter()

STORAGE_DIR = Path(os.getenv("IMAGESICS_STORAGE_DIR", "../../../storage"))
RESULTS_DIR = STORAGE_DIR / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

class AnalysisRequest(BaseModel):
    image_path: str # Relative to storage root or absolute? Let's say relative to STORAGE_DIR if not absolute.
    params: Dict[str, Any] = {}

def load_image(path_str: str) -> np.ndarray:
    path = Path(path_str)
    if not path.is_absolute():
        path = STORAGE_DIR / path_str
    
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found at {path}")
        
    img = cv.imread(str(path))
    if img is None:
        raise HTTPException(status_code=400, detail="Failed to load image")
    return img

def save_result(image: np.ndarray, prefix: str) -> str:
    filename = f"{prefix}_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    cv.imwrite(str(path), image)
    return f"/storage/results/{filename}"

@router.post("/analysis/stats")
def pixel_stats(req: AnalysisRequest):
    img = load_image(req.image_path)
    return pixel_analysis.compute_pixel_stats(img)

@router.post("/analysis/minmax")
def minmax_dev(req: AnalysisRequest):
    img = load_image(req.image_path)
    res = pixel_analysis.compute_minmax_deviation(img)
    return save_result(res, "minmax")

@router.post("/analysis/bitplane")
def bitplane(req: AnalysisRequest):
    img = load_image(req.image_path)
    plane = int(req.params.get("plane", 0))
    res = pixel_analysis.get_bit_plane(img, plane)
    return save_result(res, f"bitplane_{plane}")

@router.post("/filter/adjust")
def adjust(req: AnalysisRequest):
    img = load_image(req.image_path)
    brightness = float(req.params.get("brightness", 0))
    contrast = float(req.params.get("contrast", 1.0))
    gamma = float(req.params.get("gamma", 1.0))
    res = filters.adjust_image(img, brightness, contrast, gamma)
    return save_result(res, "adjusted")

@router.post("/filter/contrast")
def enhance_contrast(req: AnalysisRequest):
    img = load_image(req.image_path)
    method = req.params.get("method", "clahe")
    res = filters.enhance_contrast(img, method)
    return save_result(res, f"contrast_{method}")

@router.post("/filter/median")
def median_filter(req: AnalysisRequest):
    img = load_image(req.image_path)
    ksize = int(req.params.get("ksize", 3))
    res = filters.apply_median_filter(img, ksize)
    return save_result(res, "median")

@router.post("/filter/echo")
def echo_filter(req: AnalysisRequest):
    img = load_image(req.image_path)
    res = filters.apply_echo_edge(img)
    return save_result(res, "echo")

@router.post("/filter/gradient")
def gradient(req: AnalysisRequest):
    img = load_image(req.image_path)
    axis = req.params.get("axis", "x")
    res = filters.apply_gradient(img, axis)
    return save_result(res, f"gradient_{axis}")

@router.post("/transform/pca")
def pca_transform(req: AnalysisRequest):
    img = load_image(req.image_path)
    res_bytes = transforms.compute_pca(img)
    
    filename = f"pca_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(res_bytes)
    return {"result_url": f"/storage/results/{filename}"}

@router.post("/transform/frequency")
def freq_transform(req: AnalysisRequest):
    img = load_image(req.image_path)
    res_bytes = transforms.compute_frequency_split(img)
    
    filename = f"freq_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(res_bytes)
    return {"result_url": f"/storage/results/{filename}"}
    
@router.post("/ela")
def run_ela(req: AnalysisRequest):
    img = load_image(req.image_path)
    result = ela.perform_ela(img, **req.params)
    url = save_result(result, "ela")
    return {"result_url": url}

@router.post("/cloning")
def run_cloning(req: AnalysisRequest):
    img = load_image(req.image_path)
    # Cloning returns (image, stats)
    # We ideally return both.
    res_img, stats = cloning.perform_cloning_analysis(img, **req.params)
    url = save_result(res_img, "cloning")
    return {"result_url": url, "stats": stats.dict()}

@router.post("/noise")
def run_noise(req: AnalysisRequest):
    img = load_image(req.image_path)
    result = noise.perform_noise_separation(img, **req.params)
    url = save_result(result, "noise")
    return {"result_url": url}

@router.post("/digest")
def run_digest(req: AnalysisRequest):
    img = load_image(req.image_path)
    # Digest needs file path too
    path = Path(req.image_path)
    if not path.is_absolute():
        path = STORAGE_DIR / req.image_path
        
    report = digest.generate_digest_report(str(path), img)
    return report

@router.post("/histogram")
def run_histogram(req: AnalysisRequest):
    img = load_image(req.image_path)
    hists = histogram.compute_all_histograms(img)
    return hists

@router.post("/jpeg/ghost")
def run_jpeg_ghost(req: AnalysisRequest):
    img = load_image(req.image_path)
    # Parse params into GhostMapRequest
    # This is a bit manual, ideally use Pydantic directly in Body
    gm_req = ghost_maps.GhostMapRequest(**req.params)
    plot_bytes = ghost_maps.compute_ghost_maps(img, gm_req)
    
    # Save to file to return URL
    filename = f"ghost_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(plot_bytes)
        
    return {"result_url": f"/storage/results/{filename}"}

@router.post("/resampling")
def run_resampling(req: AnalysisRequest):
    img = load_image(req.image_path)
    res_req = resampling.ResamplingRequest(**req.params)
    plot_bytes = resampling.compute_resampling_analysis(img, res_req)
    
    filename = f"resampling_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(plot_bytes)
        
    return {"result_url": f"/storage/results/{filename}"}

@router.post("/stereogram")
def run_stereogram(req: AnalysisRequest):
    img = load_image(req.image_path)
    mode = req.params.get("mode", "pattern")
    res_bytes = stereogram.compute_stereogram(img, mode)
    if not res_bytes:
        # Return generic error image or handle gracefully
        return {"error": "Failed to detect stereogram"}
        
    filename = f"stereo_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(res_bytes)
    return {"result_url": f"/storage/results/{filename}"}


@router.get("/metadata/gps")
def get_gps(path: str):
    return metadata.get_gps_coords(path)

@router.get("/metadata/exif")
def get_exif(path: str):
    return metadata.get_exif_metadata(path)


@router.post("/transform/wavelet")
def run_wavelet(req: AnalysisRequest):
    img = load_image(req.image_path)
    res_bytes = wavelets.compute_wavelet_analysis(img)
    filename = f"wavelet_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(res_bytes)
    return {"result_url": f"/storage/results/{filename}"}

@router.post("/transform/plot")
def run_plot(req: AnalysisRequest):
    img = load_image(req.image_path)
    res_bytes = plots.compute_rgb_scatter(img)
    filename = f"plot_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(res_bytes)
    return {"result_url": f"/storage/results/{filename}"}

@router.post("/jpeg/quality")
def run_jpeg_quality(req: AnalysisRequest):
    img = load_image(req.image_path)
    res = jpeg_quality.compute_jpeg_quality_estimation(img)
    
    filename = f"jq_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(res["plot"])
    return {"result_url": f"/storage/results/{filename}"}

@router.post("/splicing/noiseprint")
def run_noiseprint(req: AnalysisRequest):
    img = load_image(req.image_path)
    res = external_tools.compute_splicing_noiseprint(img)
    return res 

@router.post("/splicing/trufor")
def run_trufor(req: AnalysisRequest):
    img = load_image(req.image_path)
    res = external_tools.compute_trufor(img)
    return res

@router.post("/comparison/metrics")
def run_metrics(req: AnalysisRequest):
    img = load_image(req.image_path)
    # Using params to get reference path. Comparison requires reference.
    ref_path = req.params.get("reference_path")
    if not ref_path:
        return {"error": "Reference image required"}
        
    # Handle absolute/relative for ref_path
    ref_path_obj = Path(ref_path)
    if not ref_path_obj.is_absolute():
        ref_path_obj = STORAGE_DIR / ref_path 
        
    if not ref_path_obj.exists():
        return {"error": "Reference image not found"}
        
    ref_img = cv.imread(str(ref_path_obj))
    if ref_img is None:
        return {"error": "Failed to load reference image"}

    return metrics.compute_metrics(ref_img, img)

@router.get("/metadata/header")
def get_header(path: str):
    # Hex editor panel expects JSON { "hex": "..." }
    try:
        raw_hex = metadata.get_header_structure(path)
        return {"hex": raw_hex}
    except Exception as e:
        return {"error": str(e), "hex": ""}

@router.get("/hex")
def get_hex_dump(path: str, lines: int = 16):
    """
    Returns a formatted hex dump of the first N * 16 bytes.
    """
    try:
        img_path = Path(path)
        if not img_path.is_absolute():
            img_path = STORAGE_DIR / path
            
        if not img_path.exists():
            return {"error": "File not found"}
            
        with open(img_path, "rb") as f:
            # Read specific amount: lines * 16 bytes
            data = f.read(lines * 16)
            
        # Format: Offset  Hex  Ascii
        # Similar to `hexdump -C`
        output = []
        for i in range(0, len(data), 16):
            chunk = data[i:i+16]
            # Offset
            offset = f"{i:08x}"
            # Hex values
            hex_vals = " ".join(f"{b:02x}" for b in chunk)
            # Padding for last line if < 16 bytes
            padding = "   " * (16 - len(chunk))
            # Ascii
            ascii_vals = "".join(chr(b) if 32 <= b <= 126 else "." for b in chunk)
            
            output.append(f"{offset}  {hex_vals}{padding}  |{ascii_vals}|")
            
        return {"content": "\n".join(output)}
    except Exception as e:
        return {"error": str(e), "content": ""}

@router.get("/metadata/thumbnail")
def get_thumbnail(path: str):
    thumb_bytes = metadata.extract_thumbnail(path)
    if not thumb_bytes:
        return {"error": "No thumbnail found"}
    # Return directly as image response? Or save file?
    # Sherloq viewer usually shows it as an image.
    # Let's save to temp file and return URL for generic panel compatibility
    filename = f"thumb_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(thumb_bytes)
    return {"result_url": f"/storage/results/{filename}"}

@router.post("/transform/space")
def run_space_conversion(req: AnalysisRequest):
    img = load_image(req.image_path)
    # Params: space (HSV, LAB, YCrCb, etc), channel (0,1,2)
    space = req.params.get("space", "HSV")
    channel = int(req.params.get("channel", 0))
    
    res = transforms.get_channel(img, space, channel)
    
    # Normalize for display if needed? get_channel returns uint8 usually
    _, enc = cv.imencode(".jpg", res)
    filename = f"space_{space}_{channel}_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(enc.tobytes())
    return {"result_url": f"/storage/results/{filename}"}

def compute_phash(img: np.ndarray) -> str:
    """Compute perceptual hash using DCT."""
    # 1. Resize to 32x32
    resized = cv.resize(img, (32, 32), interpolation=cv.INTER_AREA)
    # 2. Convert to gray
    gray = cv.cvtColor(resized, cv.COLOR_BGR2GRAY)
    # 3. Compute DCT
    dct = cv.dct(np.float32(gray))
    # 4. Keep top-left 8x8 (excluding DC term)
    dct_low = dct[:8, :8]
    # 5. Compute median
    med = np.median(dct_low)
    # 6. Generate hash (1 if > median, 0 otherwise)
    hash_bits = (dct_low > med).flatten()
    # Pack into hex string for easier storage/comparison if needed, 
    # but here we return bit array or int for distance
    return hash_bits

def hamming_dist(h1, h2) -> int:
    return np.count_nonzero(h1 != h2)

@router.post("/reverse")
def run_reverse_search(req: AnalysisRequest):
    """
    Perform local reverse image search using custom pHash.
    Scans STORAGE_DIR/uploads for similar images.
    """
    try:
        img = load_image(req.image_path)
    except Exception:
        return {"error": "Query image not found", "results": []}

    try:
        query_hash = compute_phash(img)
    except Exception as e:
        return {"error": f"Hashing failed: {str(e)}", "results": []}
    
    # Path to uploads directory
    uploads_dir = STORAGE_DIR / "uploads"
    if not uploads_dir.exists():
        return {"results": []}

    results = []
    
    # Iterate over all images in uploads folder
    for entry in uploads_dir.glob("*"):
        if entry.is_file() and entry.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            try:
                # Skip the query image itself
                query_path_obj = Path(req.image_path)
                if not query_path_obj.is_absolute():
                     query_path_obj = STORAGE_DIR / req.image_path
                
                # Check absolute paths to avoid self-match
                if entry.resolve() == query_path_obj.resolve():
                    continue

                candidate_img = cv.imread(str(entry))
                if candidate_img is None: 
                    continue
                
                candidate_hash = compute_phash(candidate_img)
                dist = hamming_dist(query_hash, candidate_hash)
                
                # Max distance is 8x8 = 64
                # Similarity: 1.0 - (dist / 32.0) (allow some variance)
                # Matches usually have dist <= 10
                similarity = max(0.0, 1.0 - (dist / 20.0)) 
                
                if similarity > 0.6: # Stricter threshold for local
                    results.append({
                        "id": entry.name,
                        "thumbnailUrl": f"/storage/uploads/{entry.name}", 
                        "pageUrl": f"/storage/uploads/{entry.name}", 
                        "domain": "Local Storage",
                        "title": entry.name,
                        "fileSize": f"{entry.stat().st_size / 1024:.1f} KB",
                        "dimensions": f"{candidate_img.shape[1]}x{candidate_img.shape[0]}", 
                        "date": "Local File",
                        "similarity": similarity
                    })
            except Exception as e:
                # print(f"Error processing {entry}: {e}")
                continue

    # Sort by similarity desc
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return {"results": results}
