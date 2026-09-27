import React, { useEffect, useRef } from 'react';
import { X, Keyboard, Volume2, Mic, CheckCircle } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

export default function KeyboardHelpModal({ isOpen, onClose }) {
    const modalRef = useRef(null);
    const closeBtnRef = useRef(null);
    const { speak } = useSpeech();

    useEffect(() => {
        if (isOpen) {
            speak('Keyboard shortcuts cheatsheet opened. Press Escape to close.');
            if (closeBtnRef.current) {
                closeBtnRef.current.focus();
            }
        }
    }, [isOpen, speak]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Arrow Right / N', action: 'Move to Next Question' },
        { key: 'Arrow Left / P', action: 'Move to Previous Question' },
        { key: 'Keys 1, 2, 3, 4', action: 'Select Option 1, 2, 3, or 4' },
        { key: 'R or Q', action: 'Read current Question and Options aloud via TTS' },
        { key: 'O', action: 'Read Options only aloud' },
        { key: 'S', action: 'Read your currently selected answer' },
        { key: 'M', action: 'Toggle Mark for Review' },
        { key: 'C', action: 'Clear chosen answer for current question' },
        { key: 'T', action: 'Announce remaining exam time' },
        { key: 'Escape', action: 'Stop audio speech or close dialog' },
        { key: '? or H', action: 'Open this Keyboard Shortcuts Guide' }
    ];

    const voiceCmds = [
        { phrase: '"Next Question" / "अगला प्रश्न"', action: 'Go to next question' },
        { phrase: '"Previous Question" / "पिछला प्रश्न"', action: 'Go to previous question' },
        { phrase: '"Read Question" / "सवाल पढ़ो"', action: 'Read current question' },
        { phrase: '"Option 1, 2, 3, 4"', action: 'Select corresponding option' },
        { phrase: '"Mark for Review"', action: 'Flag question for later' },
        { phrase: '"Clear Answer"', action: 'Clear selected answer' },
        { phrase: '"Remaining Time"', action: 'Hear time left' },
        { phrase: '"Submit Exam"', action: 'Open submission confirmation' }
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            ref={modalRef}
        >
            <div className="bg-[#121212] border-2 border-[#ffe600] rounded-xl max-w-2xl w-full p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center border-b border-neutral-700 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <Keyboard className="w-7 h-7 text-[#ffe600]" aria-hidden="true" />
                        <h2 id="shortcuts-title" className="text-2xl font-bold text-[#ffe600]">
                            Accessibility Shortcuts Guide
                        </h2>
                    </div>
                    <button
                        ref={closeBtnRef}
                        onClick={onClose}
                        className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                        aria-label="Close shortcuts guide"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-200 mb-3 flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-[#ffe600]" aria-hidden="true" />
                            Keyboard Shortcuts (No Mouse Required)
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {shortcuts.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center py-2 px-3 bg-neutral-900 rounded border border-neutral-800"
                                >
                                    <span className="font-mono font-bold text-[#ffe600] bg-neutral-800 px-2 py-1 rounded text-sm">
                                        {item.key}
                                    </span>
                                    <span className="text-neutral-200 text-sm">{item.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-neutral-200 mb-3 flex items-center gap-2">
                            <Mic className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                            Optional Voice Commands (Microphone)
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {voiceCmds.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center py-2 px-3 bg-neutral-900 rounded border border-neutral-800"
                                >
                                    <span className="font-medium text-cyan-300 text-sm">{item.phrase}</span>
                                    <span className="text-neutral-300 text-sm">{item.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#ffe600] text-black font-bold rounded-lg hover:bg-yellow-400 transition"
                    >
                        Close Guide (Esc)
                    </button>
                </div>
            </div>
        </div>
    );
}
