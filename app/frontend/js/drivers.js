async function loadDrivers() {
    document.getElementById('driverForm').innerHTML = renderDriverForm();
    
    try {
        const drivers = await DriverAPI.getAll();
        const tableHtml = `
            <div class="card p-6">
                <h3 class="text-gray-900 font-semibold mb-4 text-base">Driver Roster</h3>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>License Number</th><th>Phone Number</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${drivers.map(driver => `
                                <tr>
                                    <td>${driver.id}</td>
                                    <td class="font-medium">${driver.name}</td>
                                    <td class="font-mono">${driver.license_number}</td>
                                    <td>${driver.phone_number}</td>
                                    <td>${driver.is_active ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-warning">On Job</span>'}</td>
                                    <td>
                                        <button onclick="editDriver(${driver.id})" class="text-blue-600 hover:text-blue-700 mr-2" title="Edit Driver">
                                            <i class="ri-edit-line text-lg"></i>
                                        </button>
                                        <button onclick="deleteDriver(${driver.id})" class="text-red-600 hover:text-red-700" title="Delete Driver">
                                            <i class="ri-delete-bin-line text-lg"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('driversTable').innerHTML = tableHtml;
    } catch (error) {
        document.getElementById('driversTable').innerHTML = '<div class="card p-6"><p class="text-red-600 text-center">Error loading drivers</p></div>';
    }
}

async function editDriver(id) {
    try {
        const driver = await DriverAPI.getById(id);
        
        // Create edit modal
        const modalHtml = `
            <div id="editDriverModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target === this) closeModal()">
                <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-gray-900">Edit Driver</h3>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>
                    <form id="editDriverForm">
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                            <input type="text" id="editDriverName" value="${driver.name}" 
                                   class="w-full px-4 py-2 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-medium mb-2">License Number</label>
                            <input type="text" id="editLicenseNumber" value="${driver.license_number}" 
                                   class="w-full px-4 py-2 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                            <input type="text" id="editPhoneNumber" value="${driver.phone_number}" 
                                   class="w-full px-4 py-2 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-medium mb-2">Status</label>
                            <select id="editDriverStatus" class="w-full px-4 py-2 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <option value="1" ${driver.is_active === 1 ? 'selected' : ''}>Available</option>
                                <option value="0" ${driver.is_active === 0 ? 'selected' : ''}>On Job</option>
                            </select>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                                Update Driver
                            </button>
                        </div>
                    </form>
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
                if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
                    await updateStats();
                }
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
        if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
            await updateStats();
        }
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
            if (!document.getElementById('dashboardSection').classList.contains('hidden')) {
                await updateStats();
            }
        } catch (error) {
            showNotification('Error deleting driver', 'error');
        }
    }
}

function closeModal() {
    const modal = document.getElementById('editDriverModal');
    if (modal) modal.remove();
}
