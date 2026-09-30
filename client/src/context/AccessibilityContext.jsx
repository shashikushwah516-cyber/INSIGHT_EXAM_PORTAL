import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
    speakText,
    stopSpeech,
    configureSpeech,
    pauseSpeech,
    resumeSpeech,
    isSpeaking,
    subscribeSpeaking
} from '../utils/speech';

const AccessibilityContext = createContext(null);

export const THEMES = [
    {
        id: 'clean-light',
        name: 'Clean Light Professional',
        shortName: 'White / Light',
        desc: 'Crisp white surfaces, deep slate typography, optimal contrast and zero glare for daytime examination reading',
        badge: 'Default',
        color: '#2563eb'
    },
    {
        id: 'high-contrast-yellow',
        name: 'High Contrast Yellow on Black',
        shortName: 'Yellow Mode',
        desc: 'Deep black background with sharp yellow borders and text for low-vision clarity and maximum legibility',
        badge: 'Low-Vision',
        color: '#ffe600'
    },
    {
        id: 'high-contrast-cyan',
        name: 'High Contrast Cyan on Navy',
        shortName: 'Blue / Cyan Mode',
        desc: 'Midnight navy canvas with radiant electric cyan interactive accents and sharp typography',
        badge: 'High-Contrast',
        color: '#00f2fe'
    },
    {
        id: 'standard-dark',
        name: 'Standard Dark Mode',
        shortName: 'Black / Dark Mode',
        desc: 'Deep graphite slate surfaces with soft blue accents for eye comfort and reduced fatigue',
        badge: 'Dark',
        color: '#38bdf8'
    },
    {
        id: 'soft-light',
        name: 'Soft Light / Warm Cream',
        shortName: 'Warm Light',
        desc: 'Warm cream-tinted canvas engineered for candidates sensitive to harsh bright screens',
        badge: 'Gentle',
        color: '#d97706'
    }
];

const DEFAULT_PREFERENCES = {
    language: 'en',
    speechRate: 1.0,
    voicePitch: 1.0,
    volume: 1.0,
    speechEnabled: true,
    theme: 'clean-light',
    fontSize: 'normal',
    reducedMotion: false,
    keyboardNavigation: true,
    voiceCommands: true,
    autoReadQuestion: true,
    screenReaderAnnounce: true
};

export const AccessibilityProvider = ({ children, initialPreferences = {} }) => {
    const [preferences, setPreferences] = useState(() => {
        if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES, ...initialPreferences };
        const saved = localStorage.getItem('insight_a11y_prefs');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_PREFERENCES, ...parsed };
            } catch (e) {
                // Ignore parse error
            }
        }
        return { ...DEFAULT_PREFERENCES, ...initialPreferences };
    });

    const [announcement, setAnnouncement] = useState({ message: '', priority: 'polite' });
    const [speaking, setSpeaking] = useState(() => isSpeaking());

    // Keep an up-to-date ref for preferences to guarantee STABLE callbacks that never trigger re-fetch loops
    const prefsRef = useRef(preferences);
    useEffect(() => {
        prefsRef.current = preferences;
    }, [preferences]);

    useEffect(() => {
        const unsubscribe = subscribeSpeaking((status) => {
            setSpeaking(status);
        });
        return unsubscribe;
    }, []);

    // Sync preferences with DOM attributes and speech engine
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('insight_a11y_prefs', JSON.stringify(preferences));
        } catch (e) {
            // Ignore storage quota error
        }

        const body = document.body;
        const html = document.documentElement;

        const allThemeClasses = [
            'theme-clean-light',
            'theme-high-contrast-yellow',
            'theme-high-contrast-cyan',
            'theme-standard-dark',
            'theme-soft-light'
        ];

        body.classList.remove(...allThemeClasses);
        html.classList.remove(...allThemeClasses);

        const currentThemeClass = `theme-${preferences.theme || 'clean-light'}`;
        body.classList.add(currentThemeClass);
        html.classList.add(currentThemeClass);
        html.setAttribute('data-theme', preferences.theme || 'clean-light');

        // Font scaling
        const allFontClasses = ['font-size-normal', 'font-size-large', 'font-size-extra-large'];
        body.classList.remove(...allFontClasses);
        html.classList.remove(...allFontClasses);
        const fontClass = `font-size-${preferences.fontSize || 'normal'}`;
        body.classList.add(fontClass);
        html.classList.add(fontClass);

        // Reduced motion
        if (preferences.reducedMotion) {
            body.classList.add('reduced-motion');
            html.classList.add('reduced-motion');
        } else {
            body.classList.remove('reduced-motion');
            html.classList.remove('reduced-motion');
        }

        // Configure speech engine
        configureSpeech({
            rate: preferences.speechRate,
            pitch: preferences.voicePitch,
            lang: preferences.language === 'hi' ? 'hi-IN' : 'en-US',
            enabled: preferences.speechEnabled !== false
        });
    }, [preferences]);

    // Announce message through screen-reader ARIA live region (STABLE function reference)
    const announce = useCallback((message, priority = 'polite', speakAloud = false) => {
        if (!message) return;
        setAnnouncement({ message, priority });

        const currentPrefs = prefsRef.current;
        if (speakAloud && currentPrefs.screenReaderAnnounce) {
            speakText(message, {
                rate: currentPrefs.speechRate,
                lang: currentPrefs.language === 'hi' ? 'hi-IN' : 'en-US'
            });
        }
    }, []);

    // Update preferences (STABLE function reference)
    const updatePref = useCallback((key, value) => {
        setPreferences((prev) => {
            const updated = {
                ...prev,
                [key]: value,
                ...(key === 'theme' ? { explicitlyChosen: true } : {})
            };
            try {
                localStorage.setItem('insight_a11y_prefs', JSON.stringify(updated));
            } catch (e) {
                // Ignore storage error
            }
            return updated;
        });
    }, []);

    // Synthesize Speech Aloud (STABLE function reference)
    const speak = useCallback((text, options = {}, onEnd = null) => {
        if (!text) return;
        const currentPrefs = prefsRef.current;
        if (currentPrefs.speechEnabled === false && !options.force) {
            if (onEnd) onEnd();
            return;
        }

        speakText(
            text,
            {
                rate: currentPrefs.speechRate,
                pitch: currentPrefs.voicePitch,
                lang: currentPrefs.language === 'hi' ? 'hi-IN' : 'en-US',
                ...options
            },
            onEnd
        );
    }, []);

    const value = {
        preferences,
        setPreferences,
        updatePref,
        announcement,
        announce,
        speak,
        cancel: stopSpeech,
        stopSpeech,
        pauseSpeech,
        resumeSpeech,
        speaking,
        isSpeaking,
        theme: preferences.theme,
        fontSize: preferences.fontSize,
        language: preferences.language,
        speechRate: preferences.speechRate,
        themesList: THEMES
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

