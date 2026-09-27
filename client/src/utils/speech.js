// Accessible Text-To-Speech (TTS) Engine for Visually Impaired Candidates

let speechSettings = {
    rate: 1.0,
    pitch: 1.0,
    lang: 'en-US',
    voice: null
};

export const configureSpeech = (options = {}) => {
    if (options.rate !== undefined) speechSettings.rate = options.rate;
    if (options.pitch !== undefined) speechSettings.pitch = options.pitch;
    if (options.lang !== undefined) speechSettings.lang = options.lang;
};

export const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

export const pauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
    }
};

export const resumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
    }
};

export const isSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return window.speechSynthesis.speaking;
    }
    return false;
};

/**
 * Main speech synthesis trigger
 * @param {string} text - The text to speak
 * @param {object} options - Optional overrides for rate, pitch, lang
 * @param {function} onEnd - Callback when speech ends
 */
export const speakText = (text, options = {}, onEnd = null) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis is not supported in this browser.');
        return;
    }

    if (!text || typeof text !== 'string') return;

    // Cancel ongoing speech to avoid overlapping voices
    window.speechSynthesis.cancel();

    // Clean up markdown / symbols if any
    const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/#/g, '')
        .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Rate, Pitch, Language configuration
    utterance.rate = options.rate || speechSettings.rate || 1.0;
    utterance.pitch = options.pitch || speechSettings.pitch || 1.0;

    // Detect if text contains Hindi characters or if lang is set to 'hi'
    const containsHindi = /[\u0900-\u097F]/.test(cleanText);
    const targetLang = options.lang || (containsHindi ? 'hi-IN' : speechSettings.lang || 'en-US');
    utterance.lang = targetLang;

    // Find best matched voice in the browser
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.substring(0, 2)));
        if (matchingVoice) {
            utterance.voice = matchingVoice;
        }
    }

    if (onEnd) {
        utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
};