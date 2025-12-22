// ============================================================================
// APP.JS - Main Application Logic
// ============================================================================

// Toast notification system
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';

    toast.innerHTML = `
        <i data-lucide="${iconName}" class="toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// File upload handling
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const emptyState = document.getElementById('emptyState');
    const imageViewer = document.getElementById('imageViewer');
    const mainImage = document.getElementById('mainImage');
    const imageName = document.getElementById('imageName');
    const imageDimensions = document.getElementById('imageDimensions');

    // Upload button click
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File selection
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/uploads/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.path) {
                // Update global state
                window.appState.currentImagePath = data.path;
                window.appState.currentImage = file.name;

                // Show image
                mainImage.src = data.path;
                imageName.textContent = file.name;

                // Load image to get dimensions
                const img = new Image();
                img.onload = () => {
                    imageDimensions.textContent = `${img.width} × ${img.height}`;
                };
                img.src = data.path;

                // Switch views
                emptyState.classList.add('hidden');
                imageViewer.classList.remove('hidden');

                showToast('Image uploaded successfully', 'success');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Failed to upload image', 'error');
        }
    });

    // Category collapse/expand
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function () {
            const category = this.dataset.category;
            const toolList = document.getElementById(`category-${category}`);

            // Toggle expanded class on header
            this.classList.toggle('expanded');

            // Toggle expanded class on tool list
            if (toolList) {
                toolList.classList.toggle('expanded');
            }
        });

        // Start with all categories expanded
        header.classList.add('expanded');
        const category = header.dataset.category;
        const toolList = document.getElementById(`category-${category}`);
        if (toolList) {
            toolList.classList.add('expanded');
        }
    });

    // Tool selection
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', () => {
            const toolName = item.dataset.tool;
            const category = item.dataset.category;

            if (!window.appState.currentImagePath) {
                showToast('Please upload an image first', 'warning');
                return;
            }

            // Update active state
            document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
            item.classList.add('active');

            // Open tool panel
            openToolPanel(toolName, category);
        });
    });

    // Panel close button
    document.getElementById('closePanel').addEventListener('click', () => {
        closeToolPanel();
    });

    // Image viewer controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        window.appState.zoom = Math.min(window.appState.zoom * 1.2, 5);
        updateImageZoom();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        window.appState.zoom = Math.max(window.appState.zoom / 1.2, 0.1);
        updateImageZoom();
    });

    document.getElementById('resetZoom').addEventListener('click', () => {
        window.appState.zoom = 1.0;
        updateImageZoom();
    });
});

function updateImageZoom() {
    const mainImage = document.getElementById('mainImage');
    mainImage.style.transform = `scale(${window.appState.zoom})`;
}

// Tool panel management
function openToolPanel(toolName, category) {
    const panel = document.getElementById('toolPanel');
    const title = document.getElementById('toolTitle');
    const content = document.getElementById('toolContent');

    title.textContent = toolName;
    panel.classList.add('open');

    // Load tool interface
    loadToolInterface(toolName, category, content);
}

function closeToolPanel() {
    const panel = document.getElementById('toolPanel');
    panel.classList.remove('open');

    // Clear active tool
    document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
}

// Tool interface loader
async function loadToolInterface(toolName, category, container) {
    console.log(`[1] Loading tool: ${toolName}`);
    console.log(`[2] Container:`, container);

    container.innerHTML = `
        <div class="panel-loading">
            <i data-lucide="loader-2" class="spinner"></i>
            <p>Loading ${toolName}...</p>
        </div>
    `;
    console.log(`[3] Set loading HTML`);

    lucide.createIcons();
    console.log(`[4] Created icons`);

    // Map tools to their handlers
    const toolHandlers = {
        // General
        'Original Image': showOriginalImage,
        'File Digest': showFileDigest,
        'Hex Editor': showHexEditor,
        'Similar Search': showSimilarSearch,

        // Metadata
        'Header Structure': showHeaderStructure,
        'EXIF Full Dump': showExifDump,
        'Thumbnail Analysis': showThumbnailAnalysis,
        'Geolocation Data': showGeolocation,

        // Inspection
        'Enhancing Magnifier': showEnhancingMagnifier,
        'Channel Histogram': showChannelHistogram,
        'Global Adjustments': showGlobalAdjustments,
        'Reference Comparison': showReferenceComparison,
        'Contrast Enhancement': showContrastEnhancement,
        'Median Filtering': showMedianFilter,
        'Illuminant Map': showIlluminantMap,
        'Dead/Hot Pixels': showDeadHotPixels,
        'Stereogram Decoder': showStereogramDecoder,

        // Detail
        'Luminance Gradient': showLuminanceGradient,
        'Echo Edge Filter': showEchoEdge,
        'Wavelet Threshold': showWaveletThreshold,
        'Frequency Split': showFrequencySplit,

        // Colors
        'RGB/HSV Plots': showRGBPlots,
        'Space Conversion': showSpaceConversion,
        'PCA Projection': showPCAProjection,
        'Pixel Statistics': showPixelStatistics,

        // Noise
        'Signal Separation': showSignalSeparation,
        'Min/Max Deviation': showMinMaxDeviation,
        'Bit Plane Values': showBitPlane,
        'PRNU Identification': showPRNU,

        // JPEG
        'Quality Estimation': showJPEGQuality,
        'Error Level Analysis': showELA,
        'JPEG Ghost Map': showJPEGGhost,
        'Multiple Compression': showMultipleCompression,

        // Tampering
        'Copy-Move Forgery': showCopyMove,
        'Image Splicing': showSplicing,
        'Image Resampling': showResampling
    };

    console.log(`[5] Tool handlers defined, total: ${Object.keys(toolHandlers).length}`);
    console.log(`[6] Looking for handler: "${toolName}"`);

    const handler = toolHandlers[toolName];
    console.log(`[7] Handler found:`, !!handler);

    if (handler) {
        try {
            console.log(`[8] Calling handler for: ${toolName}`);
            await handler(container);
            console.log(`[9] Handler completed for: ${toolName}`);
        } catch (error) {
            console.error(`[ERROR] Error in handler for ${toolName}:`, error);
            container.innerHTML = `<p class="text-error">Error loading ${toolName}: ${error.message}</p>`;
        }
    } else {
        console.warn(`[WARN] No handler found for: ${toolName}`);
        console.log(`[DEBUG] Available handlers:`, Object.keys(toolHandlers));
        container.innerHTML = `<p>Tool "${toolName}" not yet implemented.</p>`;
    }
}

// ============================================================================
// TOOL IMPLEMENTATIONS
// ============================================================================

// General Tools
function showOriginalImage(container) {
    container.innerHTML = `
        <img src="${window.appState.currentImagePath}" class="result-image" alt="Original">
        <p class="text-muted">Original unmodified image</p>
    `;
}

async function showFileDigest(container) {
    try {
        const response = await fetch('/api/forensic/digest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();
        const hashes = data.file_hashes || {};

        container.innerHTML = `
            <h4>File Hashes</h4>
            <table class="result-table">
                <tr><th>Algorithm</th><th>Hash</th></tr>
                <tr><td>MD5</td><td style="font-family: monospace; font-size: 0.75rem; word-break: break-all;">${hashes.MD5 || 'N/A'}</td></tr>
                <tr><td>SHA1</td><td style="font-family: monospace; font-size: 0.75rem; word-break: break-all;">${hashes.SHA1 || 'N/A'}</td></tr>
                <tr><td>SHA256</td><td style="font-family: monospace; font-size: 0.75rem; word-break: break-all;">${hashes['SHA2-256'] || 'N/A'}</td></tr>
            </table>
            <p class="text-muted">Cryptographic hashes for file integrity verification</p>
        `;
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error loading digest: ${error.message}</p>`;
    }
}

async function showHexEditor(container) {
    // Initialize advanced hex editor
    window.hexEditor = new HexEditor(container, window.appState.currentImagePath);
}

async function showSimilarSearch(container) {
    container.innerHTML = `
        <h4>Similar Image Search</h4>
        <p class="text-muted">Find duplicate or similar images locally and on the internet</p>
        
        <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="display: block; margin-bottom: 0.5rem;">Search Mode:</label>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <label style="cursor: pointer;">
                    <input type="radio" name="searchMode" value="local" checked style="margin-right: 8px;">
                    Local Database Only
                </label>
                <label style="cursor: pointer;">
                    <input type="radio" name="searchMode" value="internet" style="margin-right: 8px;">
                    Internet Only
                </label>
                <label style="cursor: pointer;">
                    <input type="radio" name="searchMode" value="both" style="margin-right: 8px;">
                    Both (Local + Internet)
                </label>
            </div>
        </div>
        
        <button class="btn-primary" onclick="performSimilarSearch()">Search</button>
        <div id="searchResults" style="margin-top: 1rem;"></div>
    `;
}

async function performSimilarSearch() {
    const searchMode = document.querySelector('input[name="searchMode"]:checked').value;
    const resultsDiv = document.getElementById('searchResults');

    const searchText = searchMode === 'local' ? 'local database' :
        searchMode === 'internet' ? 'internet' :
            'local database and internet';
    resultsDiv.innerHTML = `<p class="text-muted">Searching ${searchText}...</p>`;

    try {
        const response = await fetch('/api/forensic/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                search_mode: searchMode
            })
        });

        const data = await response.json();

        let html = '';

        // Local results
        if (data.local_results && data.local_results.length > 0) {
            html += '<h4 style="margin-top: 1rem; border-bottom: 2px solid var(--accent-blue); padding-bottom: 4px;">Local Database Matches</h4>';
            html += `<p class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.5rem;">Found ${data.local_results.length} similar image(s)</p>`;

            data.local_results.forEach(r => {
                const similarityPercent = (r.similarity * 100).toFixed(1);
                const similarityColor = r.similarity > 0.95 ? '#00aa00' : r.similarity > 0.85 ? '#ff8800' : '#666666';

                html += `
                    <div style="margin-bottom: 1rem; padding: 0.5rem; background: var(--bg-tertiary); border-radius: 6px; border-left: 3px solid ${similarityColor};">
                        <img src="${r.thumbnailUrl}" style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem; cursor: pointer;" onclick="window.open('${r.thumbnailUrl}', '_blank')">
                        <table class="result-table" style="font-size: 0.7rem; margin: 0;">
`;
            });
        } else if (searchMode === 'local' || searchMode === 'both') {
            html += '<p class="text-muted">No similar images found in local database (>70% similarity threshold).</p>';
        }

        // Internet results
        if (data.internet_results && data.internet_results.length > 0) {
            html += '<h4 style="margin-top: 1.5rem; border-bottom: 2px solid var(--accent-blue); padding-bottom: 4px;">🌐 Internet Reverse Image Search</h4>';

            // Show thumbnail of the image being searched with download button
            html += `
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border-color);">
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; font-weight: 600;">Image to Search:</p>
                    <img src="${window.appState.currentImagePath}" style="max-width: 200px; max-height: 200px; border-radius: 4px; display: block; margin-bottom: 0.75rem; border: 2px solid var(--accent-blue);">
                    
                    <a href="${window.appState.currentImagePath}" download="${window.appState.currentImage}" class="btn-primary" style="display: inline-block; padding: 0.5rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                        📥 Download Image
                    </a>
                    
                    <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 4px; border-left: 3px solid #ff8800;">
                        <p style="margin: 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">
                            <strong style="color: var(--text-primary);"> Manual Upload Required:</strong><br>
                            1. Click "Download Image" button above to save the image<br>
                            2. Click a search engine link below<br>
                            3. Upload the downloaded image on that site<br>
                            4. View results showing where this image appears online
                        </p>
                    </div>
                </div>
            `;

            html += `<p class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.5rem; font-weight: 600;">Available Search Engines (${data.internet_results.length}):</p>`;

            data.internet_results.forEach(r => {
                const isLink = r.is_link || false;
                const iconMap = {
                    'Google': '🔍',
                    'Bing': '🔎',
                    'Tineye': '👁️',
                    'Yandex': '🔍'
                };
                const icon = iconMap[r.engine] || '🔗';

                if (isLink) {
                    // Manual upload link with enhanced styling
                    html += `
                        <div style="margin-bottom: 0.75rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px; border-left: 4px solid var(--accent-blue); transition: transform 0.2s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                            <a href="${r.url}" target="_blank" style="text-decoration: none; color: var(--accent-blue); font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <span style="font-size: 1.2rem;">${icon}</span>
                                <span>${r.title}</span>
                                <span style="margin-left: auto; font-size: 0.8rem;">→</span>
                            </a>
                            <p style="font-size: 0.7rem; color: var(--text-muted); margin: 0; padding-left: 28px;">${r.snippet}</p>
                        </div>
                    `;
                } else {
                    // Actual search result (if SerpAPI works)
                    html += `
                        <div style="margin-bottom: 1rem; padding: 0.5rem; background: var(--bg-tertiary); border-radius: 6px; border-left: 3px solid var(--accent-blue);">
                            ${r.thumbnail ? `<img src="${r.thumbnail}" style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">` : ''}
                            <h5 style="margin: 0 0 4px 0; font-size: 0.85rem;">
                                <a href="${r.url}" target="_blank" style="color: var(--accent-blue); text-decoration: none;">
                                    ${icon} ${r.title}
                                </a>
                            </h5>
                            <p style="font-size: 0.7rem; color: var(--text-success); margin: 2px 0;">
                                <strong>Source:</strong> ${r.source}
                            </p>
                            <p style="font-size: 0.7rem; color: var(--text-muted); margin: 0;">
                                ${r.snippet}
                            </p>
                        </div>
                    `;
                }
            });
        } else if (searchMode === 'internet' || searchMode === 'both') {
            html += '<p class="text-muted">No internet results found.</p>';
        }

        if (data.error) {
            html += `<p class="text-error" style="margin-top: 1rem;">Error: ${data.error}</p>`;
        }

        resultsDiv.innerHTML = html || '<p>No results found.</p>';

    } catch (error) {
        resultsDiv.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

// Metadata Tools
async function showHeaderStructure(container) {
    try {
        const response = await fetch(`/api/forensic/metadata/header?path=${encodeURIComponent(window.appState.currentImagePath)}`);
        const data = await response.json();

        container.innerHTML = `
            <h4>File Header</h4>
            <pre style="background: var(--bg-tertiary); padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.75rem; font-family: monospace;">${data.hex || 'No header data'}</pre>
        `;
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showExifDump(container) {
    try {
        const response = await fetch(`/api/forensic/metadata/exif?path=${encodeURIComponent(window.appState.currentImagePath)}`);
        const data = await response.json();

        if (data && Object.keys(data).length > 0) {
            const rows = Object.entries(data).map(([key, value]) =>
                `<tr><td>${key}</td><td>${value}</td></tr>`
            ).join('');

            container.innerHTML = `
                <h4>EXIF Metadata</h4>
                <table class="result-table">
                    <tr><th>Tag</th><th>Value</th></tr>
                    ${rows}
                </table>
            `;
        } else {
            container.innerHTML = `<p>No EXIF data found.</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showThumbnailAnalysis(container) {
    try {
        const response = await fetch(`/api/forensic/metadata/thumbnail?path=${encodeURIComponent(window.appState.currentImagePath)}`);
        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Embedded Thumbnail</h4>
                <img src="${data.result_url}" class="result-image" alt="Thumbnail">
            `;
        } else {
            container.innerHTML = `<p>No embedded thumbnail found.</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p>No thumbnail available.</p>`;
    }
}

async function showGeolocation(container) {
    try {
        const response = await fetch(`/api/forensic/metadata/gps?path=${encodeURIComponent(window.appState.currentImagePath)}`);
        const data = await response.json();

        if (data.latitude && data.longitude) {
            container.innerHTML = `
                <h4>GPS Coordinates</h4>
                <table class="result-table">
                    <tr><td>Latitude</td><td>${data.latitude}</td></tr>
                    <tr><td>Longitude</td><td>${data.longitude}</td></tr>
                </table>
                <a href="https://www.google.com/maps?q=${data.latitude},${data.longitude}" target="_blank" class="btn-primary" style="display: inline-block; margin-top: 1rem;">View on Map</a>
            `;
        } else {
            container.innerHTML = `<p>No GPS data found.</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p>No GPS data available.</p>`;
    }
}

// Inspection Tools
function showEnhancingMagnifier(container) {
    container.innerHTML = `
        <h4>Enhancing Magnifier</h4>
        <p class="text-muted">Click and drag on the main image to select a region to magnify.</p>
        <div class="form-group">
            <label class="form-label">Zoom Level</label>
            <input type="range" class="form-range" min="1" max="5" step="0.5" value="2" id="magnifierZoom">
            <span id="zoomValue">2x</span>
        </div>
        <button class="btn-primary" onclick="applyMagnifier()">Apply</button>
    `;
}

async function showChannelHistogram(container) {
    try {
        const response = await fetch('/api/forensic/histogram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        container.innerHTML = `
            <h4>Channel Histogram</h4>
            <canvas id="histogramChart" style="width: 100%; height: 300px;"></canvas>
        `;

        // Render histogram using Chart.js
        renderHistogram(data);
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

function showGlobalAdjustments(container) {
    container.innerHTML = `
        <h4>Global Adjustments</h4>
        <div class="form-group">
            <label class="form-label">Brightness: <span id="brightnessValue">0</span></label>
            <input type="range" class="form-range" min="-100" max="100" value="0" id="brightness">
        </div>
        <div class="form-group">
            <label class="form-label">Contrast: <span id="contrastValue">1.0</span></label>
            <input type="range" class="form-range" min="0.5" max="2.0" step="0.1" value="1.0" id="contrast">
        </div>
        <div class="form-group">
            <label class="form-label">Gamma: <span id="gammaValue">1.0</span></label>
            <input type="range" class="form-range" min="0.5" max="2.0" step="0.1" value="1.0" id="gamma">
        </div>
        <button class="btn-primary" onclick="applyAdjustments()">Apply</button>
        <div id="adjustmentResult" style="margin-top: 1rem;"></div>
    `;

    // Update value displays
    ['brightness', 'contrast', 'gamma'].forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            document.getElementById(`${id}Value`).textContent = e.target.value;
        });
    });
}

function showReferenceComparison(container) {
    container.innerHTML = `
        <h4>Reference Comparison</h4>
        <p class="text-muted">Upload a reference image to compare.</p>
        <input type="file" id="refImageInput" accept="image/*" class="form-input">
        <button class="btn-primary" style="margin-top: 1rem;" onclick="compareWithReference()">Compare</button>
        <div id="comparisonResult" style="margin-top: 1rem;"></div>
    `;
}

async function showContrastEnhancement(container) {
    container.innerHTML = `
        <h4>Contrast Enhancement</h4>
        <div class="form-group">
            <label class="form-label">Method</label>
            <select class="form-select" id="contrastMethod">
                <option value="clahe">CLAHE</option>
                <option value="histogram">Histogram Equalization</option>
            </select>
        </div>
        <button class="btn-primary" onclick="applyContrastEnhancement()">Apply</button>
        <div id="contrastResult" style="margin-top: 1rem;"></div>
    `;
}

// Detail Tools
async function showLuminanceGradient(container) {
    try {
        const response = await fetch('/api/forensic/detail/luminance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Luminance Gradient</h4>
                <img src="${data.result_url}" class="result-image" alt="Luminance Gradient">
                <p class="text-muted">Gradient magnitude visualization for lighting consistency analysis</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showEchoEdge(container) {
    try {
        const response = await fetch('/api/forensic/filter/echo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Echo Edge Filter</h4>
                <img src="${data.result_url}" class="result-image" alt="Echo Edge">
                <p class="text-muted">High-frequency edge detection</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showWaveletThreshold(container) {
    try {
        const response = await fetch('/api/forensic/wavelet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                params: { wavelet: 'db1' }
            })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Wavelet Analysis</h4>
                <img src="${data.result_url}" class="result-image" alt="Wavelet">
                <p class="text-muted">2D Discrete Wavelet Transform decomposition</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showFrequencySplit(container) {
    try {
        const response = await fetch('/api/forensic/detail/frequency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Frequency Domain Analysis</h4>
                <img src="${data.result_url}" class="result-image" alt="FFT">
                <p class="text-muted">FFT magnitude spectrum</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

// Continue in next file...

// ============================================================================
// VARIOUS TOOLS
// ============================================================================

async function showMedianFilter(container) {
    container.innerHTML = `
        <h4>Median Filtering</h4>
        <p class="text-muted">Apply median filter for noise reduction</p>
        <div class="form-group">
            <label class="form-label">Kernel Size:</label>
            <select id="kernelSize" class="form-control">
                <option value="3">3x3</option>
                <option value="5" selected>5x5</option>
                <option value="7">7x7</option>
                <option value="9">9x9</option>
                <option value="11">11x11</option>
            </select>
        </div>
        <button class="btn-primary" onclick="applyMedianFilter()">Apply Filter</button>
        <div id="medianResult" style="margin-top: 1rem;"></div>
    `;
}

async function applyMedianFilter() {
    const kernelSize = parseInt(document.getElementById('kernelSize').value);
    const resultDiv = document.getElementById('medianResult');

    resultDiv.innerHTML = '<p class="text-muted">Processing...</p>';

    try {
        const response = await fetch('/api/forensic/various/median-filter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                kernel_size: kernelSize
            })
        });

        const data = await response.json();

        if (data.result_url) {
            resultDiv.innerHTML = `<img src="${data.result_url}" style="width: 100%; border-radius: 4px;">`;
        } else {
            resultDiv.innerHTML = `<p class="text-error">Error: ${data.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showIlluminantMap(container) {
    container.innerHTML = `
        <h4>Illuminant Map</h4>
        <p class="text-muted">Estimate light source and illumination</p>
        <button class="btn-primary" onclick="computeIlluminant()">Analyze Illumination</button>
        <div id="illuminantResult" style="margin-top: 1rem;"></div>
    `;
}

async function computeIlluminant() {
    const resultDiv = document.getElementById('illuminantResult');

    resultDiv.innerHTML = '<p class="text-muted">Analyzing illumination...</p>';

    try {
        const response = await fetch('/api/forensic/various/illuminant-map', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath
            })
        });

        const data = await response.json();

        if (data.result_url) {
            resultDiv.innerHTML = `<img src="${data.result_url}" style="width: 100%; border-radius: 4px;">`;
        } else {
            resultDiv.innerHTML = `<p class="text-error">Error: ${data.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showDeadHotPixels(container) {
    container.innerHTML = `
        <h4>Dead/Hot Pixels Detection</h4>
        <p class="text-muted">Detect camera sensor defects</p>
        <div class="form-group">
            <label class="form-label">Sensitivity Threshold:</label>
            <input type="range" id="pixelThreshold" min="10" max="100" value="50" step="5" class="form-control">
            <span id="thresholdValue">50</span>
        </div>
        <button class="btn-primary" onclick="detectDefectPixels()">Detect Pixels</button>
        <div id="pixelResult" style="margin-top: 1rem;"></div>
    `;

    document.getElementById('pixelThreshold').addEventListener('input', (e) => {
        document.getElementById('thresholdValue').textContent = e.target.value;
    });
}

async function detectDefectPixels() {
    const threshold = parseFloat(document.getElementById('pixelThreshold').value);
    const resultDiv = document.getElementById('pixelResult');

    resultDiv.innerHTML = '<p class="text-muted">Detecting defective pixels...</p>';

    try {
        const response = await fetch('/api/forensic/various/dead-hot-pixels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                threshold: threshold
            })
        });

        const data = await response.json();

        if (data.result_url) {
            let html = `<img src="${data.result_url}" style="width: 100%; border-radius: 4px; margin-bottom: 1rem;">`;

            if (data.stats) {
                html += `
                    <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 4px;">
                        <h5 style="margin: 0 0 0.5rem 0;">Detection Statistics:</h5>
                        <table class="result-table" style="font-size: 0.8rem;">
                            <tr><td><strong>Dead Pixels (Blue)</strong></td><td>${data.stats.dead_pixels} (${data.stats.dead_percentage.toFixed(4)}%)</td></tr>
                            <tr><td><strong>Hot Pixels (Red)</strong></td><td>${data.stats.hot_pixels} (${data.stats.hot_percentage.toFixed(4)}%)</td></tr>
                            <tr><td><strong>Total Pixels</strong></td><td>${data.stats.total_pixels.toLocaleString()}</td></tr>
                        </table>
                    </div>
                `;
            }

            resultDiv.innerHTML = html;
        } else {
            resultDiv.innerHTML = `<p class="text-error">Error: ${data.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showStereogramDecoder(container) {
    container.innerHTML = `
        <h4>Stereogram Decoder</h4>
        <p class="text-muted">Extract hidden 3D image from autostereogram</p>
        <button class="btn-primary" onclick="decodeStereogram()">Decode Stereogram</button>
        <div id="stereogramResult" style="margin-top: 1rem;"></div>
    `;
}

async function decodeStereogram() {
    const resultDiv = document.getElementById('stereogramResult');

    resultDiv.innerHTML = '<p class="text-muted">Decoding stereogram...</p>';

    try {
        const response = await fetch('/api/forensic/various/stereogram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath
            })
        });

        const data = await response.json();

        if (data.result_url) {
            resultDiv.innerHTML = `<img src="${data.result_url}" style="width: 100%; border-radius: 4px;">`;
        } else {
            resultDiv.innerHTML = `<p class="text-error">Error: ${data.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}
