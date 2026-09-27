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
