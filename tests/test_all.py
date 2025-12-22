#!/usr/bin/env python3
"""
Comprehensive Test Suite for ImageSICS
Tests all working files and components
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import List, Dict, Tuple

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.results = []
        
    def test(self, name: str, condition: bool, error_msg: str = ""):
        """Run a single test"""
        if condition:
            print(f"{GREEN}✓{RESET} {name}")
            self.passed += 1
            self.results.append((name, True, ""))
        else:
            print(f"{RED}✗{RESET} {name}")
            if error_msg:
                print(f"  {RED}Error: {error_msg}{RESET}")
            self.failed += 1
            self.results.append((name, False, error_msg))
    
    def warn(self, name: str, message: str):
        """Log a warning"""
        print(f"{YELLOW}⚠{RESET} {name}: {message}")
        self.warnings += 1
    
    def section(self, title: str):
        """Print section header"""
        print(f"\n{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}{title}{RESET}")
        print(f"{BLUE}{'='*60}{RESET}")
    
    def summary(self):
        """Print test summary"""
        print(f"\n{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}TEST SUMMARY{RESET}")
        print(f"{BLUE}{'='*60}{RESET}")
        print(f"{GREEN}Passed: {self.passed}{RESET}")
        print(f"{RED}Failed: {self.failed}{RESET}")
        print(f"{YELLOW}Warnings: {self.warnings}{RESET}")
        print(f"Total: {self.passed + self.failed}")
        
        if self.failed == 0:
            print(f"\n{GREEN}✓ ALL TESTS PASSED!{RESET}")
            return True
        else:
            print(f"\n{RED}✗ SOME TESTS FAILED{RESET}")
            return False

def test_project_structure(runner: TestRunner):
    """Test project directory structure"""
    runner.section("PROJECT STRUCTURE")
    
    required_dirs = [
        "apps/monolith",
        "apps/monolith/static",
        "apps/monolith/static/css",
        "apps/monolith/static/js",
        "apps/monolith/templates",
        "apps/monolith/routes",
        "apps/monolith/storage",
        "apps/monolith/storage/uploads",
        "apps/monolith/storage/results",
        "packages/imagesics-core",
        "packages/imagesics-core/src/imagesics_core",
        "packages/imagesics-core/src/imagesics_core/forensic",
    ]
    
    for dir_path in required_dirs:
        exists = os.path.isdir(dir_path)
        runner.test(f"Directory exists: {dir_path}", exists)

def test_core_files(runner: TestRunner):
    """Test existence of core application files"""
    runner.section("CORE APPLICATION FILES")
    
    core_files = [
        "apps/monolith/app.py",
        "apps/monolith/routes/uploads.py",
        "apps/monolith/routes/forensic.py",
        "apps/monolith/templates/layout.html",
        "apps/monolith/templates/index.html",
        "requirements.txt",
        "README.md",
        "INSTALL.md",
    ]
    
    for file_path in core_files:
        exists = os.path.isfile(file_path)
        runner.test(f"File exists: {file_path}", exists)
        
        if exists and file_path.endswith('.py'):
            # Check if Python file is valid
            try:
                with open(file_path, 'r') as f:
                    compile(f.read(), file_path, 'exec')
                runner.test(f"Python syntax valid: {file_path}", True)
            except SyntaxError as e:
                runner.test(f"Python syntax valid: {file_path}", False, str(e))

def test_frontend_files(runner: TestRunner):
    """Test frontend CSS and JavaScript files"""
    runner.section("FRONTEND FILES")
    
    frontend_files = [
        "apps/monolith/static/css/main.css",
        "apps/monolith/static/css/hex-editor.css",
        "apps/monolith/static/css/animations.css",
        "apps/monolith/static/js/app.js",
        "apps/monolith/static/js/app-tools.js",
        "apps/monolith/static/js/hex-editor.js",
        "apps/monolith/static/js/toast.js",
        "apps/monolith/static/js/loading.js",
        "apps/monolith/static/js/interactive-tools.js",
    ]
    
    for file_path in frontend_files:
        exists = os.path.isfile(file_path)
        runner.test(f"File exists: {file_path}", exists)
        
        if exists:
            # Check file size
            size = os.path.getsize(file_path)
            runner.test(f"File not empty: {file_path}", size > 0)

def test_forensic_modules(runner: TestRunner):
    """Test forensic analysis modules"""
    runner.section("FORENSIC MODULES")
    
    forensic_modules = [
        "packages/imagesics-core/src/imagesics_core/forensic/__init__.py",
        "packages/imagesics-core/src/imagesics_core/forensic/metadata.py",
        "packages/imagesics-core/src/imagesics_core/forensic/metrics.py",
        "packages/imagesics-core/src/imagesics_core/forensic/internet_search.py",
        "packages/imagesics-core/src/imagesics_core/forensic/resampling.py",
        "packages/imagesics-core/src/imagesics_core/forensic/various.py",
    ]
    
    for file_path in forensic_modules:
        exists = os.path.isfile(file_path)
        runner.test(f"Module exists: {file_path}", exists)
        
        if exists:
            # Try to import the module
            try:
                module_name = file_path.replace('/', '.').replace('.py', '').replace('packages.imagesics-core.src.', '')
                # We can't actually import without PYTHONPATH set, so just check syntax
                with open(file_path, 'r') as f:
                    compile(f.read(), file_path, 'exec')
                runner.test(f"Python syntax valid: {os.path.basename(file_path)}", True)
            except SyntaxError as e:
                runner.test(f"Python syntax valid: {os.path.basename(file_path)}", False, str(e))

def test_python_imports(runner: TestRunner):
    """Test that critical Python imports work"""
    runner.section("PYTHON DEPENDENCIES")
    
    required_packages = [
        ('flask', 'Flask'),
        ('cv2', 'OpenCV'),
        ('numpy', 'NumPy'),
        ('PIL', 'Pillow'),
        ('matplotlib', 'Matplotlib'),
    ]
    
    for package, name in required_packages:
        try:
            __import__(package)
            runner.test(f"Package installed: {name}", True)
        except ImportError:
            runner.test(f"Package installed: {name}", False, f"{name} not installed")

def test_configuration_files(runner: TestRunner):
    """Test configuration and documentation files"""
    runner.section("CONFIGURATION & DOCUMENTATION")
    
    config_files = [
        ("README.md", "README documentation"),
        ("INSTALL.md", "Installation guide"),
        ("INTERNET_SEARCH_SETUP.md", "Internet search setup guide"),
        ("requirements.txt", "Python requirements"),
        (".gitignore", "Git ignore file"),
    ]
    
    for file_path, description in config_files:
        exists = os.path.isfile(file_path)
        runner.test(f"{description} exists", exists)
        
        if exists:
            size = os.path.getsize(file_path)
            runner.test(f"{description} not empty", size > 0)

def test_routes_functionality(runner: TestRunner):
    """Test that route files have required endpoints"""
    runner.section("API ROUTES")
    
    # Check forensic.py for required endpoints
    forensic_routes = os.path.join("apps", "monolith", "routes", "forensic.py")
    if os.path.exists(forensic_routes):
        with open(forensic_routes, 'r') as f:
            content = f.read()
        
        required_routes = [
            "@forensic_bp.route('/hex'",
            "@forensic_bp.route('/digest'",
            "@forensic_bp.route('/reverse'",
            "@forensic_bp.route('/metadata/exif'",
            "@forensic_bp.route('/ela'",
        ]
        
        for route in required_routes:
            has_route = route in content
            runner.test(f"Route defined: {route}", has_route)
    else:
        runner.test("forensic.py exists", False)

def test_html_templates(runner: TestRunner):
    """Test HTML template integrity"""
    runner.section("HTML TEMPLATES")
    
    templates = [
        "apps/monolith/templates/layout.html",
        "apps/monolith/templates/index.html",
    ]
    
    for template in templates:
        if os.path.exists(template):
            with open(template, 'r') as f:
                content = f.read()
            
            # Check for basic HTML structure
            has_html = '<html' in content.lower()
            has_body = '<body' in content.lower()
            
            runner.test(f"Valid HTML structure: {os.path.basename(template)}", has_html and has_body)
            
            # Check for Jinja2 blocks
            if 'layout.html' in template:
                has_blocks = '{% block' in content
                runner.test(f"Has Jinja2 blocks: {os.path.basename(template)}", has_blocks)
        else:
            runner.test(f"Template exists: {template}", False)

def test_storage_directories(runner: TestRunner):
    """Test storage directory permissions"""
    runner.section("STORAGE DIRECTORIES")
    
    storage_dirs = [
        "apps/monolith/storage",
        "apps/monolith/storage/uploads",
        "apps/monolith/storage/results",
    ]
    
    for dir_path in storage_dirs:
        exists = os.path.isdir(dir_path)
        runner.test(f"Directory exists: {dir_path}", exists)
        
        if exists:
            # Check if writable
            writable = os.access(dir_path, os.W_OK)
            runner.test(f"Directory writable: {dir_path}", writable)

def test_javascript_syntax(runner: TestRunner):
    """Test JavaScript files for basic syntax"""
    runner.section("JAVASCRIPT SYNTAX")
    
    js_files = [
        "apps/monolith/static/js/app.js",
        "apps/monolith/static/js/hex-editor.js",
        "apps/monolith/static/js/toast.js",
    ]
    
    for js_file in js_files:
        if os.path.exists(js_file):
            with open(js_file, 'r') as f:
                content = f.read()
            
            # Basic syntax checks
            has_functions = 'function' in content or '=>' in content
            balanced_braces = content.count('{') == content.count('}')
            balanced_parens = content.count('(') == content.count(')')
            
            runner.test(f"Has functions: {os.path.basename(js_file)}", has_functions)
            runner.test(f"Balanced braces: {os.path.basename(js_file)}", balanced_braces)
            runner.test(f"Balanced parentheses: {os.path.basename(js_file)}", balanced_parens)
        else:
            runner.test(f"File exists: {js_file}", False)

def main():
    """Run all tests"""
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}ImageSICS Comprehensive Test Suite{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    
    runner = TestRunner()
    
    # Run all test suites
    test_project_structure(runner)
    test_core_files(runner)
    test_frontend_files(runner)
    test_forensic_modules(runner)
    test_python_imports(runner)
    test_configuration_files(runner)
    test_routes_functionality(runner)
    test_html_templates(runner)
    test_storage_directories(runner)
    test_javascript_syntax(runner)
    
    # Print summary
    success = runner.summary()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
