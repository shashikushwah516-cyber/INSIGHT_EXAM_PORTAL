import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import examService from '../services/examService';
import {
    FileText,
    Volume2,
    VolumeX,
    Clock,
    Award,
    AlertTriangle,
    Keyboard,
    Play,
    ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function ExamInstructions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { speak, cancel, speaking } = useSpeech();
    const { announce } = useAccessibility();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchExam = async () => {
            try {
                const res = await examService.getExamById(id);
                if (res.success && res.exam && isMounted) {
                    setExam(res.exam);
                    const prompt = `Instructions for ${res.exam.title}. Please review the examination rules and keyboard navigation keys before starting.`;
                    speak(prompt);
                    announce(prompt, 'polite');
                }
            } catch (err) {
                console.error('Error fetching exam:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchExam();
        return () => { isMounted = false; };
    }, [id]);

    const readAllInstructions = () => {
        if (!exam) return;
        if (speaking) {
            cancel();
            announce('Reading stopped.', 'polite');
            return;
        }
        const text = `Examination Instructions for ${exam.title}. Total Duration: ${exam.durationMinutes} minutes. Total Questions: ${exam.questions?.length || exam.totalQuestions}. Marking Scheme: Positive marks for correct answers, negative marking of zero point two five marks for wrong answers. Keyboard navigation shortcuts: Press Arrow Right or N for Next Question. Press Arrow Left or P for Previous Question. Press keys 1, 2, 3, or 4 to choose your answer. Press R to hear the current question read aloud. Press M to mark the question for review. Press C to clear your chosen answer. Press T to hear the remaining time. When ready, press Enter on the Start Examination button.`;
        speak(text, { force: true });
    };

    const handleStartExam = async () => {
        if (starting) return;
        setStarting(true);
        setConfirmed(true);
        cancel();

        // Request fullscreen immediately within the user gesture
        if (typeof document !== 'undefined') {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen().catch(() => {});
            }
        }

        try {
            const startRes = await examService.startExam(id);
            if (startRes.success) {
                speak('Examination started in fullscreen lockdown mode. Question 1 loading.');
                navigate(`/exams/${id}/take`, { state: { attemptData: startRes, autoFullscreen: true } });
            }
        } catch (err) {
            console.error('Error starting exam:', err);
            const errText = err.message || 'Unable to start examination session.';
            speak(errText);
            announce(errText, 'assertive');
            setStarting(false);
        }
    };

    // Keyboard support: Press Enter to confirm & start, or Space/C to toggle checkbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = e.target?.tagName?.toLowerCase();
            if (tag === 'textarea' || e.target?.isContentEditable) return;

            // ENTER key: Immediately confirm agreement & start exam
            if (e.key === 'Enter') {
                e.preventDefault();
                setConfirmed(true);
                handleStartExam();
                return;
            }

            // SPACEBAR or 'C': Toggle agreement checkbox
            if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
                if (tag === 'button' || tag === 'a') return;
                e.preventDefault();
                setConfirmed((prev) => {
                    const next = !prev;
                    const msg = next
                        ? 'Agreement confirmed. Press Enter to start examination now.'
                        : 'Agreement unchecked.';
                    speak(msg);
                    announce(msg, 'polite');
                    return next;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleStartExam, speak, announce]);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Loading Instructions...">
                <div role="status" aria-live="polite" className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-16 text-[var(--text-muted)] rounded-3xl shadow-xs">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[var(--text-primary)] font-bold">Loading examination instructions and protocols...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!exam) {
        return (
            <main id="main-content" className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Examination Not Found</h1>
                <Link to="/exams" className="text-[var(--primary)] hover:underline font-bold">
                    Return to Available Examinations
                </Link>
            </main>
        );
    }

    return (
        <DashboardLayout
            pageTitle="Examination Instructions & Protocol"
            pageDescription="Review rules, keyboard shortcuts, and voice controls before starting your timed session."
        >
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="mb-4">
                    <Link
                        to="/exams"
                        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-semibold transition"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        <span>Back to Examination List</span>
                    </Link>
                </div>

                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-xs">
                    {/* Title Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)] mb-6">
                        <div>
                            <span className="text-xs font-mono bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold px-3 py-1 rounded-full border border-[var(--border-color)]">
                                {exam.subject || 'Competitive Exam'}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-2">
                                {exam.title}
                            </h1>
                            <p className="text-[var(--text-muted)] text-sm mt-1">Official Candidate Instructions & Protocol</p>
                        </div>

                        <button
                            onClick={readAllInstructions}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition shrink-0 text-sm border ${
                                speaking
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300 animate-pulse'
                                    : 'btn-secondary'
                            }`}
                            aria-label={speaking ? 'Stop reading instructions' : 'Read all examination rules and shortcuts aloud'}
                            title={speaking ? 'Click to Stop Reading' : 'Click to Read Rules Aloud'}
                        >
                            {speaking ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
                            <span>{speaking ? 'Stop Reading' : 'Read Rules Aloud'}</span>
                        </button>
                    </div>

                    {/* Exam Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] mb-8 text-center">
                        <div>
                            <span className="text-xs text-[var(--text-muted)] block font-semibold">Duration</span>
                            <span className="text-lg font-bold text-[var(--text-primary)]">{exam.durationMinutes} Minutes</span>
                        </div>
                        <div>
                            <span className="text-xs text-[var(--text-muted)] block font-semibold">Total Questions</span>
                            <span className="text-lg font-bold text-[var(--text-primary)]">{exam.questions?.length || exam.totalQuestions}</span>
                        </div>
                        <div>
                            <span className="text-xs text-[var(--text-muted)] block font-semibold">Total Marks</span>
                            <span className="text-lg font-bold text-[var(--primary)]">{exam.totalMarks}</span>
                        </div>
                        <div>
                            <span className="text-xs text-[var(--text-muted)] block font-semibold">Negative Marking</span>
                            <span className="text-lg font-bold text-[var(--danger)]">
                                {exam.negativeMarking ? `-${exam.negativeMarksPerQuestion || 0.25}` : 'None'}
                            </span>
                        </div>
                    </div>

                    {/* General Examination Rules */}
                    <section aria-labelledby="rules-heading" className="mb-8">
                        <h2 id="rules-heading" className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                            <span>Examination Protocol & Integrity Rules</span>
                        </h2>
                        <ul className="space-y-3 text-[var(--text-secondary)] text-sm leading-relaxed">
                            <li className="flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                                <span>
                                    Once started, the examination countdown timer cannot be paused. The timer is verified authoritatively by the server to prevent client-side manipulation.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                                <span>
                                    Every answered question is immediately saved to the database. If you refresh or experience network jitter, your answers remain safely stored.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                                <span>
                                    When the countdown timer expires, the examination will automatically finalize and calculate your score server-side.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Keyboard & Audio Navigation Reference */}
                    <section aria-labelledby="shortcuts-heading" className="mb-8">
                        <h2 id="shortcuts-heading" className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Keyboard className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                            <span>Controlled Examination Keyboard Navigation (Section 5 Standard)</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Navigate between Options</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Up / Down Arrows</span>
                            </div>
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Select Highlighted Option</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Enter</span>
                            </div>
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Next Question</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Right Arrow / N</span>
                            </div>
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Previous Question</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Left Arrow / P</span>
                            </div>
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Repeat Question & Options</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Spacebar / R</span>
                            </div>
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Directly Select 1 to 4</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Keys 1, 2, 3, 4</span>
                            </div>
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Mark for Review</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Key M</span>
                            </div>
                            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-[var(--text-primary)]">Clear Answer</span>
                                <span className="font-mono text-[var(--primary)] font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] px-2 py-0.5 rounded shadow-xs">Backspace / C</span>
                            </div>
                        </div>
                    </section>

                    {/* Confirmation Checkbox & Start Button */}
                    <div className="pt-6 border-t border-[var(--border-color)]">
                        <label 
                            htmlFor="exam-agreement-checkbox"
                            className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer mb-5 ${
                                confirmed 
                                    ? 'bg-[var(--primary-subtle)] border-[var(--primary)] text-[var(--text-primary)] shadow-xs' 
                                    : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-[var(--primary)] text-[var(--text-secondary)]'
                            }`}
                        >
                            <input
                                id="exam-agreement-checkbox"
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => {
                                    setConfirmed(e.target.checked);
                                    speak(e.target.checked ? 'Agreement confirmed. Press Enter to start examination.' : 'Agreement unchecked.');
                                }}
                                className="w-5 h-5 mt-0.5 accent-[var(--primary)] rounded cursor-pointer shrink-0 focus:ring-2 focus:ring-[var(--focus-ring)]"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-semibold text-[var(--text-primary)] block">
                                    I have reviewed the examination instructions, scoring rules, and keyboard controls. I am ready to begin my timed attempt in secure lockdown mode.
                                </span>
                                <span className="text-xs text-[var(--primary)] font-bold mt-2 flex flex-wrap items-center gap-2">
                                    <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-[11px] shadow-2xs">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-[11px] shadow-2xs">C</kbd> to toggle</span>
                                    <span>•</span>
                                    <span>Press <kbd className="px-2 py-0.5 rounded bg-[var(--primary)] text-[var(--bg-primary)] font-mono text-[11px] font-bold shadow-2xs">Enter</kbd> to Confirm & Start</span>
                                </span>
                            </div>
                        </label>

                        <button
                            type="button"
                            disabled={starting}
                            onClick={() => {
                                setConfirmed(true);
                                handleStartExam();
                            }}
                            className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-3 shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Play className="w-5 h-5" aria-hidden="true" />
                            <span>{starting ? 'Initializing Session & Entering Fullscreen...' : 'Start Examination Now (Press Enter)'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
