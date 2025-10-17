// js/utils/helpers.js
class Helpers {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    static showToast(message, type = 'success', duration = 5000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠';
        toast.innerHTML = `
            <span class="toast__icon">${icon}</span>
            <span class="toast__message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    static showLoading() {
        document.getElementById('loading-spinner').classList.remove('d-none');
    }

    static hideLoading() {
        document.getElementById('loading-spinner').classList.add('d-none');
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^\+?[\d\s-()]{10,}$/;
        return re.test(phone);
    }

    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    static getLevelLabel(level) {
        const levels = {
            100: '100 Level',
            200: '200 Level',
            300: '300 Level',
            400: '400 Level',
            500: '500 Level'
        };
        return levels[level] || `${level} Level`;
    }

    static getCategoryLabel(category) {
        const categories = {
            general: 'General',
            exam: 'Exam',
            registration: 'Registration',
            security: 'Security',
            event: 'Event'
        };
        return categories[category] || category;
    }
}