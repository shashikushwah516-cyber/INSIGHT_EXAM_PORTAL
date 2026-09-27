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
    FileText,
    PlayCircle
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

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
        <DashboardLayout
            pageTitle="Examination Results & History"
            pageDescription="Review official scores, percentages, and question-by-question audio explanations for all completed attempts."
        >
            <div className="space-y-6">
                {loading ? (
                    <div role="status" aria-live="polite" className="panel-card bg-neutral-900 border-neutral-800 text-center py-16 text-neutral-400">
                        <div className="w-8 h-8 border-4 border-[#ffe600] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-white font-bold">Loading your scored examinations...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="panel-card bg-neutral-900 border-neutral-800 text-center py-16">
                        <Award className="w-12 h-12 text-neutral-500 mx-auto mb-3" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-white mb-2">No Completed Examinations Yet</h2>
                        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
                            You have not completed any mock examinations yet. Take a competitive examination to see your detailed scorecard.
                        </p>
                        <Link
                            to="/exams"
                            className="btn-primary"
                        >
                            <PlayCircle className="w-4 h-4" aria-hidden="true" />
                            <span>Browse Available Examinations</span>
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
                                    className="panel-card panel-card-hover bg-neutral-900 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
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

                                        <h2 className="text-xl font-bold text-white leading-tight">{res.examTitle}</h2>

                                        <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-neutral-300">
                                            <span>
                                                Score: <strong className="text-[#ffe600] font-mono">{sc.obtainedMarks}</strong> / {sc.totalMarks}
                                            </span>
                                            <span className="text-neutral-600">•</span>
                                            <span>
                                                Percentage: <strong className="text-white font-mono">{sc.percentage}%</strong>
                                            </span>
                                            <span className="text-neutral-600">•</span>
                                            <span>
                                                Correct: <strong className="text-emerald-400 font-mono">{sc.correct}</strong> / {sc.totalQuestions}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/results/${res.id || res.attemptId}`}
                                        className="btn-secondary h-11 text-xs sm:text-sm shrink-0 hover:border-[#ffe600]"
                                    >
                                        <span>Detailed Review & Solutions</span>
                                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
