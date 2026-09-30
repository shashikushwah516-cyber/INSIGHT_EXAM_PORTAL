import React, { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { askAIAssistant } from '../../services/aiService';
import {
    Sparkles,
    X,
    Send,
    Volume2,
    VolumeX,
    RotateCcw,
    Trash2,
    Mic,
    MicOff,
    Bot,
    User,
    AlertTriangle
} from 'lucide-react';

export default function AIAssistantModal({ isOpen, onClose, isExamActive = false }) {
    const { preferences, speak, stopSpeech } = useAccessibility();
    const [messages, setMessages] = useState([
        {
            sender: 'assistant',
            text: preferences.language === 'hi'
                ? 'नमस्ते! मैं आपका वॉइस-फर्स्ट एआई सहायक हूँ। आप मुझसे परीक्षा नियमों, कीबोर्ड शॉर्टकट्स, अभ्यास प्रश्नों अथवा आवाज की सेटिंग्स के बारे में पूछ सकते हैं।'
                : 'Hello! I am your voice-first AI Assistant. Ask me anything about examination rules, controlled keyboard shortcuts, practice modules, or speech settings.'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [liveAnnouncement, setLiveAnnouncement] = useState('');

    const modalRef = useRef(null);
    const inputRef = useRef(null);
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initial greeting and focus
    useEffect(() => {
        if (isOpen) {
            const announcement = isExamActive
                ? 'AI Assistant opened. Notice: AI assistance is strictly disabled during active examinations.'
                : 'AI Assistant opened. Type your query or press Tab to access controls. Press Escape to close.';
            speak(announcement);
            setLiveAnnouncement(announcement);
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 100);
        } else {
            stopSpeech();
        }
    }, [isOpen, isExamActive]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Escape key listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                e.preventDefault();
                stopSpeech();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Speech-to-Text Setup
    const toggleSpeechRecognition = () => {
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            speak('Speech recognition is not supported in this browser.');
            return;
        }

        const rec = new SpeechRec();
        rec.lang = preferences.language === 'hi' ? 'hi-IN' : 'en-US';
        rec.continuous = false;
        rec.interimResults = false;

        rec.onstart = () => {
            setIsListening(true);
            speak('Listening to your query...');
        };

        rec.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            setIsListening(false);
            handleSendMessage(transcript);
        };

        rec.onerror = () => {
            setIsListening(false);
            speak('Could not recognize voice. Please try again or type your query.');
        };

        rec.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
    };

    const handleSendMessage = async (textToSend = inputText) => {
        const query = (textToSend || '').trim();
        if (!query || isLoading) return;

        setInputText('');
        setMessages((prev) => [...prev, { sender: 'user', text: query }]);
        setIsLoading(true);

        try {
            const res = await askAIAssistant(query, preferences.language, { isExamActive });
            const reply = res.reply || 'I am ready to assist you. Please ask any question.';

            setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
            setLiveAnnouncement(`AI response received: ${reply}`);
            speak(reply);
        } catch (err) {
            const errorMsg = 'Could not retrieve AI response. Please check connection and try again.';
            setMessages((prev) => [...prev, { sender: 'assistant', text: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-modal-title"
            ref={modalRef}
        >
            {/* ARIA Live Region for Screen Readers */}
            <div role="status" aria-live="polite" className="sr-only">
                {liveAnnouncement}
            </div>

            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
                {/* 1. Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <Sparkles className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="ai-modal-title" className="text-lg font-black text-slate-900 leading-tight flex items-center gap-2">
                                <span>Voice-First AI Assistant</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
                                    Accessible
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500">Ask questions regarding platform features, exams, and concepts</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                stopSpeech();
                                setMessages([messages[0]]);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                            aria-label="Clear chat history"
                            title="Clear conversation"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                stopSpeech();
                                onClose();
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                            aria-label="Close AI Assistant (Escape)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Active Exam Integrity Banner */}
                {isExamActive && (
                    <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2.5 text-xs text-amber-800 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                        <span>Competitive Examination In Progress: AI Assistance is restricted to ensure testing integrity.</span>
                    </div>
                )}

                {/* 2. Messages Canvas */}
                <div
                    className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50"
                    role="log"
                    aria-label="Conversation messages"
                >
                    {messages.map((msg, idx) => {
                        const isAssistant = msg.sender === 'assistant';
                        return (
                            <div
                                key={idx}
                                className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                            >
                                {isAssistant && (
                                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                                        isAssistant
                                            ? 'bg-white border border-slate-200 text-slate-800'
                                            : 'bg-blue-600 text-white'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.text}</p>

                                    {isAssistant && (
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => speak(msg.text)}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                                                aria-label="Read this response aloud"
                                            >
                                                <Volume2 className="w-3.5 h-3.5" />
                                                <span>Read Aloud</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={stopSpeech}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition ml-2"
                                                aria-label="Stop reading"
                                            >
                                                <VolumeX className="w-3.5 h-3.5" />
                                                <span>Stop</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {!isAssistant && (
                                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex gap-3 items-center text-slate-400 text-xs font-semibold">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 animate-spin" />
                            </div>
                            <span>Generating accessible response...</span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* 3. Input Controls Bar */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                    {/* Voice Dictation Button */}
                    <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 ${
                            isListening
                                ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                        }`}
                        aria-label={isListening ? 'Stop listening to microphone' : 'Speak your query through microphone'}
                        title={isListening ? 'Listening...' : 'Voice Dictation'}
                    >
                        {isListening ? <Mic className="w-5 h-5 text-red-600" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={
                            preferences.language === 'hi'
                                ? 'अपना प्रश्न लिखें या माइक दबाएं...'
                                : 'Ask how to practice, navigate, or understand questions...'
                        }
                        className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-600 focus:bg-white outline-none transition"
                        aria-label="Type message to AI Assistant"
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !inputText.trim()}
                        className="h-11 px-4 sm:px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
                        aria-label="Send message to AI Assistant"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
