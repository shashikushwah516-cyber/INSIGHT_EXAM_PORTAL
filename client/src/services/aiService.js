import apiClient from './apiClient';

export const askAIAssistant = async (message, language = 'en', context = {}) => {
    return apiClient.post('/ai/assistant', { message, language, context });
};

export default {
    askAIAssistant
};
