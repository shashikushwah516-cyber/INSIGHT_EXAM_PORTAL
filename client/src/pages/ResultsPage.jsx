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
        let isMounted = true;
        const fetchResults = async () => {
            try {
                const res = await resultService.getResults();
                if (res.success && isMounted) {
                    setResults(res.results || []);
                    const msg = `You have ${res.results?.length || 0} examination results available.`;
                    speak(msg);
                    announce(msg, 'polite');
                }
            } catch (err) {
                console.error('Error fetching results:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchResults();
        return () => { isMounted = false; };
    }, []);

    return (
        <DashboardLayout
            pageTitle="Examination Results & History"
            pageDescription="Review official scores, percentages, and question-by-question audio explanations for all completed attempts."
        >
            <div className="space-y-6">
                {loading ? (
                    <div role="status" aria-live="polite" className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-16 text-[var(--text-muted)]">
                        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-[var(--text-primary)] font-bold">Loading your scored examinations...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-16">
                        <Award className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Completed Examinations Yet</h2>
                        <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto mb-6">
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
                                    className="panel-card panel-card-hover bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                                                    isPassed
                                                        ? 'bg-[var(--bg-tertiary)] text-[var(--success)] border-[var(--border-color)]'
                                                        : 'bg-[var(--bg-tertiary)] text-[var(--danger)] border-[var(--border-color)]'
                                                }`}
                                            >
                                                {isPassed ? 'Passed' : 'Needs Practice'}
                                            </span>
                                            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                                                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                                {dateStr}
                                            </span>
                                        </div>

                                        <h2 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{res.examTitle}</h2>

                                        <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-[var(--text-secondary)]">
                                            <span>
                                                Score: <strong className="text-[var(--primary)] font-mono font-bold">{sc.obtainedMarks}</strong> / {sc.totalMarks}
                                            </span>
                                            <span className="text-[var(--border-color)]">•</span>
                                            <span>
                                                Percentage: <strong className="text-[var(--text-primary)] font-mono font-bold">{sc.percentage}%</strong>
                                            </span>
                                            <span className="text-[var(--border-color)]">•</span>
                                            <span>
                                                Correct: <strong className="text-[var(--success)] font-mono font-bold">{sc.correct}</strong> / {sc.totalQuestions}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/results/${res.id || res.attemptId}`}
                                        className="btn-secondary h-11 text-xs sm:text-sm shrink-0"
                                    >
                                        <span>Detailed Review & Solutions</span>
                                        <ArrowRight className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
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
