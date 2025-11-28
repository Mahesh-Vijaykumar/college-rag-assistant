import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    // FastAPI OAuth2PasswordRequestForm expects form data, but our endpoint uses JSON body in the Pydantic model?
    // Wait, in backend/routers/admin.py: async def login(user: UserLogin):
    // It expects JSON body.
    const response = await api.post('/admin/login', { username, password });
    return response.data;
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
