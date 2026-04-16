async function loadDrivers() {
    document.getElementById('driverForm').innerHTML = renderDriverForm();
    
    try {
        const drivers = await DriverAPI.getAll();
        document.getElementById('driversTable').innerHTML = renderDriversTable(drivers);
    } catch (error) {
        document.getElementById('driversTable').innerHTML = '<div class="card p-6"><p class="text-red-600 text-center">Error loading drivers</p></div>';
    }
}

async function editDriver(id) {
    try {
        const driver = await DriverAPI.getById(id);
        
        const modalHtml = `
            <div id="editDriverModal" class="modal-overlay" onclick="if(event.target === this) closeModal()">
                <div class="modal-content">
                    <div class="card-header" style="border-bottom: 1px solid #f1f5f9;">
                        <h3>
                            <i class="ri-edit-line"></i>
                            Edit Driver
                        </h3>
                    </div>
                    <div style="padding: 24px;">
                        <form id="editDriverForm">
                            <div class="form-group">
                                <label class="required">Full Name</label>
                                <div class="input-icon">
                                    <i class="ri-user-line"></i>
                                    <input type="text" id="editDriverName" value="${driver.name}" placeholder="e.g., John Doe">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">License Number</label>
                                <div class="input-icon">
                                    <i class="ri-id-card-line"></i>
                                    <input type="text" id="editLicenseNumber" value="${driver.license_number}" placeholder="e.g., LIC-12345">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Phone Number</label>
                                <div class="input-icon">
                                    <i class="ri-phone-line"></i>
                                    <input type="tel" id="editPhoneNumber" value="${driver.phone_number}" placeholder="e.g., +1 234 567 8900">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Status</label>
                                <div class="input-icon">
                                    <i class="ri-eye-line"></i>
                                    <select id="editDriverStatus">
                                        <option value="1" ${driver.is_active === 1 ? 'selected' : ''}>Available</option>
                                        <option value="0" ${driver.is_active === 0 ? 'selected' : ''}>On Job</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex gap-3" style="display: flex; gap: 12px; margin-top: 24px;">
                                <button type="button" onclick="closeModal()" class="btn-secondary" style="flex: 1;">Cancel</button>
                                <button type="submit" class="btn-primary" style="flex: 1;">Update Driver</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('editDriverForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedData = {
                name: document.getElementById('editDriverName').value,
                license_number: document.getElementById('editLicenseNumber').value,
                phone_number: document.getElementById('editPhoneNumber').value,
                is_active: parseInt(document.getElementById('editDriverStatus').value)
            };
            
            try {
                await DriverAPI.update(id, updatedData);
                showNotification('Driver updated successfully!', 'success');
                closeModal();
                await loadDrivers();
                if (typeof window.refreshDashboard === "function") window.refreshDashboard();
            } catch (error) {
                showNotification('Error updating driver: ' + error.message, 'error');
            }
        });
    } catch (error) {
        showNotification('Error loading driver details', 'error');
    }
}

async function createDriver() {
    const name = document.getElementById('driverName').value.trim();
    const license = document.getElementById('driverLicense').value.trim();
    const phone = document.getElementById('driverPhone').value.trim();
    
    if (!name || !license || !phone) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        await DriverAPI.create({ 
            name, 
            license_number: license, 
            phone_number: phone 
        });
        showNotification('Driver created successfully!', 'success');
        document.getElementById('driverName').value = '';
        document.getElementById('driverLicense').value = '';
        document.getElementById('driverPhone').value = '';
        await loadDrivers();
        if (typeof window.refreshDashboard === "function") window.refreshDashboard();
    } catch (error) {
        showNotification('Error creating driver: ' + error.message, 'error');
    }
}

async function deleteDriver(id) {
    if (confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
        try {
            await DriverAPI.delete(id);
            showNotification('Driver deleted successfully', 'success');
            await loadDrivers();
            if (typeof window.refreshDashboard === "function") window.refreshDashboard();
        } catch (error) {
            showNotification('Error deleting driver', 'error');
        }
    }
}

function closeModal() {
    const modal = document.getElementById('editDriverModal');
    if (modal) modal.remove();
}

async function refreshDashboardData() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection && !dashboardSection.classList.contains('hidden')) {
        if (typeof updateStats !== 'undefined') await updateStats();
        if (typeof loadCharts !== 'undefined') await loadCharts();
        if (typeof loadRecentActivity !== 'undefined') await loadRecentActivity();
    }
}
