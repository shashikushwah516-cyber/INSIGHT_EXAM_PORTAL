import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Play an audible alert beep via Web Audio API when a security violation occurs.
 */
const playWarningBeep = () => {
    try {
        if (typeof window === 'undefined') return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15); // A4
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.42);
    } catch (e) {
        // AudioContext may be muted or blocked by browser policy
    }
};

/**
 * Secure Examination & Lockdown Mode Hook
 * Features:
 * - Automatic browser Fullscreen entry when attending exam
 * - Automatic Fullscreen exit at the end of the exam test
 * - Instant alert and audio warning to student upon Tab Switch / Window Blur
 * - Audited proctor logging to server
 */
export const useSecureExam = ({
    examId = '',
    attemptId = '',
    currentQuestionIndex = 0,
    remainingSeconds = 0,
    maxWarnings = 3,
    enabled = true,
    onAutoSubmit = null
} = {}) => {
    const { speak, announce } = useAccessibility();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [warningCount, setWarningCount] = useState(0);
    const [securityAlert, setSecurityAlert] = useState(null); // { eventType, spokenMessage, details, warningNumber, maxWarnings, timestamp }
    const [limitReached, setLimitReached] = useState(false);

    const warningCountRef = useRef(0);
    const lastEventTimeRef = useRef(0);
    const onAutoSubmitRef = useRef(onAutoSubmit);
    onAutoSubmitRef.current = onAutoSubmit;

    // Check if browser is currently in fullscreen
    const checkFullscreenState = useCallback(() => {
        if (typeof document === 'undefined') return false;
        return Boolean(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }, []);

    // Fullscreen Requester (Enters Fullscreen Mode)
    const requestFullscreen = useCallback(async () => {
        if (typeof document === 'undefined') return false;
        const elem = document.documentElement;

        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
            setIsFullscreen(true);
            return true;
        } catch (err) {
            console.warn('[SecureExam] Fullscreen request rejected or unsupported:', err.message);
            return false;
        }
    }, []);

    // Fullscreen Exiter (Automatically turns off fullscreen at the end of exam test)
    const exitFullscreen = useCallback(async () => {
        if (typeof document === 'undefined') return;
        try {
            if (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            ) {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            }
            setIsFullscreen(false);
        } catch (err) {
            console.warn('[SecureExam] Exit fullscreen error or already off:', err.message);
        }
    }, []);

    // Dispatch Security Event to Backend API
    const logSecurityEventToServer = useCallback(async (eventType, details = '') => {
        try {
            const token = localStorage.getItem('insight_token');
            if (!token) return;

            const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
                ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
                : '/api';

            const endpoint = attemptId 
                ? `${apiBase}/attempts/${attemptId}/security-event`
                : (examId ? `${apiBase}/exams/${examId}/security-event` : null);

            if (!endpoint) return;

            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    eventType,
                    questionNumber: (currentQuestionIndex || 0) + 1,
                    remainingSeconds: remainingSeconds || 0,
                    details
                })
            });
        } catch (err) {
            console.warn('[SecureExam] Failed to persist security event to server:', err.message);
        }
    }, [attemptId, examId, currentQuestionIndex, remainingSeconds]);

    // Issue Spoken, Audible & Visual Security Warning
    const triggerSecurityWarning = useCallback((eventType, spokenMessage, visualDetails) => {
        if (!enabled) return;

        // Debounce warnings by 1.5 seconds to avoid cascading blur/visibility triggers
        const now = Date.now();
        if (now - lastEventTimeRef.current < 1500) {
            return;
        }
        lastEventTimeRef.current = now;

        warningCountRef.current += 1;
        const newCount = warningCountRef.current;
        setWarningCount(newCount);

        let finalSpoken = spokenMessage;
        if (newCount >= maxWarnings) {
            setLimitReached(true);
            finalSpoken = `${spokenMessage} Warning limit reached (${newCount} of ${maxWarnings}). Continued violations may result in exam termination.`;
        }

        // 1. Play alert sound tone
        playWarningBeep();

        // 2. Announce aloud through Text-to-Speech immediately with high priority
        speak(finalSpoken, { force: true });

        // 3. Announce through screen-reader live region (assertive alert)
        announce(finalSpoken, 'assertive');

        // 4. Set visual alert modal / banner
        setSecurityAlert({
            eventType,
            spokenMessage: finalSpoken,
            details: visualDetails,
            warningNumber: newCount,
            maxWarnings,
            timestamp: new Date()
        });

        // 5. Record event to backend audit log
        logSecurityEventToServer(eventType, visualDetails);
    }, [enabled, maxWarnings, speak, announce, logSecurityEventToServer]);

    // Clear alert banner
    const dismissAlert = useCallback(() => {
        setSecurityAlert(null);
    }, []);

    // Automatic Fullscreen Exit when hook unmounts (End of exam test)
    useEffect(() => {
        return () => {
            exitFullscreen();
        };
    }, [exitFullscreen]);

    // Automatic Fullscreen Entry attempt on mount
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;
        const attemptAutoFullscreen = async () => {
            if (!checkFullscreenState()) {
                await requestFullscreen();
            }
        };
        const timer = setTimeout(attemptAutoFullscreen, 150);
        return () => clearTimeout(timer);
    }, [enabled, checkFullscreenState, requestFullscreen]);

    // Listeners for Fullscreen, Tab Switch (Visibility), and Window Blur
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        // Initial fullscreen state check
        setIsFullscreen(checkFullscreenState());

        // 1. Fullscreen Exit Detection
        const handleFullscreenChange = () => {
            const inFullscreen = checkFullscreenState();
            setIsFullscreen(inFullscreen);

            if (!inFullscreen) {
                triggerSecurityWarning(
                    'FULLSCREEN_EXIT',
                    'Security warning. The examination is no longer in fullscreen mode. Please return to fullscreen mode immediately.',
                    'Candidate exited fullscreen display mode.'
                );
            }
        };

        // 2. Tab Switch / Page Visibility Detection
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                triggerSecurityWarning(
                    'TAB_SWITCH',
                    `Security warning. Tab switch detected! You navigated away from the examination window. Warning ${warningCountRef.current + 1} of ${maxWarnings}. Please return immediately.`,
                    'Candidate switched tab or minimized examination window.'
                );
            } else if (document.visibilityState === 'visible') {
                speak('Examination window restored. Please keep this tab active and remain in fullscreen mode.', { force: true });
            }
        };

        // 3. Window Blur Detection (Clicking out of browser window)
        const handleWindowBlur = () => {
            // Check if active element is an iframe or internal helper
            if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                return;
            }

            triggerSecurityWarning(
                'WINDOW_BLUR',
                'Security warning. Examination focus lost. Please click back into the examination window.',
                'Browser window lost input focus.'
            );
        };

        // 4. Navigation & Page Reload Prevention
        const handleBeforeUnload = (e) => {
            logSecurityEventToServer('NAVIGATION_ATTEMPT', 'Candidate attempted to reload or navigate away.');
            e.preventDefault();
            e.returnValue = 'An examination is currently active. Any unsaved progress may be impacted. Are you sure you want to leave?';
            return e.returnValue;
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [enabled, maxWarnings, checkFullscreenState, triggerSecurityWarning, logSecurityEventToServer, speak]);

    return {
        isFullscreen,
        warningCount,
        maxWarnings,
        limitReached,
        securityAlert,
        requestFullscreen,
        exitFullscreen,
        dismissAlert,
        triggerSecurityWarning,
        checkFullscreenState
    };
};

export default useSecureExam;
