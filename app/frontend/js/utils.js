// Utility functions for the application

function showNotification(message, type) {
    const colors = { 
        success: '#10b981', 
        error: '#ef4444', 
        info: '#3b82f6' 
    };
    
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg toast-notification flex items-center gap-2`;
    toast.style.backgroundColor = colors[type];
    toast.style.color = 'white';
    toast.innerHTML = `<i class="ri-${type === 'success' ? 'checkbox-circle' : type === 'error' ? 'error-warning' : 'information'}-line text-lg"></i><span class="text-sm">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getStatusBadge(status, type) {
    const badges = {
        truck: {
            'available': 'badge-success',
            'in_transit': 'badge-warning',
            'under_maintenance': 'badge-danger'
        },
        job: {
            'pending': 'badge-info',
            'in_progress': 'badge-warning',
            'completed': 'badge-success'
        },
        driver: {
            'active': 'badge-success',
            'busy': 'badge-warning'
        }
    };
    
    const displayStatus = status.replace('_', ' ');
    const badgeClass = badges[type]?.[status] || 'badge-info';
    return `<span class="badge ${badgeClass}">${displayStatus}</span>`;
}