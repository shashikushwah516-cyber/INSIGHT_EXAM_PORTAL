import apiClient from './apiClient';

export const practiceService = {
    getQuestions: async (params = {}) => {
        return apiClient.get('/practice/questions', { params });
    },

    checkAnswer: async (questionId, selectedOption) => {
        return apiClient.post('/practice/check', { questionId, selectedOption });
    },

    submitAttempt: async (attemptData) => {
        return apiClient.post('/practice/submit', attemptData);
    },

    getHistory: async () => {
        return apiClient.get('/practice/history');
    }
};

export default practiceService;
