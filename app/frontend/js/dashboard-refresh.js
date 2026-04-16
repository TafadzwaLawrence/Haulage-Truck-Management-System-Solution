// Global function to refresh all dashboard components
window.refreshDashboard = async function() {
    console.log('Refreshing dashboard data...');
    
    try {
        // Check if dashboard is visible
        const dashboardSection = document.getElementById('dashboardSection');
        if (!dashboardSection || dashboardSection.classList.contains('hidden')) {
            console.log('Dashboard not visible, skipping refresh');
            return;
        }
        
        // Refresh stats
        if (typeof window.updateStats === 'function') {
            await window.updateStats();
            console.log('Stats updated');
        }
        
        // Refresh charts
        if (typeof window.loadCharts === 'function') {
            await window.loadCharts();
            console.log('Charts updated');
        }
        
        // Refresh recent activity
        if (typeof window.loadRecentActivity === 'function') {
            await window.loadRecentActivity();
            console.log('Recent activity updated');
        }
        
        console.log('Dashboard refresh complete');
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
};

// Also expose individual refresh functions
window.refreshStats = async function() {
    if (typeof window.updateStats === 'function') {
        await window.updateStats();
    }
};

window.refreshCharts = async function() {
    if (typeof window.loadCharts === 'function') {
        await window.loadCharts();
    }
};

window.refreshActivity = async function() {
    if (typeof window.loadRecentActivity === 'function') {
        await window.loadRecentActivity();
    }
};