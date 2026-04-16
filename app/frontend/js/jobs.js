async function loadJobs() {
    try {
        const [trucks, drivers, jobs] = await Promise.all([
            TruckAPI.getAll(),
            DriverAPI.getAll(),
            JobAPI.getAll()
        ]);
        
        document.getElementById('jobForm').innerHTML = renderJobForm(trucks, drivers);
        
        const tableHtml = `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-white font-semibold mb-4 text-lg">Active & Completed Jobs</h3>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>ID</th><th>Pickup Location</th><th>Delivery Location</th><th>Cargo</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${jobs.map(job => `
                                <tr>
                                    <td>${job.id}</td>
                                    <td>${job.pickup_location}</td>
                                    <td>${job.delivery_location}</td>
                                    <td>${job.cargo_description}</td>
                                    <td>${getStatusBadge(job.status, 'job')}</td>
                                    <td>
                                        ${job.status !== 'completed' ? `<button onclick="completeJob(${job.id})" class="text-green-400 hover:text-green-300 mr-2"><i class="ri-check-line text-xl"></i></button>` : ''}
                                        <button onclick="deleteJob(${job.id})" class="text-red-400 hover:text-red-300"><i class="ri-delete-bin-line text-xl"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('jobsTable').innerHTML = tableHtml;
    } catch (error) {
        document.getElementById('jobsTable').innerHTML = '<div class="glass-card rounded-xl p-6"><p class="text-red-400 text-center">Error loading jobs</p></div>';
    }
}

async function createJob() {
    const pickup = document.getElementById('jobPickup').value.trim();
    const delivery = document.getElementById('jobDelivery').value.trim();
    const cargo = document.getElementById('jobCargo').value.trim();
    const truckId = document.getElementById('jobTruck').value;
    const driverId = document.getElementById('jobDriver').value;
    
    if (!pickup || !delivery || !cargo || !truckId || !driverId) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        await JobAPI.create({
            pickup_location: pickup,
            delivery_location: delivery,
            cargo_description: cargo,
            truck_id: parseInt(truckId),
            driver_id: parseInt(driverId)
        });
        showNotification('Job created successfully!', 'success');
        document.getElementById('jobPickup').value = '';
        document.getElementById('jobDelivery').value = '';
        document.getElementById('jobCargo').value = '';
        await loadJobs();
        if (document.getElementById('dashboardSection').classList.contains('hidden') === false) {
            await updateStats();
            await loadCharts();
            await loadRecentActivity();
        }
    } catch (error) {
        showNotification('Error creating job: ' + error.message, 'error');
    }
}

async function deleteJob(id) {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        try {
            await JobAPI.delete(id);
            showNotification('Job deleted successfully', 'success');
            await loadJobs();
            if (document.getElementById('dashboardSection').classList.contains('hidden') === false) {
                await updateStats();
                await loadCharts();
                await loadRecentActivity();
            }
        } catch (error) {
            showNotification('Error deleting job', 'error');
        }
    }
}

async function completeJob(id) {
    if (confirm('Mark this job as completed?')) {
        try {
            await JobAPI.update(id, { status: 'completed' });
            showNotification('Job marked as completed!', 'success');
            await loadJobs();
            if (document.getElementById('dashboardSection').classList.contains('hidden') === false) {
                await updateStats();
                await loadCharts();
                await loadRecentActivity();
            }
        } catch (error) {
            showNotification('Error completing job', 'error');
        }
    }
}