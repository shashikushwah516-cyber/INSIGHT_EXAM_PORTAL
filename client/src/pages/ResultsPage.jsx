import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import resultService from '../services/resultService';
import {
    Award,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowRight,
    Volume2,
    FileText
} from 'lucide-react';

export default function ResultsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await resultService.getResults();
                if (res.success) {
                    setResults(res.results || []);
                    const msg = `You have ${res.results?.length || 0} examination results available.`;
                    speak(msg);
                    announce(msg, 'polite');
                }
            } catch (err) {
                console.error('Error fetching results:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [speak, announce]);

    return (
        <main id="main-content" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Examination Results & History</h1>
                    <p className="text-neutral-300 text-sm mt-1">
                        Review scores, accuracy, and detailed question-by-question solutions.
                    </p>
                </div>
            </div>

            {loading ? (
                <div role="status" aria-live="polite" className="text-center py-16 text-neutral-400">
                    <p className="text-xl">Loading your results...</p>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                    <Award className="w-12 h-12 text-neutral-500 mx-auto mb-3" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-white mb-2">No Completed Examinations Yet</h2>
                    <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
                        You have not completed any mock examinations yet. Take a competitive examination to see your detailed scorecard.
                    </p>
                    <Link
                        to="/exams"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffe600] text-black font-bold rounded-xl"
                    >
                        <span>Browse Available Examinations</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map((res) => {
                        const sc = res.score || {};
                        const dateStr = res.submittedAt ? new Date(res.submittedAt).toLocaleDateString() : 'Recent';
                        const isPassed = sc.passed;

                        return (
                            <div
                                key={res.id || res.attemptId}
                                className="bg-neutral-900 border-2 border-neutral-800 hover:border-[#ffe600] rounded-2xl p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs font-bold px-2.5 py-0.5 rounded border uppercase ${
                                                isPassed
                                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                                                    : 'bg-red-950 text-red-300 border-red-500'
                                            }`}
                                        >
                                            {isPassed ? 'Passed' : 'Needs Practice'}
                                        </span>
                                        <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                            {dateStr}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-white">{res.examTitle}</h2>

                                    <div className="flex flex-wrap gap-4 text-sm text-neutral-300">
                                        <span>
                                            Score: <strong className="text-[#ffe600]">{sc.obtainedMarks}</strong> / {sc.totalMarks}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Percentage: <strong className="text-white">{sc.percentage}%</strong>
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Correct: <strong className="text-emerald-400">{sc.correct}</strong> / {sc.totalQuestions}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    to={`/results/${res.id || res.attemptId}`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-800 hover:bg-[#ffe600] text-white hover:text-black font-bold rounded-xl border border-neutral-700 hover:border-[#ffe600] transition shrink-0"
                                >
                                    <span>Detailed Review & Solutions</span>
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
