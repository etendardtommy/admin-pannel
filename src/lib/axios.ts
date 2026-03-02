import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor for attaching the token and site id
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const activeSiteId = localStorage.getItem('activeSiteId');

        if (token && config.headers) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }

        if (activeSiteId && config.headers) {
            config.headers.set('x-site-id', activeSiteId);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is dead or expired
            localStorage.removeItem('token');
            localStorage.removeItem('activeSiteId');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
