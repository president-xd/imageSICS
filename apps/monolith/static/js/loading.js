/**
 * Loading States and Skeleton Screens
 * Provides visual feedback during async operations
 */

// Show loading spinner
function showLoading(container, message = 'Loading...') {
    container.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

// Show skeleton loader
function showSkeleton(container, lines = 3) {
    const skeletonLines = Array(lines).fill(0).map((_, i) =>
        `<div class="skeleton-line ${i === lines - 1 ? 'short' : ''}"></div>`
    ).join('');

    container.innerHTML = `
        <div class="loading-skeleton">
            ${skeletonLines}
        </div>
    `;
}

// Show progress bar
function showProgress(container, progress = 0, message = '') {
    container.innerHTML = `
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            ${message ? `<p class="progress-message">${message}</p>` : ''}
        </div>
    `;
}

// Update progress
function updateProgress(container, progress, message = '') {
    const fill = container.querySelector('.progress-fill');
    const msg = container.querySelector('.progress-message');

    if (fill) {
        fill.style.width = `${progress}%`;
    }

    if (msg && message) {
        msg.textContent = message;
    }
}

// Show empty state
function showEmptyState(container, message = 'No data available', icon = '📭') {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">${icon}</div>
            <p class="empty-message">${message}</p>
        </div>
    `;
}

// Show error state
function showErrorState(container, message = 'An error occurred', details = '') {
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon"></div>
            <p class="error-message">${message}</p>
            ${details ? `<p class="error-details">${details}</p>` : ''}
        </div>
    `;
}

// Add ripple effect to element
function addRipple(element, event) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple to all buttons
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button, .btn, .tool-item');
        if (button && !button.classList.contains('no-ripple')) {
            addRipple(button, e);
        }
    });
});

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
/* Progress Bar */
.progress-container {
    padding: 20px;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;
}

.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
    );
    animation: shimmer 2s infinite;
}

.progress-message {
    margin-top: 12px;
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-message {
    color: var(--text-muted);
    font-size: 16px;
    max-width: 400px;
}

/* Error State */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.error-message {
    color: #ef4444;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
}

.error-details {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 500px;
    font-family: monospace;
    background: rgba(239, 68, 68, 0.1);
    padding: 12px;
    border-radius: 4px;
    margin-top: 12px;
}

/* Ripple Effect */
.ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
}

button, .btn, .tool-item {
    position: relative;
    overflow: hidden;
}
`;

document.head.appendChild(style);

// Export functions
window.showLoading = showLoading;
window.showSkeleton = showSkeleton;
window.showProgress = showProgress;
window.updateProgress = updateProgress;
window.showEmptyState = showEmptyState;
window.showErrorState = showErrorState;
window.addRipple = addRipple;
