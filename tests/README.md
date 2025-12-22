# ImageSICS Test Suite

This directory contains all test files for the ImageSICS project.

## Test Files

### Comprehensive Tests
- **test_all.py** - Comprehensive test suite that checks all project files and structure
- **test_backend.py** - Backend API and route tests
- **verify_frontend.py** - Frontend file verification

### Unit Tests
- **test_forensic_modules.py** - Tests for forensic analysis modules
- **test_routes.py** - Tests for Flask routes and endpoints

## Running Tests

### Run All Tests
```bash
cd /home/president/project/imageSICS
python3 tests/test_all.py
```

### Run Specific Test Suite
```bash
# Forensic modules
python3 -m pytest tests/test_forensic_modules.py

# Routes
python3 -m pytest tests/test_routes.py

# Or using unittest
python3 tests/test_forensic_modules.py
python3 tests/test_routes.py
```

### Run with Coverage
```bash
pip install pytest pytest-cov
pytest tests/ --cov=apps --cov=packages
```

## Test Structure

```
tests/
├── __init__.py                 # Package init
├── README.md                   # This file
├── test_all.py                 # Comprehensive test suite
├── test_backend.py             # Backend tests
├── test_forensic_modules.py    # Forensic module tests
├── test_routes.py              # Route tests
└── verify_frontend.py          # Frontend verification
```

## Expected Results

The comprehensive test suite (`test_all.py`) checks:
- ✅ Project directory structure (12 tests)
- ✅ Core application files (11 tests)
- ✅ Frontend CSS/JS files (18 tests)
- ✅ Forensic modules (12 tests)
- ✅ Python dependencies (5 tests)
- ✅ Configuration files (10 tests)
- ✅ API routes (5 tests)
- ✅ HTML templates (3 tests)
- ✅ Storage directories (6 tests)
- ✅ JavaScript syntax (9 tests)

**Total: ~90 tests**

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    python3 tests/test_all.py
    python3 -m pytest tests/
```

## Adding New Tests

1. Create new test file in `tests/` directory
2. Follow naming convention: `test_*.py`
3. Use unittest or pytest framework
4. Import required modules
5. Add test methods starting with `test_`

Example:
```python
import unittest

class TestNewFeature(unittest.TestCase):
    def test_something(self):
        self.assertTrue(True)
```
