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

async function editJob(id) {
    try {
        const [job, trucks, drivers] = await Promise.all([
            JobAPI.getById(id),
            TruckAPI.getAll(),
            DriverAPI.getAll()
        ]);
        
        const modalHtml = `
            <div id="editJobModal" class="modal-overlay" onclick="if(event.target === this) closeModal()">
                <div class="modal-content">
                    <div class="card-header" style="border-bottom: 1px solid #f1f5f9;">
                        <h3>
                            <i class="ri-edit-line"></i>
                            Edit Job
                        </h3>
                    </div>
                    <div style="padding: 24px;">
                        <form id="editJobForm">
                            <div class="form-group">
                                <label class="required">Pickup Location</label>
                                <div class="input-icon">
                                    <i class="ri-map-pin-line"></i>
                                    <input type="text" id="editPickup" value="${job.pickup_location}" placeholder="e.g., Warehouse A, City">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Delivery Location</label>
                                <div class="input-icon">
                                    <i class="ri-map-pin-line"></i>
                                    <input type="text" id="editDelivery" value="${job.delivery_location}" placeholder="e.g., Store B, City">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Cargo Description</label>
                                <div class="input-icon">
                                    <i class="ri-package-line"></i>
                                    <input type="text" id="editCargo" value="${job.cargo_description}" placeholder="e.g., Electronics, Furniture">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Status</label>
                                <div class="input-icon">
                                    <i class="ri-eye-line"></i>
                                    <select id="editJobStatus">
                                        <option value="pending" ${job.status === 'pending' ? 'selected' : ''}>Pending</option>
                                        <option value="in_progress" ${job.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="completed" ${job.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Assign Truck</label>
                                <div class="input-icon">
                                    <i class="ri-truck-line"></i>
                                    <select id="editTruckId">
                                        <option value="">Select Truck</option>
                                        ${trucks.map(t => 
                                            `<option value="${t.id}" ${job.truck_id === t.id ? 'selected' : ''}>${t.registration_number} (${formatNumber(t.capacity)} kg) - ${t.status}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Assign Driver</label>
                                <div class="input-icon">
                                    <i class="ri-user-settings-line"></i>
                                    <select id="editDriverId">
                                        <option value="">Select Driver</option>
                                        ${drivers.map(d => 
                                            `<option value="${d.id}" ${job.driver_id === d.id ? 'selected' : ''}>${d.name} (${d.license_number}) - ${d.is_active ? 'Available' : 'On Job'}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="flex gap-3" style="display: flex; gap: 12px; margin-top: 24px;">
                                <button type="button" onclick="closeModal()" class="btn-secondary" style="flex: 1;">Cancel</button>
                                <button type="submit" class="btn-primary" style="flex: 1;">Update Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('editJobForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedData = {
                pickup_location: document.getElementById('editPickup').value,
                delivery_location: document.getElementById('editDelivery').value,
                cargo_description: document.getElementById('editCargo').value,
                status: document.getElementById('editJobStatus').value,
                truck_id: parseInt(document.getElementById('editTruckId').value),
                driver_id: parseInt(document.getElementById('editDriverId').value)
            };
            
            try {
                await JobAPI.update(id, updatedData);
                showNotification('✅ Job updated successfully!', 'success');
                closeModal();
                await loadJobs();
                if (typeof window.refreshDashboardNow === 'function') {
                    setTimeout(() => window.refreshDashboardNow(), 500);
                }
            } catch (error) {
                // Error already shown in apiCall, just close modal on certain errors
                if (error.message.includes('successfully')) {
                    closeModal();
                }
            }
        });
    } catch (error) {
        showNotification('Error loading job details', 'error');
    }
}

async function createJob() {
    const pickup = document.getElementById('jobPickup').value.trim();
    const delivery = document.getElementById('jobDelivery').value.trim();
    const cargo = document.getElementById('jobCargo').value.trim();
    const truckId = document.getElementById('jobTruck').value;
    const driverId = document.getElementById('jobDriver').value;
    
    // Validation
    if (!pickup || !delivery || !cargo || !truckId || !driverId) {
        showNotification('⚠️ Please fill in all fields before creating a job', 'warning');
        return;
    }
    
    // Show loading state on button
    const createBtn = event.target;
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Creating...';
    createBtn.disabled = true;
    
    try {
        await JobAPI.create({
            pickup_location: pickup,
            delivery_location: delivery,
            cargo_description: cargo,
            truck_id: parseInt(truckId),
            driver_id: parseInt(driverId)
        });
        
        showNotification('✅ Job created successfully! The truck and driver have been assigned.', 'success');
        
        // Clear form
        document.getElementById('jobPickup').value = '';
        document.getElementById('jobDelivery').value = '';
        document.getElementById('jobCargo').value = '';
        
        await loadJobs();
        
        if (typeof window.refreshDashboardNow === 'function') {
            setTimeout(() => window.refreshDashboardNow(), 500);
        }
        
    } catch (error) {
        // Error message already shown in apiCall
        console.error('Job creation failed:', error);
    } finally {
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
    }
}

async function deleteJob(id) {
    if (confirm('⚠️ Are you sure you want to delete this job? This action cannot be undone.')) {
        try {
            await JobAPI.delete(id);
            showNotification('✅ Job deleted successfully', 'success');
            await loadJobs();
            if (typeof window.refreshDashboardNow === 'function') {
                setTimeout(() => window.refreshDashboardNow(), 500);
            }
        } catch (error) {
            // Error already shown
        }
    }
}

async function completeJob(id) {
    if (confirm('✅ Mark this job as completed? This will free up the assigned truck and driver.')) {
        try {
            await JobAPI.update(id, { status: 'completed' });
            showNotification('✅ Job completed successfully! Truck and driver are now available for new assignments.', 'success');
            await loadJobs();
            if (typeof window.refreshDashboardNow === 'function') {
                setTimeout(() => window.refreshDashboardNow(), 500);
            }
        } catch (error) {
            // Error already shown
        }
    }
}

function closeModal() {
    const modal = document.getElementById('editJobModal');
    if (modal) modal.remove();
}
