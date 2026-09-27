import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export const useVoiceCommands = (commandHandlers = {}, enabled = true) => {
    const { preferences, announce } = useAccessibility();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastCommand, setLastCommand] = useState('');
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = preferences.language === 'hi' ? 'hi-IN' : 'en-US';

            recognition.onresult = (event) => {
                const currentResultIndex = event.resultIndex;
                const text = event.results[currentResultIndex][0].transcript.trim().toLowerCase();
                setTranscript(text);
                handleCommand(text);
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setIsListening(false);
                    announce('Microphone access denied. Voice commands disabled.', 'alert');
                }
            };

            recognition.onend = () => {
                // If user wants it active, restart
                if (isListening && enabled && preferences.voiceCommands) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // ignore restart error
                    }
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
        } else {
            setIsSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // ignore abort error
                }
            }
        };
    }, [preferences.language, preferences.voiceCommands]);

    const handleCommand = useCallback((phrase) => {
        console.log('Recognized speech command:', phrase);

        // Next
        if (phrase.includes('next') || phrase.includes('अगला') || phrase.includes('aage')) {
            setLastCommand('Next Question');
            announce('Next question command executed.', 'polite');
            if (commandHandlers.onNext) commandHandlers.onNext();
        }
        // Previous
        else if (phrase.includes('previous') || phrase.includes('back') || phrase.includes('पिछला') || phrase.includes('peechhe')) {
            setLastCommand('Previous Question');
            announce('Previous question command executed.', 'polite');
            if (commandHandlers.onPrev) commandHandlers.onPrev();
        }
        // Read question
        else if (phrase.includes('read') || phrase.includes('repeat') || phrase.includes('question') || phrase.includes('दोहराएं') || phrase.includes('सवाल') || phrase.includes('padho')) {
            setLastCommand('Read Question');
            if (commandHandlers.onRead) commandHandlers.onRead();
        }
        // Option 1
        else if (phrase.includes('option 1') || phrase.includes('option one') || phrase.includes('option a') || phrase.includes('पहला विकल्प') || phrase.includes('ek')) {
            setLastCommand('Select Option 1');
            announce('Option 1 selected.', 'polite');
            if (commandHandlers.onSelectOption) commandHandlers.onSelectOption(0);
        }
        // Option 2
        else if (phrase.includes('option 2') || phrase.includes('option two') || phrase.includes('option b') || phrase.includes('दूसरा विकल्प') || phrase.includes('do')) {
            setLastCommand('Select Option 2');
            announce('Option 2 selected.', 'polite');
            if (commandHandlers.onSelectOption) commandHandlers.onSelectOption(1);
        }
        // Option 3
        else if (phrase.includes('option 3') || phrase.includes('option three') || phrase.includes('option c') || phrase.includes('तीसरा विकल्प') || phrase.includes('teen')) {
            setLastCommand('Select Option 3');
            announce('Option 3 selected.', 'polite');
            if (commandHandlers.onSelectOption) commandHandlers.onSelectOption(2);
        }
        // Option 4
        else if (phrase.includes('option 4') || phrase.includes('option four') || phrase.includes('option d') || phrase.includes('चौथा विकल्प') || phrase.includes('chaar')) {
            setLastCommand('Select Option 4');
            announce('Option 4 selected.', 'polite');
            if (commandHandlers.onSelectOption) commandHandlers.onSelectOption(3);
        }
        // Mark for review
        else if (phrase.includes('mark') || phrase.includes('review') || phrase.includes('रिव्यू')) {
            setLastCommand('Mark for Review');
            announce('Question marked for review.', 'polite');
            if (commandHandlers.onMark) commandHandlers.onMark();
        }
        // Clear answer
        else if (phrase.includes('clear') || phrase.includes('remove') || phrase.includes('साफ़') || phrase.includes('saaf')) {
            setLastCommand('Clear Answer');
            announce('Answer cleared.', 'polite');
            if (commandHandlers.onClear) commandHandlers.onClear();
        }
        // Check remaining time
        else if (phrase.includes('time') || phrase.includes('clock') || phrase.includes('समय') || phrase.includes('samay')) {
            setLastCommand('Check Time');
            if (commandHandlers.onTime) commandHandlers.onTime();
        }
        // Submit
        else if (phrase.includes('submit') || phrase.includes('सबमिट') || phrase.includes('khatam')) {
            setLastCommand('Submit Exam');
            if (commandHandlers.onSubmit) commandHandlers.onSubmit();
        }
    }, [commandHandlers, announce]);

    const startListening = () => {
        if (!recognitionRef.current || !isSupported) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
            announce('Microphone is active. Listening for voice commands.', 'polite');
        } catch (e) {
            console.warn('Recognition start error:', e);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
            setIsListening(false);
            announce('Microphone stopped.', 'polite');
        } catch (e) {
            console.warn('Recognition stop error:', e);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return {
        isListening,
        transcript,
        lastCommand,
        isSupported,
        startListening,
        stopListening,
        toggleListening
    };
};

export default useVoiceCommands;
