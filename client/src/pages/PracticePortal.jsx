import React, { useState, useEffect, useCallback } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import practiceService from '../services/practiceService';
import questionService from '../services/questionService';
import {
    BookOpen,
    Volume2,
    CheckCircle,
    XCircle,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    Award,
    HelpCircle,
    Filter
} from 'lucide-react';
import KeyboardHelpModal from '../components/common/KeyboardHelpModal';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function PracticePortal() {
    const { speak, cancel } = useSpeech();
    const { announce, preferences } = useAccessibility();

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
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
    }, [selectedSubject, selectedDifficulty, speak, announce]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const currentQ = questions[currentIndex] || null;

    // Read question aloud
    const readQuestion = useCallback(() => {
        if (!currentQ) return;
        const opts = currentQ.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join('. ');
        const text = `Practice Question ${currentIndex + 1} of ${questions.length}. Subject: ${currentQ.subject}. ${currentQ.questionText}. ${opts}. Press keys 1 to 4 to select an answer.`;
        speak(text);
    }, [currentQ, currentIndex, questions.length, speak]);

    // Auto-read on change
    useEffect(() => {
        if (!loading && currentQ && preferences.autoReadQuestion && !checkedResult) {
            readQuestion();
        }
    }, [currentIndex, loading]);

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

    // Next Question
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setCheckedResult(null);
        } else {
            speak('End of practice set reached.');
            announce('End of practice set.', 'polite');
        }
    }, [currentIndex, questions.length, speak, announce]);

    // Prev Question
    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setSelectedOption(null);
            setCheckedResult(null);
        }
    }, [currentIndex]);

    // Keyboard bindings
    useKeyboardNavigation({
        onNext: handleNext,
        onPrev: handlePrev,
        onNumberKey: (key) => handleSelectOption(parseInt(key) - 1),
        onReadQuestion: readQuestion,
        onEscape: () => cancel(),
        onHelp: () => setHelpOpen(true)
    });

    const accuracy =
        sessionStats.attempted > 0
            ? Math.round((sessionStats.correct / sessionStats.attempted) * 100)
            : 0;

    return (
        <DashboardLayout
            pageTitle="Interactive Subject Practice"
            pageDescription="Instant answer verification, audible solutions, and accuracy tracking."
        >
            <div className="space-y-6">
                {/* Header & Filter Controls */}
                <div className="panel-card bg-neutral-900 border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-6">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-cyan-400" aria-hidden="true" />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                                Interactive Subject Practice
                            </h1>
                            <p className="text-neutral-300 text-sm mt-0.5">
                                Instant answer verification, audible solutions, and accuracy tracking.
                            </p>
                        </div>
                    </div>

                    {/* Real-time session scorecard */}
                    <div className="flex items-center gap-3 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800">
                        <div className="text-center px-2">
                            <span className="text-xs text-neutral-400 block font-semibold">Attempted</span>
                            <span className="font-bold text-white text-base">{sessionStats.attempted}</span>
                        </div>
                        <div className="text-center px-2 border-l border-neutral-800">
                            <span className="text-xs text-neutral-400 block font-semibold">Correct</span>
                            <span className="font-bold text-emerald-400 text-base">{sessionStats.correct}</span>
                        </div>
                        <div className="text-center px-2 border-l border-neutral-800">
                            <span className="text-xs text-neutral-400 block font-semibold">Accuracy</span>
                            <span className="font-bold text-[#ffe600] text-base">{accuracy}%</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="filter-subject" className="block text-xs font-bold text-neutral-300 uppercase mb-1.5">
                            Filter by Subject
                        </label>
                        <select
                            id="filter-subject"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:border-cyan-400 outline-none"
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
                        <label htmlFor="filter-diff" className="block text-xs font-bold text-neutral-300 uppercase mb-1.5">
                            Difficulty Level
                        </label>
                        <select
                            id="filter-diff"
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:border-cyan-400 outline-none"
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
                <div role="status" aria-live="polite" className="text-center py-16 text-neutral-400">
                    <p className="text-xl">Loading practice questions...</p>
                </div>
            ) : !currentQ ? (
                <div className="text-center py-16 bg-neutral-900 rounded-2xl border border-neutral-800 p-8">
                    <p className="text-xl font-bold text-white mb-2">No Practice Questions Found</p>
                    <p className="text-neutral-400 text-sm">Try choosing "All Subjects" or a different difficulty.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <section
                        aria-labelledby="practice-question-text"
                        className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-800">
                            <div>
                                <span className="text-xs font-mono bg-neutral-800 text-cyan-400 px-3 py-1 rounded border border-neutral-700">
                                    {currentQ.subject} • {currentQ.difficulty?.toUpperCase()}
                                </span>
                                <span className="text-xs text-neutral-400 ml-3">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={readQuestion}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-cyan-400 rounded-lg text-sm font-bold transition"
                                aria-label="Read practice question aloud (Key R)"
                            >
                                <Volume2 className="w-4 h-4" aria-hidden="true" />
                                <span>Read Aloud (R)</span>
                            </button>
                        </div>

                        <h2
                            id="practice-question-text"
                            className="text-2xl sm:text-3xl font-extrabold text-white mb-6 leading-snug"
                        >
                            {currentQ.questionText}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3" role="radiogroup" aria-label="Practice Options">
                            {currentQ.options.map((optText, optIdx) => {
                                const isSelected = selectedOption === optIdx;
                                const isCorrectAnswer = checkedResult && checkedResult.correctOption === optIdx;
                                const isWrongSelection = checkedResult && isSelected && !checkedResult.isCorrect;

                                let borderClass = 'border-neutral-700 bg-neutral-950 hover:border-neutral-500';
                                if (isCorrectAnswer) {
                                    borderClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                                } else if (isWrongSelection) {
                                    borderClass = 'border-red-500 bg-red-950/40 text-red-200';
                                } else if (isSelected) {
                                    borderClass = 'border-cyan-400 bg-neutral-800';
                                }

                                return (
                                    <button
                                        key={optIdx}
                                        type="button"
                                        disabled={!!checkedResult || checking}
                                        onClick={() => handleSelectOption(optIdx)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-4 ${borderClass} disabled:cursor-default`}
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-neutral-800 text-white font-bold flex items-center justify-center shrink-0 border border-neutral-700">
                                            {optIdx + 1}
                                        </span>
                                        <span className="text-lg font-medium text-white flex-1">{optText}</span>

                                        {isCorrectAnswer && (
                                            <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold shrink-0">
                                                <CheckCircle className="w-5 h-5" aria-hidden="true" />
                                                <span>Correct Answer</span>
                                            </span>
                                        )}
                                        {isWrongSelection && (
                                            <span className="flex items-center gap-1 text-red-400 text-sm font-bold shrink-0">
                                                <XCircle className="w-5 h-5" aria-hidden="true" />
                                                <span>Your Choice (Incorrect)</span>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation Card */}
                        {checkedResult && (
                            <div
                                role="region"
                                aria-label="Solution explanation"
                                className={`mt-6 p-5 rounded-xl border-2 ${
                                    checkedResult.isCorrect
                                        ? 'bg-emerald-950/30 border-emerald-500/50'
                                        : 'bg-neutral-950 border-cyan-500/50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-extrabold uppercase tracking-wide text-cyan-400">
                                        Solution & Explanation
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            speak(
                                                `Explanation: ${checkedResult.explanation || 'No detailed explanation provided.'}`
                                            )
                                        }
                                        className="inline-flex items-center gap-1 text-xs text-[#ffe600] font-bold hover:underline"
                                    >
                                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Hear Explanation</span>
                                    </button>
                                </div>
                                <p className="text-neutral-200 text-sm leading-relaxed">
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
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl border border-neutral-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Previous Practice Question"
                        >
                            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                            <span>Previous</span>
                        </button>

                        <button
                            type="button"
                            disabled={currentIndex === questions.length - 1}
                            onClick={handleNext}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 focus-visible:ring-4 focus-visible:ring-cyan-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Next Practice Question"
                        >
                            <span>Next Question</span>
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            </div>

            <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </DashboardLayout>
    );
}
