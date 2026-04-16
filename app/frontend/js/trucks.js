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
            const updatedData = {
                registration_number: document.getElementById('editRegNumber').value,
                capacity: parseInt(document.getElementById('editCapacity').value),
                status: document.getElementById('editStatus').value
            };
            
            try {
                await TruckAPI.update(id, updatedData);
                showNotification('Truck updated successfully!', 'success');
                closeModal();
                await loadTrucks();
                if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
                    await updateStats();
                    await loadCharts();
                }
            } catch (error) {
                showNotification('Error updating truck: ' + error.message, 'error');
            }
        });
    } catch (error) {
        showNotification('Error loading truck details', 'error');
    }
}

async function createTruck() {
    const reg = document.getElementById('truckRegNumber').value.trim();
    const cap = document.getElementById('truckCapacity').value;
    
    if (!reg || !cap) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        await TruckAPI.create({ 
            registration_number: reg, 
            capacity: parseInt(cap) 
        });
        showNotification('Truck created successfully!', 'success');
        document.getElementById('truckRegNumber').value = '';
        document.getElementById('truckCapacity').value = '';
        await loadTrucks();
        if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
            await updateStats();
            await loadCharts();
        }
    } catch (error) {
        showNotification('Error creating truck: ' + error.message, 'error');
    }
}

async function deleteTruck(id) {
    if (confirm('Are you sure you want to delete this truck? This action cannot be undone.')) {
        try {
            await TruckAPI.delete(id);
            showNotification('Truck deleted successfully', 'success');
            await loadTrucks();
            if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
                await updateStats();
                await loadCharts();
            }
        } catch (error) {
            showNotification('Error deleting truck', 'error');
        }
    }
}

function closeModal() {
    const modal = document.getElementById('editTruckModal');
    if (modal) modal.remove();
}
