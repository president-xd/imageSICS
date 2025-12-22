/**
 * Toast Notification System
 * Displays temporary notifications with animations
 */

class ToastManager {
    constructor() {
        this.container = this.createContainer();
        this.toasts = [];
    }

    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Add icon based on type
        const icon = this.getIcon(type);

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, duration);
        }

        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    clear() {
        this.toasts.forEach(toast => this.hide(toast));
    }
}

// Create global instance
window.toastManager = new ToastManager();

// Convenience function
window.showToast = function (message, type = 'info', duration = 3000) {
    return window.toastManager.show(message, type, duration);
};

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
}

.toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
    min-width: 300px;
    max-width: 500px;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: all;
    backdrop-filter: blur(10px);
}

.toast.show {
    transform: translateX(0);
    opacity: 1;
}

.toast.hide {
    transform: translateX(400px);
    opacity: 0;
}

.toast-icon {
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.toast-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
}

.toast-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
    flex-shrink: 0;
}

.toast-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

.toast-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.toast-success .toast-icon {
    background: rgba(255, 255, 255, 0.2);
}

.toast-error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.toast-error .toast-icon {
    background: rgba(255, 255, 255, 0.2);
}

.toast-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.toast-warning .toast-icon {
    background: rgba(255, 255, 255, 0.2);
}

.toast-info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.toast-info .toast-icon {
    background: rgba(255, 255, 255, 0.2);
}

/* Animation for stacking */
.toast:not(:last-child) {
    margin-bottom: 0;
}

/* Hover effect */
.toast:hover {
    transform: translateX(-4px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15);
}
`;

document.head.appendChild(style);
