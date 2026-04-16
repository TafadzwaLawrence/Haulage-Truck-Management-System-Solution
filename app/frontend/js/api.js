let authToken = localStorage.getItem('authToken') || '';

function setAuthToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
}

function getAuthToken() {
    return authToken;
}

// Friendly error messages mapping
function getFriendlyErrorMessage(errorDetail) {
    const errorMessages = {
        'Driver already has an active job': '❌ This driver is currently assigned to another active job. Please select a different driver or wait for the current job to complete.',
        'Truck not available for assignment': '❌ This truck is currently in transit or under maintenance. Please select an available truck.',
        'Truck not available': '❌ This truck is currently in transit or under maintenance. Please select an available truck.',
        'Driver not found': '❌ Driver not found. Please select a valid driver.',
        'Truck not found': '❌ Truck not found. Please select a valid truck.',
        'duplicate key value violates unique constraint': '❌ A record with this information already exists. Please use unique values.',
        'already exists': '❌ This record already exists in the system.',
        'not found': '❌ The requested item could not be found.',
        'Invalid credentials': '❌ Invalid username or password. Please try again.',
        'Unauthorized': '🔒 Your session has expired. Please login again.',
        'Network Error': '🌐 Network error. Please check your internet connection.'
    };
    
    // Check for exact match
    if (errorMessages[errorDetail]) {
        return errorMessages[errorDetail];
    }
    
    // Check for partial matches
    for (const [key, message] of Object.entries(errorMessages)) {
        if (errorDetail.toLowerCase().includes(key.toLowerCase())) {
            return message;
        }
    }
    
    // Return formatted original error
    return `❌ ${errorDetail}`;
}

async function apiCall(endpoint, method, data = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    
    try {
        const response = await fetch(endpoint, {
            method,
            headers,
            body: data ? JSON.stringify(data) : null
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            authToken = '';
            showNotification('🔒 Your session has expired. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            let errorMessage = '';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || JSON.stringify(errorData);
            } catch (e) {
                errorMessage = await response.text();
            }
            
            const friendlyMessage = getFriendlyErrorMessage(errorMessage);
            showNotification(friendlyMessage, 'error');
            throw new Error(friendlyMessage);
        }
        
        return response.json();
    } catch (error) {
        if (error.message !== 'Session expired') {
            // Re-throw to be handled by specific functions if needed
            throw error;
        }
    }
}

// Truck API
const TruckAPI = {
    getAll: () => apiCall('/trucks/', 'GET'),
    getById: (id) => apiCall(`/trucks/${id}`, 'GET'),
    create: (data) => apiCall('/trucks/', 'POST', data),
    update: (id, data) => apiCall(`/trucks/${id}`, 'PUT', data),
    delete: (id) => apiCall(`/trucks/${id}`, 'DELETE')
};

// Driver API
const DriverAPI = {
    getAll: () => apiCall('/drivers/', 'GET'),
    getById: (id) => apiCall(`/drivers/${id}`, 'GET'),
    create: (data) => apiCall('/drivers/', 'POST', data),
    update: (id, data) => apiCall(`/drivers/${id}`, 'PUT', data),
    delete: (id) => apiCall(`/drivers/${id}`, 'DELETE')
};

// Job API
const JobAPI = {
    getAll: () => apiCall('/jobs/', 'GET'),
    getById: (id) => apiCall(`/jobs/${id}`, 'GET'),
    create: (data) => apiCall('/jobs/', 'POST', data),
    update: (id, data) => apiCall(`/jobs/${id}`, 'PUT', data),
    delete: (id) => apiCall(`/jobs/${id}`, 'DELETE')
};

// Auth API
const AuthAPI = {
    login: (username, password) => apiCall('/auth/token', 'POST', { username, password })
};

// Make functions available globally
window.setAuthToken = setAuthToken;
window.getAuthToken = getAuthToken;