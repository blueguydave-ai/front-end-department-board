// js/auth.js
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            api.setToken(token);
        }
    }

    async login(credentials) {
        try {
            const response = await api.login(credentials);
            
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            api.setToken(response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            
            Helpers.showToast('Login successful!', 'success');
            return { success: true, user: response.user };
        } catch (error) {
            Helpers.showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    async signup(userData) {
        try {
            const response = await api.signup(userData);
            
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            api.setToken(response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            
            Helpers.showToast('Registration successful!', 'success');
            return { success: true, user: response.user };
        } catch (error) {
            Helpers.showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        api.removeToken();
        localStorage.removeItem('userData');
        
        Helpers.showToast('Logged out successfully', 'success');
        window.location.href = '/';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    updateUserProfile(updatedUser) {
        this.currentUser = { ...this.currentUser, ...updatedUser };
        localStorage.setItem('userData', JSON.stringify(this.currentUser));
    }
}

// Create global AuthManager instance
const authManager = new AuthManager();