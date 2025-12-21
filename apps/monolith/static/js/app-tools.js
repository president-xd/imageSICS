// ============================================================================
// REMAINING TOOL IMPLEMENTATIONS (Colors, Noise, JPEG, Tampering)
// ============================================================================

// Colors Tools
async function showRGBPlots(container) {
    try {
        const response = await fetch('/api/forensic/plots/rgb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>RGB/HSV Scatter Plots</h4>
                <img src="${data.result_url}" class="result-image" alt="RGB Plots">
                <p class="text-muted">3D scatter plot visualization of color distribution</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showSpaceConversion(container) {
    try {
        const response = await fetch('/api/forensic/colors/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_path: window.appState.currentImagePath,
                params: { space: 'hsv' }
            })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Color Space Conversion</h4>
                <img src="${data.result_url}" class="result-image" alt="Color Space">
                <p class="text-muted">HSV color space representation</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showPCAProjection(container) {
    try {
        const response = await fetch('/api/forensic/transform/pca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>PCA Projection</h4>
                <img src="${data.result_url}" class="result-image" alt="PCA">
                <p class="text-muted">Principal Component Analysis projection</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showPixelStatistics(container) {
    try {
        const response = await fetch('/api/forensic/analysis/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.stats) {
            let rows = '';
            for (const [channel, values] of Object.entries(data.stats)) {
                rows += `<tr><td colspan="2" style="background: var(--bg-tertiary); font-weight: 600;">${channel} Channel</td></tr>`;
                for (const [key, value] of Object.entries(values)) {
                    const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
                    rows += `<tr><td>${key}</td><td>${displayValue}</td></tr>`;
                }
            }

            container.innerHTML = `
                <h4>Pixel Statistics</h4>
                <table class="result-table">
                    <tr><th>Metric</th><th>Value</th></tr>
                    ${rows}
                </table>
                <p class="text-muted">Statistical analysis of pixel values per color channel</p>
            `;
        } else if (data.error) {
            container.innerHTML = `<p class="text-error">Error: ${data.error}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

// Noise Tools
async function showSignalSeparation(container) {
    try {
        const response = await fetch('/api/forensic/noise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Signal Separation</h4>
                <img src="${data.result_url}" class="result-image" alt="Noise">
                <p class="text-muted">Noise pattern extraction</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showMinMaxDeviation(container) {
    try {
        const response = await fetch('/api/forensic/analysis/minmax', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Min/Max Deviation</h4>
                <img src="${data.result_url}" class="result-image" alt="MinMax">
                <p class="text-muted">Local extrema analysis</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showBitPlane(container) {
    try {
        const response = await fetch('/api/forensic/noise/bitplane', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Bit Plane Analysis</h4>
                <img src="${data.result_url}" class="result-image" alt="Bit Planes">
                <p class="text-muted">LSB visualization</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showPRNU(container) {
    try {
        const response = await fetch('/api/forensic/noise/prnu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>PRNU Identification</h4>
                <img src="${data.result_url}" class="result-image" alt="PRNU">
                <p class="text-muted">Photo Response Non-Uniformity pattern</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

// JPEG Tools
async function showJPEGQuality(container) {
    try {
        const response = await fetch('/api/forensic/jpeg/quality', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>JPEG Quality Estimation</h4>
                <img src="${data.result_url}" class="result-image" alt="Quality Plot">
                <p class="text-muted">Quality vs Error curve - local minima indicate compression quality</p>
            `;
        } else if (data.quality) {
            container.innerHTML = `
                <h4>JPEG Quality Estimation</h4>
                <p>Estimated Quality: <strong>${data.quality}</strong></p>
                <p class="text-muted">Based on quantization table analysis</p>
            `;
        } else if (data.error) {
            container.innerHTML = `<p class="text-error">Error: ${data.error}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showELA(container) {
    try {
        const response = await fetch('/api/forensic/ela', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Error Level Analysis</h4>
                <img src="${data.result_url}" class="result-image" alt="ELA">
                <p class="text-muted">Compression artifact detection</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showJPEGGhost(container) {
    try {
        const response = await fetch('/api/forensic/jpeg/ghost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>JPEG Ghost Maps</h4>
                <img src="${data.result_url}" class="result-image" alt="Ghost">
                <p class="text-muted">Multiple compression detection</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showMultipleCompression(container) {
    try {
        const response = await fetch('/api/forensic/jpeg/compression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Multiple Compression Detection</h4>
                <img src="${data.result_url}" class="result-image" alt="Compression Analysis">
                <p class="text-muted">Error levels across different JPEG quality settings</p>
            `;
        } else if (data.error) {
            container.innerHTML = `<p class="text-error">Error: ${data.error}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

// Tampering Tools
async function showCopyMove(container) {
    try {
        const response = await fetch('/api/forensic/tampering/copymove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Copy-Move Forgery Detection</h4>
                <img src="${data.result_url}" class="result-image" alt="Copy-Move">
                <p class="text-muted">Cloned region identification</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showSplicing(container) {
    try {
        const response = await fetch('/api/forensic/tampering/splicing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Image Splicing Detection</h4>
                <img src="${data.result_url}" class="result-image" alt="Splicing">
                <p class="text-muted">Composite image analysis</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}

async function showResampling(container) {
    try {
        const response = await fetch('/api/forensic/tampering/resampling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: window.appState.currentImagePath })
        });

        const data = await response.json();

        if (data.result_url) {
            container.innerHTML = `
                <h4>Image Resampling Detection</h4>
                <img src="${data.result_url}" class="result-image" alt="Resampling">
                <p class="text-muted">Scaling artifact detection</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
    }
}
