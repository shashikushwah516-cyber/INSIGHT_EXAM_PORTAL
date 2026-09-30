import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useExamTimer } from '../hooks/useExamTimer';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSecureExam } from '../hooks/useSecureExam';
import examService from '../services/examService';
import {
    Clock,
    Volume2,
    VolumeX,
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
    CloudCheck,
    ShieldAlert,
    Maximize,
    Image as ImageIcon
} from 'lucide-react';
import KeyboardHelpModal from '../components/common/KeyboardHelpModal';

export default function ActiveExamWindow() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { speak, cancel, speaking } = useSpeech();
    const { announce, preferences } = useAccessibility();

    const [attemptId, setAttemptId] = useState(location.state?.attemptData?.attemptId || null);
    const attemptIdRef = useRef(location.state?.attemptData?.attemptId || null);
    const [exam, setExam] = useState(location.state?.attemptData?.exam || null);
    const [questions, setQuestions] = useState(location.state?.attemptData?.exam?.questions || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);

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
    const [submitError, setSubmitError] = useState('');
    const [helpOpen, setHelpOpen] = useState(false);
    const handleConfirmSubmitRef = useRef(null);

    // Sync focused option when navigating between questions
    useEffect(() => {
        const curAns = answers[currentIndex];
        if (curAns && curAns.selectedOption !== null && curAns.selectedOption !== undefined) {
            setFocusedOptionIndex(curAns.selectedOption);
        } else {
            setFocusedOptionIndex(0);
        }
    }, [currentIndex]);

    const [hasStartedExamMode, setHasStartedExamMode] = useState(false);
    const [activeVisualText, setActiveVisualText] = useState('');
    const [activeVisualLevel, setActiveVisualLevel] = useState('');
    const visualCacheRef = useRef(new Map());

    // Auto submission handler when timer expires
    const handleTimeExpired = useCallback(async () => {
        announce('Time expired. Submitting examination automatically.', 'alert', true);
        if (handleConfirmSubmitRef.current) {
            handleConfirmSubmitRef.current(true);
        }
    }, [announce]);

    const { secondsLeft, formattedTime, announceRemainingTime } = useExamTimer(
        initialSeconds,
        expiresAt,
        handleTimeExpired
    );

    // Secure Exam Mode & Lockdown System
    const {
        isFullscreen,
        warningCount,
        maxWarnings,
        limitReached,
        securityAlert,
        requestFullscreen,
        exitFullscreen,
        dismissAlert,
        checkFullscreenState
    } = useSecureExam({
        examId: id,
        attemptId,
        currentQuestionIndex: currentIndex,
        remainingSeconds: secondsLeft,
        maxWarnings: 3,
        enabled: !loading && !submitting && !submitModalOpen
    });

    // Auto Fullscreen on Exam Start & user interaction
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

    // Cleanup: Automatically turn off fullscreen at the end of exam test
    useEffect(() => {
        return () => {
            exitFullscreen();
        };
    }, [exitFullscreen]);

    // Keyboard controls for Lockdown: Press F to toggle fullscreen, Enter/Escape to dismiss alert
    useEffect(() => {
        const handleLockdownKeys = async (e) => {
            // Dismiss security alert & restore fullscreen on Enter or Escape
            if (securityAlert && (e.key === 'Enter' || e.key === 'Escape')) {
                e.preventDefault();
                dismissAlert();
                await requestFullscreen();
                speak('Returning to examination in fullscreen mode.', { force: true });
                return;
            }

            // Press F to enter/restore fullscreen
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

        window.addEventListener('keydown', handleLockdownKeys);
        return () => window.removeEventListener('keydown', handleLockdownKeys);
    }, [securityAlert, dismissAlert, requestFullscreen, checkFullscreenState, speak]);

    // Initial load or session restoration
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const initializeSession = async () => {
            if (!exam || !attemptId) {
                try {
                    const startRes = await examService.startExam(id);
                    if (startRes.success) {
                        setAttemptId(startRes.attemptId);
                        attemptIdRef.current = startRes.attemptId;
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
    }, [id]);

    // Current Question data
    const currentQ = questions[currentIndex] || null;
    const currentAnswer = answers[currentIndex] || { selectedOption: null, isMarkedForReview: false };

    // Text-To-Speech: Read question and options for a specified question index
    const readQuestionForIndex = useCallback(
        (indexToRead, force = true) => {
            const q = questions[indexToRead];
            if (!q) return;
            const qNum = indexToRead + 1;
            const total = questions.length;
            const optionsText = (q.options || [])
                .map((opt, i) => `Option ${i + 1}: ${opt}`)
                .join('. ');

            const hasVisual = q.hasVisual || q.imageUrl || (q.visualDescription && (q.visualDescription.quick || q.visualDescription.detailed));
            const visualNotice = hasVisual ? ' This question contains a visual. Press I to hear a description of the visual.' : '';

            const text = `Question ${qNum} of ${total}. ${q.questionText}.${visualNotice} ${optionsText}.`;
            speak(text, { force });
            announce(`Question ${qNum} of ${total}: ${q.questionText}`, 'polite');
        },
        [questions, speak, announce]
    );

    // Read current question and options
    const readCurrentQuestion = useCallback(
        (force = true) => {
            readQuestionForIndex(currentIndex, force);
        },
        [currentIndex, readQuestionForIndex]
    );

    // R Key: Repeat current question aloud (Section 2 & 11)
    const handleRepeatQuestion = useCallback(() => {
        if (!currentQ) return;
        const qNum = currentIndex + 1;
        const optionsText = (currentQ.options || [])
            .map((opt, i) => `Option ${i + 1}: ${opt}`)
            .join('. ');

        const hasVisual = currentQ.hasVisual || currentQ.imageUrl || (currentQ.visualDescription && (currentQ.visualDescription.quick || currentQ.visualDescription.detailed));
        const visualNotice = hasVisual ? ' This question contains a visual. Press I to hear a description of the visual.' : '';

        const repeatText = `Repeating Question ${qNum}. Question ${qNum}. ${currentQ.questionText}.${visualNotice} ${optionsText}.`;
        speak(repeatText, { force: true });
        announce(`Repeating Question ${qNum}`, 'polite');
    }, [currentQ, currentIndex, speak, announce]);

    // Visual Description Handlers (Parts 6 - 14)
    const handleDescribeVisual = useCallback(async (level = 'quick') => {
        if (!currentQ) return;

        const hasVisual = currentQ.hasVisual || currentQ.imageUrl || (currentQ.visualDescription && (currentQ.visualDescription.quick || currentQ.visualDescription.detailed));
        if (!hasVisual) {
            const noVisualMsg = 'This question does not contain any visual images or figures.';
            speak(noVisualMsg, { force: true });
            announce(noVisualMsg, 'polite');
            return;
        }

        const cacheKey = currentQ._id || currentIndex;
        let visualData = visualCacheRef.current.get(cacheKey);

        if (!visualData) {
            if (currentQ.visualDescription && (currentQ.visualDescription.quick || currentQ.visualDescription.detailed)) {
                visualData = {
                    quick: currentQ.visualDescription.quick || currentQ.visualAlt || 'Visual figure for question.',
                    detailed: currentQ.visualDescription.detailed || currentQ.visualDescription.quick || currentQ.visualAlt || 'Detailed visual figure.'
                };
                visualCacheRef.current.set(cacheKey, visualData);
            } else {
                try {
                    const token = localStorage.getItem('insight_token');
                    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
                        ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
                        : '/api';
                    const res = await fetch(`${apiBase}/ai/describe-visual`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({
                            questionId: currentQ._id,
                            examId: attemptId || id,
                            imageUrl: currentQ.imageUrl,
                            imageType: currentQ.imageType,
                            visualDescription: currentQ.visualDescription,
                            visualAlt: currentQ.visualAlt,
                            questionText: currentQ.questionText,
                            level
                        })
                    });

                    if (res.ok) {
                        const json = await res.json();
                        visualData = {
                            quick: json.quick || currentQ.visualAlt || 'Visual description unavailable.',
                            detailed: json.detailed || json.quick || currentQ.visualAlt || 'Detailed visual description unavailable.'
                        };
                        visualCacheRef.current.set(cacheKey, visualData);
                    }
                } catch (err) {
                    console.warn('[Visual] Error calling vision service:', err);
                }
            }
        }

        if (!visualData) {
            visualData = {
                quick: currentQ.visualAlt || 'Visual description is temporarily unavailable.',
                detailed: currentQ.visualAlt ? `Detailed description: ${currentQ.visualAlt}` : 'Visual description is temporarily unavailable.'
            };
        }

        const spokenContent = level === 'detailed'
            ? `Detailed visual description: ${visualData.detailed}`
            : `Visual description: ${visualData.quick}`;

        setActiveVisualText(level === 'detailed' ? visualData.detailed : visualData.quick);
        setActiveVisualLevel(level);

        speak(spokenContent, { force: true });
        announce(spokenContent, 'polite');
    }, [currentQ, currentIndex, attemptId, id, speak, announce]);

    const handleDescribeVisualQuick = useCallback(() => handleDescribeVisual('quick'), [handleDescribeVisual]);
    const handleDescribeVisualDetailed = useCallback(() => handleDescribeVisual('detailed'), [handleDescribeVisual]);

    // Exam Start Flow with Accessible Audio Orientation (Part 18)
    const handleStartExamMode = useCallback(async () => {
        setHasStartedExamMode(true);
        await requestFullscreen();

        const totalQ = questions.length;
        const duration = exam?.durationMinutes || 25;
        const firstQ = questions[0];
        const visualNotice = (firstQ?.hasVisual || firstQ?.imageUrl || (firstQ?.visualDescription && (firstQ.visualDescription.quick || firstQ.visualDescription.detailed)))
            ? ' This question contains a visual. Press I to hear a description of the visual.'
            : '';
        const optionsText = (firstQ?.options || []).map((opt, i) => `Option ${i + 1}: ${opt}`).join('. ');

        const orientationText = `Your examination has started. There are ${totalQ} questions and you have ${duration} minutes. Press R to repeat the current question. Use the left and right arrow keys to navigate. Press 1, 2, 3, or 4 to select an option. Press T to hear the remaining time. Press I to hear a description of a visual. Press S to begin submission. Question 1 of ${totalQ}. ${firstQ?.questionText}.${visualNotice} ${optionsText}.`;

        speak(orientationText, { force: true });
        announce(`Your examination has started. There are ${totalQ} questions and you have ${duration} minutes.`, 'polite');
    }, [requestFullscreen, questions, exam, speak, announce]);

    // Toggle reading question aloud (stops speech if already playing)
    const toggleReadCurrentQuestion = useCallback(() => {
        if (speaking) {
            cancel();
            announce('Audio reading stopped.', 'polite');
        } else {
            handleRepeatQuestion();
        }
    }, [speaking, cancel, announce, handleRepeatQuestion]);

    // Read options only
    const readOptionsOnly = useCallback(() => {
        if (!currentQ) return;
        const optionsText = (currentQ.options || [])
            .map((opt, i) => `Option ${i + 1}: ${opt}`)
            .join('. ');
        speak(`Options for Question ${currentIndex + 1}: ${optionsText}.`, { force: true });
    }, [currentQ, currentIndex, speak]);

    // Read current selection
    const readSelectedAnswer = useCallback(() => {
        if (currentAnswer.selectedOption !== null && currentAnswer.selectedOption !== undefined) {
            const optText = currentQ?.options?.[currentAnswer.selectedOption];
            speak(`Selected answer: Option ${currentAnswer.selectedOption + 1}: ${optText}`, { force: true });
        } else {
            speak('No answer selected for this question.', { force: true });
        }
    }, [currentAnswer.selectedOption, currentQ, speak]);

    // Auto-read question on change if enabled in user preferences
    useEffect(() => {
        if (!loading && currentQ && preferences.autoReadQuestion) {
            readCurrentQuestion(false);
        }
    }, [currentIndex, loading, !!currentQ]);

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

    // Answer Selection via 1, 2, 3, 4 or click (Section 1 & 3)
    const handleSelectOption = useCallback(
        (optionIndex) => {
            if (!currentQ || !currentQ.options || currentQ.options[optionIndex] === undefined) return;
            const updated = {
                ...currentAnswer,
                selectedOption: optionIndex
            };

            setAnswers((prev) => ({
                ...prev,
                [currentIndex]: updated
            }));
            setFocusedOptionIndex(optionIndex);

            const optionNum = optionIndex + 1;
            const announcement = `Option ${optionNum} selected.`;
            announce(announcement, 'assertive');
            speak(announcement, { force: true });

            persistAnswer(currentIndex, optionIndex, updated.isMarkedForReview);
        },
        [currentQ, currentAnswer, currentIndex, attemptId, announce, speak]
    );

    // Controlled Option Navigation via Arrow Keys (Section 5 Standard)
    const handleOptionDown = useCallback(() => {
        if (!currentQ || !currentQ.options?.length) return;
        const next = (focusedOptionIndex + 1) % currentQ.options.length;
        setFocusedOptionIndex(next);
        const optLabel = `Option ${next + 1}: ${currentQ.options[next]}`;
        speak(`${optLabel}. Press Enter to select.`, { force: true });
        announce(`Highlighted ${optLabel}`, 'polite');
    }, [currentQ, focusedOptionIndex, speak, announce]);

    const handleOptionUp = useCallback(() => {
        if (!currentQ || !currentQ.options?.length) return;
        const prevIdx = focusedOptionIndex <= 0 ? currentQ.options.length - 1 : focusedOptionIndex - 1;
        setFocusedOptionIndex(prevIdx);
        const optLabel = `Option ${prevIdx + 1}: ${currentQ.options[prevIdx]}`;
        speak(`${optLabel}. Press Enter to select.`, { force: true });
        announce(`Highlighted ${optLabel}`, 'polite');
    }, [currentQ, focusedOptionIndex, speak, announce]);

    const handleConfirmOption = useCallback(() => {
        if (focusedOptionIndex >= 0 && currentQ?.options?.[focusedOptionIndex] !== undefined) {
            handleSelectOption(focusedOptionIndex);
        }
    }, [focusedOptionIndex, currentQ, handleSelectOption]);

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

    // Navigation: Next (Arrow Right) (Section 4 & 11)
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

    // Navigation: Prev (Arrow Left) (Section 4 & 11)
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

    // S Key: Open Submit Confirmation (Section 5)
    const handleOpenSubmit = useCallback(() => {
        cancel();
        let answeredCount = 0;
        questions.forEach((_, idx) => {
            const ans = answers[idx];
            if (ans && ans.selectedOption !== null && ans.selectedOption !== undefined) {
                answeredCount += 1;
            }
        });

        const totalQuestions = questions.length;
        const unansweredCount = totalQuestions - answeredCount;

        let promptText = '';
        if (unansweredCount === 0) {
            promptText = `You have answered all ${totalQuestions} questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        } else {
            promptText = `You have answered ${answeredCount} out of ${totalQuestions} questions. You have ${unansweredCount} unanswered questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        }

        speak(promptText, { force: true });
        announce(promptText, 'assertive');
        setSubmitError('');
        setSubmitModalOpen(true);
    }, [questions, answers, cancel, speak, announce]);

    // Y Key: Confirm Submission (Section 6)
    const handleConfirmSubmit = useCallback(async (isAuto = false) => {
        if (submitting) return; // Prevent duplicate submissions
        setSubmitting(true);
        setSubmitError('');
        cancel();

        // Announce before server confirmation
        const submittingMsg = 'Submitting your examination. Please wait.';
        speak(submittingMsg, { force: true });
        announce(submittingMsg, 'assertive');

        try {
            const formattedAnswers = questions.map((q, idx) => ({
                questionId: q._id || idx,
                questionIndex: idx,
                selectedOption: answers[idx]?.selectedOption ?? null,
                isMarkedForReview: !!answers[idx]?.isMarkedForReview
            }));

            const targetAttemptId = attemptId || attemptIdRef.current || id;
            const res = await examService.submitExam(targetAttemptId, formattedAnswers);
            if (res && res.success) {
                const finalAttemptId = res.attemptId || res.result?.attemptId || targetAttemptId;
                // Automatically turn off fullscreen at the end of the exam test
                await exitFullscreen();
                // Announce only after successful server confirmation
                const successMsg = 'Your examination has been submitted successfully.';
                speak(successMsg, { force: true });
                announce(successMsg, 'polite');
                navigate(`/results/${finalAttemptId}`);
            } else {
                throw new Error(res?.message || 'Server rejected submission');
            }
        } catch (err) {
            console.error('Submission error:', err);
            const failMsg = err.message || 'Your examination could not be submitted. Please try again.';
            setSubmitError(failMsg);
            speak(failMsg, { force: true });
            announce(failMsg, 'assertive');
            setSubmitting(false);
        }
    }, [submitting, cancel, speak, announce, questions, answers, attemptId, id, navigate, exitFullscreen]);

    handleConfirmSubmitRef.current = handleConfirmSubmit;

    // Escape Key during submit confirmation: Cancel Submission (Section 7)
    const handleCancelSubmit = useCallback(() => {
        cancel();
        setSubmitModalOpen(false);
        const cancelMsg = 'Submission cancelled. You are back in the examination.';
        speak(cancelMsg, { force: true });
        announce(cancelMsg, 'polite');
    }, [cancel, speak, announce]);

    // General Escape key handler
    const handleEscape = useCallback(() => {
        if (submitModalOpen) {
            handleCancelSubmit();
        } else {
            cancel();
            announce('Audio reading stopped.', 'polite');
        }
    }, [submitModalOpen, handleCancelSubmit, cancel, announce]);

    // Controlled Keyboard Shortcuts bindings (Sections 1-9 & Parts 4, 6, 10, 15)
    useKeyboardNavigation({
        isSubmitModalOpen: submitModalOpen,
        onRepeatQuestion: handleRepeatQuestion,
        onNextQuestion: handleNext,
        onPrevQuestion: handlePrev,
        onNext: handleNext,
        onPrev: handlePrev,
        onNumberKey: (key) => handleSelectOption(parseInt(key, 10) - 1),
        onOpenSubmit: handleOpenSubmit,
        onSubmit: handleOpenSubmit,
        onConfirmSubmit: handleConfirmSubmit,
        onCancelSubmit: handleCancelSubmit,
        onOptionDown: handleOptionDown,
        onOptionUp: handleOptionUp,
        onSelect: handleConfirmOption,
        onMark: handleToggleMark,
        onClear: handleClearAnswer,
        onReadQuestion: handleRepeatQuestion,
        onRepeatContent: handleRepeatQuestion,
        onReadOptions: readOptionsOnly,
        onReadSelected: readSelectedAnswer,
        onDescribeVisual: handleDescribeVisualQuick,
        onDetailedVisual: handleDescribeVisualDetailed,
        onVisualQuick: handleDescribeVisualQuick,
        onVisualDetailed: handleDescribeVisualDetailed,
        onReadTime: announceRemainingTime,
        onTellTime: announceRemainingTime,
        onEscape: handleEscape,
        onHelp: () => setHelpOpen(true)
    });

    // Voice Commands handler
    const voiceHandlers = {
        onNext: handleNext,
        onPrev: handlePrev,
        onRead: () => readCurrentQuestion(true),
        onSelectOption: handleSelectOption,
        onMark: handleToggleMark,
        onClear: handleClearAnswer,
        onTime: announceRemainingTime,
        onVisual: handleDescribeVisualQuick,
        onDetailedVisual: handleDescribeVisualDetailed,
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
            <main id="main-content" className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
                <div role="status" aria-live="polite" className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-2xl font-bold text-slate-900 mb-2">Preparing Examination Session...</p>
                    <p className="text-slate-500 text-sm">Validating attempt and retrieving questions safely</p>
                </div>
            </main>
        );
    }

    if (!currentQ) {
        return (
            <main id="main-content" className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">No Questions Found</h1>
                <button
                    onClick={() => navigate('/exams')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
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
            <header className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 mb-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Exam Name & Progress */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold bg-[var(--primary-subtle)] text-[var(--primary)] px-3 py-1 rounded-full border border-[var(--border-color)] font-mono">
                                {exam?.title || 'Competitive Exam'}
                            </span>
                            {saving ? (
                                <span className="text-xs text-[var(--warning)] flex items-center gap-1 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-ping" />
                                    Saving answer...
                                </span>
                            ) : (
                                <span className="text-xs text-[var(--success)] flex items-center gap-1 font-mono">
                                    <CloudCheck className="w-3.5 h-3.5 text-[var(--success)]" aria-hidden="true" />
                                    Synced
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                            Question {currentIndex + 1} of {questions.length}
                        </h1>
                    </div>

                    {/* Timer, Audio & Voice Toolbar */}
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
                            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-mono font-bold transition shadow-xs cursor-pointer ${
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

                        {/* Countdown Timer Display */}
                        <div
                            role="timer"
                            aria-label={`Time remaining: ${formattedTime}`}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl font-mono text-xl sm:text-2xl font-bold shadow-xs"
                        >
                            <Clock className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                            <span>{formattedTime}</span>
                        </div>

                        {/* Hear Time Button */}
                        <button
                            type="button"
                            onClick={announceRemainingTime}
                            className="btn-secondary p-2.5 rounded-2xl"
                            aria-label="Announce remaining time aloud (Key T)"
                            title="Hear Remaining Time (T)"
                        >
                            <Volume2 className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                        </button>

                        {/* Microphone Voice Recognition Toggle */}
                        {voiceSupported && (
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 ${
                                    isListening
                                        ? 'bg-[var(--bg-tertiary)] border-[var(--danger)] text-[var(--danger)] animate-pulse'
                                        : 'btn-secondary'
                                }`}
                                aria-label={isListening ? 'Stop Voice Commands' : 'Start Voice Commands'}
                                title="Voice Commands Mic"
                            >
                                {isListening ? (
                                    <>
                                        <Mic className="w-5 h-5 text-[var(--danger)]" aria-hidden="true" />
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
                            className="btn-secondary p-2.5 rounded-2xl"
                            aria-label="Keyboard Shortcuts Help (?)"
                        >
                            <HelpCircle className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Last voice command indicator */}
                {lastCommand && (
                    <div className="mt-2 text-xs text-[var(--primary)] font-mono bg-[var(--primary-subtle)] px-3 py-1 rounded-xl border border-[var(--border-color)]">
                        Voice Command Detected: "{lastCommand}"
                    </div>
                )}
            </header>

            {/* Security Warning Banner (Parts 1, 2, 3) */}
            {securityAlert && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-4 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="font-bold text-base">{securityAlert.spokenMessage}</p>
                            <p className="text-xs opacity-90">
                                Warning {securityAlert.warningNumber} of {securityAlert.maxWarnings}. Please keep the examination active and in fullscreen.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isFullscreen && (
                            <button
                                type="button"
                                onClick={requestFullscreen}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition shadow-xs"
                            >
                                Return to Fullscreen
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={dismissAlert}
                            className="px-3 py-2 bg-transparent hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold rounded-xl text-xs transition"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Accessible Start Exam / Fullscreen Mode Prompt (Part 18) */}
            {!hasStartedExamMode && !isFullscreen && (
                <div className="mb-6 p-5 rounded-2xl bg-[var(--primary-subtle)] border-2 border-[var(--primary)] flex flex-wrap items-center justify-between gap-4 shadow-xs">
                    <div>
                        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                            Secure Examination Mode Ready
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                            Activate Fullscreen mode to protect exam integrity and hear spoken audio instructions.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleStartExamMode}
                        className="btn-primary px-6 py-3 rounded-xl font-bold text-base flex items-center gap-2 shadow-sm"
                        autoFocus
                    >
                        <Maximize className="w-5 h-5" aria-hidden="true" />
                        <span>Activate Secure Fullscreen & Begin</span>
                    </button>
                </div>
            )}

            {/* Main Question & Navigation Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Left 3 Columns: Active Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <section
                        aria-labelledby="question-text-heading"
                        className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-xs"
                    >
                        {/* Subject & Actions Bar */}
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-color)]">
                            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                {currentQ.subject} • {currentQ.topic}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleRepeatQuestion}
                                    className="btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
                                    aria-label="Repeat current question and options aloud (Key R)"
                                    title="Repeat Question (R)"
                                >
                                    <Volume2 className="w-4 h-4 text-[var(--accent-color)]" aria-hidden="true" />
                                    <span>🔊 Repeat Question (R)</span>
                                </button>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="mb-6">
                            <h2
                                id="question-text-heading"
                                className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-snug"
                            >
                                {currentQ.questionText}
                            </h2>
                        </div>

                        {/* Visual Question Figure Section (Parts 6 - 14) */}
                        {(currentQ.hasVisual || currentQ.imageUrl || (currentQ.visualDescription && (currentQ.visualDescription.quick || currentQ.visualDescription.detailed))) && (
                            <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)]">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border-color)]">
                                        <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Visual Figure: {currentQ.imageType || 'Diagram / Chart'}</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDescribeVisualQuick}
                                            className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                                            aria-label="Describe visual figure aloud (Key I)"
                                            title="Describe Visual (I)"
                                        >
                                            <Volume2 className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                                            <span>Describe Visual (I)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDescribeVisualDetailed}
                                            className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                                            aria-label="Hear detailed visual description aloud (Key D)"
                                            title="Detailed Description (D)"
                                        >
                                            <span>Detailed Description (D)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Render Visual Image or SVG */}
                                {currentQ.imageUrl && (
                                    <div className="flex justify-center p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] mb-3 overflow-hidden">
                                        <img
                                            src={currentQ.imageUrl}
                                            alt={currentQ.visualAlt || 'Visual diagram for question'}
                                            className="max-h-72 max-w-full object-contain rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Visual Description readout card for low-vision reading */}
                                {activeVisualText && (
                                    <div
                                        role="region"
                                        aria-label="Visual Description Text"
                                        className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--primary)] text-sm leading-relaxed text-[var(--text-primary)] font-medium"
                                    >
                                        <p className="font-bold text-xs text-[var(--primary)] mb-1">
                                            {activeVisualLevel === 'detailed' ? 'Detailed Visual Description:' : 'Visual Description:'}
                                        </p>
                                        <p>{activeVisualText}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Options Group (Fieldset) */}
                        <fieldset className="space-y-3.5" role="radiogroup" aria-label="Answer Options">
                            <legend className="sr-only">Choose one option for Question {currentIndex + 1}</legend>

                            {currentQ.options.map((optionText, optIdx) => {
                                const isSelected = currentAnswer.selectedOption === optIdx;
                                const isFocused = focusedOptionIndex === optIdx;

                                let optBorder = 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--primary)]';
                                if (isSelected) {
                                    optBorder = 'bg-[var(--primary-subtle)] border-[var(--primary)] ring-2 ring-[var(--focus-ring)] shadow-xs';
                                } else if (isFocused) {
                                    optBorder = 'bg-[var(--bg-tertiary)] border-[var(--primary)] ring-2 ring-[var(--focus-ring)]';
                                }

                                return (
                                    <button
                                        key={optIdx}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => {
                                            setFocusedOptionIndex(optIdx);
                                            handleSelectOption(optIdx);
                                        }}
                                        className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition flex items-start gap-4 ${optBorder}`}
                                    >
                                        {/* Option Badge (1, 2, 3, 4) */}
                                        <span
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition ${
                                                isSelected
                                                    ? 'bg-[var(--primary)] text-white shadow-xs'
                                                    : isFocused
                                                    ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border-color)]'
                                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                                            }`}
                                        >
                                            {optIdx + 1}
                                        </span>

                                        <span className={`text-base sm:text-lg font-medium pt-0.5 leading-relaxed flex-1 ${
                                            isSelected ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'
                                        }`}>
                                            {optionText}
                                        </span>

                                        {isSelected && (
                                            <span className="shrink-0 text-[var(--primary)] font-bold text-xs bg-[var(--primary-subtle)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
                                                Selected
                                            </span>
                                        )}
                                        {!isSelected && isFocused && (
                                            <span className="shrink-0 text-[var(--text-muted)] text-xs bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
                                                Focused (Enter to select)
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </fieldset>

                        {/* Accessible Controlled Navigation Reminder */}
                        <div className="mt-4 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                            <span>Use <kbd className="font-mono font-bold text-[var(--primary)] bg-[var(--bg-surface)] border border-[var(--border-color)] px-1.5 py-0.5 rounded">↑</kbd> <kbd className="font-mono font-bold text-[var(--primary)] bg-[var(--bg-surface)] border border-[var(--border-color)] px-1.5 py-0.5 rounded">↓</kbd> to move options, <kbd className="font-mono font-bold text-[var(--primary)] bg-[var(--bg-surface)] border border-[var(--border-color)] px-1.5 py-0.5 rounded">Enter</kbd> to select, <kbd className="font-mono font-bold text-[var(--primary)] bg-[var(--bg-surface)] border border-[var(--border-color)] px-1.5 py-0.5 rounded">→</kbd> next question.</span>
                            <span className="text-[var(--text-muted)]">Keys 1-4 direct select • Key R repeats question</span>
                        </div>
                    </section>

                    {/* Bottom Question Controls Bar (Section 10) */}
                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                disabled={currentIndex === 0}
                                onClick={handlePrev}
                                className="btn-secondary px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
                                aria-label="Go to Previous Question (Arrow Left)"
                                title="Previous Question (←)"
                            >
                                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                <span>Previous Question (←)</span>
                            </button>

                            <button
                                type="button"
                                disabled={currentIndex === questions.length - 1}
                                onClick={handleNext}
                                className="btn-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
                                aria-label="Go to Next Question (Arrow Right)"
                                title="Next Question (→)"
                            >
                                <span>Next Question (→)</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                onClick={handleRepeatQuestion}
                                className="btn-secondary px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
                                aria-label="Repeat current question and options aloud (Key R)"
                                title="Repeat Question (R)"
                            >
                                <Volume2 className="w-4 h-4 text-[var(--accent-color)]" aria-hidden="true" />
                                <span>🔊 Repeat Question (R)</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleToggleMark}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition ${
                                    currentAnswer.isMarkedForReview
                                        ? 'bg-[var(--bg-tertiary)] border-[var(--warning-color)] text-[var(--warning-color)]'
                                        : 'btn-secondary'
                                }`}
                                aria-label="Mark or Unmark Question for Review (Key M)"
                                title="Mark for Review (M)"
                            >
                                <Flag className="w-4 h-4" aria-hidden="true" />
                                <span>{currentAnswer.isMarkedForReview ? 'Marked for Review (M)' : 'Mark for Review (M)'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClearAnswer}
                                className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2"
                                aria-label="Clear selected answer (Backspace or Key C)"
                                title="Clear Answer (Backspace / C)"
                            >
                                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                <span>Clear (Backspace / C)</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenSubmit}
                                className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-bold flex items-center gap-2 border-emerald-600 shadow-sm"
                                aria-label="Submit examination (Key S)"
                                title="Submit Exam (S)"
                            >
                                <Send className="w-4 h-4" aria-hidden="true" />
                                <span>Submit Exam (S)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right 1 Column: Question Navigator Palette & Submit */}
                <div className="space-y-6">
                    <section
                        aria-labelledby="palette-heading"
                        className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xs"
                    >
                        <h2 id="palette-heading" className="text-base font-bold text-[var(--text-primary)] mb-3">
                            Question Palette
                        </h2>

                        {/* Status Legend */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4 pb-3 border-b border-[var(--border-color)]">
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <span className="w-3 h-3 rounded bg-[var(--success)] shrink-0" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <span className="w-3 h-3 rounded bg-[var(--warning)] shrink-0" />
                                <span>Marked</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <span className="w-3 h-3 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] shrink-0" />
                                <span>Unanswered</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <span className="w-3 h-3 rounded border-2 border-[var(--primary)] shrink-0" />
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

                                let bgClass = 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--primary)]';
                                let statusLabel = 'Unanswered';

                                if (hasAnswer && isMarked) {
                                    bgClass = 'bg-[var(--warning)] text-black border-[var(--warning)] font-bold';
                                    statusLabel = 'Answered and Marked for Review';
                                } else if (hasAnswer) {
                                    bgClass = 'bg-[var(--success)] text-white border-[var(--success)] font-bold';
                                    statusLabel = 'Answered';
                                } else if (isMarked) {
                                    bgClass = 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary)] font-bold';
                                    statusLabel = 'Marked for Review';
                                }

                                const borderRing = isCurrent ? 'ring-2 ring-[var(--focus-ring)] border-[var(--primary)]' : '';

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            cancel();
                                            setCurrentIndex(idx);
                                            readQuestionForIndex(idx, true);
                                        }}
                                        className={`h-10 rounded-xl border flex items-center justify-center text-xs font-mono transition ${bgClass} ${borderRing}`}
                                        aria-label={`Question ${idx + 1}: ${statusLabel}${isCurrent ? ', Current' : ''}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Submit Examination Button */}
                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xs text-center">
                        <button
                            type="button"
                            onClick={handleOpenSubmit}
                            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
                            aria-label="Submit examination (Key S)"
                            title="Submit Exam (S)"
                        >
                            <Send className="w-5 h-5" aria-hidden="true" />
                            <span>Submit Exam (S)</span>
                        </button>
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                            Press <kbd className="font-mono font-bold bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">S</kbd> to open confirmation summary.
                        </p>
                    </div>
                </div>
            </div>

            {/* Submission Confirmation Modal Dialog (Section 5, 6, 7) */}
            {submitModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="submit-modal-title"
                >
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl max-w-lg w-full p-6 sm:p-8 text-[var(--text-primary)] shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--warning-color)] flex items-center justify-center border border-[var(--border-color)]">
                                <AlertCircle className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 id="submit-modal-title" className="text-2xl font-black text-[var(--text-primary)]">
                                    Confirm Submission
                                </h2>
                                <p className="text-xs text-[var(--text-muted)]">Press Y to confirm or Escape to cancel</p>
                            </div>
                        </div>

                        <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                            {Object.values(answers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length === questions.length ? (
                                <>You have answered all <strong>{questions.length}</strong> questions. Are you sure you want to submit the exam? Press <strong>Y</strong> to confirm or <strong>Escape</strong> to cancel.</>
                            ) : (
                                <>You have answered <strong>{Object.values(answers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length}</strong> out of <strong>{questions.length}</strong> questions. You have <strong>{questions.length - Object.values(answers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length}</strong> unanswered questions. Are you sure you want to submit the exam? Press <strong>Y</strong> to confirm or <strong>Escape</strong> to cancel.</>
                            )}
                        </p>

                        {/* Summary breakdown stats */}
                        <div className="grid grid-cols-3 gap-3 p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] mb-6 text-center">
                            <div>
                                <span className="text-xs text-[var(--text-muted)] block font-semibold">Answered</span>
                                <span className="text-2xl font-black text-[var(--success-color)]">
                                    {Object.values(answers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--text-muted)] block font-semibold">Marked Review</span>
                                <span className="text-2xl font-black text-[var(--warning-color)]">
                                    {Object.values(answers).filter((a) => a.isMarkedForReview).length}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--text-muted)] block font-semibold">Unanswered</span>
                                <span className="text-2xl font-black text-[var(--text-muted)]">
                                    {questions.length - Object.values(answers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length}
                                </span>
                            </div>
                        </div>

                        {submitError && (
                            <div role="alert" className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>{submitError}</span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleConfirmSubmit(false)}
                                className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2"
                                aria-label="Confirm submission of examination (Press Y)"
                            >
                                {submitting ? 'Submitting your examination. Please wait...' : 'Confirm Submission (Y)'}
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleCancelSubmit}
                                className="btn-secondary py-3 px-5 text-sm font-semibold flex items-center justify-center gap-2"
                                aria-label="Cancel submission and return to examination (Press Escape)"
                            >
                                Cancel Submission (Escape)
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
                    aria-labelledby="lockdown-alert-title"
                    aria-describedby="lockdown-alert-desc"
                >
                    <div className="bg-[var(--bg-surface)] border-2 border-red-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-[var(--text-primary)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center border border-red-500/30 shrink-0">
                                <ShieldAlert className="w-8 h-8 stroke-[2.5] animate-pulse" aria-hidden="true" />
                            </div>
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase bg-red-500 text-white shadow-xs mb-1">
                                    {securityAlert.eventType === 'TAB_SWITCH' ? 'Tab Switch Detected' : 'Lockdown Security Alert'}
                                </span>
                                <h2 id="lockdown-alert-title" className="text-xl sm:text-2xl font-black text-red-500 tracking-tight">
                                    {securityAlert.eventType === 'TAB_SWITCH' ? 'Tab Switch Alert!' : 'Examination Warning'}
                                </h2>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
                            <p id="lockdown-alert-desc" className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                                {securityAlert.spokenMessage}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-red-500/20 pt-2 font-mono">
                                <span>Violation Strike: <strong className="text-red-500">{securityAlert.warningNumber} / {securityAlert.maxWarnings}</strong></span>
                                <span>Audit Log: <strong className="text-red-500">Recorded to Server</strong></span>
                            </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                            Under strict examination lockdown protocols, tab switching, minimizing, or switching windows is prohibited. Your exam session remains live. Please return to fullscreen mode immediately.
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

            <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </main>
    );
}
