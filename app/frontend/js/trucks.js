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
                    <div class="card-header"><h3><i class="ri-edit-line"></i> Edit Truck</h3></div>
                    <div style="padding:24px">
                        <form id="editTruckForm">
                            <div class="form-group"><label>Registration Number</label><div class="input-icon"><i class="ri-truck-line"></i><input type="text" id="editRegNumber" value="${truck.registration_number}"></div></div>
                            <div class="form-group"><label>Capacity (kg)</label><div class="input-icon"><i class="ri-weight-line"></i><input type="number" id="editCapacity" value="${truck.capacity}"></div></div>
                            <div class="form-group"><label>Status</label><div class="input-icon"><i class="ri-eye-line"></i><select id="editStatus"><option value="available" ${truck.status==='available'?'selected':''}>Available</option><option value="in_transit" ${truck.status==='in_transit'?'selected':''}>In Transit</option><option value="under_maintenance" ${truck.status==='under_maintenance'?'selected':''}>Under Maintenance</option></select></div></div>
                            <div class="flex gap-3"><button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancel</button><button type="submit" class="btn-primary flex-1">Update Truck</button></div>
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
                showNotification('✅ Truck updated', 'success');
                closeModal();
                await loadTrucks();
                window.forceRefresh();   // 🔄 Refresh all UI components
            } catch (error) { showNotification('Error updating truck', 'error'); }
        });
    } catch (error) { showNotification('Error loading truck details', 'error'); }
}

async function createTruck(event) {
    if (event && event.preventDefault) event.preventDefault();
    const reg = document.getElementById('truckRegNumber').value.trim();
    const cap = document.getElementById('truckCapacity').value;
    if (!reg || !cap || cap <= 0) {
        showNotification('Please fill all fields correctly', 'warning');
        return;
    }
    const btn = document.querySelector('#truckForm button.btn-primary');
    const original = btn ? btn.innerHTML : 'Add Truck';
    if (btn) { btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Adding...'; btn.disabled = true; }
    try {
        await TruckAPI.create({ registration_number: reg, capacity: parseInt(cap) });
        showNotification('✅ Truck created', 'success');
        document.getElementById('truckRegNumber').value = '';
        document.getElementById('truckCapacity').value = '';
        await loadTrucks();
        window.forceRefresh();   // 🔄 Refresh all UI components
    } catch (error) { showNotification('Error creating truck', 'error'); }
    finally { if (btn) { btn.innerHTML = original; btn.disabled = false; } }
}

async function deleteTruck(id) {
    if (!confirm('Delete this truck? This action cannot be undone.')) return;
    try {
        await TruckAPI.delete(id);
        showNotification('✅ Truck deleted', 'success');
        await loadTrucks();
        window.forceRefresh();   // 🔄 Refresh all UI components
    } catch (error) { showNotification('Error deleting truck', 'error'); }
}

function closeModal() { const modal = document.getElementById('editTruckModal'); if (modal) modal.remove(); }
