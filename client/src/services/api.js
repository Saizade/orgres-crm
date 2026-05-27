import axios from 'axios';

const API_BASE_URL =
    import.meta.env.PROD ?
    'https://orgres-crm-api.onrender.com/api' :
    'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('crm_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("crm_token");
            localStorage.removeItem("crm_user");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Customer API
export const customerAPI = {
    getAll: () => api.get('/customers'),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
};

// Lead API
export const leadAPI = {
    getAll: () => api.get('/leads'),
    getById: (id) => api.get(`/leads/${id}`),
    create: (data) => api.post('/leads', data),
    update: (id, data) => api.put(`/leads/${id}`, data),
    delete: (id) => api.delete(`/leads/${id}`),
};

// Task API
export const taskAPI = {
    getAll: () => api.get('/tasks'),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
};

// Note API
export const noteAPI = {
    getAll: (params) => api.get('/notes', { params }),
    create: (data) => api.post('/notes', data),
    delete: (id) => api.delete(`/notes/${id}`),
};

// AI API
export const aiAPI = {
    generateEmail: (data) => api.post('/ai/generate-email', data),
    customerInsights: (data) => api.post('/ai/customer-insights', data),
    meetingSummary: (data) => api.post('/ai/meeting-summary', data),
    chat: (data) => api.post('/ai/chat', data),
    leadScoring: (data) => api.post('/ai/lead-scoring', data),
};

export default api;