// ============================================================================
// INTERACTIVE TOOLS - Missing JavaScript Functions
// ============================================================================

// Enhancing Magnifier - Apply magnification to selected region
async function applyMagnifier() {
    const zoom = parseFloat(document.getElementById('magnifierZoom').value);
    const resultDiv = document.getElementById('toolContent');

    try {
        // For now, apply magnification to center region
        // TODO: Add canvas overlay for ROI selection
        const response = await fetch('/api/forensic/inspection/magnifier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                params: {
                    x: 200,
                    y: 150,
                    width: 200,
                    height: 200,
                    zoom: zoom
                }
            })
        });

        const data = await response.json();

        if (data.result_url) {
            const currentContent = resultDiv.innerHTML;
            resultDiv.innerHTML = currentContent + `
                <h4 style="margin-top: 1rem;">Magnified Result (${zoom}x)</h4>
                <img src="${data.result_url}" class="result-image" alt="Magnified">
                <p class="text-muted">Center region magnified at ${zoom}x zoom</p>
            `;
        } else if (data.error) {
            showToast('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Failed to apply magnifier: ' + error.message, 'error');
    }
}

// Global Adjustments - Apply brightness/contrast/gamma adjustments
async function applyAdjustments() {
    const brightness = parseFloat(document.getElementById('brightness').value);
    const contrast = parseFloat(document.getElementById('contrast').value);
    const gamma = parseFloat(document.getElementById('gamma').value);
    const resultDiv = document.getElementById('adjustmentResult');

    resultDiv.innerHTML = '<p class="text-muted">Processing...</p>';

    try {
        const response = await fetch('/api/forensic/filter/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                params: {
                    brightness: brightness,
                    contrast: contrast,
                    gamma: gamma
                }
            })
        });

        const data = await response.json();

        if (data.result_url) {
            resultDiv.innerHTML = `
                <h4>Adjusted Image</h4>
                <img src="${data.result_url}" class="result-image" alt="Adjusted">
                <p class="text-muted">Brightness: ${brightness}, Contrast: ${contrast}, Gamma: ${gamma}</p>
            `;
            showToast('Adjustments applied successfully', 'success');
        } else if (data.error) {
            resultDiv.innerHTML = `<p class="text-error">Error: ${data.error}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-error">Failed to apply adjustments: ${error.message}</p>`;
    }
}

// Reference Comparison - Upload and compare with reference image
async function compareWithReference() {
    const fileInput = document.getElementById('refImageInput');
    const resultDiv = document.getElementById('comparisonResult');

    if (!fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a reference image first', 'warning');
        return;
    }

    resultDiv.innerHTML = '<p class="text-muted">Uploading reference image...</p>';

    try {
        // First, upload the reference image
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        const uploadResponse = await fetch('/api/uploads/', {
            method: 'POST',
            body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.path) {
            throw new Error('Failed to upload reference image');
        }

        resultDiv.innerHTML = '<p class="text-muted">Comparing images...</p>';

        // Now compare the images
        const compareResponse = await fetch('/api/forensic/inspection/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                reference_path: uploadData.path
            })
        });

        const compareData = await compareResponse.json();

        if (compareData.error) {
            resultDiv.innerHTML = `<p class="text-error">Error: ${compareData.error}</p>`;
            return;
        }

        // Display comparison results
        let html = '<h4>Comparison Results</h4>';
        html += '<table class="result-table">';

        if (compareData.ssim !== undefined) {
            html += `<tr><td>SSIM (Structural Similarity)</td><td>${compareData.ssim.toFixed(4)}</td></tr>`;
        }
        if (compareData.psnr !== undefined) {
            html += `<tr><td>PSNR (Peak Signal-to-Noise Ratio)</td><td>${compareData.psnr.toFixed(2)} dB</td></tr>`;
        }
        if (compareData.mse !== undefined) {
            html += `<tr><td>MSE (Mean Squared Error)</td><td>${compareData.mse.toFixed(2)}</td></tr>`;
        }

        html += '</table>';

        if (compareData.difference_url) {
            html += `
                <h4 style="margin-top: 1rem;">Difference Map</h4>
                <img src="${compareData.difference_url}" class="result-image" alt="Difference">
            `;
        }

        resultDiv.innerHTML = html;
        showToast('Comparison completed', 'success');

    } catch (error) {
        resultDiv.innerHTML = `<p class="text-error">Failed to compare images: ${error.message}</p>`;
    }
}

// Contrast Enhancement - Apply CLAHE or histogram equalization
async function applyContrastEnhancement() {
    const method = document.getElementById('contrastMethod').value;
    const resultDiv = document.getElementById('contrastResult');

    resultDiv.innerHTML = '<p class="text-muted">Processing...</p>';

    try {
        const response = await fetch('/api/forensic/filter/contrast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                params: {
                    method: method
                }
            })
        });

        const data = await response.json();

        if (data.result_url) {
            resultDiv.innerHTML = `
                <h4>Enhanced Image</h4>
                <img src="${data.result_url}" class="result-image" alt="Enhanced">
                <p class="text-muted">Method: ${method === 'clahe' ? 'CLAHE' : 'Histogram Equalization'}</p>
            `;
            showToast('Contrast enhancement applied', 'success');
        } else if (data.error) {
            resultDiv.innerHTML = `<p class="text-error">Error: ${data.error}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-error">Failed to enhance contrast: ${error.message}</p>`;
    }
}
