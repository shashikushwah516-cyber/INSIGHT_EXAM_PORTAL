import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import practiceService from '../services/practiceService';
import questionService from '../services/questionService';
import {
    BookOpen,
    Volume2,
    VolumeX,
    CheckCircle,
    XCircle,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    Award,
    HelpCircle,
    Filter,
    Sparkles,
    LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import KeyboardHelpModal from '../components/common/KeyboardHelpModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';

export default function PracticePortal() {
    const { isAuthenticated } = useAuth();
    const { speak, cancel, speaking } = useSpeech();
    const { announce, preferences } = useAccessibility();

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [checkedResult, setCheckedResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    // Practice session scorecard
    const [sessionStats, setSessionStats] = useState({
        attempted: 0,
        correct: 0,
        incorrect: 0
    });
    const [sessionSaved, setSessionSaved] = useState(false);
    const sessionStartTimeRef = useRef(Date.now());

    // Reset focused option on question change
    useEffect(() => {
        setFocusedOptionIndex(0);
    }, [currentIndex]);

    // Fetch subjects metadata on mount
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await questionService.getSubjectsMeta();
                if (res.success) {
                    setSubjects(res.distinctSubjects || []);
                }
            } catch (err) {
                console.warn('Could not load subjects meta:', err);
            }
        };
        fetchMeta();
    }, []);

    // Load practice questions whenever filter changes
    const loadQuestions = useCallback(async () => {
        setLoading(true);
        setCheckedResult(null);
        setSelectedOption(null);
        setCurrentIndex(0);

        try {
            const params = { limit: 10 };
            if (selectedSubject !== 'all') params.subject = selectedSubject;
            if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;

            const res = await practiceService.getQuestions(params);
            if (res.success) {
                setQuestions(res.questions || []);
                const msg = `Practice mode loaded with ${res.questions?.length || 0} questions.`;
                speak(msg);
                announce(msg, 'polite');
            }
        } catch (err) {
            console.error('Error loading practice questions:', err);
            announce('Unable to load questions for practice.', 'assertive', true);
        } finally {
            setLoading(false);
        }
    }, [selectedSubject, selectedDifficulty]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const currentQ = questions[currentIndex] || null;

    // Read question aloud
    const readQuestion = useCallback(
        (force = true) => {
            if (!currentQ) return;
            const opts = currentQ.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join('. ');
            const text = `Practice Question ${currentIndex + 1} of ${questions.length}. Subject: ${currentQ.subject}. ${currentQ.questionText}. ${opts}. Use Up and Down arrow keys to navigate options, and press Enter to check answer. Press Right Arrow for next question.`;
            speak(text, { force });
        },
        [currentQ, currentIndex, questions.length, speak]
    );

    const toggleReadQuestion = useCallback(() => {
        if (speaking) {
            cancel();
            announce('Audio reading stopped.', 'polite');
        } else {
            readQuestion(true);
        }
    }, [speaking, cancel, announce, readQuestion]);

    // Auto-read on change
    useEffect(() => {
        if (!loading && currentQ && preferences.autoReadQuestion && !checkedResult) {
            readQuestion(false);
        }
    }, [currentIndex, loading, !!currentQ]);

    // Select Option
    const handleSelectOption = useCallback(
        async (optIdx) => {
            if (checking || checkedResult) return;
            setSelectedOption(optIdx);

            const optText = currentQ.options[optIdx];
            speak(`Selected Option ${optIdx + 1}: ${optText}`);

            // Automatically check answer in practice mode
            setChecking(true);
            try {
                const res = await practiceService.checkAnswer(currentQ._id, optIdx);
                setCheckedResult(res);

                // Update session stats
                setSessionStats((prev) => ({
                    attempted: prev.attempted + 1,
                    correct: res.isCorrect ? prev.correct + 1 : prev.correct,
                    incorrect: !res.isCorrect ? prev.incorrect + 1 : prev.incorrect
                }));

                // Announce result via speech
                speak(res.audioSpeech || (res.isCorrect ? 'Correct answer!' : 'Incorrect answer.'));
            } catch (err) {
                console.error('Check answer error:', err);
            } finally {
                setChecking(false);
            }
        },
        [checking, checkedResult, currentQ, speak]
    );

    // Controlled Option Navigation via Arrow Keys (Section 5 Standard)
    const handleOptionDown = useCallback(() => {
        if (!currentQ || !currentQ.options?.length) return;
        setFocusedOptionIndex((prev) => {
            const next = (prev + 1) % currentQ.options.length;
            const optLabel = `Option ${next + 1}: ${currentQ.options[next]}`;
            speak(`${optLabel}. Press Enter to select.`);
            announce(`Highlighted ${optLabel}`, 'polite');
            return next;
        });
    }, [currentQ, speak, announce]);

    const handleOptionUp = useCallback(() => {
        if (!currentQ || !currentQ.options?.length) return;
        setFocusedOptionIndex((prev) => {
            const prevIdx = prev <= 0 ? currentQ.options.length - 1 : prev - 1;
            const optLabel = `Option ${prevIdx + 1}: ${currentQ.options[prevIdx]}`;
            speak(`${optLabel}. Press Enter to select.`);
            announce(`Highlighted ${optLabel}`, 'polite');
            return prevIdx;
        });
    }, [currentQ, speak, announce]);

    const handleConfirmOption = useCallback(() => {
        if (focusedOptionIndex >= 0 && currentQ?.options?.[focusedOptionIndex] !== undefined) {
            handleSelectOption(focusedOptionIndex);
        }
    }, [focusedOptionIndex, currentQ, handleSelectOption]);

    const handleClearPracticeAnswer = useCallback(() => {
        if (checkedResult || selectedOption !== null) {
            setSelectedOption(null);
            setCheckedResult(null);
            speak('Practice answer reset. Select an option to try again.');
            announce('Answer reset', 'polite');
        }
    }, [checkedResult, selectedOption, speak, announce]);

    // Save practice session to MongoDB
    const handleSaveSession = useCallback(async () => {
        if (!isAuthenticated || sessionStats.attempted === 0 || sessionSaved) return;
        try {
            const timeTakenSeconds = Math.max(1, Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
            const subjectName = selectedSubject === 'all' ? (currentQ?.subject || 'General') : selectedSubject;
            await practiceService.submitAttempt({
                subject: subjectName,
                topic: 'Subject Practice Set',
                difficulty: selectedDifficulty,
                totalQuestions: questions.length,
                attempted: sessionStats.attempted,
                correct: sessionStats.correct,
                incorrect: sessionStats.incorrect,
                timeTakenSeconds
            });
            setSessionSaved(true);
            const msg = `Practice set recorded. Scored ${sessionStats.correct} out of ${sessionStats.attempted} questions.`;
            speak(msg);
            announce(msg, 'polite');
        } catch (e) {
            console.error('Failed to save practice attempt:', e);
        }
    }, [isAuthenticated, sessionStats, sessionSaved, selectedSubject, currentQ, selectedDifficulty, questions.length, speak, announce]);

    // Next Question
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setCheckedResult(null);
        } else {
            speak('End of practice set reached.');
            announce('End of practice set.', 'polite');
            if (sessionStats.attempted > 0 && !sessionSaved) {
                handleSaveSession();
            }
        }
    }, [currentIndex, questions.length, sessionStats.attempted, sessionSaved, handleSaveSession, speak, announce]);

    // Prev Question
    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setSelectedOption(null);
            setCheckedResult(null);
        }
    }, [currentIndex]);

    // Controlled Keyboard bindings
    useKeyboardNavigation({
        onOptionDown: handleOptionDown,
        onOptionUp: handleOptionUp,
        onSelect: handleConfirmOption,
        onNextQuestion: handleNext,
        onPrevQuestion: handlePrev,
        onNext: handleNext,
        onPrev: handlePrev,
        onRepeatContent: readQuestion,
        onClear: handleClearPracticeAnswer,
        onNumberKey: (key) => handleSelectOption(parseInt(key) - 1),
        onReadQuestion: readQuestion,
        onEscape: () => cancel(),
        onHelp: () => setHelpOpen(true)
    });

    const accuracy =
        sessionStats.attempted > 0
            ? Math.round((sessionStats.correct / sessionStats.attempted) * 100)
            : 0;

    const practiceContent = (
        <div className="space-y-6">
            {/* Header & Filter Controls */}
                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)] mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center border border-[var(--border-color)]">
                                <BookOpen className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                                    Interactive Subject Practice
                                </h1>
                                <p className="text-[var(--text-muted)] text-sm mt-0.5">
                                    Instant answer verification, audible solutions, and accuracy tracking.
                                </p>
                            </div>
                        </div>

                        {/* Real-time session scorecard */}
                        <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] px-4 py-2.5 rounded-2xl border border-[var(--border-color)]">
                            <div className="text-center px-2">
                                <span className="text-xs text-[var(--text-muted)] block font-semibold">Attempted</span>
                                <span className="font-bold text-[var(--text-primary)] text-base">{sessionStats.attempted}</span>
                            </div>
                            <div className="text-center px-2 border-l border-[var(--border-color)]">
                                <span className="text-xs text-[var(--text-muted)] block font-semibold">Correct</span>
                                <span className="font-bold text-[var(--success)] text-base">{sessionStats.correct}</span>
                            </div>
                            <div className="text-center px-2 border-l border-[var(--border-color)]">
                                <span className="text-xs text-[var(--text-muted)] block font-semibold">Accuracy</span>
                                <span className="font-bold text-[var(--primary)] text-base">{accuracy}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="filter-subject" className="block text-xs font-bold text-[var(--text-primary)] uppercase mb-1.5">
                                Filter by Subject
                            </label>
                            <select
                                id="filter-subject"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--focus-ring)] outline-none"
                            >
                                <option value="all">All Subjects</option>
                                {subjects.map((sub, i) => (
                                    <option key={i} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="filter-diff" className="block text-xs font-bold text-[var(--text-primary)] uppercase mb-1.5">
                                Difficulty Level
                            </label>
                            <select
                                id="filter-diff"
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--focus-ring)] outline-none"
                            >
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Practice Question Card */}
                {loading ? (
                    <div role="status" aria-live="polite" className="text-center py-16 text-slate-500">
                        <p className="text-xl">Loading practice questions...</p>
                    </div>
                ) : !currentQ ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <p className="text-xl font-bold text-slate-900 mb-2">No Practice Questions Found</p>
                        <p className="text-slate-500 text-sm">Try choosing "All Subjects" or a different difficulty.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <section
                            aria-labelledby="practice-question-text"
                            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                                <div>
                                    <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-semibold">
                                        {currentQ.subject} • {currentQ.difficulty?.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-slate-500 ml-3">
                                        Question {currentIndex + 1} of {questions.length}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={toggleReadQuestion}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                        speaking
                                            ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300 animate-pulse'
                                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                    }`}
                                    aria-label={speaking ? 'Stop reading practice question' : 'Read practice question aloud (Key R)'}
                                    title={speaking ? 'Click to Stop Reading' : 'Click to Read Aloud (Space / R)'}
                                >
                                    {speaking ? (
                                        <>
                                            <VolumeX className="w-4 h-4" aria-hidden="true" />
                                            <span>Stop Reading</span>
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4" aria-hidden="true" />
                                            <span>Read Aloud (Space / R)</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <h2
                                id="practice-question-text"
                                className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 leading-snug"
                            >
                                {currentQ.questionText}
                            </h2>

                            {/* Options */}
                            <div className="space-y-3" role="radiogroup" aria-label="Practice Options">
                                {currentQ.options.map((optText, optIdx) => {
                                    const isSelected = selectedOption === optIdx;
                                    const isFocused = focusedOptionIndex === optIdx;
                                    const isCorrectAnswer = checkedResult && checkedResult.correctOption === optIdx;
                                    const isWrongSelection = checkedResult && isSelected && !checkedResult.isCorrect;

                                    let borderClass = 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';
                                    if (isCorrectAnswer) {
                                        borderClass = 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 font-semibold';
                                    } else if (isWrongSelection) {
                                        borderClass = 'border-red-500 bg-red-50 text-red-950 ring-2 ring-red-400';
                                    } else if (isSelected) {
                                        borderClass = 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-600';
                                    } else if (isFocused) {
                                        borderClass = 'border-blue-400 bg-slate-50 text-slate-900 ring-2 ring-blue-300';
                                    }

                                    return (
                                        <button
                                            key={optIdx}
                                            type="button"
                                            disabled={!!checkedResult || checking}
                                            onClick={() => {
                                                setFocusedOptionIndex(optIdx);
                                                handleSelectOption(optIdx);
                                            }}
                                            className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition flex items-center gap-4 ${borderClass} disabled:cursor-default`}
                                        >
                                            <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm ${
                                                isCorrectAnswer
                                                    ? 'bg-emerald-600 text-white'
                                                    : isWrongSelection
                                                    ? 'bg-red-600 text-white'
                                                    : isSelected
                                                    ? 'bg-blue-600 text-white'
                                                    : isFocused
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                                {optIdx + 1}
                                            </span>
                                            <span className="text-base sm:text-lg font-medium flex-1">{optText}</span>

                                            {isCorrectAnswer && (
                                                <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold shrink-0 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                                    <span>Correct Answer</span>
                                                </span>
                                            )}
                                            {isWrongSelection && (
                                                <span className="flex items-center gap-1 text-red-700 text-xs font-bold shrink-0 bg-red-100 px-2.5 py-1 rounded-full border border-red-200">
                                                    <XCircle className="w-4 h-4" aria-hidden="true" />
                                                    <span>Your Choice (Incorrect)</span>
                                                </span>
                                            )}
                                            {!checkedResult && isFocused && (
                                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                                    Press Enter to check
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Accessible Navigation Helper Tip */}
                            <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                                <span>Use <kbd className="font-mono font-bold text-blue-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">↑</kbd> <kbd className="font-mono font-bold text-blue-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">↓</kbd> to navigate, <kbd className="font-mono font-bold text-blue-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">Enter</kbd> to verify, <kbd className="font-mono font-bold text-blue-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">Backspace</kbd> to retry.</span>
                                <span className="text-slate-400">Keys 1-4 direct select</span>
                            </div>

                            {/* Explanation Card */}
                            {checkedResult && (
                                <div
                                    role="region"
                                    aria-label="Solution explanation"
                                    className={`mt-6 p-5 rounded-2xl border-2 ${
                                        checkedResult.isCorrect
                                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                            : 'bg-blue-50/50 border-blue-200 text-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                                            Solution & Detailed Explanation
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                speak(
                                                    `Explanation: ${checkedResult.explanation || 'No detailed explanation provided.'}`
                                                )
                                            }
                                            className="inline-flex items-center gap-1 text-xs text-blue-700 font-bold hover:underline"
                                        >
                                            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                                            <span>Hear Explanation</span>
                                        </button>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        {checkedResult.explanation || 'No detailed explanation provided.'}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                disabled={currentIndex === 0}
                                onClick={handlePrev}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                aria-label="Previous Practice Question (← / P)"
                            >
                                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                <span>Previous</span>
                            </button>

                            {currentIndex === questions.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleSaveSession}
                                    disabled={sessionSaved || sessionStats.attempted === 0}
                                    className={`inline-flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-xs transition text-sm ${
                                        sessionSaved
                                            ? 'bg-emerald-600 text-white opacity-90 cursor-default'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                    aria-label="Complete and record practice set"
                                >
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                    <span>{sessionSaved ? 'Practice Recorded ✓' : 'Complete & Record Set'}</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                    aria-label="Next Practice Question (→ / N)"
                                >
                                    <span>Next Question</span>
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
    );

    if (isAuthenticated) {
        return (
            <DashboardLayout
                pageTitle="Interactive Subject Practice"
                pageDescription="Instant answer verification, audible solutions, and accuracy tracking."
            >
                {practiceContent}
                <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
            </DashboardLayout>
        );
    }

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-12">
                <div className="container-app space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">
                                    Interactive Practice Mode
                                </h2>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Answer live questions with immediate spoken explanations. Sign in to permanently track topic-wise accuracy.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/login"
                            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In / 1-Click Login</span>
                        </Link>
                    </div>

                    {practiceContent}
                </div>
            </main>
            <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </PublicLayout>
    );
}
