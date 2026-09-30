import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Default announcement intervals per examination specification (Part 4)
 * Configurable list of milestones and candidate-friendly spoken phrases
 */
export const DEFAULT_ANNOUNCEMENT_INTERVALS = [
    { seconds: 1800, text: 'You have 30 minutes remaining.' },
    { seconds: 1200, text: 'You have 20 minutes remaining.' },
    { seconds: 600, text: 'You have 10 minutes remaining.' },
    { seconds: 300, text: 'You have 5 minutes remaining.' },
    { seconds: 180, text: 'You have 3 minutes remaining.' },
    { seconds: 120, text: 'You have 2 minutes remaining.' },
    { seconds: 60, text: 'You have 1 minute remaining.' },
    { seconds: 30, text: 'You have 30 seconds remaining.' },
    { seconds: 10, text: 'You have 10 seconds remaining.' }
];

export const useExamTimer = (
    initialSeconds = 1800,
    expiresAt = null,
    onExpire = null,
    intervals = DEFAULT_ANNOUNCEMENT_INTERVALS
) => {
    const { announce, speak } = useAccessibility();

    // Calculate actual remaining seconds from server timestamp (Single Source of Truth)
    const calculateSeconds = useCallback(() => {
        if (expiresAt) {
            const expiryTime = new Date(expiresAt).getTime();
            const now = Date.now();
            return Math.max(0, Math.floor((expiryTime - now) / 1000));
        }
        return initialSeconds;
    }, [expiresAt, initialSeconds]);

    const [secondsLeft, setSecondsLeft] = useState(calculateSeconds);
    const announcedRef = useRef(new Set());
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(() => {
        setSecondsLeft(calculateSeconds());
    }, [calculateSeconds]);

    useEffect(() => {
        const checkTimer = () => {
            let updated;
            if (expiresAt) {
                const expiryTime = new Date(expiresAt).getTime();
                const now = Date.now();
                updated = Math.max(0, Math.floor((expiryTime - now) / 1000));
                setSecondsLeft(updated);
            } else {
                setSecondsLeft((prev) => {
                    updated = Math.max(0, prev - 1);
                    return updated;
                });
            }

            // Check milestone announcement intervals (Part 4 & 5)
            const milestone = intervals.find((m) => m.seconds === updated);
            if (milestone && !announcedRef.current.has(updated)) {
                announcedRef.current.add(updated);
                // Queue the announcement so it doesn't interrupt active question reading
                speak(milestone.text, { queue: true, force: true });
                announce(milestone.text, updated <= 60 ? 'assertive' : 'polite');
            }

            // Expiry at 0 seconds
            if (updated <= 0 && !announcedRef.current.has(0)) {
                announcedRef.current.add(0);
                const expiryMsg = 'Examination time has expired. Submitting your examination automatically.';
                speak(expiryMsg, { force: true });
                announce(expiryMsg, 'assertive');
                if (onExpireRef.current) {
                    onExpireRef.current();
                }
            }
        };

        const interval = setInterval(checkTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, intervals, speak, announce]);

    // Format MM:SS
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    /**
     * T = Tell Remaining Time (Part 4)
     * Speaks exact minutes and seconds based on actual timer state
     */
    const announceRemainingTime = useCallback(() => {
        let text = '';
        if (minutes > 0 && seconds > 0) {
            text = `You have ${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''} remaining.`;
        } else if (minutes > 0) {
            text = `You have ${minutes} minute${minutes !== 1 ? 's' : ''} remaining.`;
        } else {
            text = `You have ${seconds} second${seconds !== 1 ? 's' : ''} remaining.`;
        }

        speak(text, { force: true });
        announce(text, 'polite');
    }, [minutes, seconds, speak, announce]);

    return {
        secondsLeft,
        formattedTime,
        minutes,
        seconds,
        isExpired: secondsLeft <= 0,
        announceRemainingTime
    };
};

export default useExamTimer;
