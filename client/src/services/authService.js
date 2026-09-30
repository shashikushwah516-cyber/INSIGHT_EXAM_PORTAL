import apiClient from './apiClient';

export const authService = {
    login: async (rollNumber, password) => {
        return apiClient.post('/auth/login', { rollNumber, password });
    },

    register: async (userData) => {
        return apiClient.post('/auth/register', userData);
    },

    getProfile: async () => {
        return apiClient.get('/auth/me');
    },

    updatePreferences: async (preferences) => {
        return apiClient.put('/auth/preferences', preferences);
    },

    updateProfile: async (profileData) => {
        return apiClient.put('/auth/profile', profileData);
    },

    forgotPassword: async (resetData) => {
        return apiClient.post('/auth/forgot-password', resetData);
    },

    getStudents: async (params = {}) => {
        return apiClient.get('/admin/students', { params });
    },

    getStudentById: async (id) => {
        return apiClient.get(`/admin/students/${id}`);
    },

    createStudent: async (studentData) => {
        return apiClient.post('/admin/students', studentData);
    },

    updateStudent: async (id, studentData) => {
        return apiClient.put(`/admin/students/${id}`, studentData);
    },

    deleteStudent: async (id) => {
        return apiClient.delete(`/admin/students/${id}`);
    },

    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (e) {
            // Ignore failure on logout
        } finally {
            localStorage.removeItem('insight_token');
            localStorage.removeItem('insight_user');
        }
    }
};

export default authService;
