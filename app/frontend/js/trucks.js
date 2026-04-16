async function loadTrucks() {
    document.getElementById('truckForm').innerHTML = renderTruckForm();
    
    try {
        const trucks = await TruckAPI.getAll();
        const tableHtml = `
            <div class="card p-6">
                <h3 class="text-gray-900 font-semibold mb-4 text-base">Truck Fleet</h3>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>ID</th><th>Registration Number</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${trucks.map(truck => `
                                <tr>
                                    <td>${truck.id}</td>
                                    <td class="font-mono">${truck.registration_number}</td>
                                    <td>${formatNumber(truck.capacity)} kg</td>
                                    <td>${getStatusBadge(truck.status, 'truck')}</td>
                                    <td>
                                        <button onclick="editTruck(${truck.id})" class="text-blue-600 hover:text-blue-700 mr-2" title="Edit Truck">
                                            <i class="ri-edit-line text-lg"></i>
                                        </button>
                                        <button onclick="deleteTruck(${truck.id})" class="text-red-600 hover:text-red-700" title="Delete Truck">
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
        document.getElementById('trucksTable').innerHTML = tableHtml;
    } catch (error) {
        document.getElementById('trucksTable').innerHTML = '<div class="card p-6"><p class="text-red-600 text-center">Error loading trucks</p></div>';
    }
}

async function editTruck(id) {
    try {
        const truck = await TruckAPI.getById(id);
        
        // Create edit modal
        const modalHtml = `
            <div id="editTruckModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target === this) closeModal()">
                <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-gray-900">Edit Truck</h3>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>
                    <form id="editTruckForm">
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-medium mb-2">Registration Number</label>
                            <input type="text" id="editRegNumber" value="${truck.registration_number}" 
                                   class="w-full px-4 py-2 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-medium mb-2">Capacity (kg)</label>
                            <input type="number" id="editCapacity" value="${truck.capacity}" 
                                   class="w-full px-4 py-2 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-medium mb-2">Status</label>
                            <select id="editStatus" class="w-full px-4 py-2 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <option value="available" ${truck.status === 'available' ? 'selected' : ''}>Available</option>
                                <option value="in_transit" ${truck.status === 'in_transit' ? 'selected' : ''}>In Transit</option>
                                <option value="under_maintenance" ${truck.status === 'under_maintenance' ? 'selected' : ''}>Under Maintenance</option>
                            </select>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                                Update Truck
                            </button>
                        </div>
                    </form>
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