import axios from 'axios';

// Use environment variable for production, fallback to empty string (relative path) for development/deployment
const API_URL = import.meta.env.VITE_API_URL || '';


const api = axios.create({
    baseURL: API_URL,
});

// Token management utilities
export const tokenManager = {
    getAccessToken: () => localStorage.getItem('token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),
    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    },
    clearTokens: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    }
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = tokenManager.getRefreshToken();

            if (!refreshToken) {
                // No refresh token, redirect to login
                tokenManager.clearTokens();
                window.location.href = '/admin/login';
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the token
                const response = await axios.post(`${API_URL}/admin/refresh`, {
                    refresh_token: refreshToken
                });

                const { access_token } = response.data;
                tokenManager.setTokens(access_token, refreshToken);

                // Update the failed request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                processQueue(null, access_token);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed, clear tokens and redirect to login
                tokenManager.clearTokens();
                window.location.href = '/admin/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    const response = await api.post('/admin/login', { username, password });
    const { access_token, refresh_token } = response.data;

    // Store both tokens
    tokenManager.setTokens(access_token, refresh_token);

    return response.data;
};

export const logout = async () => {
    const refreshToken = tokenManager.getRefreshToken();

    if (refreshToken) {
        try {
            await api.post('/admin/logout', { refresh_token: refreshToken });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    tokenManager.clearTokens();
};

export const uploadDocument = async (file, category) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const response = await api.post('/admin/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getDocuments = async () => {
    const response = await api.get('/admin/documents');
    return response.data;
};

export const deleteDocument = async (filename) => {
    const response = await api.delete(`/admin/document/${filename}`);
    return response.data;
};

export const chatQuery = async (query) => {
    const response = await api.post('/chat/query', { query });
    return response.data;
};

// Alias for compatibility
export const queryChat = chatQuery;

export default api;

