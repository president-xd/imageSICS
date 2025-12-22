# ImageSICS - Installation Guide

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/president-xd/imageSICS.git
cd imageSICS
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install imagesics-core Package
```bash
cd packages/imagesics-core
pip install -e .
cd ../..
```

### 4. Set Up Environment Variables (Optional)
Create a `.env` file in the project root:
```bash
# Storage directories
IMAGESICS_STORAGE_DIR=./storage
IMAGESICS_THIRD_PARTY_DIR=./third_party
PORT=8000

# Optional: For internet reverse image search
SERPAPI_KEY=your_serpapi_key_here
```

### 5. Run the Application
```bash
cd apps/monolith
PYTHONPATH=../../packages/imagesics-core/src python3 app.py
```

The application will be available at `http://localhost:8000`

## System Requirements

- **Python**: 3.9 or higher
- **Operating System**: Linux, macOS, or Windows
- **RAM**: Minimum 4GB (8GB recommended for large images)
- **Disk Space**: 500MB for dependencies + storage for uploaded images

## Optional Dependencies

### ExifTool (for enhanced metadata extraction)
```bash
# Ubuntu/Debian
sudo apt-get install libimage-exiftool-perl

# macOS
brew install exiftool

# Windows
# Download from https://exiftool.org/
```

### Production Server (Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## Troubleshooting

### ModuleNotFoundError: No module named 'imagesics_core'
Make sure to set PYTHONPATH:
```bash
export PYTHONPATH=/path/to/imageSICS/packages/imagesics-core/src
```

### OpenCV Import Errors
If you need GUI features, replace opencv-python-headless with opencv-python:
```bash
pip uninstall opencv-python-headless
pip install opencv-python
```

### Permission Errors on Storage
Ensure the storage directory is writable:
```bash
chmod -R 755 apps/monolith/storage
```

## Development Setup

For development with auto-reload:
```bash
cd apps/monolith
FLASK_ENV=development PYTHONPATH=../../packages/imagesics-core/src python3 app.py
```

## Docker Deployment (Coming Soon)

A Dockerfile and docker-compose.yml will be provided for containerized deployment.
