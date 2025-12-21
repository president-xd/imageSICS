// ============================================================================
// CHARTS.JS - Chart Rendering with Chart.js
// ============================================================================

function renderHistogram(data) {
    const ctx = document.getElementById('histogramChart');
    if (!ctx) return;

    // Prepare data for Chart.js
    const labels = Array.from({ length: 256 }, (_, i) => i);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Red',
                    data: data.red || [],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true
                },
                {
                    label: 'Green',
                    data: data.green || [],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true
                },
                {
                    label: 'Blue',
                    data: data.blue || [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true
                },
                {
                    label: 'Luminance',
                    data: data.luminance || [],
                    borderColor: 'rgb(148, 163, 184)',
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#cbd5e1',
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Pixel Value',
                        color: '#94a3b8'
                    },
                    ticks: {
                        color: '#64748b',
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: '#1e293b'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Frequency',
                        color: '#94a3b8'
                    },
                    ticks: {
                        color: '#64748b'
                    },
                    grid: {
                        color: '#1e293b'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function renderCompressionChart(qualities, errors) {
    const ctx = document.getElementById('compressionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: qualities,
            datasets: [{
                label: 'Compression Error',
                data: errors,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Error: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'JPEG Quality',
                        color: '#94a3b8'
                    },
                    ticks: {
                        color: '#64748b'
                    },
                    grid: {
                        color: '#1e293b'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Mean Absolute Error',
                        color: '#94a3b8'
                    },
                    ticks: {
                        color: '#64748b'
                    },
                    grid: {
                        color: '#1e293b'
                    }
                }
            }
        }
    });
}
