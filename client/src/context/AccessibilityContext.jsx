import React, { createContext, useContext, useState, useEffect } from 'react';
import { speakText, stopSpeech, configureSpeech } from '../utils/speech';

const AccessibilityContext = createContext(null);

const DEFAULT_PREFERENCES = {
    language: 'en',
    speechRate: 1.0,
    voicePitch: 1.0,
    theme: 'high-contrast-yellow',
    fontSize: 'large',
    reducedMotion: false,
    keyboardNavigation: true,
    voiceCommands: true,
    autoReadQuestion: true,
    screenReaderAnnounce: true
};

export const AccessibilityProvider = ({ children, initialPreferences = {} }) => {
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('insight_a11y_prefs');
        if (saved) {
            try {
                return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
            } catch (e) {
                // Ignore parse error
            }
        }
        return { ...DEFAULT_PREFERENCES, ...initialPreferences };
    });

    const [announcement, setAnnouncement] = useState({ message: '', priority: 'polite' });

    // Sync preferences with body classes and speech engine
    useEffect(() => {
        localStorage.setItem('insight_a11y_prefs', JSON.stringify(preferences));

        // Update body class list for theme & font-size
        const body = document.body;
        body.classList.remove(
            'theme-high-contrast-yellow',
            'theme-high-contrast-cyan',
            'theme-standard-dark',
            'theme-soft-light',
            'font-size-normal',
            'font-size-large',
            'font-size-extra-large',
            'reduced-motion'
        );

        body.classList.add(`theme-${preferences.theme}`);
        body.classList.add(`font-size-${preferences.fontSize}`);
        if (preferences.reducedMotion) {
            body.classList.add('reduced-motion');
        }

        // Configure TTS utility
        configureSpeech({
            rate: preferences.speechRate,
            pitch: preferences.voicePitch,
            lang: preferences.language === 'hi' ? 'hi-IN' : 'en-US'
        });
    }, [preferences]);

    // Announce message through screen-reader ARIA live region and optional TTS
    const announce = (message, priority = 'polite', speakAloud = false) => {
        if (!message) return;
        setAnnouncement({ message, priority });

        if (speakAloud && preferences.screenReaderAnnounce) {
            speakText(message, {
                rate: preferences.speechRate,
                lang: preferences.language === 'hi' ? 'hi-IN' : 'en-US'
            });
        }
    };

    const updatePref = (key, value) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const speak = (text, options = {}, onEnd = null) => {
        speakText(
            text,
            {
                rate: preferences.speechRate,
                pitch: preferences.voicePitch,
                lang: preferences.language === 'hi' ? 'hi-IN' : 'en-US',
                ...options
            },
            onEnd
        );
    };

    const value = {
        preferences,
        setPreferences,
        updatePref,
        announcement,
        announce,
        speak,
        stopSpeech,
        theme: preferences.theme,
        fontSize: preferences.fontSize,
        language: preferences.language,
        speechRate: preferences.speechRate
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {/* Accessible ARIA Live Regions for Screen Readers */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
                id="a11y-live-polite"
            >
                {announcement.priority === 'polite' ? announcement.message : ''}
            </div>

            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
                id="a11y-live-assertive"
            >
                {announcement.priority === 'assertive' ? announcement.message : ''}
            </div>

            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
