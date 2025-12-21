# imageSICS: Web-Based Forensic Analysis Suite

**imageSICS** is a comprehensive, web-based image forensic testing suite designed to be the modern successor to the Sherloq desktop application. It provides a robust set of 32 distinct forensic tools for analyzing digital images, detecting tampering, and verifying authenticity.

## 🚀 Overview

- **Architecture**: Modern Monorepo (Python/FastAPI Backend + React/Next.js Frontend).
- **Interface**: "Dock"-style modular UI allowing infinite customization of the workspace.
- **Core**: High-performance OpenCV and NumPy algorithms ported directly from proven forensic implementations.
- **Parity**: **100% Feature Parity** with the original desktop suite.

## 🛠️ Technology Stack

| Component | Tech | Description |
|-----------|------|-------------|
| **Core** | Python 3.9+ | Main logic library (`imagesics-core`) |
| **Back** | FastAPI | High-performance async REST API |
| **Front** | Next.js 14 | React-based UI with TailwindCSS |
| **Layout**| FlexLayout | Draggable, dockable panel management |
| **Build** | Hatch/Poetry | Python package management |

---

## 📦 Installation & Setup

### Prerequisites
- **Python 3.10+**: Required for the backend.
- **Node.js 20+**: Required for the frontend (Provided locally in project).

### 1. Backend Setup
The backend handles all forensic analysis and file processing.

```bash
# 1. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies (Core & API)
pip install -e packages/imagesics-core
pip install -e apps/api
pip install uvicorn python-multipart

# Note: If venv creation fails due to missing system packages, 
# you can install globally for your user:
# pip install --user -e packages/imagesics-core
# pip install --user -e apps/api
# pip install --user uvicorn python-multipart
```

### 2. Frontend Setup
The frontend is a Next.js application located in `apps/web`.

```bash
# 1. Setup usage of local Node.js binary (recommended)
export PATH=$PWD/node-v20.10.0-linux-x64/bin:$PATH

# 2. Install dependencies
cd apps/web
npm install
```

---

## ▶️ Running the Application

You will need two terminal windows running simultaneously.

### Terminal 1: API Server
Starts the backend server on port 8000.

```bash
# From the project root
source .venv/bin/activate  # If using venv
uvicorn imagesics_api.main:app --app-dir apps/api/src --reload --port 8000 --host 127.0.0.1
```

### Terminal 2: Web Interface
Starts the frontend development server on port 3000.

```bash
# From the project root
export PATH=$PWD/node-v20.10.0-linux-x64/bin:$PATH
cd apps/web
npm run dev
```

Once both are running, open your browser and access the suite at:
👉 **http://localhost:3000**

---

## 🔍 Features

The toolset is organized into 8 categories:

### 1. General
- **Original Image**: View the unaltered reference.
- **File Digest**: Calculate MD5/SHA1/SHA256 hashes.
- **Hex Editor**: Inspect raw file bytes.
- **Similar Search**: Reverse image search integration.

### 2. Metadata
- **Header Structure**: Analyze file signatures.
- **EXIF Dump**: View standard EXIF tags.
- **Thumbnail Analysis**: Extract embedded thumbnails.
- **Geolocation**: Map GPS coordinates found in metadata.

### 3. Inspection
- **Enhancing Magnifier**: ROI-based contrast/brightness inspection.
- **Channel Histogram**: RGB/Luminance distribution.
- **Global Adjustments**: Full-image brightness/contrast/gamma control.
- **Reference Comparison**: Compare evidence against a trusted reference (SSIM, PSNR, Difference).

### 4. Detail
- **Luminance Gradient**: Analyze lighting direction consistency.
- **Echo Edge Filter**: Detect edges and high-frequency content.
- **Wavelet Threshold**: Visualize wavelet coefficients.
- **Frequency Split**: FFT-based frequency domain analysis.

### 5. Colors
- **RGB/HSV Plots**: 3D scatter plots of pixel colors.
- **Space Conversion**: View channels in HSV, LAB, YCrCb, YUV, XYZ spaces.
- **PCA Projection**: Principal Component Analysis of color distribution.
- **Pixel Statistics**: Min/Max, Mean, Variance stats.

### 6. Noise
- **Signal Separation**: Extract noise residuals (SRM-like).
- **Min/Max Deviation**: Visualize pixel outliers.
- **Bit Plane Values**: Inspect specific bit planes for hidden data.
- **PRNU Identification**: Sensor pattern noise analysis.

### 7. JPEG
- **Quality Estimation**: Estimate original JPEG quality.
- **Error Level Analysis (ELA)**: Detect re-saved modifications.
- **Multiple Compression**: Analyze compression loss curves.
- **JPEG Ghost Map**: Detect inconsistencies in compression grids.

### 8. Tampering
- **Contrast Enhancement**: Detect histogram anomalies from contrast stretching.
- **Copy-Move Forgery**: Detect cloned regions (SIFT/SURF-based).
- **Image Splicing**: Advanced splicing detection (Noiseprint).
- **Image Resampling**: Detect periodic correlations from resizing.

---

## 🧩 Project Structure

```bash
imageSICS/
├── apps/
│   ├── api/              # FastAPI application (Routers, Services)
│   └── web/              # Next.js application (Components, Panels)
├── packages/
│   └── imagesics-core/   # Core logic library
│       ├── forensic/     # All 32 forensic algorithms
│       └── utils/        # Generic helpers
├── third_party/          # Binaries (ExifTool)
└── storage/              # Uploads and temporary results
```

## 🐛 Troubleshooting

**"Reference image required" error:**
- The Compare tool requires you to upload a second image. This feature is pending UI implementation for multi-file upload, currently implemented via API parameter `reference_path`.

**"Install 'sewar' for advanced metrics":**
- The system gracefully degrades if `sewar` is missing. Install it via `pip install sewar` for full metrics.
