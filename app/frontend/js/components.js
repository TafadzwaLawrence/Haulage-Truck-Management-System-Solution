// UI Components - Whitespace Design

function renderSidebar() {
    return `
        <div class="sidebar">
            <div class="p-6">
                <div class="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                    <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <i class="ri-truck-line text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-gray-900 font-semibold text-lg">Haulage MS</h1>
                        <p class="text-gray-500 text-xs">Enterprise Fleet</p>
                    </div>
                </div>
                
                <nav class="space-y-1">
                    <a href="#" onclick="showSection('dashboard'); return false;" 
                       class="nav-item active">
                        <i class="ri-dashboard-line"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" onclick="showSection('trucks'); loadTrucks(); return false;" 
                       class="nav-item">
                        <i class="ri-truck-line"></i>
                        <span>Trucks</span>
                    </a>
                    <a href="#" onclick="showSection('drivers'); loadDrivers(); return false;" 
                       class="nav-item">
                        <i class="ri-user-settings-line"></i>
                        <span>Drivers</span>
                    </a>
                    <a href="#" onclick="showSection('jobs'); loadJobs(); return false;" 
                       class="nav-item">
                        <i class="ri-delivery-line"></i>
                        <span>Jobs</span>
                    </a>
                </nav>
            </div>
            
            <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
                <div class="mb-4 p-3 bg-gray-50 rounded-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="ri-user-line text-blue-600 text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-gray-900 text-sm font-medium">Admin User</p>
                            <p class="text-gray-500 text-xs">Administrator</p>
                        </div>
                    </div>
                </div>
                <button onclick="logout()" class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
                    <i class="ri-logout-box-line text-lg"></i>
                    <span class="text-sm">Logout</span>
                </button>
            </div>
        </div>
    `;
}

function renderPageHeader(title, subtitle) {
    return `
        <div class="page-header">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>
    `;
}

function renderStatsCards(stats) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div class="stat-card">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <i class="ri-truck-line text-blue-600 text-xl"></i>
                    </div>
                    <i class="ri-more-2-fill text-gray-400"></i>
                </div>
                <p class="text-gray-500 text-sm mb-1">Total Trucks</p>
                <p class="text-gray-900 text-3xl font-semibold">${stats.trucks}</p>
            </div>
            
            <div class="stat-card">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <i class="ri-user-settings-line text-purple-600 text-xl"></i>
                    </div>
                    <i class="ri-more-2-fill text-gray-400"></i>
                </div>
                <p class="text-gray-500 text-sm mb-1">Total Drivers</p>
                <p class="text-gray-900 text-3xl font-semibold">${stats.drivers}</p>
            </div>
            
            <div class="stat-card">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <i class="ri-delivery-line text-yellow-600 text-xl"></i>
                    </div>
                    <i class="ri-more-2-fill text-gray-400"></i>
                </div>
                <p class="text-gray-500 text-sm mb-1">Active Jobs</p>
                <p class="text-gray-900 text-3xl font-semibold">${stats.activeJobs}</p>
            </div>
            
            <div class="stat-card">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <i class="ri-checkbox-circle-line text-green-600 text-xl"></i>
                    </div>
                    <i class="ri-more-2-fill text-gray-400"></i>
                </div>
                <p class="text-gray-500 text-sm mb-1">Completed Jobs</p>
                <p class="text-gray-900 text-3xl font-semibold">${stats.completedJobs}</p>
            </div>
        </div>
    `;
}

function renderTruckForm() {
    return `
        <div class="card p-6 mb-6">
            <h3 class="text-gray-900 font-semibold text-lg mb-4 flex items-center gap-2">
                <i class="ri-add-line text-blue-600"></i>
                Add New Truck
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-group">
                    <label>Registration Number</label>
                    <input type="text" id="truckRegNumber" placeholder="e.g., ABC-1234" 
                           class="w-full rounded-xl">
                </div>
                <div class="form-group">
                    <label>Capacity (kg)</label>
                    <input type="number" id="truckCapacity" placeholder="e.g., 10000" 
                           class="w-full rounded-xl">
                </div>
                <div class="flex items-end">
                    <button onclick="createTruck()" class="btn-primary w-full justify-center">
                        <i class="ri-add-line"></i> Add Truck
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderDriverForm() {
    return `
        <div class="card p-6 mb-6">
            <h3 class="text-gray-900 font-semibold text-lg mb-4 flex items-center gap-2">
                <i class="ri-add-line text-blue-600"></i>
                Add New Driver
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="driverName" placeholder="e.g., John Doe" 
                           class="w-full rounded-xl">
                </div>
                <div class="form-group">
                    <label>License Number</label>
                    <input type="text" id="driverLicense" placeholder="e.g., LIC-12345" 
                           class="w-full rounded-xl">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="driverPhone" placeholder="e.g., +1234567890" 
                           class="w-full rounded-xl">
                </div>
                <div class="flex items-end">
                    <button onclick="createDriver()" class="btn-primary w-full justify-center">
                        <i class="ri-add-line"></i> Add Driver
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderJobForm(trucks, drivers) {
    const availableTrucks = trucks.filter(t => t.status === 'available');
    const availableDrivers = drivers.filter(d => d.is_active);
    
    return `
        <div class="card p-6 mb-6">
            <h3 class="text-gray-900 font-semibold text-lg mb-4 flex items-center gap-2">
                <i class="ri-add-line text-blue-600"></i>
                Create New Delivery Job
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="form-group">
                    <label>Pickup Location</label>
                    <input type="text" id="jobPickup" placeholder="e.g., Warehouse A, City" 
                           class="w-full rounded-xl">
                </div>
                <div class="form-group">
                    <label>Delivery Location</label>
                    <input type="text" id="jobDelivery" placeholder="e.g., Store B, City" 
                           class="w-full rounded-xl">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="form-group">
                    <label>Cargo Description</label>
                    <input type="text" id="jobCargo" placeholder="e.g., Electronics, Furniture" 
                           class="w-full rounded-xl">
                </div>
                <div class="form-group">
                    <label>Assign Truck</label>
                    <select id="jobTruck" class="w-full rounded-xl">
                        <option value="">Select Truck</option>
                        ${availableTrucks.map(t => 
                            `<option value="${t.id}">${t.registration_number} (${formatNumber(t.capacity)} kg) - ${t.status}</option>`
                        ).join('')}
                        ${availableTrucks.length === 0 ? '<option disabled>No available trucks</option>' : ''}
                    </select>
                </div>
                <div class="form-group">
                    <label>Assign Driver</label>
                    <select id="jobDriver" class="w-full rounded-xl">
                        <option value="">Select Driver</option>
                        ${availableDrivers.map(d => 
                            `<option value="${d.id}">${d.name} (${d.license_number})</option>`
                        ).join('')}
                        ${availableDrivers.length === 0 ? '<option disabled>No available drivers</option>' : ''}
                    </select>
                </div>
            </div>
            <div class="flex justify-end">
                <button onclick="createJob()" class="btn-primary px-6 py-2.5">
                    <i class="ri-add-line"></i> Create Job
                </button>
            </div>
        </div>
    `;
}
