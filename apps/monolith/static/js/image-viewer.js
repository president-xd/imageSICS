// ============================================================================
// IMAGE-VIEWER.JS - Advanced Image Viewer Controls
// ============================================================================

class ImageViewer {
    constructor(canvasId, imageId) {
        this.canvas = document.getElementById(canvasId);
        this.image = document.getElementById(imageId);
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;

        this.initializeEvents();
    }

    initializeEvents() {
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            window.appState.zoom = Math.max(0.1, Math.min(5, window.appState.zoom * delta));
            this.updateTransform();
        });

        // Pan with mouse drag
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.isPanning = true;
                this.startX = e.clientX - this.translateX;
                this.startY = e.clientY - this.translateY;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.translateX = e.clientX - this.startX;
                this.translateY = e.clientY - this.startY;
                this.updateTransform();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
        });
    }

    updateTransform() {
        this.image.style.transform = `
            translate(${this.translateX}px, ${this.translateY}px) 
            scale(${window.appState.zoom})
        `;
    }

    reset() {
        window.appState.zoom = 1.0;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }
}

// Initialize viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageViewer = new ImageViewer('viewerCanvas', 'mainImage');
});
