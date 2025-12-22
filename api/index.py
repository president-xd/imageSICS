"""
Vercel Serverless Entry Point for ImageSICS
This module wraps the Flask application for deployment on Vercel's serverless platform.
"""
import os
import sys

# Get the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add the packages directory to Python path for imagesics-core
packages_path = os.path.join(project_root, 'packages', 'imagesics-core', 'src')
sys.path.insert(0, packages_path)

# Add the apps/monolith directory to Python path for routes
monolith_path = os.path.join(project_root, 'apps', 'monolith')
sys.path.insert(0, monolith_path)

# Change working directory to monolith for relative imports
os.chdir(monolith_path)

# Set environment variable for serverless mode
os.environ['VERCEL_ENV'] = 'true'

# Import the Flask app
from app import app

# Export for Vercel's Python runtime
# The runtime expects a variable named 'app' or 'application'
application = app
