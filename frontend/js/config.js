// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Endpoints
const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    
    // Items
    ITEMS: `${API_BASE_URL}/items`,
    
    // Sales
    SALES: `${API_BASE_URL}/sales`,
    
    // Dashboard
    DASHBOARD: `${API_BASE_URL}/dashboard/metrics`,
    
    // Reports
    REPORTS: `${API_BASE_URL}/reports`,
    REPORTS_EXPORT: `${API_BASE_URL}/reports/export`
};

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to get auth headers
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return !!getAuthToken();
}

// Helper function to get user data
function getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Helper function to logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
