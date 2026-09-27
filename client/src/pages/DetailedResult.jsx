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
    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await resultService.getResultById(id);
                if (res.success && res.result) {
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
                setLoading(false);
            }
        };

        fetchResult();
    }, [id, speak, announce]);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Loading Scorecard...">
                <div role="status" aria-live="polite" className="panel-card bg-neutral-900 border-neutral-800 text-center py-16 text-neutral-400">
                    <div className="w-8 h-8 border-4 border-[#ffe600] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-white font-bold">Loading examination results and solutions...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!result) {
        return (
            <DashboardLayout pageTitle="Result Not Found">
                <div className="panel-card bg-neutral-900 border-neutral-800 text-center py-16">
                    <h1 className="text-2xl font-bold text-white mb-4">Result Not Found</h1>
                    <Link to="/results" className="btn-primary">
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
        speak(text);
    };

    return (
        <DashboardLayout
            pageTitle="Scorecard & Question Review"
            pageDescription="Detailed review of all questions with correct options, candidate answers, and audible explanations."
        >
            <div className="mb-4">
                <Link
                    to="/results"
                    className="inline-flex items-center gap-2 text-neutral-300 hover:text-[#ffe600] text-sm font-semibold transition"
                >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Back to Results History</span>
                </Link>
            </div>

            {/* Score Card Banner */}
            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-6">
                    <div>
                        <span
                            className={`text-xs font-bold px-3 py-1 rounded border uppercase ${
                                sc.passed
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                                    : 'bg-red-950 text-red-300 border-red-500'
                            }`}
                        >
                            {sc.passed ? 'Passed Examination' : 'Needs Preparation'}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                            {result.examTitle}
                        </h1>
                        <p className="text-neutral-300 text-sm mt-0.5">Comprehensive Performance Analysis</p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            speak(
                                `Total Questions: ${sc.totalQuestions}. Attempted: ${sc.attempted}. Correct: ${sc.correct}. Incorrect: ${sc.incorrect}. Unanswered: ${sc.unanswered}. Total Marks: ${sc.totalMarks}. Obtained Marks: ${sc.obtainedMarks}. Percentage: ${sc.percentage} percent.`
                            )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800 text-[#ffe600] border border-[#ffe600] rounded-xl hover:bg-neutral-700 font-bold transition shrink-0"
                        aria-label="Read full scorecard summary aloud"
                    >
                        <Volume2 className="w-5 h-5" aria-hidden="true" />
                        <span>Read Score Aloud</span>
                    </button>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-950 rounded-xl border border-neutral-800 mb-6 text-center">
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Marks Obtained</span>
                        <span className="text-2xl font-extrabold text-[#ffe600]">
                            {sc.obtainedMarks} <span className="text-sm text-neutral-400">/ {sc.totalMarks}</span>
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Percentage</span>
                        <span className="text-2xl font-extrabold text-white">{sc.percentage}%</span>
                    </div>
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Correct Answers</span>
                        <span className="text-2xl font-extrabold text-emerald-400">
                            {sc.correct} <span className="text-sm text-neutral-400">/ {sc.totalQuestions}</span>
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Time Taken</span>
                        <span className="text-2xl font-extrabold text-purple-400">
                            {Math.floor((sc.timeTakenSeconds || 0) / 60)}m {(sc.timeTakenSeconds || 0) % 60}s
                        </span>
                    </div>
                </div>

                {/* Sub-Metrics: Attempted, Incorrect, Unanswered */}
                <div className="flex flex-wrap justify-around gap-4 text-sm text-neutral-300 pt-2 border-t border-neutral-800/60">
                    <span>
                        Attempted: <strong className="text-white">{sc.attempted}</strong>
                    </span>
                    <span>•</span>
                    <span>
                        Incorrect: <strong className="text-red-400">{sc.incorrect}</strong>
                    </span>
                    <span>•</span>
                    <span>
                        Unanswered: <strong className="text-neutral-400">{sc.unanswered}</strong>
                    </span>
                </div>
            </div>

            {/* Subject-Wise Performance Accessible Table */}
            {subjectBreakdown.length > 0 && (
                <section aria-labelledby="subject-perf-title" className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
                    <h2 id="subject-perf-title" className="text-xl font-bold text-white mb-4">
                        Subject-Wise Performance Breakdown
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-xs">
                                    <th className="py-3 px-4 font-bold">Subject</th>
                                    <th className="py-3 px-4 font-bold text-center">Total Questions</th>
                                    <th className="py-3 px-4 font-bold text-center">Correct</th>
                                    <th className="py-3 px-4 font-bold text-center">Incorrect</th>
                                    <th className="py-3 px-4 font-bold text-right">Accuracy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {subjectBreakdown.map((sb, i) => (
                                    <tr key={i} className="hover:bg-neutral-850">
                                        <td className="py-3.5 px-4 font-bold text-white">{sb.subject}</td>
                                        <td className="py-3.5 px-4 text-center text-neutral-300">{sb.total}</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{sb.correct}</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-red-400">{sb.incorrect}</td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#ffe600]">
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
                    <h2 id="review-heading" className="text-2xl font-bold text-white">
                        Question-by-Question Solution Review
                    </h2>
                    <span className="text-xs text-neutral-400">
                        {questionReview.length} Questions Evaluated
                    </span>
                </div>

                {questionReview.map((q, idx) => {
                    const hasAnswer = q.selectedOption !== null && q.selectedOption !== undefined;

                    return (
                        <div
                            key={idx}
                            className={`p-6 rounded-2xl border-2 transition ${
                                q.isCorrect
                                    ? 'bg-neutral-900 border-emerald-500/60'
                                    : hasAnswer
                                    ? 'bg-neutral-900 border-red-500/60'
                                    : 'bg-neutral-900 border-neutral-700'
                            }`}
                        >
                            {/* Question Header */}
                            <div className="flex justify-between items-start gap-4 mb-3 pb-2 border-b border-neutral-800">
                                <div>
                                    <span className="text-xs font-mono text-neutral-400">
                                        QUESTION {idx + 1} • {q.subject || 'General'}
                                    </span>
                                    <span
                                        className={`ml-3 text-xs font-bold px-2 py-0.5 rounded border uppercase ${
                                            q.isCorrect
                                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                                : hasAnswer
                                                ? 'bg-red-950 text-red-300 border-red-600'
                                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                        }`}
                                    >
                                        {q.isCorrect ? 'Correct (+1)' : hasAnswer ? 'Incorrect (-0.25)' : 'Unanswered (0)'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => readQuestionReview(q, idx)}
                                    className="p-1.5 text-neutral-400 hover:text-[#ffe600] rounded-lg transition"
                                    aria-label={`Read solution for question ${idx + 1} aloud`}
                                    title="Hear Question & Solution"
                                >
                                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Question Text */}
                            <h3 className="text-xl font-bold text-white mb-4 leading-snug">
                                {q.questionText}
                            </h3>

                            {/* Options Status */}
                            <div className="space-y-2 mb-4">
                                {q.options.map((optText, optIdx) => {
                                    const isCorrectOpt = q.correctOption === optIdx;
                                    const isChosenByCandidate = q.selectedOption === optIdx;

                                    let optClass = 'bg-neutral-950 border-neutral-800 text-neutral-300';
                                    if (isCorrectOpt) {
                                        optClass = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                                    } else if (isChosenByCandidate && !q.isCorrect) {
                                        optClass = 'bg-red-950/50 border-red-500 text-red-200';
                                    }

                                    return (
                                        <div
                                            key={optIdx}
                                            className={`p-3 rounded-xl border flex items-center justify-between text-sm ${optClass}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded bg-neutral-800 text-white font-mono text-xs flex items-center justify-center shrink-0">
                                                    {optIdx + 1}
                                                </span>
                                                <span>{optText}</span>
                                            </div>

                                            {isCorrectOpt && (
                                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                                                    <Check className="w-4 h-4" aria-hidden="true" />
                                                    Correct Answer
                                                </span>
                                            )}
                                            {isChosenByCandidate && !isCorrectOpt && (
                                                <span className="text-xs font-bold text-red-400 flex items-center gap-1 shrink-0">
                                                    <X className="w-4 h-4" aria-hidden="true" />
                                                    Your Choice
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-sm">
                                <span className="text-xs font-bold text-[#ffe600] uppercase block mb-1">
                                    Explanation & Method:
                                </span>
                                <p className="text-neutral-300 leading-relaxed">
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
