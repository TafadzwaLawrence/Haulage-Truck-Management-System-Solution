

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.classList.add('loading');
    
    // Clear previous error
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.remove('show');
    errorDiv.innerHTML = '';
    
    // Validate inputs
    if (!username || !password) {
        showLoginError('Please enter both username and password');
        loginBtn.classList.remove('loading');
        return;
    }
    
    try {
        const data = await AuthAPI.login(username, password);
        setAuthToken(data.access_token);
            // Start dashboard auto-refresh
            if (typeof window.startDashboardRefresh === "function") {
                window.startDashboardRefresh();
            }
        
        // Save to localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem('rememberedUsername', username);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
        
        // Animate transition
        const loginContainer = document.getElementById('loginContainer');
        loginContainer.style.animation = 'fadeOut 0.3s ease-out';
        
        setTimeout(() => {
            loginContainer.classList.add('hidden');
            document.getElementById('dashboardContainer').classList.remove('hidden');
            
            // Render sidebar and header
            document.getElementById('sidebar').innerHTML = renderSidebar();
            document.getElementById('pageHeader').innerHTML = renderPageHeader('Dashboard', 'Welcome back, here\'s your fleet overview');
            
            loadDashboard();
            showNotification(`Welcome back, ${username}!`, 'success');
        }, 300);
        
    } catch (error) {
        showLoginError('Invalid username or password. Please try again.');
        loginBtn.classList.remove('loading');
        
        // Shake animation for error
        const form = document.getElementById('loginForm');
        form.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.innerHTML = `
        <i class="ri-error-warning-line" style="margin-right: 8px;"></i>
        ${message}
    `;
    errorDiv.classList.add('show');
}

function logout() {
    setAuthToken('');
    document.getElementById('dashboardContainer').classList.add('hidden');
    document.getElementById('loginContainer').classList.remove('hidden');
    
    // Reset login form
    document.getElementById('loginForm').reset();
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = 'admin';
    
    // Animate login container back
    const loginContainer = document.getElementById('loginContainer');
    loginContainer.style.animation = 'fadeInUp 0.6s ease-out';
    
    showNotification('Logged out successfully', 'info');
}

async function refreshAllData() {
    showNotification('Refreshing data...', 'info');
    const currentSection = document.querySelector('.nav-item.active span')?.innerText.toLowerCase();
    
    if (!currentSection || currentSection === 'dashboard') {
        await loadDashboard();
    } else if (currentSection === 'trucks') {
        await loadTrucks();
    } else if (currentSection === 'drivers') {
        await loadDrivers();
    } else if (currentSection === 'jobs') {
        await loadJobs();
    }
}

function showSection(section) {
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('trucksSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    document.getElementById('jobsSection').classList.add('hidden');
    
    document.getElementById(`${section}Section`).classList.remove('hidden');
    
    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Welcome back, here\'s your fleet overview' },
        'trucks': { title: 'Truck Management', subtitle: 'Manage your fleet of trucks' },
        'drivers': { title: 'Driver Management', subtitle: 'Manage your driver roster' },
        'jobs': { title: 'Job Management', subtitle: 'Track and manage delivery jobs' }
    };
    
    document.getElementById('pageHeader').innerHTML = renderPageHeader(titles[section].title, titles[section].subtitle);
    
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Global closeModal function for closing edit modals
window.closeModal = function() {
    const modals = document.querySelectorAll('[id$="Modal"]');
    modals.forEach(modal => {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 200);
    });
};

// Close modal when clicking escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        window.closeModal();
    }
});

// Auto-refresh every 30 seconds
setInterval(() => {
    if (getAuthToken() && !document.getElementById('dashboardContainer').classList.contains('hidden')) {
        const activeSection = document.querySelector('.nav-item.active span')?.innerText.toLowerCase();
        if (activeSection === 'dashboard') {
            updateStats();
            loadCharts();
            loadRecentActivity();
        }
    }
}, 30000);

// Handle responsive sidebar on mobile
let sidebarOpen = false;

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        sidebarOpen = !sidebarOpen;
    }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.95);
        }
    }
`;
document.head.appendChild(style);

// Add resize listener for responsive behavior
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
            sidebarOpen = false;
        }
    }
});

// Preload dashboard for faster transition
window.addEventListener('load', function() {
    // Preload common assets
    if (document.getElementById('username').value === 'admin') {
        // Pre-fetch token silently?
    }
});

// Make refreshDashboardData available globally
window.refreshDashboardData = async function() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection && !dashboardSection.classList.contains('hidden')) {
        if (typeof updateStats !== 'undefined') await updateStats();
        if (typeof loadCharts !== 'undefined') await loadCharts();
        if (typeof loadRecentActivity !== 'undefined') await loadRecentActivity();
        console.log('Dashboard refreshed successfully');
    }
};
