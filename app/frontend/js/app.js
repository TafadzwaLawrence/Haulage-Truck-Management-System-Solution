async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const data = await AuthAPI.login(username, password);
        setAuthToken(data.access_token);
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('dashboardContainer').classList.remove('hidden');
        
        // Render sidebar and header
        document.getElementById('sidebar').innerHTML = renderSidebar();
        document.getElementById('pageHeader').innerHTML = renderPageHeader('Dashboard', 'Welcome back, here\'s your fleet overview');
        
        await loadDashboard();
        showNotification('Welcome to Haulage Management System!', 'success');
    } catch (error) {
        document.getElementById('loginError').innerText = 'Invalid credentials. Please try again.';
        showNotification('Login failed: Invalid credentials', 'error');
    }
}

function logout() {
    setAuthToken('');
    document.getElementById('dashboardContainer').classList.add('hidden');
    document.getElementById('loginContainer').classList.remove('hidden');
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
        // Add fade out animation
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
