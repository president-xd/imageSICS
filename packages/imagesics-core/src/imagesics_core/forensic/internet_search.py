"""
Internet reverse image search functionality using SerpAPI.
"""
import requests
import os
from typing import List, Dict

# SerpAPI configuration
# Get your free API key from https://serpapi.com/
SERPAPI_KEY = os.environ.get('SERPAPI_KEY', '')

def search_google_images_serpapi(image_path: str, max_results: int = 10) -> List[Dict]:
    """
    Search Google Images using SerpAPI reverse image search.
    Requires SERPAPI_KEY environment variable.
    """
    results = []
    
    print(f"[DEBUG] SERPAPI_KEY present: {bool(SERPAPI_KEY)}")
    print(f"[DEBUG] SERPAPI_KEY length: {len(SERPAPI_KEY) if SERPAPI_KEY else 0}")
    
    if not SERPAPI_KEY:
        print("Warning: SERPAPI_KEY not set. Skipping Google search.")
        return results
    
    try:
        print(f"[DEBUG] Searching for image: {image_path}")
        
        # Read and base64 encode the image
        import base64
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Use SerpAPI with base64 encoded image
        params = {
            'engine': 'google_lens',
            'api_key': SERPAPI_KEY,
            'url': f'data:image/png;base64,{image_data}'
        }
        
        print(f"[DEBUG] Making request to SerpAPI with Google Lens...")
        response = requests.get(
            'https://serpapi.com/search',
            params=params,
            timeout=30
        )
        
        print(f"[DEBUG] Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[DEBUG] Response keys: {list(data.keys())}")
            
            # Extract visual matches from Google Lens
            if 'visual_matches' in data:
                print(f"[DEBUG] Found {len(data['visual_matches'])} visual_matches")
                for item in data['visual_matches'][:max_results]:
                    results.append({
                        'title': item.get('title', 'No title'),
                        'url': item.get('link', ''),
                        'source': item.get('source', 'Unknown'),
                        'snippet': item.get('snippet', ''),
                        'thumbnail': item.get('thumbnail')
                    })
            
            # Also check knowledge graph
            if 'knowledge_graph' in data:
                kg = data['knowledge_graph']
                if isinstance(kg, list):
                    for item in kg[:3]:
                        results.append({
                            'title': item.get('title', 'No title'),
                            'url': item.get('link', ''),
                            'source': 'Knowledge Graph',
                            'snippet': item.get('description', ''),
                            'thumbnail': item.get('thumbnail')
                        })
            
            # Check for errors in response
            if 'error' in data:
                print(f"[ERROR] SerpAPI error: {data['error']}")
                
            print(f"[DEBUG] Total results found: {len(results)}")
        else:
            print(f"[ERROR] SerpAPI returned status {response.status_code}")
            print(f"[ERROR] Response: {response.text[:500]}")
                    
    except Exception as e:
        print(f"[ERROR] SerpAPI Google search error: {e}")
        import traceback
        traceback.print_exc()
    
    return results[:max_results]

def search_tineye_api(image_path: str, max_results: int = 10) -> List[Dict]:
    """
    Search TinEye using their API (requires API key).
    """
    results = []
    
    # TinEye API requires paid subscription
    # For now, return empty
    print("TinEye API not configured (requires paid subscription)")
    
    return results

def perform_internet_search(image_path: str, engines: List[str] = None) -> Dict:
    """
    Perform reverse image search across multiple engines.
    
    Args:
        image_path: Path to image file
        engines: List of engines to search (google, tineye, bing)
    
    Returns:
        Dictionary with results from each engine
    """
    if engines is None:
        engines = ['google']
    
    all_results = {
        "google": [],
        "tineye": [],
        "bing": [],
        "total_matches": 0
    }
    
    # Try SerpAPI for Google
    if 'google' in engines:
        google_results = search_google_images_serpapi(image_path)
        all_results['google'] = google_results
        all_results['total_matches'] += len(google_results)
    
    # If no API key or no results, return empty
    # The backend will fall back to providing manual search links
    
    return all_results
