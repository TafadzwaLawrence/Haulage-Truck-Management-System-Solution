async function loadJobs() {
    try {
        const [trucks, drivers, jobs] = await Promise.all([TruckAPI.getAll(), DriverAPI.getAll(), JobAPI.getAll()]);
        document.getElementById('jobForm').innerHTML = renderJobForm(trucks, drivers);
        document.getElementById('jobsTable').innerHTML = renderJobsTable(jobs);
    } catch (error) {
        document.getElementById('jobsTable').innerHTML = '<div class="card p-6"><p class="text-red-600">Error loading jobs</p></div>';
    }
}

async function editJob(id) {
    try {
        const [job, trucks, drivers] = await Promise.all([JobAPI.getById(id), TruckAPI.getAll(), DriverAPI.getAll()]);
        const modalHtml = `
            <div id="editJobModal" class="modal-overlay" onclick="if(event.target===this) closeModal()">
                <div class="modal-content"><div class="card-header"><h3><i class="ri-edit-line"></i> Edit Job</h3></div>
                <div style="padding:24px"><form id="editJobForm">
                    <div class="form-group"><label>Pickup</label><input type="text" id="editPickup" value="${job.pickup_location}"></div>
                    <div class="form-group"><label>Delivery</label><input type="text" id="editDelivery" value="${job.delivery_location}"></div>
                    <div class="form-group"><label>Cargo</label><input type="text" id="editCargo" value="${job.cargo_description}"></div>
                    <div class="form-group"><label>Status</label>
                        <select id="editJobStatus">
                            <option value="pending" ${job.status==='pending'?'selected':''}>Pending</option>
                            <option value="in_progress" ${job.status==='in_progress'?'selected':''}>In Progress</option>
                            <option value="completed" ${job.status==='completed'?'selected':''}>Completed</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Truck</label><select id="editTruckId">${trucks.map(t=>`<option value="${t.id}" ${job.truck_id===t.id?'selected':''}>${t.registration_number}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Driver</label><select id="editDriverId">${drivers.map(d=>`<option value="${d.id}" ${job.driver_id===d.id?'selected':''}>${d.name}</option>`).join('')}</select></div>
                    <div class="flex gap-3"><button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancel</button><button type="submit" class="btn-primary flex-1">Update Job</button></div>
                </form></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('editJobForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updated = {
                pickup_location: document.getElementById('editPickup').value,
                delivery_location: document.getElementById('editDelivery').value,
                cargo_description: document.getElementById('editCargo').value,
                status: document.getElementById('editJobStatus').value,
                truck_id: parseInt(document.getElementById('editTruckId').value),
                driver_id: parseInt(document.getElementById('editDriverId').value)
            };
            try {
                await JobAPI.update(id, updated);
                showNotification('✅ Job updated', 'success');
                closeModal();
                await loadJobs();
                if (typeof window.forceRefresh === 'function') window.forceRefresh();
            } catch (error) { showNotification('Error updating job', 'error'); }
        });
    } catch (error) { showNotification('Error loading job', 'error'); }
}

async function createJob(event) {
    if (event && event.preventDefault) event.preventDefault();
    const pickup = document.getElementById('jobPickup').value.trim();
    const delivery = document.getElementById('jobDelivery').value.trim();
    const cargo = document.getElementById('jobCargo').value.trim();
    const truckId = document.getElementById('jobTruck').value;
    const driverId = document.getElementById('jobDriver').value;
    if (!pickup || !delivery || !cargo || !truckId || !driverId) {
        showNotification('Please fill all fields', 'warning');
        return;
    }
    const btn = document.querySelector('#jobForm button.btn-primary');
    const original = btn ? btn.innerHTML : 'Create Job';
    if (btn) { btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Creating...'; btn.disabled = true; }
    try {
        await JobAPI.create({ pickup_location: pickup, delivery_location: delivery, cargo_description: cargo, truck_id: parseInt(truckId), driver_id: parseInt(driverId) });
        showNotification('✅ Job created', 'success');
        document.getElementById('jobPickup').value = '';
        document.getElementById('jobDelivery').value = '';
        document.getElementById('jobCargo').value = '';
        await loadJobs();
        if (typeof window.forceRefresh === 'function') window.forceRefresh();
    } catch (error) { showNotification('Error creating job', 'error'); }
    finally { if (btn) { btn.innerHTML = original; btn.disabled = false; } }
}

async function deleteJob(id) {
    if (!confirm('Delete this job?')) return;
    try {
        await JobAPI.delete(id);
        showNotification('✅ Job deleted', 'success');
        await loadJobs();
        if (typeof window.forceRefresh === 'function') window.forceRefresh();
    } catch (error) { showNotification('Error deleting job', 'error'); }
}

async function completeJob(id) {
    if (!confirm('Mark this job as completed?')) return;
    try {
        await JobAPI.update(id, { status: 'completed' });
        showNotification('✅ Job completed! Resources freed.', 'success');
        await loadJobs();
        if (typeof window.forceRefresh === 'function') window.forceRefresh();
    } catch (error) { showNotification('Error completing job', 'error'); }
}

function closeModal() { const modal = document.getElementById('editJobModal'); if (modal) modal.remove(); }
