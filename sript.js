const API_BASE_URL = 'http://localhost:5000/api';

// State Management
let currentUser = null;
let token = localStorage.getItem('token');

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboard = document.getElementById('dashboard');
const loading = document.getElementById('loading');
const notification = document.getElementById('notification');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

// Authentication Functions
async function checkAuthStatus() {
    if (token) {
        try {
            showLoading();
            const user = await getCurrentUser();
            currentUser = user;
            showDashboard();
            loadAnnouncements();
        } catch (error) {
            localStorage.removeItem('token');
            token = null;
            showAuth();
        } finally {
            hideLoading();
        }
    } else {
        showAuth();
    }
}

async function getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Not authenticated');
    }

    return await response.json();
}

// Auth UI Functions
function showAuth() {
    authSection.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashboard.classList.remove('hidden');
    updateProfileDisplay();
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tabName === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('signup-form').classList.add('active');
    }
}

// Event Listeners
function setupEventListeners() {
    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // Navigation
    document.getElementById('announcements-btn').addEventListener('click', () => switchSection('announcements'));
    document.getElementById('profile-btn').addEventListener('click', () => switchSection('profile'));
    document.getElementById('results-btn').addEventListener('click', () => switchSection('results'));
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Profile
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('change-picture-btn').addEventListener('click', handlePictureChange);
    
    // Announcements
    document.getElementById('search-announcements').addEventListener('input', filterAnnouncements);
    document.getElementById('filter-category').addEventListener('change', filterAnnouncements);
}

// API Functions
async function handleLogin(e) {
    e.preventDefault();
    showLoading();

    const formData = new FormData(e.target);
    const credentials = {
        matricNumber: formData.get('matricNumber'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            showDashboard();
            loadAnnouncements();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    showLoading();

    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        matricNumber: formData.get('matricNumber'),
        level: parseInt(formData.get('level')),
        department: formData.get('department'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            switchTab('login');
            e.target.reset();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function loadAnnouncements() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/announcements`);
        const announcements = await response.json();

        if (response.ok) {
            displayAnnouncements(announcements);
        } else {
            showNotification('Failed to load announcements', 'error');
        }
    } catch (error) {
        showNotification('Network error loading announcements', 'error');
    } finally {
        hideLoading();
    }
}

function displayAnnouncements(announcements) {
    const container = document.getElementById('announcements-list');
    
    if (announcements.length === 0) {
        container.innerHTML = '<div class="no-data">No announcements found.</div>';
        return;
    }

    container.innerHTML = announcements.map(announcement => `
        <div class="announcement-card ${announcement.isFeatured ? 'featured' : ''} ${announcement.isUrgent ? 'urgent' : ''}">
            <div class="announcement-header">
                <h3 class="announcement-title">${announcement.title}</h3>
                <span class="announcement-category">${announcement.category}</span>
            </div>
            <div class="announcement-meta">
                <span><i class="far fa-calendar"></i> ${new Date(announcement.createdAt).toLocaleDateString()}</span>
                <span><i class="far fa-user"></i> ${announcement.author.name}</span>
            </div>
            <div class="announcement-content">
                ${announcement.content}
            </div>
            <div class="announcement-actions">
                ${announcement.isFeatured ? '<span class="badge featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                ${announcement.isUrgent ? '<span class="badge urgent-badge"><i class="fas fa-exclamation-triangle"></i> Urgent</span>' : ''}
                <button class="btn btn-outline archive-btn" onclick="archiveAnnouncement('${announcement.id}')">
                    <i class="fas fa-archive"></i> Archive
                </button>
            </div>
        </div>
    `).join('');
}

async function archiveAnnouncement(announcementId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/archives/${announcementId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Announcement archived successfully!', 'success');
        } else {
            showNotification('Failed to archive announcement', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

function filterAnnouncements() {
    const searchTerm = document.getElementById('search-announcements').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;
    
    // This would typically re-fetch from API with filters
    // For now, we'll just show a message
    showNotification('Filtering announcements...', 'success');
}

// Profile Functions
function updateProfileDisplay() {
    if (!currentUser) return;

    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-matric').textContent = currentUser.matricNumber;
    document.getElementById('profile-department').textContent = currentUser.department;
    
    // Populate form fields
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-email').value = currentUser.email;
    document.getElementById('edit-phone').value = currentUser.phone || '';
    document.getElementById('edit-level').value = currentUser.level;
    
    // Profile picture
    const profileImg = document.getElementById('profile-picture');
    if (currentUser.profileImage) {
        profileImg.src = currentUser.profileImage;
    } else {
        profileImg.src = 'https://via.placeholder.com/120/667eea/ffffff?text=' + currentUser.name.charAt(0);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    showLoading();

    const formData = new FormData(e.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        level: parseInt(formData.get('level'))
    };

    try {
        const response = await fetch(`${API_BASE_URL}/students/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            currentUser = updatedUser;
            updateProfileDisplay();
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification('Failed to update profile', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function handlePictureChange() {
    // Implement profile picture upload
    showNotification('Profile picture upload feature coming soon!', 'success');
}

// Results Functions
async function loadResults() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/students/results`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const results = await response.json();
            displayResults(results);
        } else {
            showNotification('Failed to load results', 'error');
        }
    } catch (error) {
        showNotification('Network error loading results', 'error');
    } finally {
        hideLoading();
    }
}

function displayResults(results) {
    const container = document.getElementById('results-container');
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="no-data">No results available yet.</div>';
        return;
    }

    // Implement results display based on your data structure
    container.innerHTML = '<div class="no-data">Results display will be implemented based on your data structure.</div>';
}

// Navigation
function switchSection(sectionName) {
    // Update nav buttons
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    // Activate selected section
    document.getElementById(`${sectionName}-btn`).classList.add('active');
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Load section data
    if (sectionName === 'announcements') {
        loadAnnouncements();
    } else if (sectionName === 'results') {
        loadResults();
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    showAuth();
    showNotification('Logged out successfully', 'success');
}

// Utility Functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}