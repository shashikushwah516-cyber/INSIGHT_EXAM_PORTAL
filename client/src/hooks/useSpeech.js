import { useAccessibility } from '../context/AccessibilityContext';

export const useSpeech = () => {
    const {
        speak,
        cancel,
        pauseSpeech: pause,
        resumeSpeech: resume,
        speaking,
        isSpeaking
    } = useAccessibility();

    return {
        speak,
        cancel,
        pause,
        resume,
        speaking,
        isSpeaking
    };
};

export default useSpeech;

