function renderSidebar() {
    return `
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <i class="ri-truck-line text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-gray-900 font-bold text-lg">Haulage MS</h1>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-nav">
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
                    <i class="ri-task-line"></i>
                    <span>Jobs</span>
                </a>
            </div>
            
            <div class="sidebar-footer">
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
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="ri-truck-line"></i>
                </div>
                <div class="stat-label">Total Trucks</div>
                <div class="stat-value">${stats.trucks}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon purple">
                    <i class="ri-user-settings-line"></i>
                </div>
                <div class="stat-label">Total Drivers</div>
                <div class="stat-value">${stats.drivers}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon yellow">
                    <i class="ri-delivery-line"></i>
                </div>
                <div class="stat-label">Active Jobs</div>
                <div class="stat-value">${stats.activeJobs}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="ri-checkbox-circle-line"></i>
                </div>
                <div class="stat-label">Completed Jobs</div>
                <div class="stat-value">${stats.completedJobs}</div>
            </div>
        </div>
    `;
}

function renderTruckForm() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>
                    <i class="ri-add-line"></i>
                    Add New Truck
                </h3>
            </div>
            <div class="card-body">
                <div class="form-grid-3">
                    <div class="form-group">
                        <label class="required">Registration Number</label>
                        <div class="input-icon">
                            <i class="ri-truck-line"></i>
                            <input type="text" id="truckRegNumber" placeholder="e.g., ABC-1234" autocomplete="off">
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
                            <input type="number" id="truckCapacity" placeholder="e.g., 10000" autocomplete="off">
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Maximum load capacity in kilograms</span>
                        </div>
                    </div>
                    <div>
                        <button onclick="createTruck()" class="btn-primary" style="width: 100%; margin-top: 24px;">
                            <i class="ri-add-line"></i> Add Truck
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDriverForm() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>
                    <i class="ri-add-line"></i>
                    Add New Driver
                </h3>
            </div>
            <div class="card-body">
                <div class="form-grid-4">
                    <div class="form-group">
                        <label class="required">Full Name</label>
                        <div class="input-icon">
                            <i class="ri-user-line"></i>
                            <input type="text" id="driverName" placeholder="e.g., John Doe" autocomplete="off">
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Driver's full legal name</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="required">License Number</label>
                        <div class="input-icon">
                            <i class="ri-id-card-line"></i>
                            <input type="text" id="driverLicense" placeholder="e.g., LIC-12345" autocomplete="off">
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Valid commercial driver's license</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="required">Phone Number</label>
                        <div class="input-icon">
                            <i class="ri-phone-line"></i>
                            <input type="tel" id="driverPhone" placeholder="e.g., +1 234 567 8900" autocomplete="off">
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Emergency contact number</span>
                        </div>
                    </div>
                    <div>
                        <button onclick="createDriver()" class="btn-primary" style="width: 100%; margin-top: 24px;">
                            <i class="ri-add-line"></i> Add Driver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderJobForm(trucks, drivers) {
    const availableTrucks = trucks.filter(t => t.status === 'available');
    const availableDrivers = drivers.filter(d => d.is_active);
    
    return `
        <div class="card">
            <div class="card-header">
                <h3>
                    <i class="ri-add-line"></i>
                    Create New Delivery Job
                </h3>
            </div>
            <div class="card-body">
                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="required">Pickup Location</label>
                        <div class="input-icon">
                            <i class="ri-map-pin-line"></i>
                            <input type="text" id="jobPickup" placeholder="e.g., Warehouse A, City" autocomplete="off">
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Where to pick up the cargo</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="required">Delivery Location</label>
                        <div class="input-icon">
                            <i class="ri-map-pin-line"></i>
                            <input type="text" id="jobDelivery" placeholder="e.g., Store B, City" autocomplete="off">
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Where to deliver the cargo</span>
                        </div>
                    </div>
                </div>
                <div class="form-grid-3">
                    <div class="form-group">
                        <label class="required">Cargo Description</label>
                        <div class="input-icon">
                            <i class="ri-package-line"></i>
                            <input type="text" id="jobCargo" placeholder="e.g., Electronics, Furniture" autocomplete="off">
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Type of goods being transported</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="required">Assign Truck</label>
                        <div class="input-icon">
                            <i class="ri-truck-line"></i>
                            <select id="jobTruck">
                                <option value="">Select Truck</option>
                                ${availableTrucks.map(t => 
                                    `<option value="${t.id}">${t.registration_number} (${formatNumber(t.capacity)} kg)</option>`
                                ).join('')}
                                ${availableTrucks.length === 0 ? '<option disabled>No available trucks</option>' : ''}
                            </select>
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Only available trucks are shown</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="required">Assign Driver</label>
                        <div class="input-icon">
                            <i class="ri-user-settings-line"></i>
                            <select id="jobDriver">
                                <option value="">Select Driver</option>
                                ${availableDrivers.map(d => 
                                    `<option value="${d.id}">${d.name} (${d.license_number})</option>`
                                ).join('')}
                                ${availableDrivers.length === 0 ? '<option disabled>No available drivers</option>' : ''}
                            </select>
                        </div>
                        <div class="helper-text">
                            <i class="ri-information-line"></i>
                            <span>Only available drivers are shown</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                    <button onclick="createJob()" class="btn-primary">
                        <i class="ri-add-line"></i> Create Job
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderTrucksTable(trucks) {
    return `
        <div class="card">
            <div class="card-header">
                <h3>
                    <i class="ri-truck-line"></i>
                    Truck Fleet
                </h3>
            </div>
            <div class="table-container">
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
                                    <div class="action-buttons">
                                        <button onclick="editTruck(${truck.id})" class="btn-icon" title="Edit Truck">
                                            <i class="ri-edit-line"></i>
                                        </button>
                                        <button onclick="deleteTruck(${truck.id})" class="btn-icon danger" title="Delete Truck">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderDriversTable(drivers) {
    return `
        <div class="card">
            <div class="card-header">
                <h3>
                    <i class="ri-user-settings-line"></i>
                    Driver Roster
                </h3>
            </div>
            <div class="table-container">
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
                                    <div class="action-buttons">
                                        <button onclick="editDriver(${driver.id})" class="btn-icon" title="Edit Driver">
                                            <i class="ri-edit-line"></i>
                                        </button>
                                        <button onclick="deleteDriver(${driver.id})" class="btn-icon danger" title="Delete Driver">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderJobsTable(jobs) {
    return `
        <div class="card">
            <div class="card-header">
                <h3>
                    <i class="ri-task-line"></i>
                    Active & Completed Jobs
                </h3>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr><th>ID</th><th>Pickup Location</th><th>Delivery Location</th><th>Cargo</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${jobs.map(job => `
                            <tr>
                                <td>${job.id}</td>
                                <td>${job.pickup_location}</td>
                                <td>${job.delivery_location}</td>
                                <td>${job.cargo_description}</td>
                                <td>${getStatusBadge(job.status, 'job')}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button onclick="editJob(${job.id})" class="btn-icon" style="color: #3b82f6;" title="Edit Job">
                                            <i class="ri-edit-line"></i>
                                        </button>
                                        ${job.status !== 'completed' ? `
                                            <button onclick="completeJob(${job.id})" class="btn-icon" style="color: #10b981;" title="Complete Job">
                                                <i class="ri-check-line"></i>
                                            </button>
                                        ` : ''}
                                        <button onclick="deleteJob(${job.id})" class="btn-icon danger" title="Delete Job">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
