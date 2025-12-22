import os
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.urandom(24)
CORS(app) # Enable CORS just in case, though monolithic

# Configuration
# Use /tmp for serverless environments (Vercel), local storage for development
IS_SERVERLESS = os.getenv('VERCEL_ENV') is not None
if IS_SERVERLESS:
    STORAGE_DIR = '/tmp/storage'
else:
    STORAGE_DIR = os.path.join(os.getcwd(), 'storage')

UPLOADS_DIR = os.path.join(STORAGE_DIR, 'uploads')
RESULTS_DIR = os.path.join(STORAGE_DIR, 'results')

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

from routes.uploads import uploads_bp
from routes.forensic import forensic_bp

app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
app.register_blueprint(forensic_bp, url_prefix='/api/forensic')

TOOLS = [
    { "name": "General", "tool_list": ["Original Image", "File Digest", "Hex Editor", "Similar Search"] },
    { "name": "Metadata", "tool_list": ["Header Structure", "EXIF Full Dump", "Thumbnail Analysis", "Geolocation Data"] },
    { "name": "Inspection", "tool_list": ["Enhancing Magnifier", "Channel Histogram", "Global Adjustments", "Reference Comparison", "Contrast Enhancement"] },
    { "name": "Detail", "tool_list": ["Luminance Gradient", "Echo Edge Filter", "Wavelet Threshold", "Frequency Split"] },
    { "name": "Colors", "tool_list": ["RGB/HSV Plots", "Space Conversion", "PCA Projection", "Pixel Statistics"] },
    { "name": "Noise", "tool_list": ["Signal Separation", "Min/Max Deviation", "Bit Plane Values", "PRNU Identification"] },
    { "name": "JPEG", "tool_list": ["Quality Estimation", "Error Level Analysis", "JPEG Ghost Map", "Multiple Compression"] },
    { "name": "Tampering", "tool_list": ["Copy-Move Forgery", "Image Splicing", "Image Resampling"] },
    { "name": "Various", "tool_list": ["Median Filtering", "Illuminant Map", "Dead/Hot Pixels", "Stereogram Decoder"] }
]

@app.route('/')
def index():
    return render_template('index.html', tools=TOOLS)

@app.route('/storage/<path:filename>')
def serve_storage(filename):
    return send_from_directory(STORAGE_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
