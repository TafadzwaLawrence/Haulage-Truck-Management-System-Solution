// Dashboard specific logic - Whitespace Design

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
                    <h3 class="text-gray-900 font-semibold mb-4 text-base">Fleet Status Distribution</h3>
                    <canvas id="fleetChart" height="250"></canvas>
                </div>
                <div class="chart-container">
                    <h3 class="text-gray-900 font-semibold mb-4 text-base">Job Status Overview</h3>
                    <canvas id="jobChart" height="250"></canvas>
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
                        labels: { font: { size: 12, family: 'Inter' } }
                    }
                }
            }
        });
        
        const jobCtx = document.getElementById('jobChart').getContext('2d');
        jobChart = new Chart(jobCtx, {
            type: 'bar',
            data: {
                labels: ['Pending', 'In Progress', 'Completed'],
                datasets: [{
                    label: 'Number of Jobs',
                    data: [jobStatus.pending, jobStatus.in_progress, jobStatus.completed],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { font: { size: 12, family: 'Inter' } } }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { size: 12, family: 'Inter' } }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { font: { size: 12, family: 'Inter' } }
                    }
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
                <h3 class="text-gray-900 font-semibold mb-4 text-base">Recent Activity</h3>
                <div class="space-y-3">
                    ${recent.map(job => `
                        <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div class="flex items-center gap-3 flex-1">
                                <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <i class="ri-delivery-line text-blue-600"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="text-gray-900 font-medium text-sm">Job #${job.id} - ${job.cargo_description}</p>
                                    <p class="text-gray-500 text-xs mt-0.5">${job.pickup_location} → ${job.delivery_location}</p>
                                </div>
                            </div>
                            ${getStatusBadge(job.status, 'job')}
                        </div>
                    `).join('')}
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
