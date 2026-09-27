import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export const useExamTimer = (initialSeconds = 1800, expiresAt = null, onExpire = null) => {
    const { announce, speak } = useAccessibility();

    // Calculate actual remaining seconds from server timestamp if provided
    const calculateSeconds = useCallback(() => {
        if (expiresAt) {
            const expiryTime = new Date(expiresAt).getTime();
            const now = Date.now();
            const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
            return diff;
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
        if (secondsLeft <= 0) {
            if (onExpireRef.current) {
                onExpireRef.current();
            }
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                const updated = prev - 1;

                // Threshold announcements (15 mins, 10 mins, 5 mins, 1 min)
                if (updated === 900 && !announcedRef.current.has(900)) {
                    announcedRef.current.add(900);
                    announce('Attention: 15 minutes remaining in examination.', 'alert', true);
                } else if (updated === 600 && !announcedRef.current.has(600)) {
                    announcedRef.current.add(600);
                    announce('Attention: 10 minutes remaining.', 'alert', true);
                } else if (updated === 300 && !announcedRef.current.has(300)) {
                    announcedRef.current.add(300);
                    announce('Warning: 5 minutes remaining. Please review your answers.', 'alert', true);
                } else if (updated === 60 && !announcedRef.current.has(60)) {
                    announcedRef.current.add(60);
                    announce('Final minute: 1 minute remaining. Exam will automatically submit.', 'alert', true);
                } else if (updated <= 0) {
                    announce('Examination time has expired. Submitting your examination automatically.', 'alert', true);
                    if (onExpireRef.current) {
                        onExpireRef.current();
                    }
                }

                return Math.max(0, updated);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft, announce]);

    // Format MM:SS
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const announceRemainingTime = useCallback(() => {
        const text = `${minutes} minutes and ${seconds} seconds remaining.`;
        speak(text);
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
