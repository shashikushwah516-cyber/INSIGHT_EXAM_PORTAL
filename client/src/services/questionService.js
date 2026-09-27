import apiClient from './apiClient';

export const questionService = {
    getQuestions: async (params = {}) => {
        return apiClient.get('/questions', { params });
    },

    getQuestionById: async (id) => {
        return apiClient.get(`/questions/${id}`);
    },

    createQuestion: async (questionData) => {
        return apiClient.post('/questions', questionData);
    },

    updateQuestion: async (id, questionData) => {
        return apiClient.put(`/questions/${id}`, questionData);
    },

    deleteQuestion: async (id) => {
        return apiClient.delete(`/questions/${id}`);
    },

    getSubjectsMeta: async () => {
        return apiClient.get('/questions/meta/subjects');
    }
};

export default questionService;
