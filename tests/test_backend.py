import requests
import os
import sys

BASE_URL = "http://localhost:8000"
IMAGE_PATH = "test_image.jpg"

def test_endpoint(name, method, url, **kwargs):
    print(f"Testing {name}...", end=" ")
    try:
        if method == "POST":
            resp = requests.post(f"{BASE_URL}{url}", **kwargs)
        else:
            resp = requests.get(f"{BASE_URL}{url}", **kwargs)
            
        if resp.status_code == 200:
            print("OK")
            return True, resp
        else:
            print(f"FAILED ({resp.status_code})")
            print(resp.text)
            return False, resp
    except Exception as e:
        print(f"ERROR: {e}")
        return False, None

def run_tests():
    # 1. Check API Root/Docs
    ok, _ = test_endpoint("Docs", "GET", "/docs")
    if not ok:
        print("API seems down.")
        sys.exit(1)

    # 2. Pixel Stats
    # The routers expect AnalysisRequest with image_path. 
    # Since we don't have a frontend uploading to a specific spot, 
    # we need to ensure test_image.jpg is where the backend expects it 
    # OR we use absolute path.
    
    # The backend load_image checks relative to STORAGE_DIR.
    # Let's copy test_image.jpg to storage/
    if not os.path.exists("storage"):
        os.makedirs("storage")
    
    import shutil
    shutil.copy(IMAGE_PATH, "storage/test_image.jpg")
    
    payload = {
        "image_path": "test_image.jpg",
        "params": {}
    }
    
    print("\n--- Core Tools ---")
    test_endpoint("Pixel Stats", "POST", "/api/forensic/analysis/stats", json=payload)
    test_endpoint("Min/Max", "POST", "/api/forensic/analysis/minmax", json=payload)
    test_endpoint("Bit Plane", "POST", "/api/forensic/analysis/bitplane", json={"image_path": "test_image.jpg", "params": {"plane": 0}})

    print("\n--- Filters ---")
    test_endpoint("Enhance Contrast", "POST", "/api/forensic/filter/contrast", json={"image_path": "test_image.jpg", "params": {"method": "clahe"}})
    test_endpoint("Echo Edge", "POST", "/api/forensic/filter/echo", json=payload)
    
    print("\n--- Metadata ---")
    # For GET endpoints like thumbnail, it expects path query param
    # Note: Using absolute path for safety in backend or relative to storage
    test_endpoint("Header", "GET", f"/api/forensic/metadata/header?path={os.path.abspath('storage/test_image.jpg')}")
    test_endpoint("Thumbnail", "GET", f"/api/forensic/metadata/thumbnail?path={os.path.abspath('storage/test_image.jpg')}")

    print("\n--- Advanced ---")
    test_endpoint("ELA", "POST", "/api/forensic/ela", json=payload)
    test_endpoint("Noise Sep", "POST", "/api/forensic/noise", json=payload)
    test_endpoint("JPEG Quality", "POST", "/api/forensic/jpeg/quality", json=payload)
    test_endpoint("Hex Editor", "GET", f"/api/forensic/metadata/header?path={os.path.abspath('storage/test_image.jpg')}")

    # Add reference comparison test (requires reference path)
    ref_payload = {
        "image_path": "test_image.jpg",
        "params": {
            "reference_path": "test_image.jpg" # Compare to self
        }
    }
    print("\n--- Comparison ---")
    test_endpoint("Metrics (Self-Compare)", "POST", "/api/forensic/comparison/metrics", json=ref_payload)

if __name__ == "__main__":
    run_tests()
