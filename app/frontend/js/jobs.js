async function loadJobs() {
    try {
        const [trucks, drivers, jobs] = await Promise.all([
            TruckAPI.getAll(),
            DriverAPI.getAll(),
            JobAPI.getAll()
        ]);
        
        document.getElementById('jobForm').innerHTML = renderJobForm(trucks, drivers);
        document.getElementById('jobsTable').innerHTML = renderJobsTable(jobs);
    } catch (error) {
        document.getElementById('jobsTable').innerHTML = '<div class="card p-6"><p class="text-red-600 text-center">Error loading jobs</p></div>';
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
        if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
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
            if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
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
            if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
                await updateStats();
                await loadCharts();
                await loadRecentActivity();
            }
        } catch (error) {
            showNotification('Error completing job', 'error');
        }
    }
}
