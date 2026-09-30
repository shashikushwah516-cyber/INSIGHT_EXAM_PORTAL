import React, { useEffect, useRef } from 'react';
import { X, Keyboard, Volume2, Mic, CheckCircle } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

export default function KeyboardHelpModal({ isOpen, onClose }) {
    const modalRef = useRef(null);
    const closeBtnRef = useRef(null);
    const { speak } = useSpeech();

    useEffect(() => {
        if (isOpen) {
            speak('Keyboard shortcuts cheatsheet opened. Press Escape to close.', { force: true });
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
        { key: 'R', action: 'Repeat Current Question & Options aloud' },
        { key: 'Keys 1, 2, 3, 4', action: 'Directly select Option 1, 2, 3, or 4' },
        { key: 'Right Arrow (→)', action: 'Move to Next Question' },
        { key: 'Left Arrow (←)', action: 'Move to Previous Question' },
        { key: 'I', action: 'Describe Visual figure aloud (Level 1 Quick Summary)' },
        { key: 'D', action: 'Detailed Visual Description (Level 2 Breakdown)' },
        { key: 'T', action: 'Announce remaining exam time aloud' },
        { key: 'S', action: 'Open Submit Examination confirmation' },
        { key: 'Y', action: 'Confirm Submission (in confirmation dialog)' },
        { key: 'Escape', action: 'Cancel Submission or stop audio narration' },
        { key: 'M', action: 'Toggle Mark for Review' },
        { key: 'Backspace / C', action: 'Clear chosen answer for current question' },
        { key: 'Up / Down Arrows', action: 'Move option focus (optional)' },
        { key: 'Enter', action: 'Confirm focused option' },
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            ref={modalRef}
        >
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-7 text-slate-900 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                            <Keyboard className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="shortcuts-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Controlled Keyboard Navigation
                            </h2>
                            <p className="text-xs text-slate-500">Universal accessibility shortcuts — fully operable without a mouse</p>
                        </div>
                    </div>
                    <button
                        ref={closeBtnRef}
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                        aria-label="Close shortcuts guide"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
                            Standard Keyboard Navigation (Section 5 Standard)
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {shortcuts.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition"
                                >
                                    <span className="font-mono font-bold text-blue-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-xs shadow-2xs">
                                        {item.key}
                                    </span>
                                    <span className="text-slate-700 text-xs sm:text-sm font-medium">{item.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                            <Mic className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                            Optional Voice Dictation Commands (Web Speech API)
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {voiceCmds.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-200/80"
                                >
                                    <span className="font-medium text-indigo-700 text-xs sm:text-sm">{item.phrase}</span>
                                    <span className="text-slate-600 text-xs sm:text-sm">{item.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-sm text-sm"
                    >
                        Close Guide (Esc)
                    </button>
                </div>
            </div>
        </div>
    );
}
