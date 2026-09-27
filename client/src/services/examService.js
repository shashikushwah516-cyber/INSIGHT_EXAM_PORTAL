import apiClient from './apiClient';

export const examService = {
    getExams: async () => {
        return apiClient.get('/exams');
    },

    getExamById: async (id) => {
        return apiClient.get(`/exams/${id}`);
    },

    createExam: async (examData) => {
        return apiClient.post('/exams', examData);
    },

    updateExam: async (id, examData) => {
        return apiClient.put(`/exams/${id}`, examData);
    },

    deleteExam: async (id) => {
        return apiClient.delete(`/exams/${id}`);
    },

    startExam: async (id) => {
        return apiClient.post(`/exams/${id}/start`);
    },

    getAttempt: async (attemptId) => {
        return apiClient.get(`/attempts/${attemptId}`);
    },

    saveAnswer: async (attemptId, answerData) => {
        return apiClient.post(`/attempts/${attemptId}/answers`, answerData);
    },

    submitExam: async (attemptId, answers = []) => {
        return apiClient.post(`/attempts/${attemptId}/submit`, { answers });
    }
};

export default examService;
