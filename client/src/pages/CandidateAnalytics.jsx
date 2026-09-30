import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import resultService from '../services/resultService';
import {
    BarChart3,
    Award,
    Clock,
    Target,
    CheckCircle2,
    Volume2,
    VolumeX,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function CandidateAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { speak, cancel, speaking } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        let isMounted = true;
        const fetchAnalytics = async () => {
            try {
                const res = await resultService.getCandidateAnalytics();
                if (res.success && res.analytics && isMounted) {
                    setAnalytics(res.analytics);
                    const msg = `Performance analytics loaded. Your overall accuracy is ${res.analytics.accuracy} percent across ${res.analytics.totalExamsAttempted} examinations.`;
                    speak(msg);
                    announce(msg, 'polite');
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAnalytics();
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Calculating Analytics...">
                <div role="status" aria-live="polite" className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-16 text-[var(--text-muted)]">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[var(--text-primary)] font-bold">Calculating preparation analytics and accuracy metrics...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!analytics || (analytics.totalExamsAttempted === 0 && (!analytics.totalPracticed || analytics.totalPracticed === 0))) {
        return (
            <DashboardLayout pageTitle="Performance Analytics" pageDescription="Detailed accuracy tracking, subject mastery, and examination progress over time.">
                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-12 max-w-lg mx-auto shadow-xs">
                    <BarChart3 className="w-12 h-12 text-[var(--primary)] mx-auto mb-3" aria-hidden="true" />
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Performance Data Yet</h1>
                    <p className="text-[var(--text-secondary)] text-sm mb-6">
                        Complete your first competitive mock examination or try interactive subject practice to generate accuracy metrics and insights.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            to="/exams"
                            className="btn-primary"
                        >
                            <span>Browse Exams</span>
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                        <Link
                            to="/practice"
                            className="btn-secondary"
                        >
                            <span>Practice Hub</span>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            pageTitle="Performance Analytics & Insights"
            pageDescription="Detailed breakdown of your competitive exam preparation, accuracy, and weak areas."
        >
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-2xl shadow-xs">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Performance Overview</h2>
                        <p className="text-[var(--text-secondary)] text-sm">Real-time statistics across all attempted competitive papers</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (speaking) {
                                cancel();
                            } else {
                                const recs = analytics.recommendations.join('. ');
                                speak(
                                    `Analytics Summary: Accuracy is ${analytics.accuracy} percent. Average time per question is ${analytics.averageTimePerQuestion} seconds. Recommendations: ${recs}`,
                                    { force: true }
                                );
                            }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition shadow-xs shrink-0 border ${
                            speaking
                                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300 animate-pulse'
                                : 'btn-secondary'
                        }`}
                        aria-label={speaking ? 'Stop reading summary' : 'Read complete analytics summary aloud'}
                        title={speaking ? 'Click to Stop Reading' : 'Click to Read Summary Aloud'}
                    >
                        {speaking ? <VolumeX className="w-5 h-5 text-white" aria-hidden="true" /> : <Volume2 className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />}
                        <span>{speaking ? 'Stop Reading' : 'Read Summary Aloud'}</span>
                    </button>
                </div>

                {/* Top Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-[var(--text-muted)]">Total Exams</span>
                            <Award className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                        </div>
                        <p className="text-3xl font-extrabold text-[var(--text-primary)]">{analytics.totalExamsAttempted}</p>
                        <span className="text-xs text-[var(--text-muted)] mt-1 block">Completed sessions</span>
                    </div>

                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-[var(--text-muted)]">Overall Accuracy</span>
                            <Target className="w-5 h-5 text-[var(--success)]" aria-hidden="true" />
                        </div>
                        <p className="text-3xl font-extrabold text-[var(--success)]">{analytics.accuracy}%</p>
                        <span className="text-xs text-[var(--text-muted)] mt-1 block">Correct vs Attempted</span>
                    </div>

                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-[var(--text-muted)]">Attempt Rate</span>
                            <TrendingUp className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                        </div>
                        <p className="text-3xl font-extrabold text-[var(--primary)]">{analytics.attemptRate}%</p>
                        <span className="text-xs text-[var(--text-muted)] mt-1 block">Questions answered</span>
                    </div>

                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-[var(--text-muted)]">Average Pacing</span>
                            <Clock className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                        </div>
                        <p className="text-3xl font-extrabold text-[var(--text-primary)]">
                            {analytics.averageTimePerQuestion}s
                        </p>
                        <span className="text-xs text-[var(--text-muted)] mt-1 block">Per question answered</span>
                    </div>
                </div>

                {/* Subject-Wise Accuracy Section */}
                <section aria-labelledby="subject-acc-title" className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
                    <h2 id="subject-acc-title" className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                        Subject-Wise Competence & Accuracy
                    </h2>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] uppercase text-xs">
                                    <th className="py-3 px-4 font-bold">Subject</th>
                                    <th className="py-3 px-4 font-bold text-center">Total Answered</th>
                                    <th className="py-3 px-4 font-bold text-center">Correct Answers</th>
                                    <th className="py-3 px-4 font-bold text-right">Accuracy Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                                {analytics.subjectAccuracy.map((sa, i) => (
                                    <tr key={i} className="hover:bg-[var(--bg-tertiary)] transition">
                                        <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{sa.subject}</td>
                                        <td className="py-3.5 px-4 text-center">{sa.total}</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-[var(--success)]">{sa.correct}</td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="w-32 bg-[var(--bg-tertiary)] h-3 rounded-full overflow-hidden border border-[var(--border-color)] hidden sm:block">
                                                    <div
                                                        className="bg-[var(--primary)] h-full rounded-full transition-all"
                                                        style={{ width: `${sa.accuracy}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono font-bold text-[var(--primary)] w-12 text-right">
                                                    {sa.accuracy}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Personalized Recommendations */}
                <section aria-labelledby="recs-title" className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-[var(--success)]" aria-hidden="true" />
                        <h2 id="recs-title" className="text-xl font-bold text-[var(--text-primary)]">
                            Personalized Preparation Recommendations
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {analytics.recommendations.map((rec, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)]"
                            >
                                <span className="w-6 h-6 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[var(--border-color)]">
                                    {idx + 1}
                                </span>
                                <span className="leading-relaxed">{rec}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
