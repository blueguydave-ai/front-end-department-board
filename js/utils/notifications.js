// Notification system
class NotificationSystem {
    static show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    }

    static getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    static success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    static warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    static clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Add notification styles to the existing CSS
const addNotificationStyles = () => {
    const styles = `
        .notification {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--base-color);
            border-radius: var(--radius);
            padding: var(--space-md);
            margin-bottom: var(--space-sm);
            box-shadow: var(--shadow-lg);
            border-left: 4px solid var(--accent-color);
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        }

        .notification.success {
            border-left-color: var(--success-color);
        }

        .notification.error {
            border-left-color: var(--error-color);
        }

        .notification.warning {
            border-left-color: var(--warning-color);
        }

        .notification.info {
            border-left-color: var(--info-color);
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            flex: 1;
        }

        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: var(--space-xs);
            color: var(--text-light);
            border-radius: var(--radius-sm);
            transition: background var(--transition-fast);
        }

        .notification-close:hover {
            background: var(--border-light);
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

    // Add styles to document if not already present
    if (!document.getElementById('notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
};

// Initialize notification styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addNotificationStyles);