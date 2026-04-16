function showNotification(message, type) {
    const colors = { 
        success: '#10b981', 
        error: '#ef4444', 
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const icons = {
        success: 'ri-checkbox-circle-line',
        error: 'ri-error-warning-line',
        info: 'ri-information-line',
        warning: 'ri-alert-line'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-notification`;
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.style.color = 'white';
    toast.style.padding = '14px 20px';
    toast.style.borderRadius = '12px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.maxWidth = '400px';
    toast.style.minWidth = '300px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.zIndex = '10000';
    toast.innerHTML = `<i class="${icons[type] || icons.info}" style="font-size: 20px;"></i><span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds for errors, 3 seconds for success
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
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

// Make functions available globally
window.showNotification = showNotification;