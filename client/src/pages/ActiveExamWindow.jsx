import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useExamTimer } from '../hooks/useExamTimer';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useAccessibility } from '../context/AccessibilityContext';
import examService from '../services/examService';
import {
    Clock,
    Volume2,
    Mic,
    MicOff,
    CheckCircle2,
    Flag,
    RotateCcw,
    ArrowLeft,
    ArrowRight,
    Send,
    HelpCircle,
    AlertCircle,
    Check,
    CloudCheck
} from 'lucide-react';
import KeyboardHelpModal from '../components/common/KeyboardHelpModal';

export default function ActiveExamWindow() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { speak, cancel } = useSpeech();
    const { announce, preferences } = useAccessibility();

    const [attemptId, setAttemptId] = useState(location.state?.attemptData?.attemptId || null);
    const [exam, setExam] = useState(location.state?.attemptData?.exam || null);
    const [questions, setQuestions] = useState(location.state?.attemptData?.exam?.questions || []);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Map of answers: { [qIndex]: { selectedOption: number|null, isMarkedForReview: boolean } }
    const [answers, setAnswers] = useState(() => {
        const initial = {};
        const saved = location.state?.attemptData?.savedAnswers || [];
        saved.forEach((ans) => {
            initial[ans.questionIndex] = {
                selectedOption: ans.selectedOption,
                isMarkedForReview: ans.isMarkedForReview
            };
        });
        return initial;
    });

    const [expiresAt, setExpiresAt] = useState(location.state?.attemptData?.expiresAt || null);
    const [initialSeconds, setInitialSeconds] = useState(location.state?.attemptData?.remainingSeconds || 1800);
    const [loading, setLoading] = useState(!exam);
    const [saving, setSaving] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    // Auto submission handler when timer expires
    const handleTimeExpired = useCallback(async () => {
        announce('Time expired. Submitting examination automatically.', 'alert', true);
        handleFinalSubmit(true);
    }, []);

    const { formattedTime, announceRemainingTime } = useExamTimer(
        initialSeconds,
        expiresAt,
        handleTimeExpired
    );

    // Initial load or session restoration
    useEffect(() => {
        const initializeSession = async () => {
            if (!exam) {
                try {
                    const startRes = await examService.startExam(id);
                    if (startRes.success) {
                        setAttemptId(startRes.attemptId);
                        setExam(startRes.exam);
                        setQuestions(startRes.exam?.questions || []);
                        setExpiresAt(startRes.expiresAt);
                        setInitialSeconds(startRes.remainingSeconds);

                        const map = {};
                        (startRes.savedAnswers || []).forEach((ans) => {
                            map[ans.questionIndex] = {
                                selectedOption: ans.selectedOption,
                                isMarkedForReview: ans.isMarkedForReview
                            };
                        });
                        setAnswers(map);
                    }
                } catch (err) {
                    console.error('Error starting exam session:', err);
                    announce('Failed to load examination. Please return to exams page.', 'alert', true);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        initializeSession();
    }, [id, exam, announce]);

    // Current Question data
    const currentQ = questions[currentIndex] || null;
    const currentAnswer = answers[currentIndex] || { selectedOption: null, isMarkedForReview: false };

    // Text-To-Speech: Read current question and options
    const readCurrentQuestion = useCallback(() => {
        if (!currentQ) return;
        const qNum = currentIndex + 1;
        const total = questions.length;
        const optionsText = currentQ.options
            .map((opt, i) => `Option ${i + 1}: ${opt}`)
            .join('. ');

        const chosen =
            currentAnswer.selectedOption !== null && currentAnswer.selectedOption !== undefined
                ? `You have selected Option ${currentAnswer.selectedOption + 1}.`
                : 'No option currently selected.';

        const fullText = `Question ${qNum} of ${total}. Subject: ${currentQ.subject || 'General'}. ${currentQ.questionText}. ${optionsText}. ${chosen}. Press keys 1 to 4 to choose an answer.`;
        speak(fullText);
    }, [currentQ, currentIndex, questions.length, currentAnswer.selectedOption, speak]);

    // Read options only
    const readOptionsOnly = useCallback(() => {
        if (!currentQ) return;
        const optionsText = currentQ.options
            .map((opt, i) => `Option ${i + 1}: ${opt}`)
            .join('. ');
        speak(`Options for Question ${currentIndex + 1}: ${optionsText}`);
    }, [currentQ, currentIndex, speak]);

    // Read current selection
    const readSelectedAnswer = useCallback(() => {
        if (currentAnswer.selectedOption !== null && currentAnswer.selectedOption !== undefined) {
            const optText = currentQ?.options[currentAnswer.selectedOption];
            speak(`Selected answer: Option ${currentAnswer.selectedOption + 1}, ${optText}`);
        } else {
            speak('No answer selected for this question.');
        }
    }, [currentAnswer.selectedOption, currentQ, speak]);

    // Auto-read question on change if enabled in user preferences
    useEffect(() => {
        if (!loading && currentQ && preferences.autoReadQuestion) {
            readCurrentQuestion();
        }
    }, [currentIndex, loading]);

    // Autosave answer to backend
    const persistAnswer = async (qIndex, selectedOpt, isMarked) => {
        if (!attemptId || !questions[qIndex]) return;
        setSaving(true);
        try {
            await examService.saveAnswer(attemptId, {
                questionId: questions[qIndex]._id || qIndex,
                questionIndex: qIndex,
                selectedOption: selectedOpt,
                isMarkedForReview: isMarked
            });
            setLastSavedTime(new Date());
        } catch (err) {
            console.warn('Autosave sync error:', err);
        } finally {
            setSaving(false);
        }
    };

    // Answer Selection
    const handleSelectOption = useCallback(
        (optionIndex) => {
            if (!currentQ) return;
            const updated = {
                ...currentAnswer,
                selectedOption: optionIndex
            };

            setAnswers((prev) => ({
                ...prev,
                [currentIndex]: updated
            }));

            const optionLabel = `Option ${optionIndex + 1}: ${currentQ.options[optionIndex]}`;
            announce(`Selected ${optionLabel}`, 'polite');
            speak(`${optionLabel} selected`);

            persistAnswer(currentIndex, optionIndex, updated.isMarkedForReview);
        },
        [currentQ, currentAnswer, currentIndex, attemptId, announce, speak]
    );

    // Clear Answer
    const handleClearAnswer = useCallback(() => {
        if (currentAnswer.selectedOption === null) {
            speak('Answer is already clear.');
            return;
        }

        const updated = {
            ...currentAnswer,
            selectedOption: null
        };

        setAnswers((prev) => ({
            ...prev,
            [currentIndex]: updated
        }));

        announce('Answer cleared for this question.', 'polite');
        speak('Answer cleared');
        persistAnswer(currentIndex, null, updated.isMarkedForReview);
    }, [currentAnswer, currentIndex, speak, announce]);

    // Toggle Mark for Review
    const handleToggleMark = useCallback(() => {
        const newMarked = !currentAnswer.isMarkedForReview;
        const updated = {
            ...currentAnswer,
            isMarkedForReview: newMarked
        };

        setAnswers((prev) => ({
            ...prev,
            [currentIndex]: updated
        }));

        const statusMsg = newMarked ? 'Question marked for review.' : 'Question unmarked from review.';
        announce(statusMsg, 'polite');
        speak(statusMsg);

        persistAnswer(currentIndex, updated.selectedOption, newMarked);
    }, [currentAnswer, currentIndex, speak, announce]);

    // Navigation: Next
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            speak('This is the last question of the examination.');
            announce('Last question reached.', 'polite');
        }
    }, [currentIndex, questions.length, speak, announce]);

    // Navigation: Prev
    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        } else {
            speak('This is the first question.');
            announce('First question.', 'polite');
        }
    }, [currentIndex, speak, announce]);

    // Open Submit Confirmation
    const handleOpenSubmit = useCallback(() => {
        cancel();
        // Compute summary counts
        let answeredCount = 0;
        let markedCount = 0;
        let unansweredCount = 0;

        questions.forEach((_, idx) => {
            const ans = answers[idx];
            if (ans && ans.selectedOption !== null && ans.selectedOption !== undefined) {
                answeredCount += 1;
            } else {
                unansweredCount += 1;
            }
            if (ans && ans.isMarkedForReview) {
                markedCount += 1;
            }
        });

        const promptText = `Submission Confirmation. You have answered ${answeredCount} questions, marked ${markedCount} for review, and left ${unansweredCount} unanswered. Are you sure you want to finish and submit your examination? Press Enter on Confirm Submission or Escape to return.`;
        speak(promptText);
        setSubmitModalOpen(true);
    }, [questions, answers, cancel, speak]);

    // Final Submission
    const handleFinalSubmit = async (isAuto = false) => {
        setSubmitting(true);
        cancel();
        try {
            const formattedAnswers = questions.map((q, idx) => ({
                questionId: q._id || idx,
                questionIndex: idx,
                selectedOption: answers[idx]?.selectedOption ?? null,
                isMarkedForReview: !!answers[idx]?.isMarkedForReview
            }));

            const res = await examService.submitExam(attemptId, formattedAnswers);
            if (res.success) {
                const finishMsg = 'Examination successfully submitted and scored. Loading your detailed result.';
                speak(finishMsg);
                navigate(`/results/${attemptId}`);
            }
        } catch (err) {
            console.error('Submission error:', err);
            const errMsg = err.message || 'Error submitting examination. Retrying...';
            speak(errMsg);
            announce(errMsg, 'assertive');
            setSubmitting(false);
        }
    };

    // Keyboard Shortcuts bindings
    useKeyboardNavigation(
        {
            onNext: handleNext,
            onPrev: handlePrev,
            onNumberKey: (key) => handleSelectOption(parseInt(key) - 1),
            onMark: handleToggleMark,
            onClear: handleClearAnswer,
            onReadQuestion: readCurrentQuestion,
            onReadOptions: readOptionsOnly,
            onReadSelected: readSelectedAnswer,
            onReadTime: announceRemainingTime,
            onEscape: () => {
                cancel();
                if (submitModalOpen) setSubmitModalOpen(false);
            },
            onHelp: () => setHelpOpen(true)
        },
        !submitModalOpen
    );

    // Voice Commands handler
    const voiceHandlers = {
        onNext: handleNext,
        onPrev: handlePrev,
        onRead: readCurrentQuestion,
        onSelectOption: handleSelectOption,
        onMark: handleToggleMark,
        onClear: handleClearAnswer,
        onTime: announceRemainingTime,
        onSubmit: handleOpenSubmit
    };

    const {
        isListening,
        toggleListening,
        isSupported: voiceSupported,
        lastCommand
    } = useVoiceCommands(voiceHandlers, preferences.voiceCommands);

    if (loading) {
        return (
            <main id="main-content" className="min-h-screen flex items-center justify-center p-4">
                <div role="status" aria-live="polite" className="text-center">
                    <p className="text-2xl font-bold text-[#ffe600] mb-2">Preparing Examination Session...</p>
                    <p className="text-neutral-400 text-sm">Validating attempt and retrieving questions safely</p>
                </div>
            </main>
        );
    }

    if (!currentQ) {
        return (
            <main id="main-content" className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">No Questions Found</h1>
                <button
                    onClick={() => navigate('/exams')}
                    className="px-6 py-3 bg-[#ffe600] text-black font-bold rounded-xl"
                >
                    Return to Available Examinations
                </button>
            </main>
        );
    }

    return (
        <main
            id="main-content"
            className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between"
        >
            {/* Top Exam Header */}
            <header className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Exam Name & Progress */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-neutral-800 text-[#ffe600] px-2.5 py-0.5 rounded border border-neutral-700">
                                {exam?.title || 'Competitive Exam'}
                            </span>
                            {saving ? (
                                <span className="text-xs text-yellow-400 flex items-center gap-1 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                                    <CloudCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                                    Synced
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                            Question {currentIndex + 1} of {questions.length}
                        </h1>
                    </div>

                    {/* Timer, Audio & Voice Toolbar */}
                    <div className="flex items-center gap-3">
                        {/* Countdown Timer Display */}
                        <div
                            role="timer"
                            aria-label={`Time remaining: ${formattedTime}`}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-950 border-2 border-[#ffe600] rounded-xl text-[#ffe600] font-mono text-xl sm:text-2xl font-bold shadow-inner"
                        >
                            <Clock className="w-5 h-5" aria-hidden="true" />
                            <span>{formattedTime}</span>
                        </div>

                        {/* Hear Time Button */}
                        <button
                            type="button"
                            onClick={announceRemainingTime}
                            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-[#ffe600] rounded-xl border border-neutral-700 transition"
                            aria-label="Announce remaining time aloud (Key T)"
                            title="Hear Remaining Time (T)"
                        >
                            <Volume2 className="w-5 h-5" aria-hidden="true" />
                        </button>

                        {/* Microphone Voice Recognition Toggle */}
                        {voiceSupported && (
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 ${
                                    isListening
                                        ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
                                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                                }`}
                                aria-label={isListening ? 'Stop Voice Commands' : 'Start Voice Commands'}
                                title="Voice Commands Mic"
                            >
                                {isListening ? (
                                    <>
                                        <Mic className="w-5 h-5 text-red-400" aria-hidden="true" />
                                        <span className="text-xs font-bold hidden sm:inline">Listening</span>
                                    </>
                                ) : (
                                    <MicOff className="w-5 h-5" aria-hidden="true" />
                                )}
                            </button>
                        )}

                        {/* Help Guide */}
                        <button
                            type="button"
                            onClick={() => setHelpOpen(true)}
                            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-[#ffe600] rounded-xl border border-neutral-700 transition"
                            aria-label="Keyboard Shortcuts Help (?)"
                        >
                            <HelpCircle className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Last voice command indicator */}
                {lastCommand && (
                    <div className="mt-2 text-xs text-cyan-400 font-mono bg-cyan-950/40 px-3 py-1 rounded border border-cyan-800/50">
                        Voice Command Detected: "{lastCommand}"
                    </div>
                )}
            </header>

            {/* Main Question & Navigation Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Left 3 Columns: Active Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <section
                        aria-labelledby="question-text-heading"
                        className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl"
                    >
                        {/* Subject & Actions Bar */}
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-800">
                            <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                                {currentQ.subject} • {currentQ.topic}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={readCurrentQuestion}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-[#ffe600] border border-[#ffe600] rounded-lg text-sm font-bold transition"
                                    aria-label="Read question and options aloud (Key R)"
                                >
                                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                                    <span>Read Aloud (R)</span>
                                </button>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="mb-8">
                            <h2
                                id="question-text-heading"
                                className="text-2xl sm:text-3xl font-extrabold text-white leading-snug"
                            >
                                {currentQ.questionText}
                            </h2>
                        </div>

                        {/* Options Group (Fieldset) */}
                        <fieldset className="space-y-4" role="radiogroup" aria-label="Answer Options">
                            <legend className="sr-only">Choose one option for Question {currentIndex + 1}</legend>

                            {currentQ.options.map((optionText, optIdx) => {
                                const isSelected = currentAnswer.selectedOption === optIdx;
                                return (
                                    <button
                                        key={optIdx}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => handleSelectOption(optIdx)}
                                        className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition flex items-start gap-4 ${
                                            isSelected
                                                ? 'bg-neutral-800 border-[#ffe600] ring-2 ring-[#ffe600]'
                                                : 'bg-neutral-950 border-neutral-700 hover:border-neutral-500'
                                        }`}
                                    >
                                        {/* Option Badge (1, 2, 3, 4) */}
                                        <span
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base shrink-0 ${
                                                isSelected
                                                    ? 'bg-[#ffe600] text-black font-extrabold'
                                                    : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                                            }`}
                                        >
                                            {optIdx + 1}
                                        </span>

                                        <span className="text-lg sm:text-xl font-medium text-white pt-0.5 leading-relaxed">
                                            {optionText}
                                        </span>

                                        {isSelected && (
                                            <span className="ml-auto shrink-0 text-[#ffe600] font-bold text-xs bg-[#ffe600]/10 px-2.5 py-1 rounded border border-[#ffe600]/30">
                                                Selected
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </fieldset>

                        {/* Shortcut Tip */}
                        <p className="text-xs text-neutral-400 mt-4">
                            * Tip: Press number keys <kbd className="text-[#ffe600] font-bold">1</kbd>, <kbd className="text-[#ffe600] font-bold">2</kbd>, <kbd className="text-[#ffe600] font-bold">3</kbd>, or <kbd className="text-[#ffe600] font-bold">4</kbd> on your keyboard to select an option immediately.
                        </p>
                    </section>

                    {/* Bottom Question Controls Bar */}
                    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={currentIndex === 0}
                                onClick={handlePrev}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl border border-neutral-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Go to Previous Question (Arrow Left or P)"
                            >
                                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                                <span>Previous (P)</span>
                            </button>

                            <button
                                type="button"
                                disabled={currentIndex === questions.length - 1}
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl border border-neutral-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Go to Next Question (Arrow Right or N)"
                            >
                                <span>Next (N)</span>
                                <ArrowRight className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleToggleMark}
                                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border font-bold transition ${
                                    currentAnswer.isMarkedForReview
                                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                                }`}
                                aria-label="Mark or Unmark Question for Review (Key M)"
                            >
                                <Flag className="w-5 h-5" aria-hidden="true" />
                                <span>{currentAnswer.isMarkedForReview ? 'Unmark Review (M)' : 'Mark Review (M)'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClearAnswer}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold rounded-xl border border-neutral-700 transition"
                                aria-label="Clear selected answer (Key C)"
                            >
                                <RotateCcw className="w-5 h-5" aria-hidden="true" />
                                <span>Clear (C)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right 1 Column: Question Navigator Palette & Submit */}
                <div className="space-y-6">
                    <section
                        aria-labelledby="palette-heading"
                        className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 shadow-xl"
                    >
                        <h2 id="palette-heading" className="text-lg font-bold text-white mb-3">
                            Question Palette
                        </h2>

                        {/* Status Legend */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4 pb-3 border-b border-neutral-800">
                            <div className="flex items-center gap-1.5 text-neutral-300">
                                <span className="w-3.5 h-3.5 rounded bg-emerald-500 shrink-0" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-300">
                                <span className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0" />
                                <span>Marked</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-300">
                                <span className="w-3.5 h-3.5 rounded bg-neutral-700 shrink-0" />
                                <span>Unanswered</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-300">
                                <span className="w-3.5 h-3.5 rounded border-2 border-[#ffe600] shrink-0" />
                                <span>Current</span>
                            </div>
                        </div>

                        {/* Question Grid Buttons */}
                        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                            {questions.map((_, idx) => {
                                const ans = answers[idx];
                                const hasAnswer = ans && ans.selectedOption !== null && ans.selectedOption !== undefined;
                                const isMarked = ans && ans.isMarkedForReview;
                                const isCurrent = idx === currentIndex;

                                let bgClass = 'bg-neutral-800 text-neutral-300 border-neutral-700';
                                let statusLabel = 'Unanswered';

                                if (hasAnswer && isMarked) {
                                    bgClass = 'bg-amber-600 text-white border-amber-400 font-bold';
                                    statusLabel = 'Answered and Marked for Review';
                                } else if (hasAnswer) {
                                    bgClass = 'bg-emerald-600 text-white border-emerald-400 font-bold';
                                    statusLabel = 'Answered';
                                } else if (isMarked) {
                                    bgClass = 'bg-amber-700 text-amber-100 border-amber-400 font-bold';
                                    statusLabel = 'Marked for Review';
                                }

                                const borderRing = isCurrent ? 'ring-2 ring-[#ffe600] border-[#ffe600]' : '';

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-11 rounded-lg border flex items-center justify-center text-sm font-mono transition ${bgClass} ${borderRing}`}
                                        aria-label={`Question ${idx + 1}: ${statusLabel}${isCurrent ? ', Current' : ''}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Submit Examination Button */}
                    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 shadow-xl text-center">
                        <button
                            type="button"
                            onClick={handleOpenSubmit}
                            className="w-full py-4 px-6 bg-[#ffe600] hover:bg-yellow-400 text-black font-extrabold text-lg rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" aria-hidden="true" />
                            <span>Submit Examination</span>
                        </button>
                        <p className="text-xs text-neutral-400 mt-2">
                            A confirmation summary will be displayed before final submission.
                        </p>
                    </div>
                </div>
            </div>

            {/* Submission Confirmation Modal Dialog */}
            {submitModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="submit-modal-title"
                >
                    <div className="bg-neutral-900 border-2 border-[#ffe600] rounded-2xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-8 h-8 text-[#ffe600]" aria-hidden="true" />
                            <h2 id="submit-modal-title" className="text-2xl font-extrabold text-white">
                                Confirm Submission
                            </h2>
                        </div>

                        <p className="text-neutral-300 text-sm mb-6">
                            Please review your examination attempt statistics before confirming your submission. Once submitted, your score will be calculated immediately.
                        </p>

                        {/* Summary breakdown stats */}
                        <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-950 rounded-xl border border-neutral-800 mb-6 text-center">
                            <div>
                                <span className="text-xs text-neutral-400 block font-semibold">Answered</span>
                                <span className="text-2xl font-bold text-emerald-400">
                                    {Object.values(answers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-neutral-400 block font-semibold">Marked Review</span>
                                <span className="text-2xl font-bold text-amber-400">
                                    {Object.values(answers).filter((a) => a.isMarkedForReview).length}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-neutral-400 block font-semibold">Unanswered</span>
                                <span className="text-2xl font-bold text-neutral-400">
                                    {questions.length - Object.values(answers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleFinalSubmit(false)}
                                className="flex-1 py-3.5 px-4 bg-[#ffe600] hover:bg-yellow-400 text-black font-extrabold text-base rounded-xl transition disabled:opacity-50"
                            >
                                {submitting ? 'Calculating Score...' : 'Confirm Submission (Enter)'}
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setSubmitModalOpen(false)}
                                className="py-3.5 px-5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-base rounded-xl border border-neutral-700 transition"
                            >
                                Return to Exam (Esc)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </main>
    );
}
