import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import resultService from '../services/resultService';
import {
    Award,
    CheckCircle2,
    XCircle,
    Clock,
    Volume2,
    VolumeX,
    ArrowLeft,
    Check,
    X,
    HelpCircle,
    BookOpen
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function DetailedResult() {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const { speak, cancel, speaking } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        let isMounted = true;
        const fetchResult = async () => {
            try {
                const res = await resultService.getResultById(id);
                if (res.success && res.result && isMounted) {
                    setResult(res.result);
                    const sc = res.result.score || {};
                    const summary = `Result for ${res.result.examTitle}. You obtained ${sc.obtainedMarks} marks out of ${sc.totalMarks}, with a score of ${sc.percentage} percent. ${sc.passed ? 'You passed the examination.' : 'Additional practice is recommended.'}`;
                    speak(summary);
                    announce(summary, 'polite');
                }
            } catch (err) {
                console.error('Error fetching detailed result:', err);
                announce('Unable to load result.', 'assertive');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchResult();
        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Loading Scorecard...">
                <div role="status" aria-live="polite" className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-16 text-[var(--text-muted)] rounded-3xl shadow-xs">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[var(--text-primary)] font-bold">Loading examination results and solutions...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!result) {
        return (
            <DashboardLayout pageTitle="Result Not Found">
                <div className="panel-card bg-white border border-slate-200 text-center py-16 rounded-3xl shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Result Not Found</h1>
                    <Link to="/results" className="inline-flex h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold items-center justify-center transition shadow-md shadow-blue-500/20">
                        Back to Results History
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const sc = result.score || {};
    const questionReview = sc.questionReview || [];
    const subjectBreakdown = sc.subjectBreakdown || [];

    const readQuestionReview = (q, idx) => {
        const hasAns = q.selectedOption !== null && q.selectedOption !== undefined;
        const yourChoice = hasAns ? `Option ${q.selectedOption + 1}: ${q.options[q.selectedOption]}` : 'Unanswered';
        const correctChoice = `Option ${q.correctOption + 1}: ${q.options[q.correctOption]}`;
        const outcome = q.isCorrect ? 'Correct.' : 'Incorrect.';
        const text = `Question ${idx + 1}: ${q.questionText}. Your answer: ${yourChoice}. ${outcome} Correct answer: ${correctChoice}. Explanation: ${q.explanation || 'None provided.'}`;
        speak(text, { force: true });
    };

    return (
        <DashboardLayout
            pageTitle="Scorecard & Question Review"
            pageDescription="Detailed review of all questions with correct options, candidate answers, and audible explanations."
        >
            <div className="mb-4">
                <Link
                    to="/results"
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-semibold transition"
                >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Back to Results History</span>
                </Link>
            </div>

            {/* Score Card Banner */}
            <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)] mb-6">
                    <div>
                        <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${
                                sc.passed
                                    ? 'bg-[var(--bg-tertiary)] text-[var(--success)] border-[var(--border-color)]'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--danger)] border-[var(--border-color)]'
                            }`}
                        >
                            {sc.passed ? 'Passed Examination' : 'Needs Preparation'}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-2">
                            {result.examTitle}
                        </h1>
                        <p className="text-[var(--text-muted)] text-sm mt-0.5">Comprehensive Performance Analysis & Scoring</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (speaking) {
                                cancel();
                            } else {
                                speak(
                                    `Total Questions: ${sc.totalQuestions}. Attempted: ${sc.attempted}. Correct: ${sc.correct}. Incorrect: ${sc.incorrect}. Unanswered: ${sc.unanswered}. Total Marks: ${sc.totalMarks}. Obtained Marks: ${sc.obtainedMarks}. Percentage: ${sc.percentage} percent.`,
                                    { force: true }
                                );
                            }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition shrink-0 text-sm border ${
                            speaking
                                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300 animate-pulse'
                                : 'btn-secondary'
                        }`}
                        aria-label={speaking ? 'Stop reading scorecard' : 'Read full scorecard summary aloud'}
                        title={speaking ? 'Click to Stop Reading' : 'Click to Read Score Aloud'}
                    >
                        {speaking ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
                        <span>{speaking ? 'Stop Reading' : 'Read Score Aloud'}</span>
                    </button>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] mb-6 text-center">
                    <div>
                        <span className="text-xs text-[var(--text-muted)] block font-semibold">Marks Obtained</span>
                        <span className="text-2xl font-black text-[var(--primary)]">
                            {sc.obtainedMarks} <span className="text-sm text-[var(--text-muted)]">/ {sc.totalMarks}</span>
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-[var(--text-muted)] block font-semibold">Percentage</span>
                        <span className="text-2xl font-black text-[var(--text-primary)]">{sc.percentage}%</span>
                    </div>
                    <div>
                        <span className="text-xs text-[var(--text-muted)] block font-semibold">Correct Answers</span>
                        <span className="text-2xl font-black text-[var(--success)]">
                            {sc.correct} <span className="text-sm text-[var(--text-muted)]">/ {sc.totalQuestions}</span>
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-[var(--text-muted)] block font-semibold">Time Taken</span>
                        <span className="text-2xl font-black text-[var(--primary)]">
                            {Math.floor((sc.timeTakenSeconds || 0) / 60)}m {(sc.timeTakenSeconds || 0) % 60}s
                        </span>
                    </div>
                </div>

                {/* Sub-Metrics: Attempted, Incorrect, Unanswered */}
                <div className="flex flex-wrap justify-around gap-4 text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
                    <span>
                        Attempted: <strong className="text-[var(--text-primary)]">{sc.attempted}</strong>
                    </span>
                    <span>•</span>
                    <span>
                        Incorrect: <strong className="text-[var(--danger)]">{sc.incorrect}</strong>
                    </span>
                    <span>•</span>
                    <span>
                        Unanswered: <strong className="text-[var(--text-muted)]">{sc.unanswered}</strong>
                    </span>
                </div>
            </div>

            {/* Subject-Wise Performance Accessible Table */}
            {subjectBreakdown.length > 0 && (
                <section aria-labelledby="subject-perf-title" className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
                    <h2 id="subject-perf-title" className="text-xl font-bold text-[var(--text-primary)] mb-4">
                        Subject-Wise Performance Breakdown
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase text-xs">
                                    <th className="py-3 px-4 font-bold">Subject</th>
                                    <th className="py-3 px-4 font-bold text-center">Total Questions</th>
                                    <th className="py-3 px-4 font-bold text-center">Correct</th>
                                    <th className="py-3 px-4 font-bold text-center">Incorrect</th>
                                    <th className="py-3 px-4 font-bold text-right">Accuracy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                                {subjectBreakdown.map((sb, i) => (
                                    <tr key={i} className="hover:bg-[var(--bg-tertiary)] transition">
                                        <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{sb.subject}</td>
                                        <td className="py-3.5 px-4 text-center">{sb.total}</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-[var(--success)]">{sb.correct}</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-[var(--danger)]">{sb.incorrect}</td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--primary)]">
                                            {sb.accuracy}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Question-by-Question Detailed Review */}
            <section aria-labelledby="review-heading" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 id="review-heading" className="text-2xl font-black text-[var(--text-primary)]">
                        Question-by-Question Solution Review
                    </h2>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                        {questionReview.length} Questions Evaluated
                    </span>
                </div>

                {questionReview.map((q, idx) => {
                    const hasAnswer = q.selectedOption !== null && q.selectedOption !== undefined;

                    return (
                        <div
                            key={idx}
                            className={`p-6 rounded-3xl border-2 transition ${
                                q.isCorrect
                                    ? 'bg-[var(--bg-surface)] border-[var(--success)] shadow-xs'
                                    : hasAnswer
                                    ? 'bg-[var(--bg-surface)] border-[var(--danger)] shadow-xs'
                                    : 'bg-[var(--bg-surface)] border-[var(--border-color)] shadow-xs'
                            }`}
                        >
                            {/* Question Header */}
                            <div className="flex justify-between items-start gap-4 mb-3 pb-2 border-b border-[var(--border-color)]">
                                <div>
                                    <span className="text-xs font-mono text-[var(--text-muted)]">
                                        QUESTION {idx + 1} • {q.subject || 'General'}
                                    </span>
                                    <span
                                        className={`ml-3 text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                                            q.isCorrect
                                                ? 'bg-[var(--bg-tertiary)] text-[var(--success)] border-[var(--border-color)]'
                                                : hasAnswer
                                                ? 'bg-[var(--bg-tertiary)] text-[var(--danger)] border-[var(--border-color)]'
                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-color)]'
                                        }`}
                                    >
                                        {q.isCorrect ? 'Correct (+1)' : hasAnswer ? 'Incorrect (-0.25)' : 'Unanswered (0)'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => readQuestionReview(q, idx)}
                                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] rounded-lg transition"
                                    aria-label={`Read solution for question ${idx + 1} aloud`}
                                    title="Hear Question & Solution"
                                >
                                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Question Text */}
                            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 leading-snug">
                                {q.questionText}
                            </h3>

                            {/* Options Status */}
                            <div className="space-y-2 mb-4">
                                {q.options.map((optText, optIdx) => {
                                    const isCorrectOpt = q.correctOption === optIdx;
                                    const isChosenByCandidate = q.selectedOption === optIdx;

                                    let optClass = 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)]';
                                    if (isCorrectOpt) {
                                        optClass = 'bg-[var(--bg-surface)] border-[var(--success)] text-[var(--success)] font-bold';
                                    } else if (isChosenByCandidate && !q.isCorrect) {
                                        optClass = 'bg-[var(--bg-surface)] border-[var(--danger)] text-[var(--danger)]';
                                    }

                                    return (
                                        <div
                                            key={optIdx}
                                            className={`p-3 rounded-xl border flex items-center justify-between text-sm ${optClass}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                                                    isCorrectOpt ? 'bg-[var(--success)] text-white' : isChosenByCandidate ? 'bg-[var(--danger)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                                }`}>
                                                    {optIdx + 1}
                                                </span>
                                                <span>{optText}</span>
                                            </div>

                                            {isCorrectOpt && (
                                                <span className="text-xs font-bold text-[var(--success)] flex items-center gap-1 shrink-0 bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                                                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                                    Correct Answer
                                                </span>
                                            )}
                                            {isChosenByCandidate && !isCorrectOpt && (
                                                <span className="text-xs font-bold text-[var(--danger)] flex items-center gap-1 shrink-0 bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                                                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                                                    Your Choice
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            <div className="p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] text-sm">
                                <span className="text-xs font-black text-[var(--primary)] uppercase block mb-1">
                                    Explanation & Method:
                                </span>
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {q.explanation || 'No detailed explanation provided.'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </section>
        </DashboardLayout>
    );
}
