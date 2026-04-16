async function loadTrucks() {
    document.getElementById('truckForm').innerHTML = renderTruckForm();
    
    try {
        const trucks = await TruckAPI.getAll();
        document.getElementById('trucksTable').innerHTML = renderTrucksTable(trucks);
    } catch (error) {
        document.getElementById('trucksTable').innerHTML = '<div class="card p-6"><p class="text-red-600 text-center">Error loading trucks</p></div>';
    }
}

async function editTruck(id) {
    try {
        const truck = await TruckAPI.getById(id);
        
        const modalHtml = `
            <div id="editTruckModal" class="modal-overlay" onclick="if(event.target === this) closeModal()">
                <div class="modal-content">
                    <div class="card-header" style="border-bottom: 1px solid #f1f5f9;">
                        <h3>
                            <i class="ri-edit-line"></i>
                            Edit Truck
                        </h3>
                    </div>
                    <div style="padding: 24px;">
                        <form id="editTruckForm">
                            <div class="form-group">
                                <label class="required">Registration Number</label>
                                <div class="input-icon">
                                    <i class="ri-truck-line"></i>
                                    <input type="text" id="editRegNumber" value="${truck.registration_number}" placeholder="e.g., ABC-1234">
                                </div>
                                <div class="helper-text">
                                    <i class="ri-information-line"></i>
                                    <span>Unique vehicle identification number</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Capacity (kg)</label>
                                <div class="input-icon">
                                    <i class="ri-weight-line"></i>
                                    <input type="number" id="editCapacity" value="${truck.capacity}" placeholder="e.g., 10000">
                                </div>
                                <div class="helper-text">
                                    <i class="ri-information-line"></i>
                                    <span>Maximum load capacity in kilograms</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="required">Status</label>
                                <div class="input-icon">
                                    <i class="ri-eye-line"></i>
                                    <select id="editStatus">
                                        <option value="available" ${truck.status === 'available' ? 'selected' : ''}>Available</option>
                                        <option value="in_transit" ${truck.status === 'in_transit' ? 'selected' : ''}>In Transit</option>
                                        <option value="under_maintenance" ${truck.status === 'under_maintenance' ? 'selected' : ''}>Under Maintenance</option>
                                    </select>
                                </div>
                                <div class="helper-text">
                                    <i class="ri-information-line"></i>
                                    <span>Current operational status</span>
                                </div>
                            </div>
                            <div class="flex gap-3" style="display: flex; gap: 12px; margin-top: 24px;">
                                <button type="button" onclick="closeModal()" class="btn-secondary" style="flex: 1;">Cancel</button>
                                <button type="submit" class="btn-primary" style="flex: 1;">Update Truck</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('editTruckForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate inputs
            const regNumber = document.getElementById('editRegNumber').value.trim();
            const capacity = document.getElementById('editCapacity').value;
            
            if (!regNumber) {
                showNotification('⚠️ Please enter the truck registration number', 'warning');
                return;
            }
            
            if (!capacity || capacity <= 0) {
                showNotification('⚠️ Please enter a valid capacity (must be greater than 0)', 'warning');
                return;
            }
            
            const updatedData = {
                registration_number: regNumber,
                capacity: parseInt(capacity),
                status: document.getElementById('editStatus').value
            };
            
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Updating...';
            submitBtn.disabled = true;
            
            try {
                await TruckAPI.update(id, updatedData);
                showNotification('✅ Truck updated successfully!', 'success');
                closeModal();
                await loadTrucks();
                // Refresh dashboard
                if (typeof window.refreshDashboardNow === 'function') {
                    setTimeout(() => window.refreshDashboardNow(), 500);
                }
            } catch (error) {
                // Error already shown in apiCall
                console.error('Update failed:', error);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    } catch (error) {
        showNotification('Error loading truck details', 'error');
    }
}

async function createTruck() {
    const reg = document.getElementById('truckRegNumber').value.trim();
    const cap = document.getElementById('truckCapacity').value;
    
    // Validation
    if (!reg) {
        showNotification('⚠️ Please enter the truck registration number', 'warning');
        return;
    }
    
    if (!cap || cap <= 0) {
        showNotification('⚠️ Please enter a valid capacity (must be greater than 0)', 'warning');
        return;
    }
    
    // Check for duplicate registration number (basic validation)
    try {
        const existingTrucks = await TruckAPI.getAll();
        if (existingTrucks.some(truck => truck.registration_number.toLowerCase() === reg.toLowerCase())) {
            showNotification('⚠️ A truck with this registration number already exists. Please use a unique number.', 'warning');
            return;
        }
    } catch (error) {
        // Continue anyway, backend will handle duplicate
    }
    
    // Show loading state on button
    const createBtn = event.target;
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Adding...';
    createBtn.disabled = true;
    
    try {
        await TruckAPI.create({ 
            registration_number: reg, 
            capacity: parseInt(cap) 
        });
        
        showNotification('✅ Truck created successfully! The truck is now available for assignments.', 'success');
        
        // Clear form
        document.getElementById('truckRegNumber').value = '';
        document.getElementById('truckCapacity').value = '';
        
        await loadTrucks();
        
        // Refresh dashboard if visible
        if (typeof window.refreshDashboardNow === 'function') {
            setTimeout(() => window.refreshDashboardNow(), 500);
        }
        
    } catch (error) {
        // Error message already shown in apiCall
        console.error('Creation failed:', error);
    } finally {
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
    }
}

async function deleteTruck(id) {
    // Get truck details for confirmation message
    let truckReg = '';
    try {
        const truck = await TruckAPI.getById(id);
        truckReg = truck.registration_number;
    } catch (error) {
        truckReg = `#${id}`;
    }
    
    if (confirm(`⚠️ Are you sure you want to delete truck ${truckReg}? This action cannot be undone and will remove all associated data.`)) {
        // Show loading state on the delete button
        const deleteBtn = event.target;
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';
        deleteBtn.disabled = true;
        
        try {
            await TruckAPI.delete(id);
            showNotification('✅ Truck deleted successfully', 'success');
            await loadTrucks();
            
            // Refresh dashboard if visible
            if (typeof window.refreshDashboardNow === 'function') {
                setTimeout(() => window.refreshDashboardNow(), 500);
            }
        } catch (error) {
            // Error already shown
        } finally {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }
    }
}

function closeModal() {
    const modal = document.getElementById('editTruckModal');
    if (modal) modal.remove();
}

// Add keyboard shortcut for closing modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
