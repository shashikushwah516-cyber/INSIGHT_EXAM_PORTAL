import apiClient from './apiClient';

export const resultService = {
    getResults: async () => {
        return apiClient.get('/results');
    },

    getResultById: async (attemptId) => {
        return apiClient.get(`/results/${attemptId}`);
    },

    getCandidateAnalytics: async () => {
        return apiClient.get('/results/analytics/candidate');
    },

    getAdminOverview: async () => {
        return apiClient.get('/results/admin/overview');
    }
};

export default resultService;
