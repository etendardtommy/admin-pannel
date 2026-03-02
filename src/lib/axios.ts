import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for attaching the token and site id
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const activeSiteId = localStorage.getItem('activeSiteId');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (activeSiteId && config.headers) {
            config.headers['x-site-id'] = activeSiteId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
