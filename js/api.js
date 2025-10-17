// js/api.js
class API {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Authentication endpoints
    async signup(userData) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    // Student endpoints
    async getStudentProfile() {
        return this.request('/students/profile');
    }

    async updateStudentProfile(profileData) {
        return this.request('/students/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async uploadProfilePicture(formData) {
        return this.request('/students/profile/picture', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    async getStudentResults() {
        return this.request('/students/results');
    }

    async archiveAnnouncement(announcementId) {
        return this.request(`/students/archives/${announcementId}`, {
            method: 'POST'
        });
    }

    async getArchivedItems() {
        return this.request('/students/archives');
    }

    async removeFromArchive(archiveId) {
        return this.request(`/students/archives/${archiveId}`, {
            method: 'DELETE'
        });
    }

    // Announcements endpoints
    async getAnnouncements(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/announcements?${queryString}` : '/announcements';
        return this.request(endpoint);
    }

    async getFeaturedAnnouncements() {
        return this.request('/announcements/featured');
    }

    async getAnnouncement(id) {
        return this.request(`/announcements/${id}`);
    }

    // Timetable endpoints
    async getTimetable(level) {
        return this.request(`/admin/timetables/${level}`);
    }

    // Admin endpoints (for future implementation)
    async createAnnouncement(announcementData) {
        return this.request('/admin/announcements', {
            method: 'POST',
            body: JSON.stringify(announcementData)
        });
    }

    async updateAnnouncement(id, announcementData) {
        return this.request(`/admin/announcements/${id}`, {
            method: 'PUT',
            body: JSON.stringify(announcementData)
        });
    }

    async deleteAnnouncement(id) {
        return this.request(`/admin/announcements/${id}`, {
            method: 'DELETE'
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Create global API instance
const api = new API();