import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import apiClient from '../services/apiClient';
import {
    Clock,
    Volume2,
    VolumeX,
    CheckCircle2,
    Flag,
    RotateCcw,
    ArrowLeft,
    ArrowRight,
    Send,
    HelpCircle,
    AlertCircle,
    Check,
    Keyboard,
    ShieldAlert,
    BookOpen,
    Maximize
} from 'lucide-react';
import { useSecureExam } from '../hooks/useSecureExam';

const FALLBACK_QUESTIONS = [
    {
        _id: 'q1',
        questionText: 'Which HTML5 element is specifically used to declare the navigation section of an accessible digital platform?',
        options: ['<nav>', '<section>', '<header>', '<aside>'],
        correctOption: 0
    },
    {
        _id: 'q2',
        questionText: 'Under WCAG 2.2 AA standards, what is the minimum contrast ratio required for standard body text?',
        options: ['3:1', '4.5:1', '7:1', '2:1'],
        correctOption: 1
    },
    {
        _id: 'q3',
        questionText: 'What key combination is universally recommended as an accessible shortcut for screen reader users to skip repeated navigation menus?',
        options: ['Ctrl + C', 'Skip Link via Tab key', 'Alt + F4', 'Shift + Esc'],
        correctOption: 1
    },
    {
        _id: 'q4',
        questionText: 'In computer fundamentals, which component is considered the primary brain that performs arithmetic and logical instructions?',
        options: ['RAM (Random Access Memory)', 'Central Processing Unit (CPU)', 'Solid State Drive (SSD)', 'Power Supply Unit'],
        correctOption: 1
    },
    {
        _id: 'q5',
        questionText: 'Which Web Speech API interface is used in modern browsers to convert text directly into synthesized speech audio?',
        options: ['SpeechRecognition', 'AudioContext', 'SpeechSynthesisUtterance', 'MediaStreamTrack'],
        correctOption: 2
    }
];

export default function ExamWindow({ token: propToken }) {
    const { user, token: ctxToken } = useAuth();
    const token = propToken || ctxToken || (typeof window !== 'undefined' ? localStorage.getItem('insight_token') : null);
    const { preferences, speak, announce, cancel, speaking } = useAccessibility();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIdx]: selectedOptionIndex }
    const [markedReview, setMarkedReview] = useState({}); // { [qIdx]: boolean }
    const [remainingSeconds, setRemainingSeconds] = useState(1800); // 30 mins
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [score, setScore] = useState(0);

    // Secure Exam Mode & Fullscreen Lockdown
    const {
        isFullscreen,
        securityAlert,
        requestFullscreen,
        exitFullscreen,
        dismissAlert,
        checkFullscreenState
    } = useSecureExam({
        remainingSeconds,
        enabled: !isSubmitted && !showSubmitModal
    });

    // Auto Fullscreen on mount / user interaction
    useEffect(() => {
        const tryFullscreen = async () => {
            if (!checkFullscreenState()) {
                await requestFullscreen();
            }
        };
        tryFullscreen();

        const handleUserGesture = async () => {
            if (!checkFullscreenState()) {
                await requestFullscreen();
            }
        };
        window.addEventListener('click', handleUserGesture, { once: true });
        window.addEventListener('keydown', handleUserGesture, { once: true });

        return () => {
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
        };
    }, [checkFullscreenState, requestFullscreen]);

    // Cleanup: Turn off fullscreen when exam component unmounts
    useEffect(() => {
        return () => {
            exitFullscreen();
        };
    }, [exitFullscreen]);

    // Handle alert dismissal and F key for fullscreen
    useEffect(() => {
        const handleKeys = async (e) => {
            if (securityAlert && (e.key === 'Enter' || e.key === 'Escape')) {
                e.preventDefault();
                dismissAlert();
                await requestFullscreen();
                speak('Returning to examination in fullscreen mode.', { force: true });
                return;
            }

            if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const tag = e.target?.tagName?.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
                e.preventDefault();
                if (!checkFullscreenState()) {
                    await requestFullscreen();
                    speak('Fullscreen lockdown mode activated.', { force: true });
                }
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [securityAlert, dismissAlert, requestFullscreen, checkFullscreenState, speak]);

    // Fetch questions from API or fallback
    useEffect(() => {
        let isMounted = true;
        const fetchQuestions = async () => {
            try {
                const data = await apiClient.get('/exams/questions');
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    setQuestions(data);
                    return;
                }
            } catch (e) {
                // If API fails or unauthenticated, fallback gracefully
            }
            if (isMounted) {
                setQuestions(FALLBACK_QUESTIONS);
            }
        };

        fetchQuestions();
        return () => { isMounted = false; };
    }, []);

    const timerAnnouncedRef = useRef(new Set());

    // T Key: Tell remaining exam time (Part 4)
    const announceRemainingTime = useCallback(() => {
        const m = Math.floor(remainingSeconds / 60);
        const s = remainingSeconds % 60;
        let text = '';
        if (m > 0 && s > 0) {
            text = `You have ${m} minute${m !== 1 ? 's' : ''} and ${s} second${s !== 1 ? 's' : ''} remaining.`;
        } else if (m > 0) {
            text = `You have ${m} minute${m !== 1 ? 's' : ''} remaining.`;
        } else {
            text = `You have ${s} second${s !== 1 ? 's' : ''} remaining.`;
        }
        speak(text, { force: true });
        announce(text, 'polite');
    }, [remainingSeconds, speak, announce]);

    // Timer Countdown with Intelligent Milestone Announcements (Part 4 & 5)
    useEffect(() => {
        if (!isTimerRunning || isSubmitted || remainingSeconds <= 0) return;

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                const nextSec = prev - 1;
                if (nextSec <= 0) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }

                // Periodic intelligent milestones (1800, 1200, 600, 300, 180, 120, 60, 30, 10)
                const milestones = {
                    1800: 'You have 30 minutes remaining.',
                    1200: 'You have 20 minutes remaining.',
                    600: 'You have 10 minutes remaining.',
                    300: 'You have 5 minutes remaining.',
                    180: 'You have 3 minutes remaining.',
                    120: 'You have 2 minutes remaining.',
                    60: 'You have 1 minute remaining.',
                    30: 'You have 30 seconds remaining.',
                    10: 'You have 10 seconds remaining.'
                };

                if (milestones[nextSec] && !timerAnnouncedRef.current.has(nextSec)) {
                    timerAnnouncedRef.current.add(nextSec);
                    speak(milestones[nextSec], { queue: true, force: true });
                    announce(milestones[nextSec], nextSec <= 60 ? 'assertive' : 'polite');
                }

                return nextSec;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning, isSubmitted, remainingSeconds, handleAutoSubmit, speak, announce]);

    // Visual Description Handlers (Part 6, 10, 15)
    const handleDescribeVisual = useCallback((level = 'quick') => {
        const q = questions[currentIndex];
        if (!q) return;

        const hasVisual = q.hasVisual || q.imageUrl || (q.visualDescription && (q.visualDescription.quick || q.visualDescription.detailed));
        if (!hasVisual) {
            const noVisualMsg = 'This question does not contain any visual images or figures.';
            speak(noVisualMsg, { force: true });
            announce(noVisualMsg, 'polite');
            return;
        }

        const quick = q.visualDescription?.quick || q.visualAlt || 'Visual figure for question.';
        const detailed = q.visualDescription?.detailed || q.visualDescription?.quick || q.visualAlt || 'Detailed visual figure.';
        const spoken = level === 'detailed' ? `Detailed visual description: ${detailed}` : `Visual description: ${quick}`;

        speak(spoken, { force: true });
        announce(spoken, 'polite');
    }, [questions, currentIndex, speak, announce]);

    const handleDescribeVisualQuick = useCallback(() => handleDescribeVisual('quick'), [handleDescribeVisual]);
    const handleDescribeVisualDetailed = useCallback(() => handleDescribeVisual('detailed'), [handleDescribeVisual]);

    // Read question audio narration
    // Text-To-Speech: Read question and options for a specified question index
    const readQuestionForIndex = useCallback((indexToRead, force = true) => {
        const idx = indexToRead !== undefined ? indexToRead : currentIndex;
        if (!questions[idx]) return;

        const q = questions[idx];
        const qNum = idx + 1;
        const total = questions.length;
        const optionsText = (q.options || [])
            .map((opt, i) => `Option ${i + 1}: ${opt}`)
            .join('. ');

        const hasVisual = q.hasVisual || q.imageUrl || (q.visualDescription && (q.visualDescription.quick || q.visualDescription.detailed));
        const visualNotice = hasVisual ? ' This question contains a visual. Press I to hear a description of the visual.' : '';

        const text = `Question ${qNum} of ${total}. ${q.questionText}.${visualNotice} ${optionsText}.`;
        speak(text, { force });
        announce(`Question ${qNum} of ${total}: ${q.questionText}`, 'polite');
    }, [currentIndex, questions, speak, announce]);

    // R Key: Repeat current question aloud (Section 2 & 11)
    const handleRepeatQuestion = useCallback(() => {
        if (!questions[currentIndex]) return;
        const q = questions[currentIndex];
        const qNum = currentIndex + 1;
        const optionsText = (q.options || [])
            .map((opt, i) => `Option ${i + 1}: ${opt}`)
            .join('. ');

        const hasVisual = q.hasVisual || q.imageUrl || (q.visualDescription && (q.visualDescription.quick || q.visualDescription.detailed));
        const visualNotice = hasVisual ? ' This question contains a visual. Press I to hear a description of the visual.' : '';

        const repeatText = `Repeating Question ${qNum}. Question ${qNum}. ${q.questionText}.${visualNotice} ${optionsText}.`;
        speak(repeatText, { force: true });
        announce(`Repeating Question ${qNum}`, 'polite');
    }, [currentIndex, questions, speak, announce]);

    // Read question automatically on index change if preference enabled
    useEffect(() => {
        if (questions.length > 0 && preferences?.speechEnabled && !isSubmitted) {
            readQuestionForIndex(currentIndex, false);
        }
    }, [currentIndex, questions.length, preferences?.speechEnabled, isSubmitted, readQuestionForIndex]);

    // Option selection with numbers 1, 2, 3, 4 (Section 1 & 3)
    const handleSelectOption = useCallback((optIdx) => {
        if (!questions[currentIndex] || !questions[currentIndex].options || questions[currentIndex].options[optIdx] === undefined) return;
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentIndex]: optIdx
        }));
        const optionNum = optIdx + 1;
        const announcement = `Option ${optionNum} selected.`;
        announce(announcement, 'assertive');
        speak(announcement, { force: true });
    }, [currentIndex, questions, announce, speak]);

    // Navigation: Next (Arrow Right) (Section 4)
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            cancel();
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            readQuestionForIndex(nextIdx, true);
        } else {
            speak('This is the last question of the examination.', { force: true });
            announce('Last question reached.', 'polite');
        }
    }, [currentIndex, questions.length, cancel, readQuestionForIndex, speak, announce]);

    // Navigation: Prev (Arrow Left) (Section 4)
    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            cancel();
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            readQuestionForIndex(prevIdx, true);
        } else {
            speak('This is the first question.', { force: true });
            announce('First question.', 'polite');
        }
    }, [currentIndex, cancel, readQuestionForIndex, speak, announce]);

    const toggleMarkForReview = useCallback(() => {
        setMarkedReview((prev) => {
            const nextState = !prev[currentIndex];
            if (nextState) {
                speak(`Question ${currentIndex + 1} marked for review.`);
                announce(`Question ${currentIndex + 1} flagged for review.`, 'polite');
            } else {
                speak(`Question ${currentIndex + 1} unflagged.`);
                announce(`Question ${currentIndex + 1} review flag removed.`, 'polite');
            }
            return {
                ...prev,
                [currentIndex]: nextState
            };
        });
    }, [currentIndex, speak, announce]);

    const handleClearResponse = useCallback(() => {
        setSelectedAnswers((prev) => {
            const copy = { ...prev };
            delete copy[currentIndex];
            return copy;
        });
        speak(`Response cleared for question ${currentIndex + 1}.`);
        announce(`Response cleared for question ${currentIndex + 1}.`, 'polite');
    }, [currentIndex, speak, announce]);

    const toggleReadQuestion = useCallback((idx) => {
        if (speaking) {
            cancel();
            announce('Audio reading stopped.', 'polite');
        } else {
            handleRepeatQuestion();
        }
    }, [speaking, cancel, announce, handleRepeatQuestion]);

    const calculateScore = useCallback(() => {
        let total = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctOption) {
                total += 1;
            }
        });
        setScore(total);
    }, [questions, selectedAnswers]);

    // S Key: Open Submit Confirmation (Section 5)
    const handleOpenSubmit = useCallback(() => {
        cancel();
        const total = questions.length;
        const answered = Object.keys(selectedAnswers).length;
        const unanswered = total - answered;

        let promptText = '';
        if (unanswered === 0) {
            promptText = `You have answered all ${total} questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        } else {
            promptText = `You have answered ${answered} out of ${total} questions. You have ${unanswered} unanswered questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        }

        speak(promptText, { force: true });
        announce(promptText, 'assertive');
        setShowSubmitModal(true);
    }, [questions.length, selectedAnswers, cancel, speak, announce]);

    // Y Key: Confirm Submission (Section 6)
    const handleConfirmSubmit = useCallback(async () => {
        setShowSubmitModal(false);
        setIsTimerRunning(false);

        const submittingMsg = 'Submitting your examination. Please wait.';
        speak(submittingMsg, { force: true });
        announce(submittingMsg, 'assertive');

        try {
            const formattedAnswers = questions.map((q, idx) => ({
                questionId: q._id || q.id || idx,
                questionIndex: idx,
                selectedOption: selectedAnswers[idx] ?? null,
                isMarkedForReview: !!markedReview[idx]
            }));

            let submittedOnline = false;
            let targetAttemptId = null;

            if (token) {
                try {
                    const res = await apiClient.post('/attempts/submit', { answers: formattedAnswers });
                    if (res && res.success) {
                        submittedOnline = true;
                        targetAttemptId = res.attemptId || res.result?.attemptId;
                    }
                } catch (apiErr) {
                    console.warn('Backend submission failed, falling back to local scorecard:', apiErr);
                }
            }

            if (submittedOnline && targetAttemptId) {
                await exitFullscreen();
                const successMsg = 'Your examination has been submitted successfully.';
                speak(successMsg, { force: true });
                announce(successMsg, 'polite');
                navigate(`/results/${targetAttemptId}`);
            } else {
                await exitFullscreen();
                calculateScore();
                setIsSubmitted(true);
                const successMsg = 'Your examination has been submitted successfully.';
                speak(successMsg, { force: true });
                announce(successMsg, 'polite');
            }
        } catch (err) {
            const failMsg = 'Your examination could not be submitted. Please try again.';
            speak(failMsg, { force: true });
            announce(failMsg, 'assertive');
            setIsTimerRunning(true);
        }
    }, [calculateScore, speak, announce, questions, selectedAnswers, markedReview, token, navigate]);

    // Escape Key during submit confirmation: Cancel Submission (Section 7)
    const handleCancelSubmit = useCallback(() => {
        cancel();
        setShowSubmitModal(false);
        const cancelMsg = 'Submission cancelled. You are back in the examination.';
        speak(cancelMsg, { force: true });
        announce(cancelMsg, 'polite');
    }, [cancel, speak, announce]);

    const handleEscape = useCallback(() => {
        if (showSubmitModal) {
            handleCancelSubmit();
        } else {
            cancel();
            announce('Audio reading stopped.', 'polite');
        }
    }, [showSubmitModal, handleCancelSubmit, cancel, announce]);

    const handleAutoSubmit = useCallback(() => {
        setShowSubmitModal(false);
        setIsTimerRunning(false);
        calculateScore();
        setIsSubmitted(true);
        speak('Exam time has expired. Your responses have been submitted automatically.');
    }, [calculateScore, speak]);

    // Controlled Keyboard Navigation (Sections 1-9 & Parts 4, 6, 10, 15)
    useKeyboardNavigation({
        isSubmitModalOpen: showSubmitModal,
        onRepeatQuestion: handleRepeatQuestion,
        onNextQuestion: handleNext,
        onPrevQuestion: handlePrev,
        onNumberKey: (key) => handleSelectOption(parseInt(key, 10) - 1),
        onOpenSubmit: handleOpenSubmit,
        onSubmit: handleOpenSubmit,
        onConfirmSubmit: handleConfirmSubmit,
        onCancelSubmit: handleCancelSubmit,
        onEscape: handleEscape,
        onMark: toggleMarkForReview,
        onClear: handleClearResponse,
        onReadTime: announceRemainingTime,
        onTellTime: announceRemainingTime,
        onDescribeVisual: handleDescribeVisualQuick,
        onDetailedVisual: handleDescribeVisualDetailed,
        onVisualQuick: handleDescribeVisualQuick,
        onVisualDetailed: handleDescribeVisualDetailed
    }, !isSubmitted);

    // Format seconds MM:SS
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-xl font-bold">Loading Accessible Exam Window...</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Configuring audio narration & keyboard navigation</p>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const totalAnswered = Object.keys(selectedAnswers).length;
    const currentSelectedOpt = selectedAnswers[currentIndex];
    const isCurrentMarked = !!markedReview[currentIndex];

    // Submitted Result View
    if (isSubmitted) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6 transition-colors duration-200">
                <div className="max-w-xl w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-[var(--success)]/20 text-[var(--success)] flex items-center justify-center mx-auto border-2 border-[var(--success)]/40">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)]">Exam Completed!</h1>
                        <p className="text-[var(--text-secondary)] text-sm mt-2">
                            Your responses have been securely verified and recorded.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)]">
                        <div>
                            <span className="text-xs text-[var(--text-muted)] font-semibold block">Total Questions</span>
                            <span className="text-xl font-bold text-[var(--text-primary)] mt-1 block">{questions.length}</span>
                        </div>
                        <div>
                            <span className="text-xs text-[var(--text-muted)] font-semibold block">Answered</span>
                            <span className="text-xl font-bold text-[var(--primary)] mt-1 block">{totalAnswered}</span>
                        </div>
                        <div>
                            <span className="text-xs text-[var(--text-muted)] font-semibold block">Score</span>
                            <span className="text-xl font-bold text-[var(--success)] mt-1 block">{score} / {questions.length} ({percentage}%)</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] font-bold text-sm transition hover:opacity-90 shadow-sm"
                        >
                            Return to Dashboard
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSubmitted(false);
                                setCurrentIndex(0);
                                setSelectedAnswers({});
                                setMarkedReview({});
                                setRemainingSeconds(1800);
                                setIsTimerRunning(true);
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-primary)] font-bold text-sm transition"
                        >
                            Retake Practice Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
            {/* Top Exam Navigation & Status Banner */}
            <header className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
                            Insight Online Assessment - Live Window
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Candidate: <span className="font-mono font-bold text-[var(--text-primary)]">{user?.rollNumber || 'CAND101'}</span>
                        </p>
                    </div>
                </div>

                {/* Right Controls: Timer + Read Out + Submit */}
                <div className="flex items-center gap-3">
                    {/* Fullscreen Lockdown Status Indicator */}
                    <button
                        type="button"
                        onClick={async () => {
                            if (!checkFullscreenState()) {
                                await requestFullscreen();
                                speak('Fullscreen lockdown mode activated.', { force: true });
                            }
                        }}
                        className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition shadow-xs cursor-pointer ${
                            isFullscreen
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 animate-pulse'
                        }`}
                        title={isFullscreen ? 'Exam Lockdown Active in Fullscreen' : 'Lockdown Alert: Not in fullscreen. Click or press F to enter'}
                        aria-label={isFullscreen ? 'Exam Lockdown Active in Fullscreen' : 'Lockdown Warning: Not in fullscreen. Click to enter'}
                    >
                        {isFullscreen ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>🔒 Fullscreen Lockdown</span>
                            </>
                        ) : (
                            <>
                                <Maximize className="w-3.5 h-3.5" />
                                <span>⚠️ Enter Fullscreen (F)</span>
                            </>
                        )}
                    </button>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-mono font-bold ${
                        remainingSeconds < 300 
                            ? 'bg-[var(--danger)]/20 border-[var(--danger)] text-[var(--danger)] animate-pulse' 
                            : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]'
                    }`}>
                        <Clock className="w-4 h-4 text-[var(--warning)]" />
                        <span>{formatTime(remainingSeconds)}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleReadQuestion(currentIndex, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                            speaking
                                ? 'bg-[var(--warning)] text-black border-[var(--warning)] ring-2 ring-[var(--warning)]'
                                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]'
                        }`}
                        title={speaking ? 'Click to Stop (Escape)' : 'Read Question Aloud (Space, R, or Q)'}
                    >
                        {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[var(--primary)]" />}
                        <span className="hidden sm:inline">{speaking ? 'Stop Reading' : 'Read Aloud'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenSubmit}
                        className="px-4 py-1.5 rounded-xl bg-[var(--success)] text-[var(--bg-primary)] hover:opacity-90 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        title="Submit Exam (Alt+S)"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Exam</span>
                    </button>
                </div>
            </header>

            {/* Main Exam Content Layout */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left 3 Cols: Active Question Card */}
                <section className="lg:col-span-3 flex flex-col justify-between space-y-6">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm">
                        {/* Question Metadata Header */}
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-6">
                            <span className="px-3 py-1 rounded-full bg-[var(--primary-subtle)] border border-[var(--border-color)] text-[var(--primary)] font-bold text-xs uppercase">
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleReadQuestion(currentIndex, true)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer ${
                                        speaking
                                            ? 'bg-[var(--warning)] text-black border-[var(--warning)] ring-2 ring-[var(--warning)]'
                                            : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]'
                                    }`}
                                    title={speaking ? 'Stop reading (Escape)' : 'Listen to question (Space, R, or Q)'}
                                    aria-label={speaking ? 'Stop reading question aloud' : 'Listen to question aloud'}
                                >
                                    {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[var(--primary)]" />}
                                    <span>{speaking ? 'Stop Reading' : 'Listen (Space / R)'}</span>
                                </button>
                                {isCurrentMarked && (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-[var(--warning)]/20 border border-[var(--warning)] text-[var(--warning)] font-bold text-xs flex items-center gap-1">
                                        <Flag className="w-3 h-3 text-[var(--warning)]" />
                                        Review Flagged
                                    </span>
                                )}
                                <span className="text-xs text-[var(--text-muted)] font-mono">1.0 Mark</span>
                            </div>
                        </div>

                        {/* Question Prompt */}
                        <div className="mb-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-relaxed">
                                {currentQ.questionText}
                            </h3>
                        </div>

                        {/* Interactive Options List (1-4) */}
                        <div className="space-y-3.5" role="radiogroup" aria-label={`Options for question ${currentIndex + 1}`}>
                            {currentQ.options.map((option, optIdx) => {
                                const isSelected = currentSelectedOpt === optIdx;
                                return (
                                    <button
                                        key={optIdx}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => handleSelectOption(optIdx)}
                                        className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-150 ${
                                            isSelected
                                                ? 'bg-[var(--primary-subtle)] border-[var(--primary)] text-[var(--text-primary)] ring-2 ring-[var(--focus-ring)]'
                                                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-primary)]'
                                        } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 border ${
                                            isSelected
                                                ? 'bg-[var(--primary)] text-[var(--bg-primary)] border-[var(--primary)]'
                                                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)]'
                                        }`}>
                                            {optIdx + 1}
                                        </div>
                                        <span className="text-base font-semibold flex-1">
                                            {option}
                                        </span>
                                        {isSelected && (
                                            <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--bg-primary)] flex items-center justify-center shrink-0">
                                                <Check className="w-4 h-4 stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question Action Buttons (Section 10) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Go to Previous Question (Arrow Left)"
                                title="Previous Question (←)"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Previous Question (←)</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={currentIndex === questions.length - 1}
                                className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                aria-label="Go to Next Question (Arrow Right)"
                                title="Next Question (→)"
                            >
                                <span>Next Question (→)</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={handleRepeatQuestion}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold transition flex items-center gap-1.5"
                                aria-label="Repeat current question aloud (Key R)"
                                title="Repeat Question (R)"
                            >
                                <Volume2 className="w-4 h-4 text-[var(--accent-color)]" />
                                <span>🔊 Repeat Question (R)</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleMarkForReview}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                                    isCurrentMarked
                                        ? 'bg-[var(--warning)]/20 border-[var(--warning)] text-[var(--warning)]'
                                        : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                                }`}
                                aria-label="Mark or Unmark Question for Review (Key M)"
                                title="Mark for Review (M)"
                            >
                                <Flag className="w-4 h-4 text-[var(--warning)]" />
                                <span>{isCurrentMarked ? 'Unflag Review' : 'Mark for Review (M)'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClearResponse}
                                className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--danger)]/15 border border-[var(--border-color)] hover:border-[var(--danger)]/50 text-[var(--text-secondary)] hover:text-[var(--danger)] text-xs font-bold transition flex items-center gap-1.5"
                                aria-label="Clear selected answer (Backspace or Key C)"
                                title="Clear Answer (Backspace / C)"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Clear (Backspace / C)</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenSubmit}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                aria-label="Submit examination (Key S)"
                                title="Submit Exam (S)"
                            >
                                <Send className="w-4 h-4" />
                                <span>Submit Exam (S)</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Right 1 Col: Question Grid / Navigation Palette */}
                <aside className="space-y-6">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Question Palette</h4>
                        
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, idx) => {
                                const isCurrent = currentIndex === idx;
                                const isAnswered = selectedAnswers[idx] !== undefined;
                                const isFlagged = !!markedReview[idx];

                                let bgClass = 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)]';
                                if (isAnswered) bgClass = 'bg-[var(--success)]/20 border-[var(--success)]/50 text-[var(--success)]';
                                if (isFlagged) bgClass = 'bg-[var(--warning)]/20 border-[var(--warning)]/50 text-[var(--warning)]';
                                if (isCurrent) bgClass += ' ring-2 ring-[var(--focus-ring)]';

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            cancel();
                                            setCurrentIndex(idx);
                                            readQuestionForIndex(idx, true);
                                        }}
                                        className={`h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition ${bgClass}`}
                                        aria-label={`Jump to Question ${idx + 1}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status Legend */}
                        <div className="mt-6 pt-4 border-t border-[var(--border-color)] space-y-2 text-xs text-[var(--text-secondary)]">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-[var(--success)]/20 border border-[var(--success)] inline-block" />
                                <span>Answered ({totalAnswered})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-[var(--warning)]/20 border border-[var(--warning)] inline-block" />
                                <span>Marked for Review ({Object.values(markedReview).filter(Boolean).length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] inline-block" />
                                <span>Unanswered ({questions.length - totalAnswered})</span>
                            </div>
                        </div>
                    </div>

                    {/* Keyboard Shortcuts Summary Card */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 text-xs text-[var(--text-secondary)] space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                            <Keyboard className="w-4 h-4 text-[var(--primary)]" />
                            <span>Quick Keyboard Shortcuts</span>
                        </div>
                        <ul className="space-y-1 list-disc list-inside">
                            <li><kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono border border-[var(--border-color)]">R</kbd>: Repeat current question</li>
                            <li><kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono border border-[var(--border-color)]">1 - 4</kbd>: Select option 1, 2, 3, or 4</li>
                            <li><kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono border border-[var(--border-color)]">← / →</kbd>: Previous / Next question</li>
                            <li><kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono border border-[var(--border-color)]">S</kbd>: Submit exam confirmation</li>
                            <li><kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono border border-[var(--border-color)]">Y</kbd>: Confirm submission</li>
                            <li><kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono border border-[var(--border-color)]">Escape</kbd>: Cancel submission</li>
                        </ul>
                    </div>
                </aside>
            </main>

            {/* Confirm Submission Modal (Section 5, 6, 7) */}
            {showSubmitModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-modal-heading"
                >
                    <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 id="confirm-modal-heading" className="text-xl font-bold text-[var(--text-primary)]">
                                Confirm Examination Submission
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                                {questions.length - totalAnswered === 0 ? (
                                    <>You have answered all <strong>{questions.length}</strong> questions. Are you sure you want to submit the exam? Press <strong>Y</strong> to confirm or <strong>Escape</strong> to cancel.</>
                                ) : (
                                    <>You have answered <strong>{totalAnswered}</strong> out of <strong>{questions.length}</strong> questions. You have <strong>{questions.length - totalAnswered}</strong> unanswered questions. Are you sure you want to submit the exam? Press <strong>Y</strong> to confirm or <strong>Escape</strong> to cancel.</>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--success)] hover:opacity-90 text-[var(--bg-primary)] text-sm font-bold transition shadow-sm"
                                aria-label="Confirm submission (Key Y)"
                            >
                                Confirm Submission (Y)
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelSubmit}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition border border-[var(--border-color)]"
                                aria-label="Cancel submission (Escape)"
                            >
                                Cancel (Escape)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lockdown Violation Modal (Tab Switch, Fullscreen Exit, Window Blur) */}
            {securityAlert && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="lockdown-alert-heading"
                >
                    <div className="bg-[var(--bg-surface)] border-2 border-red-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-[var(--text-primary)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center border border-red-500/30 shrink-0">
                                <ShieldAlert className="w-8 h-8 stroke-[2.5] animate-pulse" aria-hidden="true" />
                            </div>
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase bg-red-500 text-white shadow-xs mb-1">
                                    {securityAlert.eventType === 'TAB_SWITCH' ? 'Tab Switch Detected' : 'Lockdown Alert'}
                                </span>
                                <h2 id="lockdown-alert-heading" className="text-xl sm:text-2xl font-black text-red-500 tracking-tight">
                                    {securityAlert.eventType === 'TAB_SWITCH' ? 'Tab Switch Alert!' : 'Examination Warning'}
                                </h2>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                                {securityAlert.spokenMessage}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-red-500/20 pt-2 font-mono">
                                <span>Violation Strike: <strong className="text-red-500">{securityAlert.warningNumber} / {securityAlert.maxWarnings}</strong></span>
                                <span>Audit Log: <strong className="text-red-500">Recorded to Server</strong></span>
                            </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                            Under strict examination lockdown protocols, tab switching or navigating away is prohibited. Please return to fullscreen mode immediately.
                        </p>

                        <button
                            type="button"
                            onClick={async () => {
                                dismissAlert();
                                await requestFullscreen();
                                speak('Returning to examination in fullscreen mode.', { force: true });
                            }}
                            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                        >
                            <Maximize className="w-4 h-4" />
                            <span>Acknowledge & Return to Fullscreen (Press Enter)</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}