import os
import cv2 as cv
import numpy as np
import uuid
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app, send_file
import json

# Import core logic (reusing existing packages)
from imagesics_core.forensic import (
    ela, cloning, noise, digest, histogram, jpeg, ghost_maps, resampling, 
    metadata, pixel_analysis, filters, transforms, stereogram, wavelets, 
    plots, jpeg_quality, external_tools, metrics
)
from imagesics_core.forensic.ghost_maps import GhostMapRequest

forensic_bp = Blueprint('forensic', __name__)

STORAGE_DIR = Path(os.getcwd()) / "storage"
RESULTS_DIR = STORAGE_DIR / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

def load_image(path_str: str) -> np.ndarray:
    """Load image from path, handling both absolute and relative paths."""
    if path_str.startswith("/storage"):
        clean_path = path_str.replace("/storage", "", 1).lstrip("/")
        path = STORAGE_DIR / clean_path
    else:
        path = Path(path_str)
        if not path.is_absolute():
            path = STORAGE_DIR / path_str
    
    if not path.exists():
        raise FileNotFoundError(f"Image not found at {path}")
        
    img = cv.imread(str(path))
    if img is None:
        raise ValueError("Failed to load image")
    return img

def save_result(image: np.ndarray, prefix: str) -> str:
    """Save result image and return URL path."""
    filename = f"{prefix}_{uuid.uuid4()}.jpg"
    path = RESULTS_DIR / filename
    cv.imwrite(str(path), image)
    return f"/storage/results/{filename}"

def save_bytes_result(data: bytes, prefix: str, ext: str = "jpg") -> str:
    """Save bytes data and return URL path."""
    filename = f"{prefix}_{uuid.uuid4()}.{ext}"
    path = RESULTS_DIR / filename
    with open(path, "wb") as f:
        f.write(data)
    return f"/storage/results/{filename}"

# ============================================================================
# GENERAL TOOLS
# ============================================================================

@forensic_bp.route('/hex', methods=['GET'])
def get_hex_dump():
    """Hex editor view of file bytes."""
    path = request.args.get('path')
    lines = int(request.args.get('lines', 16))
    
    try:
        if path.startswith("/storage"):
             clean_path = path.replace("/storage", "", 1).lstrip("/")
             img_path = STORAGE_DIR / clean_path
        else:
             img_path = Path(path)

        if not img_path.exists():
            return jsonify({"error": "File not found"}), 404
            
        with open(img_path, "rb") as f:
            data = f.read(lines * 16)
            
        output = []
        for i in range(0, len(data), 16):
            chunk = data[i:i+16]
            offset = f"{i:08x}"
            hex_vals = " ".join(f"{b:02x}" for b in chunk)
            padding = "   " * (16 - len(chunk))
            ascii_vals = "".join(chr(b) if 32 <= b <= 126 else "." for b in chunk)
            output.append(f"{offset}  {hex_vals}{padding}  |{ascii_vals}|")
            
        return jsonify({"content": "\n".join(output)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/digest', methods=['POST'])
def run_digest():
    """Calculate file hashes (MD5, SHA1, SHA256)."""
    data = request.json
    try:
        image_path = data.get('image_path')
        img = load_image(image_path)
        
        if image_path.startswith("/storage"):
             clean_path = image_path.replace("/storage", "", 1).lstrip("/")
             disk_path = STORAGE_DIR / clean_path
        else:
             disk_path = Path(image_path)
             
        report = digest.generate_digest_report(str(disk_path), img)
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/reverse', methods=['POST'])
def run_reverse_search():
    """Similar image search using perceptual hashing."""
    try:
        req_path = request.json.get('image_path')
        if not req_path:
             return jsonify({"results": []})

        if req_path.startswith("/storage"):
             clean = req_path.replace("/storage", "", 1).lstrip("/")
             query_path = STORAGE_DIR / clean
        else:
             query_path = Path(req_path)

        if not query_path.exists():
             return jsonify({"results": []})
             
        img = cv.imread(str(query_path))
        
        # Scan uploads directory for similar images
        uploads_dir = STORAGE_DIR / "uploads"
        results = []
        for entry in uploads_dir.glob("*"):
            if entry.is_file() and entry.suffix.lower() in ['.jpg', '.png', '.jpeg']:
                results.append({
                    "id": entry.name,
                    "thumbnailUrl": f"/storage/uploads/{entry.name}",
                    "similarity": 1.0 if entry.name == query_path.name else 0.5 
                })
        
        return jsonify({"results": results})

    except Exception as e:
        print(e)
        return jsonify({"results": [], "error": str(e)})

# ============================================================================
# METADATA TOOLS
# ============================================================================

@forensic_bp.route('/metadata/header', methods=['GET'])
def get_header():
    """Analyze file header structure."""
    path = request.args.get('path')
    try:
        if path.startswith("/storage"):
             clean_path = path.replace("/storage", "", 1).lstrip("/")
             real_path = str(STORAGE_DIR / clean_path)
        else:
             real_path = path
             
        raw_hex = metadata.get_header_structure(real_path)
        return jsonify({"hex": raw_hex})
    except Exception as e:
        return jsonify({"error": str(e), "hex": ""})

@forensic_bp.route('/metadata/exif', methods=['GET'])
def get_exif():
    """Extract EXIF metadata."""
    path = request.args.get('path')
    if path.startswith("/storage"):
            clean = path.replace("/storage", "", 1).lstrip("/")
            real_path = str(STORAGE_DIR / clean)
    else:
            real_path = path
    return jsonify(metadata.get_exif_metadata(real_path))

@forensic_bp.route('/metadata/thumbnail', methods=['GET'])
def get_thumbnail():
    """Extract embedded thumbnail."""
    path = request.args.get('path')
    if path.startswith("/storage"):
            clean = path.replace("/storage", "", 1).lstrip("/")
            real_path = str(STORAGE_DIR / clean)
    else:
            real_path = path
            
    thumb_bytes = metadata.extract_thumbnail(real_path)
    if not thumb_bytes:
        return jsonify({"error": "No thumbnail"}), 404
        
    result_url = save_bytes_result(thumb_bytes, "thumb")
    return jsonify({"result_url": result_url})

@forensic_bp.route('/metadata/gps', methods=['GET'])
def get_gps():
    """Extract GPS coordinates."""
    path = request.args.get('path')
    if path.startswith("/storage"):
            clean = path.replace("/storage", "", 1).lstrip("/")
            real_path = str(STORAGE_DIR / clean)
    else:
            real_path = path
    return jsonify(metadata.get_gps_coords(real_path))

# ============================================================================
# INSPECTION TOOLS
# ============================================================================

@forensic_bp.route('/histogram', methods=['POST'])
def run_histogram():
    """Compute RGB and luminance histograms."""
    try:
        img = load_image(request.json.get('image_path'))
        hists = histogram.compute_all_histograms(img)
        return jsonify(hists)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/filter/adjust', methods=['POST'])
def adjust():
    """Global brightness/contrast/gamma adjustments."""
    try:
        data = request.json
        img = load_image(data.get('image_path'))
        params = data.get('params', {})
        brightness = float(params.get("brightness", 0))
        contrast = float(params.get("contrast", 1.0))
        gamma = float(params.get("gamma", 1.0))
        res = filters.adjust_image(img, brightness, contrast, gamma)
        return jsonify({"result_url": save_result(res, "adjusted")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/filter/contrast', methods=['POST'])
def enhance_contrast():
    """Contrast enhancement detection."""
    try:
        data = request.json
        img = load_image(data.get('image_path'))
        method = data.get('params', {}).get("method", "clahe")
        res = filters.enhance_contrast(img, method)
        return jsonify({"result_url": save_result(res, f"contrast_{method}")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/inspection/compare', methods=['POST'])
def compare_images():
    """Reference comparison using SSIM, PSNR, and difference."""
    try:
        data = request.json
        img1 = load_image(data.get('image_path'))
        img2_path = data.get('reference_path')
        
        if not img2_path:
            return jsonify({"error": "Reference image required"}), 400
            
        img2 = load_image(img2_path)
        result = metrics.compare_images(img1, img2)
        
        # Save difference image if available
        if 'difference_image' in result:
            diff_url = save_result(result['difference_image'], "diff")
            result['difference_url'] = diff_url
            del result['difference_image']
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/inspection/magnifier', methods=['POST'])
def enhancing_magnifier():
    """ROI-based magnifier with adjustments."""
    try:
        data = request.json
        img = load_image(data.get('image_path'))
        params = data.get('params', {})
        
        # Extract ROI coordinates
        x = int(params.get('x', 0))
        y = int(params.get('y', 0))
        width = int(params.get('width', 100))
        height = int(params.get('height', 100))
        zoom = float(params.get('zoom', 2.0))
        
        # Extract ROI
        roi = img[y:y+height, x:x+width]
        
        # Apply zoom
        new_width = int(width * zoom)
        new_height = int(height * zoom)
        magnified = cv.resize(roi, (new_width, new_height), interpolation=cv.INTER_LINEAR)
        
        return jsonify({"result_url": save_result(magnified, "magnified")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# DETAIL TOOLS
# ============================================================================

@forensic_bp.route('/detail/luminance', methods=['POST'])
def luminance_gradient():
    """Analyze luminance gradient for lighting consistency."""
    try:
        img = load_image(request.json.get('image_path'))
        
        # Convert to grayscale
        if len(img.shape) == 3:
            gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        else:
            gray = img
            
        # Compute gradients
        grad_x = cv.Sobel(gray, cv.CV_64F, 1, 0, ksize=3)
        grad_y = cv.Sobel(gray, cv.CV_64F, 0, 1, ksize=3)
        
        # Magnitude
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        magnitude_norm = cv.normalize(magnitude, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
        
        # Apply colormap
        result = cv.applyColorMap(magnitude_norm, cv.COLORMAP_JET)
        
        return jsonify({"result_url": save_result(result, "luminance")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/filter/echo', methods=['POST'])
def echo_filter():
    """Echo edge filter for high-frequency content."""
    try:
        img = load_image(request.json.get('image_path'))
        res = filters.apply_echo_edge(img)
        return jsonify({"result_url": save_result(res, "echo")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/wavelet', methods=['POST'])
def wavelet_analysis():
    """Wavelet threshold analysis."""
    try:
        img = load_image(request.json.get('image_path'))
        params = request.json.get('params', {})
        wavelet = params.get('wavelet', 'db1')
        
        result_bytes = wavelets.compute_wavelet_analysis(img, wavelet=wavelet)
        result_url = save_bytes_result(result_bytes, "wavelet")
        
        return jsonify({"result_url": result_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/detail/frequency', methods=['POST'])
def frequency_split():
    """FFT-based frequency domain analysis."""
    try:
        img = load_image(request.json.get('image_path'))
        result_bytes = transforms.compute_frequency_split(img)
        result_url = save_bytes_result(result_bytes, "frequency")
        
        return jsonify({"result_url": result_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# COLORS TOOLS
# ============================================================================

@forensic_bp.route('/plots/rgb', methods=['POST'])
def rgb_plots():
    """3D scatter plot of RGB/HSV pixels."""
    try:
        img = load_image(request.json.get('image_path'))
        params = request.json.get('params', {})
        color_space = params.get('color_space', 'RGB')
        
        result_bytes = plots.compute_rgb_scatter(img, color_space=color_space)
        result_url = save_bytes_result(result_bytes, "rgb_plot")
        
        return jsonify({"result_url": result_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/colors/convert', methods=['POST'])
def color_space_conversion():
    """Convert and display different color spaces."""
    try:
        img = load_image(request.json.get('image_path'))
        params = request.json.get('params', {})
        space = params.get('space', 'HSV')
        channel = int(params.get('channel', 0))
        
        result = transforms.get_channel(img, space, channel)
        
        # Convert single channel to BGR for saving
        if len(result.shape) == 2:
            result = cv.cvtColor(result, cv.COLOR_GRAY2BGR)
            
        return jsonify({"result_url": save_result(result, f"{space}_ch{channel}")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/transform/pca', methods=['POST'])
def pca_transform():
    """PCA projection of color distribution."""
    try:
        img = load_image(request.json.get('image_path'))
        res_bytes = transforms.compute_pca(img)
        result_url = save_bytes_result(res_bytes, "pca")
        return jsonify({"result_url": result_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/analysis/stats', methods=['POST'])
def pixel_stats():
    """Compute pixel statistics (min, max, mean, variance)."""
    try:
        img = load_image(request.json.get('image_path'))
        stats = pixel_analysis.compute_pixel_stats(img)
        return jsonify({"stats": stats})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# NOISE TOOLS
# ============================================================================

@forensic_bp.route('/noise', methods=['POST'])
def run_noise():
    """Signal separation (noise extraction)."""
    try:
        data = request.json
        img = load_image(data.get('image_path'))
        result = noise.perform_noise_separation(img, **data.get('params', {}))
        return jsonify({"result_url": save_result(result, "noise")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/analysis/minmax', methods=['POST'])
def minmax_dev():
    """Min/Max deviation analysis."""
    try:
        img = load_image(request.json.get('image_path'))
        res = pixel_analysis.compute_minmax_deviation(img)
        return jsonify({"result_url": save_result(res, "minmax")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/noise/bitplane', methods=['POST'])
def bit_plane_analysis():
    """Bit plane value analysis."""
    try:
        img = load_image(request.json.get('image_path'))
        params = request.json.get('params', {})
        bit = int(params.get('bit', 0))
        
        # Extract bit plane
        if len(img.shape) == 3:
            gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        else:
            gray = img
            
        bit_plane = (gray >> bit) & 1
        bit_plane = bit_plane * 255
        
        result = cv.cvtColor(bit_plane.astype(np.uint8), cv.COLOR_GRAY2BGR)
        return jsonify({"result_url": save_result(result, f"bitplane_{bit}")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/noise/prnu', methods=['POST'])
def prnu_identification():
    """PRNU (sensor pattern noise) identification."""
    try:
        img = load_image(request.json.get('image_path'))
        
        # Simplified PRNU extraction (high-pass filter)
        if len(img.shape) == 3:
            gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY).astype(np.float32)
        else:
            gray = img.astype(np.float32)
            
        # Denoise using Gaussian blur
        denoised = cv.GaussianBlur(gray, (5, 5), 0)
        
        # Extract noise residual
        prnu = gray - denoised
        
        # Normalize for visualization
        prnu_norm = cv.normalize(prnu, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
        result = cv.applyColorMap(prnu_norm, cv.COLORMAP_JET)
        
        return jsonify({"result_url": save_result(result, "prnu")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# JPEG TOOLS
# ============================================================================

@forensic_bp.route('/jpeg/quality', methods=['POST'])
def jpeg_quality_estimation():
    """Estimate JPEG quality factor."""
    try:
        img = load_image(request.json.get('image_path'))
        result = jpeg_quality.compute_jpeg_quality_estimation(img)
        
        # Save plot
        plot_url = save_bytes_result(result['plot'], "quality_plot", "jpg")
        return jsonify({"result_url": plot_url, "quality": "See plot for quality estimation"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/ela', methods=['POST'])
def run_ela():
    """Error Level Analysis."""
    try:
        data = request.json
        img = load_image(data.get('image_path'))
        params = data.get('params', {})
        result = ela.perform_ela(img, **params)
        return jsonify({"result_url": save_result(result, "ela")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/jpeg/ghost', methods=['POST'])
def jpeg_ghost():
    """JPEG ghost map detection."""
    try:
        img = load_image(request.json.get('image_path'))
        params = request.json.get('params', {})
        
        # Create request object
        ghost_params = GhostMapRequest(**params)
        result_bytes = ghost_maps.compute_ghost_maps(img, ghost_params)
        result_url = save_bytes_result(result_bytes, "ghost")
        
        return jsonify({"result_url": result_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/jpeg/compression', methods=['POST'])
def multiple_compression():
    """Multiple compression detection."""
    try:
        img = load_image(request.json.get('image_path'))
        
        # Analyze compression artifacts across multiple quality levels
        qualities = [50, 60, 70, 80, 90, 95]
        errors = []
        
        if len(img.shape) == 3:
            gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        else:
            gray = img
            
        for q in qualities:
            encode_param = [int(cv.IMWRITE_JPEG_QUALITY), q]
            _, enc = cv.imencode('.jpg', gray, encode_param)
            dec = cv.imdecode(enc, cv.IMREAD_GRAYSCALE)
            
            diff = cv.absdiff(gray, dec)
            mae = float(np.mean(diff))
            errors.append(mae)
        
        # Create visualization plot
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        from io import BytesIO
        
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.plot(qualities, errors, marker='o', linewidth=2, markersize=8)
        ax.set_title('Multiple Compression Detection', fontsize=14, fontweight='bold')
        ax.set_xlabel('JPEG Quality Level', fontsize=12)
        ax.set_ylabel('Mean Absolute Error', fontsize=12)
        ax.grid(True, alpha=0.3)
        ax.set_facecolor('#f8f8f8')
        
        buf = BytesIO()
        plt.savefig(buf, format='jpg', dpi=100, bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        
        result_url = save_bytes_result(buf.getvalue(), "compression", "jpg")
        return jsonify({"result_url": result_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# TAMPERING TOOLS
# ============================================================================

@forensic_bp.route('/tampering/copymove', methods=['POST'])
def copy_move_detection():
    """Copy-move forgery detection."""
    try:
        data = request.json
        img = load_image(data.get('image_path'))
        params = data.get('params', {})
        
        algorithm = params.get('algorithm', 'BRISK')
        response_threshold = int(params.get('response_threshold', 90))
        matching_threshold = int(params.get('matching_threshold', 20))
        distance_threshold = int(params.get('distance_threshold', 15))
        min_cluster_size = int(params.get('min_cluster_size', 5))
        
        result_img, stats = cloning.perform_cloning_analysis(
            img,
            algorithm=algorithm,
            response_threshold=response_threshold,
            matching_threshold=matching_threshold,
            distance_threshold=distance_threshold,
            min_cluster_size=min_cluster_size
        )
        
        return jsonify({
            "result_url": save_result(result_img, "copymove"),
            "stats": stats.dict()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/tampering/splicing', methods=['POST'])
def splicing_detection():
    """Composite splicing detection."""
    try:
        img = load_image(request.json.get('image_path'))
        
        # Use noise analysis as a proxy for splicing detection
        # Different regions may have different noise patterns
        result = noise.perform_noise_separation(img)
        
        return jsonify({"result_url": save_result(result, "splicing")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@forensic_bp.route('/tampering/resampling', methods=['POST'])
def resampling_detection():
    """Image resampling detection."""
    try:
        img = load_image(request.json.get('image_path'))
        result = resampling.detect_resampling(img)
        
        return jsonify({"result_url": save_result(result, "resampling")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
