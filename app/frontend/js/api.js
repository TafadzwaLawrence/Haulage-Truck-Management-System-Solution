let authToken = '';

function setAuthToken(token) {
    authToken = token;
}

function getAuthToken() {
    return authToken;
}

async function apiCall(endpoint, method, data = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    
    const response = await fetch(endpoint, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
    }
    return response.json();
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
