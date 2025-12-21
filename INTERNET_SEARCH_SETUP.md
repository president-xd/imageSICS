# ImageSICS - Internet Search Configuration

## SerpAPI Setup (Optional)

To enable real internet reverse image search, you need a SerpAPI key:

1. **Get Free API Key**:
   - Visit: https://serpapi.com/
   - Sign up for free account (100 searches/month free)
   - Copy your API key

2. **Set Environment Variable**:
   ```bash
   export SERPAPI_KEY="your_api_key_here"
   ```

3. **Restart Flask Server**:
   ```bash
   cd apps/monolith
   PYTHONPATH=../../packages/imagesics-core/src SERPAPI_KEY="your_key" python3 app.py
   ```

## How It Works

**With API Key**:
- Real reverse image search results from Google
- Shows actual websites where image appears
- Displays source names, URLs, snippets, thumbnails

**Without API Key** (Current):
- Falls back to manual search engine links
- User clicks link and manually uploads image
- Works but requires manual steps

## Alternative: Free Solution

If you don't want to use SerpAPI, the application provides direct links to:
- Google Images
- TinEye  
- Bing Visual Search

Users can click these links and manually upload the image to search.
