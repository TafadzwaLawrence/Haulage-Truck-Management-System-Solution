
async function loadDrivers() {
    document.getElementById('driverForm').innerHTML = renderDriverForm();
    try {
        const drivers = await DriverAPI.getAll();
        document.getElementById('driversTable').innerHTML = renderDriversTable(drivers);
    } catch (error) {
        document.getElementById('driversTable').innerHTML = '<div class="card p-6"><p class="text-red-600">Error loading drivers</p></div>';
    }
}

async function editDriver(id) {
    try {
        const driver = await DriverAPI.getById(id);
        const modalHtml = `
            <div id="editDriverModal" class="modal-overlay" onclick="if(event.target===this) closeModal()">
                <div class="modal-content"><div class="card-header"><h3><i class="ri-edit-line"></i> Edit Driver</h3></div>
                <div style="padding:24px"><form id="editDriverForm">
                    <div class="form-group"><label>Full Name</label><input type="text" id="editDriverName" value="${driver.name}"></div>
                    <div class="form-group"><label>License Number</label><input type="text" id="editLicenseNumber" value="${driver.license_number}"></div>
                    <div class="form-group"><label>Phone Number</label><input type="text" id="editPhoneNumber" value="${driver.phone_number}"></div>
                    <div class="form-group"><label>Status</label><select id="editDriverStatus"><option value="1" ${driver.is_active===1?'selected':''}>Available</option><option value="0" ${driver.is_active===0?'selected':''}>On Job</option></select></div>
                    <div class="flex gap-3"><button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancel</button><button type="submit" class="btn-primary flex-1">Update Driver</button></div>
                </form></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('editDriverForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updated = {
                name: document.getElementById('editDriverName').value,
                license_number: document.getElementById('editLicenseNumber').value,
                phone_number: document.getElementById('editPhoneNumber').value,
                is_active: parseInt(document.getElementById('editDriverStatus').value)
            };
            try {
                await DriverAPI.update(id, updated);
                showNotification('✅ Driver updated', 'success');
                closeModal();
                await loadDrivers();
                window.forceRefresh();
            } catch (error) { showNotification('Error updating driver', 'error'); }
        });
    } catch (error) { showNotification('Error loading driver', 'error'); }
}

async function createDriver(event) {
    if (event && event.preventDefault) event.preventDefault();
    const name = document.getElementById('driverName').value.trim();
    const license = document.getElementById('driverLicense').value.trim();
    const phone = document.getElementById('driverPhone').value.trim();
    if (!name || !license || !phone) { showNotification('Please fill all fields', 'warning'); return; }
    const btn = document.querySelector('#driverForm button.btn-primary');
    const original = btn ? btn.innerHTML : 'Add Driver';
    if (btn) { btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Adding...'; btn.disabled = true; }
    try {
        await DriverAPI.create({ name, license_number: license, phone_number: phone });
        showNotification('✅ Driver created', 'success');
        document.getElementById('driverName').value = '';
        document.getElementById('driverLicense').value = '';
        document.getElementById('driverPhone').value = '';
        await loadDrivers();
        window.forceRefresh();
    } catch (error) { showNotification('Error creating driver', 'error'); }
    finally { if (btn) { btn.innerHTML = original; btn.disabled = false; } }
}

async function deleteDriver(id) {
    if (!confirm('Delete this driver?')) return;
    try {
        await DriverAPI.delete(id);
        showNotification('✅ Driver deleted', 'success');
        await loadDrivers();
        window.forceRefresh();
    } catch (error) { showNotification('Error deleting driver', 'error'); }
}

function closeModal() { const modal = document.getElementById('editDriverModal'); if (modal) modal.remove(); }
