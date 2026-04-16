let fleetChart = null;
let jobChart = null;

async function loadDashboard() {
    await updateStats();
    await loadCharts();
    await loadRecentActivity();
}

async function updateStats() {
    try {
        const [trucks, drivers, jobs] = await Promise.all([
            TruckAPI.getAll(),
            DriverAPI.getAll(),
            JobAPI.getAll()
        ]);
        
        const stats = {
            trucks: trucks.length,
            drivers: drivers.length,
            activeJobs: jobs.filter(j => j.status !== 'completed').length,
            completedJobs: jobs.filter(j => j.status === 'completed').length
        };
        
        document.getElementById('statsCards').innerHTML = renderStatsCards(stats);
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

async function loadCharts() {
    try {
        const [trucks, jobs] = await Promise.all([
            TruckAPI.getAll(),
            JobAPI.getAll()
        ]);
        
        const truckStatus = {
            available: trucks.filter(t => t.status === 'available').length,
            in_transit: trucks.filter(t => t.status === 'in_transit').length,
            under_maintenance: trucks.filter(t => t.status === 'under_maintenance').length
        };
        
        const jobStatus = {
            pending: jobs.filter(j => j.status === 'pending').length,
            in_progress: jobs.filter(j => j.status === 'in_progress').length,
            completed: jobs.filter(j => j.status === 'completed').length
        };
        
        const chartsHtml = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="chart-container">
                    <h3>Fleet Status Distribution</h3>
                    <canvas id="fleetChart" height="200" style="max-height: 200px;"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Job Status Overview</h3>
                    <canvas id="jobChart" height="200" style="max-height: 200px;"></canvas>
                </div>
            </div>
        `;
        
        document.getElementById('chartsSection').innerHTML = chartsHtml;
        
        if (fleetChart) fleetChart.destroy();
        if (jobChart) jobChart.destroy();
        
        const fleetCtx = document.getElementById('fleetChart').getContext('2d');
        fleetChart = new Chart(fleetCtx, {
            type: 'doughnut',
            data: {
                labels: ['Available', 'In Transit', 'Under Maintenance'],
                datasets: [{
                    data: [truckStatus.available, truckStatus.in_transit, truckStatus.under_maintenance],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { font: { size: 11, family: 'Inter' }, boxWidth: 10, padding: 8 }
                    },
                    tooltip: { bodyFont: { size: 12 } }
                },
                layout: {
                    padding: { top: 5, bottom: 5, left: 5, right: 5 }
                }
            }
        });
        
        const jobCtx = document.getElementById('jobChart').getContext('2d');
        jobChart = new Chart(jobCtx, {
            type: 'bar',
            data: {
                labels: ['Pending', 'In Progress', 'Completed'],
                datasets: [{
                    label: 'Jobs',
                    data: [jobStatus.pending, jobStatus.in_progress, jobStatus.completed],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
                    borderRadius: 6,
                    barPercentage: 0.65,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        display: false
                    },
                    tooltip: { bodyFont: { size: 12 } }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { font: { size: 11, family: 'Inter' }, stepSize: 1 },
                        title: { display: false }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { font: { size: 11, family: 'Inter' } }
                    }
                },
                layout: {
                    padding: { top: 5, bottom: 5, left: 5, right: 5 }
                }
            }
        });
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

async function loadRecentActivity() {
    try {
        const jobs = await JobAPI.getAll();
        const recent = jobs.slice(-5).reverse();
        
        if (recent.length === 0) {
            document.getElementById('recentActivity').innerHTML = `
                <div class="card p-6">
                    <div class="text-center py-8">
                        <p class="text-gray-500 text-sm">No recent activity</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const activityHtml = `
            <div class="card p-6">
                <div class="card-header">
                    <h3>
                        <i class="ri-history-line"></i>
                        Recent Activity
                    </h3>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Cargo</th>
                                <th>Route</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recent.map(job => `
                                <tr>
                                    <td>#${job.id}</td>
                                    <td><strong>${job.cargo_description}</strong></td>
                                    <td>${job.pickup_location} → ${job.delivery_location}</td>
                                    <td>${getStatusBadge(job.status, 'job')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('recentActivity').innerHTML = activityHtml;
    } catch (error) {
        document.getElementById('recentActivity').innerHTML = `
            <div class="card p-6">
                <div class="text-center py-8">
                    <p class="text-red-600 text-sm">Error loading activity</p>
                </div>
            </div>
        `;
    }
}

// Make functions available globally
window.updateStats = updateStats;
window.loadCharts = loadCharts;
window.loadRecentActivity = loadRecentActivity;
window.loadDashboard = loadDashboard;
