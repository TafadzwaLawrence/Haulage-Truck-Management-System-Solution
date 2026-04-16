async function fetchAllData() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
        const [trucks, drivers, jobs] = await Promise.all([
            fetch('/trucks/', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
            fetch('/drivers/', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
            fetch('/jobs/', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
        ]);
        return { trucks, drivers, jobs };
    } catch (err) {
        console.error('Fetch failed', err);
        return null;
    }
}

// Force update of every possible UI component
function updateAllUI(trucks, drivers, jobs) {
    // Update dashboard stats
    const stats = {
        trucks: trucks.length,
        drivers: drivers.length,
        activeJobs: jobs.filter(j => j.status !== 'completed').length,
        completedJobs: jobs.filter(j => j.status === 'completed').length
    };
    const statsDiv = document.getElementById('statsCards');
    if (statsDiv) statsDiv.innerHTML = renderStatsCards(stats);
    
    // Update trucks table (even if hidden)
    const trucksTable = document.getElementById('trucksTable');
    if (trucksTable) trucksTable.innerHTML = renderTrucksTable(trucks);
    
    // Update drivers table (even if hidden)
    const driversTable = document.getElementById('driversTable');
    if (driversTable) driversTable.innerHTML = renderDriversTable(drivers);
    
    // Update jobs table (even if hidden)
    const jobsTable = document.getElementById('jobsTable');
    if (jobsTable) jobsTable.innerHTML = renderJobsTable(jobs);
    
    // Update job creation form dropdowns
    const jobForm = document.getElementById('jobForm');
    if (jobForm) jobForm.innerHTML = renderJobForm(trucks, drivers);
    
    // Update charts if they exist and we are on dashboard
    if (typeof loadCharts === 'function') loadCharts();
    if (typeof loadRecentActivity === 'function') loadRecentActivity();
}

window.refreshAll = async function() {
    console.log('🔄 Refreshing ALL UI components...');
    const data = await fetchAllData();
    if (!data) return;
    updateAllUI(data.trucks, data.drivers, data.jobs);
    console.log('✅ Refresh complete – all tables updated');
};

window.forceRefresh = function() {
    setTimeout(() => window.refreshAll(), 300);
};
