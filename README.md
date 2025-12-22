# 🔍 ImageSICS - Image Forensics Analysis Suite

![ImageSICS Banner](https://img.shields.io/badge/ImageSICS-Forensic_Analysis-blue?style=for-the-badge)
[![Python](https://img.shields.io/badge/Python-3.9+-green?style=for-the-badge&logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**A comprehensive web-based image forensic analysis toolkit for detecting tampering, verifying authenticity, and analyzing digital images.**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Tool Categories](#-tool-categories)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**ImageSICS** (Image Security Investigation and Comparison Suite) is a modern, web-based forensic analysis platform designed for digital image investigation. Built with Flask and powered by advanced computer vision algorithms, it provides **36 specialized forensic tools** across **9 categories** to help investigators, researchers, and security professionals analyze digital images for authenticity and tampering.

### Why ImageSICS?

- 🌐 **Web-Based**: Access from any browser, no installation required
- 🎨 **Modern UI**: Clean, dark-themed interface with intuitive navigation
- 🔬 **Comprehensive**: 36 forensic tools covering all aspects of image analysis
- ⚡ **Fast**: Optimized algorithms for real-time analysis
- 🔓 **Open Source**: Fully transparent and extensible
- 📊 **Visual Results**: Rich visualizations and detailed reports

---

## ✨ Features

### Core Capabilities

- **Metadata Analysis**: Extract and analyze EXIF, GPS, thumbnail data
- **Tampering Detection**: Identify copy-move forgery, splicing, and resampling
- **JPEG Analysis**: Quality estimation, ELA, ghost detection, compression analysis
- **Noise Analysis**: PRNU identification, signal separation, bit plane inspection
- **Color Analysis**: RGB/HSV plots, PCA projection, color space conversion
- **Frequency Analysis**: FFT, wavelet transforms, frequency domain inspection
- **Similarity Search**: Local perceptual hashing + internet reverse image search
- **Image Enhancement**: Magnification, contrast adjustment, histogram equalization

### Advanced Features

- **Dead/Hot Pixel Detection**: Camera sensor defect analysis
- **Illuminant Mapping**: Light source estimation and white balance
- **Stereogram Decoding**: Extract hidden 3D images
- **Median Filtering**: Noise reduction and smoothing
- **Reference Comparison**: SSIM, PSNR, and difference analysis

---

## 🚀 Installation

### Prerequisites

- **Python 3.9+**
- **pip** (Python package manager)
- **Git** (for cloning the repository)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/president-xd/imageSICS.git
cd imageSICS

# Install dependencies
pip install -r requirements.txt

# Install core package
cd packages/imagesics-core
pip install -e .
cd ../..

# Run the application
cd apps/monolith
PYTHONPATH=../../packages/imagesics-core/src python3 app.py
```

The application will be available at **http://localhost:8000**

### Detailed Installation

See [INSTALL.md](INSTALL.md) for detailed installation instructions, troubleshooting, and deployment options.

---

## 🎮 Quick Start

1. **Upload an Image**: Click the upload area or drag & drop an image
2. **Select a Tool**: Choose from 9 categories in the left sidebar
3. **Analyze**: Click on any tool to run the analysis
4. **View Results**: Results appear in the right panel with visualizations

### Example Workflow

```bash
# 1. Start the server
cd apps/monolith
PYTHONPATH=../../packages/imagesics-core/src python3 app.py

# 2. Open browser to http://localhost:8000

# 3. Upload a test image
# 4. Try "Error Level Analysis" from JPEG category
# 5. View the ELA visualization showing potential tampering
```

---

## 🛠️ Tool Categories

### 1. 📁 General (4 tools)

- **Original Image**: View unaltered reference
- **File Digest**: Calculate MD5/SHA1/SHA256 hashes
- **Hex Editor**: Inspect raw file bytes
- **Similar Search**: Reverse image search (local + internet)

### 2. 📝 Metadata (4 tools)

- **Header Structure**: Analyze file signatures and headers
- **EXIF Full Dump**: Complete EXIF tag extraction
- **Thumbnail Analysis**: Extract and analyze embedded thumbnails
- **Geolocation Data**: Map GPS coordinates from metadata

### 3. 🔍 Inspection (5 tools)

- **Enhancing Magnifier**: ROI-based magnification with enhancement
- **Channel Histogram**: RGB/Luminance distribution analysis
- **Global Adjustments**: Brightness/Contrast/Gamma controls
- **Reference Comparison**: Compare against trusted reference (SSIM/PSNR)
- **Contrast Enhancement**: CLAHE and histogram equalization

### 4. 🌈 Detail (4 tools)

- **Luminance Gradient**: Lighting direction consistency analysis
- **Echo Edge Filter**: Edge detection and high-frequency content
- **Wavelet Threshold**: Wavelet coefficient visualization
- **Frequency Split**: FFT-based frequency domain analysis

### 5. 🎨 Colors (4 tools)

- **RGB/HSV Plots**: 3D scatter plots of pixel distribution
- **Space Conversion**: View in HSV, LAB, YCrCb, YUV, XYZ spaces
- **PCA Projection**: Principal Component Analysis of colors
- **Pixel Statistics**: Comprehensive statistical analysis

### 6. 📡 Noise (4 tools)

- **Signal Separation**: Extract noise residuals (SRM-like)
- **Min/Max Deviation**: Visualize pixel outliers
- **Bit Plane Values**: Inspect specific bit planes
- **PRNU Identification**: Sensor pattern noise analysis

### 7. 📷 JPEG (4 tools)

- **Quality Estimation**: Estimate original JPEG quality factor
- **Error Level Analysis**: Detect re-saved modifications
- **JPEG Ghost Map**: Detect compression grid inconsistencies
- **Multiple Compression**: Analyze compression loss curves

### 8. 🚨 Tampering (3 tools)

- **Copy-Move Forgery**: Detect cloned regions (SIFT/SURF-based)
- **Image Splicing**: Advanced splicing detection
- **Image Resampling**: Detect periodic correlations from resizing

### 9. 🔧 Various (4 tools)

- **Median Filtering**: Noise reduction with adjustable kernel
- **Illuminant Map**: Light source estimation (gray-world algorithm)
- **Dead/Hot Pixels**: Camera sensor defect detection
- **Stereogram Decoder**: Extract hidden 3D images from autostereograms

**Total: 36 Forensic Tools**

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vanilla JavaScript + Jinja2 | Dynamic UI with server-side rendering |
| **Backend** | Flask 3.0 | RESTful API and routing |
| **Core Logic** | Python (imagesics-core) | Forensic algorithms |
| **Image Processing** | OpenCV, Pillow, NumPy | Computer vision operations |
| **Scientific Computing** | SciPy, scikit-learn | Statistical analysis |
| **Visualization** | Matplotlib, Chart.js | Data visualization |
| **Signal Processing** | PyWavelets | Wavelet transforms |

### Project Structure

```
imageSICS/
├── apps/
│   └── monolith/              # Flask application
│       ├── static/            # CSS, JavaScript, assets
│       ├── templates/         # Jinja2 templates
│       ├── routes/            # API endpoints
│       └── storage/           # Uploaded images & results
├── packages/
│   └── imagesics-core/        # Core forensic library
│       └── src/
│           └── imagesics_core/
│               ├── forensic/  # 20 forensic modules
│               └── utils/     # Helper functions
├── requirements.txt           # Python dependencies
├── INSTALL.md                # Installation guide
└── README.md                 # This file
```

### Core Modules

The `imagesics-core` package contains 20 specialized forensic modules:

- `metadata.py` - EXIF, GPS, thumbnail extraction
- `ela.py` - Error Level Analysis
- `cloning.py` - Copy-move forgery detection
- `jpeg.py` - JPEG compression analysis
- `ghost_maps.py` - JPEG ghost detection
- `resampling.py` - Resampling detection
- `noise.py` - Noise analysis and PRNU
- `pixel_analysis.py` - Statistical pixel analysis
- `filters.py` - Image filtering operations
- `transforms.py` - Color space transformations
- `wavelets.py` - Wavelet analysis
- `plots.py` - Data visualization
- `histogram.py` - Histogram analysis
- `various.py` - Median filter, illuminant map, etc.
- `internet_search.py` - Reverse image search
- And more...

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or tools
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/imageSICS.git
cd imageSICS

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install in development mode
pip install -r requirements.txt
pip install -e packages/imagesics-core

# Run with auto-reload
cd apps/monolith
FLASK_ENV=development PYTHONPATH=../../packages/imagesics-core/src python3 app.py
```

### Code Style

- Follow PEP 8 for Python code
- Use meaningful variable names
- Add docstrings to functions
- Write unit tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by forensic research and tools in the digital forensics community
- Built with open-source libraries: OpenCV, NumPy, SciPy, Flask
- Special thanks to all contributors

---

## 📞 Contact & Support

- **GitHub**: [@president-xd](https://github.com/president-xd)
- **Repository**: [github.com/president-xd/imageSICS](https://github.com/president-xd/imageSICS)
- **Issues**: [Report a bug](https://github.com/president-xd/imageSICS/issues)

---

**Made with ❤️ for the digital forensics community**

**⭐ Star this repository if you find it useful! ⭐**
