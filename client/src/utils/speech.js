// Accessible Text-To-Speech (TTS) Engine for Universal Examination Access
// Robust implementation addressing all Chromium/Windows/Firefox/Safari edge cases:
// 1. Race condition with cancel() dropping subsequent speak() calls
// 2. V8 garbage collection dropping active SpeechSynthesisUtterance objects
// 3. Chromium 15-second speech freeze on long questions
// 4. Autoplay policy unlock on first user gesture
// 5. Stale voice objects after voiceschanged
// 6. Reactive speaking state subscriber bus

let speechSettings = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    lang: 'en-US',
    voice: null,
    enabled: true
};

let lastSpokenText = '';
let voicesCache = [];
let heartbeatTimer = null;
let pendingSpeakTimeout = null;
let currentUtterance = null;
const activeUtterances = new Set();
const speakingListeners = new Set();
let speechQueue = [];

/**
 * Notify all subscribers of speech state changes
 */
const notifySpeaking = (status) => {
    speakingListeners.forEach((fn) => {
        try {
            fn(status);
        } catch (e) {
            console.warn('[TTS] Error in speaking listener:', e);
        }
    });
};

/**
 * Subscribe to real-time speaking state changes
 * @param {Function} listener (isSpeaking: boolean) => void
 * @returns {Function} unsubscribe function
 */
export const subscribeSpeaking = (listener) => {
    speakingListeners.add(listener);
    try {
        listener(isSpeaking());
    } catch (e) {}
    return () => {
        speakingListeners.delete(listener);
    };
};

/**
 * Fetch available voices, always preferring live browser voices
 */
export const getAvailableVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
            const v = window.speechSynthesis.getVoices();
            if (v && v.length > 0) {
                voicesCache = v;
                return v;
            }
        } catch (e) {}
    }
    return voicesCache;
};

// Initialize listeners for Chromium voice availability & autoplay unlock
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    getAvailableVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            getAvailableVoices();
        };
    }

    try {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            getAvailableVoices();
        });
    } catch (e) {}

    // Unlock speech engine on first user interaction to satisfy browser autoplay security policies
    let isUnlocked = false;
    const unlockSpeech = () => {
        if (isUnlocked) return;
        try {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
            // Prime the synthesizer with an empty utterance so Chrome enables audio output
            const silent = new SpeechSynthesisUtterance('');
            silent.volume = 0;
            silent.rate = 2;
            window.speechSynthesis.speak(silent);
            isUnlocked = true;
        } catch (e) {}

        window.removeEventListener('click', unlockSpeech);
        window.removeEventListener('keydown', unlockSpeech);
        window.removeEventListener('touchstart', unlockSpeech);
    };

    window.addEventListener('click', unlockSpeech, { passive: true });
    window.addEventListener('keydown', unlockSpeech, { passive: true });
    window.addEventListener('touchstart', unlockSpeech, { passive: true });
}

export const configureSpeech = (options = {}) => {
    if (options.rate !== undefined) speechSettings.rate = options.rate;
    if (options.pitch !== undefined) speechSettings.pitch = options.pitch;
    if (options.volume !== undefined) speechSettings.volume = options.volume;
    if (options.lang !== undefined) speechSettings.lang = options.lang;
    if (options.enabled !== undefined) speechSettings.enabled = options.enabled;
};

export const stopSpeech = () => {
    speechQueue = [];
    if (pendingSpeakTimeout) {
        clearTimeout(pendingSpeakTimeout);
        pendingSpeakTimeout = null;
    }

    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    activeUtterances.clear();
    currentUtterance = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
        } catch (e) {}
    }

    notifySpeaking(false);
};

export const pauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
            window.speechSynthesis.pause();
            notifySpeaking(false);
        } catch (e) {}
    }
};

export const resumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
            window.speechSynthesis.resume();
            notifySpeaking(true);
        } catch (e) {}
    }
};

export const isSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return !!(window.speechSynthesis.speaking && !window.speechSynthesis.paused);
    }
    return false;
};

export const repeatLastSpeech = () => {
    if (lastSpokenText) {
        speakText(lastSpokenText, { force: true });
    }
};

/**
 * Intelligent voice matching with safe fallback for Windows / Chromium / macOS / Mobile
 */
const findBestVoice = (targetLang) => {
    const voices = getAvailableVoices();
    if (!voices || voices.length === 0) {
        return { voice: null, safeLang: targetLang || 'en-US' };
    }

    const normTarget = (targetLang || 'en-US').replace('_', '-').toLowerCase();
    const langPrefix = normTarget.substring(0, 2);

    // 1. Exact match (e.g. 'en-us' or 'hi-in')
    let found = voices.find(v => v.lang && v.lang.replace('_', '-').toLowerCase() === normTarget);

    // 2. Target prefix match (e.g. 'en' or 'hi')
    if (!found) {
        found = voices.find(v => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(langPrefix));
    }

    // 3. Fallback for Hindi if OS does not have a native Hindi speech engine installed
    if (!found && langPrefix === 'hi') {
        found = voices.find(v => v.lang && (v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'))) ||
                voices.find(v => v.default) ||
                voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) ||
                voices[0];

        return {
            voice: found || null,
            safeLang: found?.lang || 'en-US'
        };
    }

    // 4. Default voice fallback
    if (!found) {
        found = voices.find(v => v.default) ||
                voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) ||
                voices[0];
    }

    return {
        voice: found || null,
        safeLang: found?.lang || targetLang || 'en-US'
    };
};

/**
 * Main speech synthesis function
 * @param {string} text Text to vocalize
 * @param {object} options Options { force, rate, pitch, volume, lang }
 * @param {function} onEnd Callback invoked when playback ends
 */
export const speakText = (text, options = {}, onEnd = null) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('[TTS] SpeechSynthesis is not supported in this browser.');
        if (onEnd) onEnd();
        return;
    }

    if (!text || typeof text !== 'string') {
        if (onEnd) onEnd();
        return;
    }

    // Check if TTS is globally disabled (unless explicitly forced by user action)
    if (speechSettings.enabled === false && !options.force) {
        if (onEnd) onEnd();
        return;
    }

    lastSpokenText = text;

    // Clean up formatting symbols, asterisks, brackets, bullets for natural pronunciation
    const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/#+/g, ' ')
        .replace(/[`~]/g, '')
        .replace(/[\[\]]/g, '')
        .replace(/[•·]/g, ', ')
        .replace(/\//g, ' or ')
        .replace(/&/g, ' and ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!cleanText) {
        if (onEnd) onEnd();
        return;
    }

    // If queue mode is requested and speech is currently active, queue announcement (Part 5)
    if (options.queue && isSpeaking()) {
        speechQueue.push({ text: cleanText, options: { ...options, queue: false }, onEnd });
        return;
    }

    if (!options.queue) {
        speechQueue = [];
    }

    // Cancel any pending speak timer
    if (pendingSpeakTimeout) {
        clearTimeout(pendingSpeakTimeout);
        pendingSpeakTimeout = null;
    }

    // Cancel ongoing speech to reset the queue
    try {
        window.speechSynthesis.cancel();
        // Unconditionally resume to wake Chromium audio pipeline after cancel
        window.speechSynthesis.resume();
    } catch (e) {}

    // Determine target language (detect Devanagari Hindi or respect settings)
    const containsHindi = /[\u0900-\u097F]/.test(cleanText);
    const requestedLang = options.lang || (containsHindi ? 'hi-IN' : speechSettings.lang || 'en-US');
    const { voice, safeLang } = findBestVoice(requestedLang);

    // Create Utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = safeLang;
    if (voice) {
        utterance.voice = voice;
    }

    // Configure rate, pitch, volume
    const rate = options.rate !== undefined ? options.rate : (speechSettings.rate || 1.0);
    const pitch = options.pitch !== undefined ? options.pitch : (speechSettings.pitch || 1.0);
    const volume = options.volume !== undefined ? options.volume : (speechSettings.volume || 1.0);

    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
    utterance.volume = Math.max(0.1, Math.min(1.0, volume));

    // Retain utterance reference in global Set to prevent V8 garbage collection
    activeUtterances.add(utterance);
    currentUtterance = utterance;

    const cleanup = () => {
        activeUtterances.delete(utterance);
        if (currentUtterance === utterance) {
            currentUtterance = null;
        }
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    };

    utterance.onstart = () => {
        notifySpeaking(true);
    };

    utterance.onend = () => {
        cleanup();
        notifySpeaking(false);
        if (onEnd) onEnd();

        // Process next queued announcement without interrupting (Part 5)
        if (speechQueue.length > 0) {
            const next = speechQueue.shift();
            setTimeout(() => {
                speakText(next.text, next.options, next.onEnd);
            }, 60);
        }
    };

    utterance.onerror = (event) => {
        // 'canceled' and 'interrupted' occur naturally when user navigates or skips
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
            console.warn('[TTS] Synthesis event error:', event.error);

            // If rejected due to language or voice unavailability, auto-retry with standard fallback
            if (event.error === 'language-unavailable' || event.error === 'voice-unavailable' || event.error === 'synthesis-failed') {
                try {
                    const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
                    fallbackUtterance.lang = 'en-US';
                    fallbackUtterance.rate = utterance.rate;
                    fallbackUtterance.volume = utterance.volume;
                    activeUtterances.add(fallbackUtterance);

                    fallbackUtterance.onstart = () => {
                        notifySpeaking(true);
                    };
                    fallbackUtterance.onend = () => {
                        activeUtterances.delete(fallbackUtterance);
                        notifySpeaking(false);
                        if (onEnd) onEnd();
                    };
                    fallbackUtterance.onerror = () => {
                        activeUtterances.delete(fallbackUtterance);
                        notifySpeaking(false);
                        if (onEnd) onEnd();
                    };

                    window.speechSynthesis.speak(fallbackUtterance);
                    cleanup();
                    return;
                } catch (retryErr) {
                    console.warn('[TTS] Fallback attempt error:', retryErr);
                }
            }
        }
        cleanup();
        notifySpeaking(false);
        if (onEnd) onEnd();
    };

    // Chrome 15-second speech freeze workaround: pause then resume watchdog
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                try {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                } catch (e) {}
            } else if (!window.speechSynthesis.speaking) {
                clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }
        }
    }, 4500);

    // Schedule speak with 40ms debounce to allow cancel() to cleanly complete in Chromium
    pendingSpeakTimeout = setTimeout(() => {
        pendingSpeakTimeout = null;
        try {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error('[TTS] Window.speechSynthesis.speak error:', err);
            cleanup();
            notifySpeaking(false);
            if (onEnd) onEnd();
        }
    }, 40);
};

export default {
    speakText,
    stopSpeech,
    pauseSpeech,
    resumeSpeech,
    isSpeaking,
    repeatLastSpeech,
    configureSpeech,
    getAvailableVoices,
    subscribeSpeaking
};