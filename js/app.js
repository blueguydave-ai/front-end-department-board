// js/app.js
class StudentPortalApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {
            'login': this.renderLoginPage.bind(this),
            'signup': this.renderSignupPage.bind(this),
            'dashboard': this.renderDashboard.bind(this),
            'announcements': this.renderAnnouncementsPage.bind(this),
            'timetable': this.renderTimetablePage.bind(this),
            'profile': this.renderProfilePage.bind(this),
            'archive': this.renderArchivePage.bind(this)
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleRoute();
        
        // Check API health on startup
        this.checkAPIHealth();
    }

    setupEventListeners() {
        // Navigation toggle for mobile
        document.getElementById('nav-toggle').addEventListener('click', this.toggleMobileMenu.bind(this));
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav__menu') && !e.target.closest('.nav__toggle')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    }

    closeMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }

    handleRoute() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        
        if (this.pages[hash]) {
            this.currentPage = hash;
            this.renderPage();
        } else {
            this.navigateTo('dashboard');
        }
    }

    navigateTo(page) {
        if (this.pages[page]) {
            window.location.hash = page;
            this.currentPage = page;
            this.renderPage();
        }
    }

    async renderPage() {
        const mainContent = document.getElementById('main-content');
        
        // Check authentication for protected routes
        const protectedRoutes = ['dashboard', 'announcements', 'timetable', 'profile', 'archive'];
        
        if (protectedRoutes.includes(this.currentPage) && !authManager.isAuthenticated) {
            this.navigateTo('login');
            return;
        }
        
        // Redirect to dashboard if already authenticated and trying to access auth pages
        if (['login', 'signup'].includes(this.currentPage) && authManager.isAuthenticated) {
            this.navigateTo('dashboard');
            return;
        }

        Helpers.showLoading();
        
        try {
            await this.pages[this.currentPage]();
            this.updateNavigation();
        } catch (error) {
            console.error('Error rendering page:', error);
            Helpers.showToast('Error loading page', 'error');
        } finally {
            Helpers.hideLoading();
        }
    }

    updateNavigation() {
        const navList = document.getElementById('nav-list');
        const navUser = document.getElementById('nav-user');
        
        if (!authManager.isAuthenticated) {
            navList.innerHTML = '';
            navUser.innerHTML = `
                <a href="#login" class="btn btn--outline btn--sm">Login</a>
                <a href="#signup" class="btn btn--primary btn--sm">Sign Up</a>
            `;
            return;
        }

        // Navigation items for authenticated users
        navList.innerHTML = `
            <li><a href="#dashboard" class="nav__link ${this.currentPage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
            <li><a href="#announcements" class="nav__link ${this.currentPage === 'announcements' ? 'active' : ''}">Announcements</a></li>
            <li><a href="#timetable" class="nav__link ${this.currentPage === 'timetable' ? 'active' : ''}">Timetable</a></li>
            <li><a href="#profile" class="nav__link ${this.currentPage === 'profile' ? 'active' : ''}">Profile & Results</a></li>
            <li><a href="#archive" class="nav__link ${this.currentPage === 'archive' ? 'active' : ''}">Archive</a></li>
        `;

        // User menu
        const user = authManager.getCurrentUser();
        navUser.innerHTML = `
            <div class="user-menu">
                <div class="user-avatar" id="user-avatar">
                    ${Helpers.getInitials(user.name)}
                </div>
                <div class="user-dropdown" id="user-dropdown">
                    <div class="user-dropdown__item">
                        <strong>${user.name}</strong>
                    </div>
                    <div class="user-dropdown__item">
                        ${user.matricNumber}
                    </div>
                    <div class="user-dropdown__item">
                        ${Helpers.getLevelLabel(user.level)}
                    </div>
                    <div class="user-dropdown__item" onclick="authManager.logout()">
                        Logout
                    </div>
                </div>
            </div>
        `;

        // User dropdown toggle
        document.getElementById('user-avatar').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('user-dropdown').classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.classList.remove('show');
        });
    }

    // Page rendering methods
    async renderLoginPage() {
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="container">
                <div class="grid" style="grid-template-columns: 1fr; max-width: 400px; margin: 0 auto;">
                    <div class="card">
                        <div class="card__header text-center">
                            <h1 class="card__title">Welcome Back</h1>
                            <p class="card__subtitle">Sign in to your account</p>
                        </div>
                        <div class="card__body">
                            <form id="login-form">
                                <div class="form-group">
                                    <label class="form-label" for="identifier">Email or Matric Number</label>
                                    <input type="text" class="form-control" id="identifier" name="identifier" required>
                                    <div class="form-error" id="identifier-error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="password">Password</label>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                    <div class="form-error" id="password-error"></div>
                                </div>
                                
                                <div class="form-group d-flex justify-between align-center">
                                    <label class="form-label mb-0">
                                        <input type="checkbox" id="remember" name="remember">
                                        Remember me
                                    </label>
                                    <a href="#" style="color: var(--primary); text-decoration: none;">Forgot password?</a>
                                </div>
                                
                                <button type="submit" class="btn btn--primary w-100 mb-2">Sign In</button>
                                
                                <div class="text-center">
                                    <p>Don't have an account? <a href="#signup" style="color: var(--primary); text-decoration: none;">Sign up</a></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = {
            identifier: document.getElementById('identifier').value,
            password: document.getElementById('password').value
        };

        const validation = Validators.validateLoginForm(formData);
        
        if (!validation.isValid) {
            this.displayFormErrors(validation.errors);
            return;
        }

        this.clearFormErrors();

        const result = await authManager.login(formData);
        
        if (result.success) {
            this.navigateTo('dashboard');
        }
    }

    async renderSignupPage() {
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="container">
                <div class="grid" style="grid-template-columns: 1fr; max-width: 500px; margin: 0 auto;">
                    <div class="card">
                        <div class="card__header text-center">
                            <h1 class="card__title">Create Account</h1>
                            <p class="card__subtitle">Join the Computer Science Department</p>
                        </div>
                        <div class="card__body">
                            <form id="signup-form">
                                <div class="form-group">
                                    <label class="form-label" for="name">Full Name</label>
                                    <input type="text" class="form-control" id="name" name="name" required>
                                    <div class="form-error" id="name-error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="email">Email Address</label>
                                    <input type="email" class="form-control" id="email" name="email" required>
                                    <div class="form-error" id="email-error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="matricNumber">Matric Number</label>
                                    <input type="text" class="form-control" id="matricNumber" name="matricNumber" required>
                                    <div class="form-error" id="matricNumber-error"></div>
                                </div>
                                
                                <div class="grid grid--2">
                                    <div class="form-group">
                                        <label class="form-label" for="level">Level</label>
                                        <select class="form-control" id="level" name="level" required>
                                            <option value="">Select Level</option>
                                            <option value="100">100 Level</option>
                                            <option value="200">200 Level</option>
                                            <option value="300">300 Level</option>
                                            <option value="400">400 Level</option>
                                            <option value="500">500 Level</option>
                                        </select>
                                        <div class="form-error" id="level-error"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label" for="studentType">Student Type</label>
                                        <select class="form-control" id="studentType" name="studentType" required>
                                            <option value="">Select Type</option>
                                            <option value="Undergraduate">Undergraduate</option>
                                            <option value="Postgraduate">Postgraduate</option>
                                        </select>
                                        <div class="form-error" id="studentType-error"></div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="phone">Phone Number</label>
                                    <input type="tel" class="form-control" id="phone" name="phone" required>
                                    <div class="form-error" id="phone-error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="password">Password</label>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                    <div class="form-error" id="password-error"></div>
                                </div>
                                
                                <button type="submit" class="btn btn--primary w-100 mb-2">Create Account</button>
                                
                                <div class="text-center">
                                    <p>Already have an account? <a href="#login" style="color: var(--primary); text-decoration: none;">Sign in</a></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('signup-form').addEventListener('submit', this.handleSignup.bind(this));
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            matricNumber: document.getElementById('matricNumber').value,
            level: document.getElementById('level').value,
            studentType: document.getElementById('studentType').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value
        };

        const validation = Validators.validateSignupForm(formData);
        
        if (!validation.isValid) {
            this.displayFormErrors(validation.errors);
            return;
        }

        this.clearFormErrors();

        const result = await authManager.signup(formData);
        
        if (result.success) {
            this.navigateTo('dashboard');
        }
    }

    async renderDashboard() {
        const mainContent = document.getElementById('main-content');
        const user = authManager.getCurrentUser();
        
        // Fetch featured announcements
        let featuredAnnouncements = [];
        try {
            const response = await api.getFeaturedAnnouncements();
            featuredAnnouncements = response.announcements || [];
        } catch (error) {
            console.error('Error fetching featured announcements:', error);
        }

        mainContent.innerHTML = `
            <div class="container">
                <div class="mb-4">
                    <h1>Welcome back, ${user.name}!</h1>
                    <p class="text-light">Here's what's happening in the department today.</p>
                </div>
                
                <!-- Quick Actions -->
                <div class="grid grid--4 mb-4">
                    <div class="card quick-action" onclick="app.navigateTo('announcements')">
                        <div class="quick-action__icon">📢</div>
                        <h3 class="quick-action__title">Announcements</h3>
                        <p class="quick-action__description">View all department announcements</p>
                    </div>
                    
                    <div class="card quick-action" onclick="app.navigateTo('timetable')">
                        <div class="quick-action__icon">📅</div>
                        <h3 class="quick-action__title">Timetable</h3>
                        <p class="quick-action__description">Check your class schedule</p>
                    </div>
                    
                    <div class="card quick-action" onclick="app.navigateTo('profile')">
                        <div class="quick-action__icon">📊</div>
                        <h3 class="quick-action__title">Results</h3>
                        <p class="quick-action__description">View your academic results</p>
                    </div>
                    
                    <div class="card quick-action" onclick="app.navigateTo('archive')">
                        <div class="quick-action__icon">📁</div>
                        <h3 class="quick-action__title">Archive</h3>
                        <p class="quick-action__description">Your saved announcements</p>
                    </div>
                </div>
                
                <!-- Featured Announcements -->
                <div class="card">
                    <div class="card__header">
                        <h2 class="card__title">Featured Announcements</h2>
                        <p class="card__subtitle">Important updates from the department</p>
                    </div>
                    <div class="card__body">
                        <div id="featured-announcements">
                            ${featuredAnnouncements.length === 0 ? 
                                '<p class="text-center text-light">No featured announcements at the moment.</p>' : 
                                this.renderAnnouncementsList(featuredAnnouncements)
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderAnnouncementsPage() {
        const mainContent = document.getElementById('main-content');
        
        // Fetch all announcements
        let announcements = [];
        try {
            const response = await api.getAnnouncements();
            announcements = response.announcements || [];
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }

        mainContent.innerHTML = `
            <div class="container">
                <div class="d-flex justify-between align-center mb-4">
                    <div>
                        <h1>Announcements</h1>
                        <p class="text-light">Stay updated with department news</p>
                    </div>
                    <div class="search-box">
                        <input type="text" class="form-control search-box__input" id="search-announcements" placeholder="Search announcements...">
                        <span class="search-box__icon">🔍</span>
                    </div>
                </div>
                
                <!-- Filters -->
                <div class="card mb-4">
                    <div class="card__body">
                        <div class="filter-group">
                            <select class="filter-select" id="category-filter">
                                <option value="">All Categories</option>
                                <option value="general">General</option>
                                <option value="exam">Exam</option>
                                <option value="registration">Registration</option>
                                <option value="security">Security</option>
                                <option value="event">Event</option>
                            </select>
                            
                            <select class="filter-select" id="featured-filter">
                                <option value="">All Announcements</option>
                                <option value="featured">Featured Only</option>
                                <option value="urgent">Urgent Only</option>
                            </select>
                            
                            <button class="btn btn--outline" id="clear-filters">Clear Filters</button>
                        </div>
                    </div>
                </div>
                
                <!-- Announcements Grid -->
                <div class="grid grid--2" id="announcements-grid">
                    ${this.renderAnnouncementsList(announcements)}
                </div>
                
                ${announcements.length === 0 ? 
                    '<div class="text-center mt-4"><p>No announcements found.</p></div>' : 
                    ''
                }
            </div>
        `;

        this.setupAnnouncementsFilters();
    }

    renderAnnouncementsList(announcements) {
        return announcements.map(announcement => `
            <div class="card announcement-card ${announcement.isFeatured ? 'featured' : ''} ${announcement.isUrgent ? 'urgent' : ''}">
                <div class="card__body">
                    <span class="announcement-card__category">
                        ${Helpers.getCategoryLabel(announcement.category)}
                    </span>
                    <h3 class="announcement-card__title">${Helpers.sanitizeInput(announcement.title)}</h3>
                    <div class="announcement-card__content">
                        ${Helpers.sanitizeInput(announcement.content)}
                    </div>
                    <div class="announcement-card__meta">
                        <span>By ${announcement.author?.name || 'Department'}</span>
                        <span>${Helpers.formatDate(announcement.createdAt)}</span>
                    </div>
                    <div class="announcement-card__actions">
                        <button class="btn btn--secondary btn--sm" onclick="app.archiveAnnouncement('${announcement.id}')">
                            📁 Archive
                        </button>
                        ${announcement.fileUrl ? `
                            <a href="${announcement.fileUrl}" class="btn btn--outline btn--sm" target="_blank">
                                📎 Attachment
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupAnnouncementsFilters() {
        const searchInput = document.getElementById('search-announcements');
        const categoryFilter = document.getElementById('category-filter');
        const featuredFilter = document.getElementById('featured-filter');
        const clearFiltersBtn = document.getElementById('clear-filters');

        const debouncedSearch = Helpers.debounce(async (searchTerm) => {
            await this.filterAnnouncements();
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        categoryFilter.addEventListener('change', this.filterAnnouncements.bind(this));
        featuredFilter.addEventListener('change', this.filterAnnouncements.bind(this));
        
        clearFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = '';
            featuredFilter.value = '';
            this.filterAnnouncements();
        });
    }

    async filterAnnouncements() {
        const searchTerm = document.getElementById('search-announcements').value;
        const category = document.getElementById('category-filter').value;
        const featured = document.getElementById('featured-filter').value;

        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (category) params.category = category;
        if (featured === 'featured') params.featured = true;
        if (featured === 'urgent') params.urgent = true;

        try {
            Helpers.showLoading();
            const response = await api.getAnnouncements(params);
            const announcementsGrid = document.getElementById('announcements-grid');
            announcementsGrid.innerHTML = this.renderAnnouncementsList(response.announcements || []);
        } catch (error) {
            Helpers.showToast('Error filtering announcements', 'error');
        } finally {
            Helpers.hideLoading();
        }
    }

    async archiveAnnouncement(announcementId) {
        try {
            await api.archiveAnnouncement(announcementId);
            Helpers.showToast('Announcement archived successfully', 'success');
        } catch (error) {
            Helpers.showToast('Error archiving announcement', 'error');
        }
    }

    async renderTimetablePage() {
        const mainContent = document.getElementById('main-content');
        const user = authManager.getCurrentUser();
        
        mainContent.innerHTML = `
            <div class="container">
                <div class="mb-4">
                    <h1>Class Timetable</h1>
                    <p class="text-light">View and download your class schedules</p>
                </div>
                
                <div class="card">
                    <div class="card__body">
                        <div class="filter-group mb-4">
                            <select class="filter-select" id="level-select">
                                <option value="100">100 Level</option>
                                <option value="200">200 Level</option>
                                <option value="300">300 Level</option>
                                <option value="400">400 Level</option>
                                <option value="500">500 Level</option>
                            </select>
                            
                            <select class="filter-select" id="semester-select">
                                <option value="first">First Semester</option>
                                <option value="second">Second Semester</option>
                            </select>
                            
                            <button class="btn btn--primary" id="load-timetable">Load Timetable</button>
                        </div>
                        
                        <div id="timetable-content">
                            <p class="text-center text-light">Select your level and semester to view timetable</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set current user's level as default
        document.getElementById('level-select').value = user.level;
        
        document.getElementById('load-timetable').addEventListener('click', this.loadTimetable.bind(this));
    }

    async loadTimetable() {
        const level = document.getElementById('level-select').value;
        const semester = document.getElementById('semester-select').value;
        
        try {
            Helpers.showLoading();
            const timetable = await api.getTimetable(level);
            const timetableContent = document.getElementById('timetable-content');
            
            if (timetable && timetable.fileUrl) {
                timetableContent.innerHTML = `
                    <div class="text-center">
                        <h3>Timetable for ${Helpers.getLevelLabel(level)} - ${semester === 'first' ? 'First' : 'Second'} Semester</h3>
                        <p class="mb-3">Click the button below to download the timetable</p>
                        <a href="${timetable.fileUrl}" class="btn btn--primary" target="_blank" download>
                            📥 Download Timetable
                        </a>
                        <div class="mt-4">
                            <p><strong>Last Updated:</strong> ${timetable.updatedAt ? Helpers.formatDate(timetable.updatedAt) : 'N/A'}</p>
                        </div>
                    </div>
                `;
            } else {
                timetableContent.innerHTML = `
                    <p class="text-center text-light">No timetable available for ${Helpers.getLevelLabel(level)} ${semester} semester.</p>
                `;
            }
        } catch (error) {
            Helpers.showToast('Error loading timetable', 'error');
            document.getElementById('timetable-content').innerHTML = `
                <p class="text-center text-light">Error loading timetable. Please try again.</p>
            `;
        } finally {
            Helpers.hideLoading();
        }
    }

    async renderProfilePage() {
        const mainContent = document.getElementById('main-content');
        const user = authManager.getCurrentUser();
        
        // Fetch student results
        let results = [];
        try {
            const response = await api.getStudentResults();
            results = response.results || [];
        } catch (error) {
            console.error('Error fetching results:', error);
        }

        mainContent.innerHTML = `
            <div class="container">
                <div class="grid grid--2">
                    <!-- Profile Section -->
                    <div>
                        <div class="card mb-4">
                            <div class="card__header">
                                <h2 class="card__title">Profile Information</h2>
                            </div>
                            <div class="card__body">
                                <div class="profile-header">
                                    <div class="profile-avatar">
                                        ${Helpers.getInitials(user.name)}
                                    </div>
                                    <div class="profile-info">
                                        <h2>${user.name}</h2>
                                        <p>${user.matricNumber} • ${Helpers.getLevelLabel(user.level)}</p>
                                        <p>${user.studentType} • ${user.department}</p>
                                    </div>
                                </div>
                                
                                <form id="profile-form">
                                    <div class="form-group">
                                        <label class="form-label" for="profile-name">Full Name</label>
                                        <input type="text" class="form-control" id="profile-name" name="name" value="${user.name}" required>
                                        <div class="form-error" id="profile-name-error"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label" for="profile-email">Email Address</label>
                                        <input type="email" class="form-control" id="profile-email" name="email" value="${user.email}" required>
                                        <div class="form-error" id="profile-email-error"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label" for="profile-phone">Phone Number</label>
                                        <input type="tel" class="form-control" id="profile-phone" name="phone" value="${user.phone}" required>
                                        <div class="form-error" id="profile-phone-error"></div>
                                    </div>
                                    
                                    <button type="submit" class="btn btn--primary">Update Profile</button>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Profile Picture Upload -->
                        <div class="card">
                            <div class="card__header">
                                <h2 class="card__title">Profile Picture</h2>
                            </div>
                            <div class="card__body">
                                <div class="form-group">
                                    <label class="form-label" for="profile-picture">Upload Profile Picture</label>
                                    <input type="file" class="form-control" id="profile-picture" accept="image/*">
                                    <div class="form-text">Supported formats: JPG, PNG, GIF (Max 2MB)</div>
                                </div>
                                <button class="btn btn--secondary" onclick="app.uploadProfilePicture()">Upload Picture</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Results Section -->
                    <div>
                        <div class="card">
                            <div class="card__header">
                                <h2 class="card__title">Academic Results</h2>
                                <p class="card__subtitle">Your course grades and performance</p>
                            </div>
                            <div class="card__body">
                                ${results.length > 0 ? this.renderResultsTable(results) : `
                                    <p class="text-center text-light">No results available at the moment.</p>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('profile-form').addEventListener('submit', this.handleProfileUpdate.bind(this));
    }

    renderResultsTable(results) {
        return `
            <div class="table-responsive">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Title</th>
                            <th>Grade</th>
                            <th>Semester</th>
                            <th>Credit Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(result => `
                            <tr>
                                <td>${result.courseCode}</td>
                                <td>${result.courseTitle}</td>
                                <td><strong>${result.grade}</strong></td>
                                <td>${result.semester}</td>
                                <td>${result.creditUnits}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('profile-name').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value
        };

        const validation = Validators.validateProfileForm(formData);
        
        if (!validation.isValid) {
            this.displayFormErrors(validation.errors, 'profile-');
            return;
        }

        this.clearFormErrors('profile-');

        try {
            const response = await api.updateStudentProfile(formData);
            authManager.updateUserProfile(response.user);
            Helpers.showToast('Profile updated successfully', 'success');
        } catch (error) {
            Helpers.showToast('Error updating profile', 'error');
        }
    }

    async uploadProfilePicture() {
        const fileInput = document.getElementById('profile-picture');
        const file = fileInput.files[0];
        
        if (!file) {
            Helpers.showToast('Please select a file', 'warning');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            Helpers.showToast('File size must be less than 2MB', 'error');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            Helpers.showToast('Please select a valid image file (JPG, PNG, GIF)', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            Helpers.showLoading();
            const response = await api.uploadProfilePicture(formData);
            authManager.updateUserProfile(response.user);
            Helpers.showToast('Profile picture updated successfully', 'success');
            fileInput.value = ''; // Clear the file input
        } catch (error) {
            Helpers.showToast('Error uploading profile picture', 'error');
        } finally {
            Helpers.hideLoading();
        }
    }

    async renderArchivePage() {
        const mainContent = document.getElementById('main-content');
        
        // Fetch archived items
        let archivedItems = [];
        try {
            const response = await api.getArchivedItems();
            archivedItems = response.archives || [];
        } catch (error) {
            console.error('Error fetching archived items:', error);
        }

        mainContent.innerHTML = `
            <div class="container">
                <div class="mb-4">
                    <h1>Archived Announcements</h1>
                    <p class="text-light">Your saved announcements for quick reference</p>
                </div>
                
                ${archivedItems.length > 0 ? `
                    <div class="grid grid--2" id="archive-grid">
                        ${this.renderArchivedItemsList(archivedItems)}
                    </div>
                ` : `
                    <div class="card">
                        <div class="card__body text-center">
                            <h3>No Archived Items</h3>
                            <p class="text-light">You haven't archived any announcements yet.</p>
                            <a href="#announcements" class="btn btn--primary">Browse Announcements</a>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    renderArchivedItemsList(archivedItems) {
        return archivedItems.map(item => {
            const announcement = item.announcement;
            return `
                <div class="card announcement-card">
                    <div class="card__body">
                        <span class="announcement-card__category">
                            ${Helpers.getCategoryLabel(announcement.category)}
                        </span>
                        <h3 class="announcement-card__title">${Helpers.sanitizeInput(announcement.title)}</h3>
                        <div class="announcement-card__content">
                            ${Helpers.sanitizeInput(announcement.content)}
                        </div>
                        <div class="announcement-card__meta">
                            <span>Archived on ${Helpers.formatDate(item.archivedAt)}</span>
                        </div>
                        <div class="announcement-card__actions">
                            <button class="btn btn--danger btn--sm" onclick="app.removeFromArchive('${item.id}')">
                                🗑️ Remove
                            </button>
                            ${announcement.fileUrl ? `
                                <a href="${announcement.fileUrl}" class="btn btn--outline btn--sm" target="_blank">
                                    📎 Attachment
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async removeFromArchive(archiveId) {
        try {
            await api.removeFromArchive(archiveId);
            Helpers.showToast('Removed from archive', 'success');
            // Refresh the archive page
            this.renderArchivePage();
        } catch (error) {
            Helpers.showToast('Error removing from archive', 'error');
        }
    }

    // Utility methods
    displayFormErrors(errors, prefix = '') {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${prefix}${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.add('show');
                
                const inputElement = document.getElementById(`${prefix}${field}`);
                if (inputElement) {
                    inputElement.classList.add('error');
                }
            }
        });
    }

    clearFormErrors(prefix = '') {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.classList.remove('show');
            element.textContent = '';
        });

        const inputElements = document.querySelectorAll('.form-control');
        inputElements.forEach(element => {
            element.classList.remove('error');
        });
    }

    async checkAPIHealth() {
        try {
            await api.healthCheck();
            console.log('API is healthy');
        } catch (error) {
            console.error('API health check failed:', error);
            Helpers.showToast('Unable to connect to server', 'error');
        }
    }
}

// Helper function to display form errors
function displayFormErrors(errors, prefix = '') {
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${prefix}${field}-error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.classList.add('show');
            
            const inputElement = document.getElementById(`${prefix}${field}`);
            if (inputElement) {
                inputElement.classList.add('error');
            }
        }
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudentPortalApp();
    
    // Handle hash changes for SPA navigation
    window.addEventListener('hashchange', () => {
        app.handleRoute();
    });
});