import { useState, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { speakText, stopSpeech, pauseSpeech, resumeSpeech, isSpeaking } from '../utils/speech';

export const useSpeech = () => {
    const { preferences } = useAccessibility();
    const [speaking, setSpeaking] = useState(false);

    const speak = useCallback(
        (text, customOptions = {}, onEnd = null) => {
            if (!text) return;
            setSpeaking(true);

            speakText(
                text,
                {
                    rate: preferences.speechRate,
                    pitch: preferences.voicePitch,
                    lang: preferences.language === 'hi' ? 'hi-IN' : 'en-US',
                    ...customOptions
                },
                () => {
                    setSpeaking(false);
                    if (onEnd) onEnd();
                }
            );
        },
        [preferences.speechRate, preferences.voicePitch, preferences.language]
    );

    const cancel = useCallback(() => {
        stopSpeech();
        setSpeaking(false);
    }, []);

    const pause = useCallback(() => {
        pauseSpeech();
    }, []);

    const resume = useCallback(() => {
        resumeSpeech();
    }, []);

    return {
        speak,
        cancel,
        pause,
        resume,
        speaking: speaking || isSpeaking()
    };
};

export default useSpeech;
