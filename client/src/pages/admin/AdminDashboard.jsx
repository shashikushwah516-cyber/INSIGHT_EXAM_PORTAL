import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../../hooks/useSpeech';
import resultService from '../../services/resultService';
import {
    Users,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    TrendingUp,
    ArrowRight,
    Shield,
    Volume2,
    Plus,
    FileSpreadsheet,
    Activity,
    Clock,
    Award
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const { speak } = useSpeech();

    useEffect(() => {
        let isMounted = true;
        const fetchOverview = async () => {
            try {
                const res = await resultService.getAdminOverview();
                if (isMounted && res.success && res.overview) {
                    setOverview(res.overview);
                }
            } catch (err) {
                console.error('Error fetching admin overview:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchOverview();
        return () => { isMounted = false; };
    }, []);

    return (
        <AdminLayout
            pageTitle="Administrator Control Center"
            pageDescription="Overview of platform assessments, candidate results, question banks, and system metrics."
        >
            <div className="space-y-8">
                {/* Header Greeting Banner */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono font-bold bg-[var(--primary)] text-[var(--bg-primary)] px-3 py-1 rounded-full shadow-xs">
                                    ADMIN CONSOLE
                                </span>
                                <span className="text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                                    SYSTEM CONTROLLER
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                                Administrator Control Center
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                                Oversee competitive examination scheduling, question bank items, candidate submissions, and platform-wide accessibility compliance.
                            </p>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() =>
                                    speak(
                                        `Administrator Dashboard. Registered candidates: ${overview?.totalCandidates || 0}. Total examinations: ${overview?.totalExams || 0}. Question bank count: ${overview?.totalQuestions || 0}. Completed exam submissions: ${overview?.totalAttempts || 0}. Platform mean score: ${overview?.averageScore || 0} percent.`,
                                        { force: true }
                                    )
                                }
                                className="inline-flex items-center gap-2 min-h-[2.75rem] px-4 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-primary)] font-bold text-sm transition-all shadow-xs cursor-pointer"
                                aria-label="Read admin platform overview metrics aloud"
                            >
                                <Volume2 className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden="true" />
                                <span>Read Metrics Aloud</span>
                            </button>

                            <Link
                                to="/admin/questions"
                                className="inline-flex items-center gap-2 min-h-[2.75rem] px-5 py-2.5 bg-[var(--primary)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 text-sm font-bold shadow-sm transition"
                            >
                                <Plus className="w-5 h-5 shrink-0" aria-hidden="true" />
                                <span>Add Question</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div role="status" aria-live="polite" className="text-center py-16 text-[var(--text-muted)]">
                        <p className="text-xl font-bold">Loading platform metrics...</p>
                    </div>
                ) : (
                    <>
                        {/* Platform Summary Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-8">
                            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] p-5 rounded-2xl transition-all duration-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Candidates</span>
                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
                                        <Users className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-[var(--text-primary)]">{overview?.totalCandidates || 0}</p>
                                <span className="text-xs text-[var(--text-muted)] mt-1 block">Registered students</span>
                            </div>

                            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] p-5 rounded-2xl transition-all duration-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Question Bank</span>
                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
                                        <HelpCircle className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-[var(--text-primary)]">{overview?.totalQuestions || 0}</p>
                                <span className="text-xs text-[var(--text-muted)] mt-1 block">Active question items</span>
                            </div>

                            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] p-5 rounded-2xl transition-all duration-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Exams Scheduled</span>
                                    <div className="w-8 h-8 rounded-lg bg-[var(--warning)]/15 flex items-center justify-center text-[var(--warning)]">
                                        <BookOpen className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-[var(--text-primary)]">{overview?.totalExams || 0}</p>
                                <span className="text-xs text-[var(--text-muted)] mt-1 block">Competitive tests</span>
                            </div>

                            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] p-5 rounded-2xl transition-all duration-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Submissions</span>
                                    <div className="w-8 h-8 rounded-lg bg-[var(--success)]/15 flex items-center justify-center text-[var(--success)]">
                                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-[var(--success)]">{overview?.totalAttempts || 0}</p>
                                <span className="text-xs text-[var(--text-muted)] mt-1 block">Completed exams</span>
                            </div>

                            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] p-5 rounded-2xl transition-all duration-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Platform Mean</span>
                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
                                        <TrendingUp className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-[var(--primary)]">
                                    {overview?.averageScore || 0}%
                                </p>
                                <span className="text-xs text-[var(--text-muted)] mt-1 block">Candidate average</span>
                            </div>
                        </div>

                        {/* Quick Management Links */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Link
                                to="/admin/students"
                                className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-sm"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)] mb-4 border border-[var(--border-color)]">
                                        <Users className="w-7 h-7" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Student Management</h2>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                        Search enrolled candidates, register new student profiles, edit credentials, manage account status, and view exam logs.
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-[var(--primary)] inline-flex items-center gap-1.5">
                                    <span>Manage Candidates</span>
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </span>
                            </Link>

                            <Link
                                to="/admin/questions"
                                className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-sm"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)] mb-4 border border-[var(--border-color)]">
                                        <HelpCircle className="w-7 h-7" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Question Bank Management</h2>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                        Add, edit, and organize competitive exam questions with 4 options, correct answer keys, marks, negative marking, and accessible audio descriptions.
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-[var(--primary)] inline-flex items-center gap-1.5">
                                    <span>Manage Question Bank</span>
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </span>
                            </Link>

                            <Link
                                to="/admin/exams"
                                className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-sm"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)] mb-4 border border-[var(--border-color)]">
                                        <BookOpen className="w-7 h-7" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Examination Builder</h2>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                        Configure new timed examinations, set durations, select questions from the bank, toggle negative marking, and publish them to candidate portals.
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-[var(--primary)] inline-flex items-center gap-1.5">
                                    <span>Create & Publish Exams</span>
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </span>
                            </Link>

                            <Link
                                to="/admin/attempts"
                                className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--focus-ring)] rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-sm"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/15 flex items-center justify-center text-[var(--success)] mb-4 border border-[var(--border-color)]">
                                        <Activity className="w-7 h-7" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Candidate Attempts Monitor</h2>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                        Inspect candidate exam attempts in real time, audit submission scores, and analyze pass/fail outcomes across subjects.
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-[var(--success)] inline-flex items-center gap-1.5">
                                    <span>Monitor Candidate Attempts</span>
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </span>
                            </Link>
                        </div>

                        {/* Recent Candidate Submissions Log */}
                        <section aria-labelledby="recent-attempts-title" className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 id="recent-attempts-title" className="text-xl font-bold text-[var(--text-primary)]">
                                        Recent Candidate Submissions
                                    </h2>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Live assessment log across all competitive tests</p>
                                </div>
                                <Link
                                    to="/admin/attempts"
                                    className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                                >
                                    <span>View All Records</span>
                                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                                </Link>
                            </div>

                            {overview?.recentAttempts && overview.recentAttempts.length > 0 ? (
                                <div className="overflow-x-auto scrollbar-thin">
                                    <table className="w-full min-w-[620px] text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                                                <th className="py-3 px-4 font-bold">Candidate</th>
                                                <th className="py-3 px-4 font-bold">Roll Number</th>
                                                <th className="py-3 px-4 font-bold">Examination</th>
                                                <th className="py-3 px-4 font-bold text-center">Score</th>
                                                <th className="py-3 px-4 font-bold text-center">Percentage</th>
                                                <th className="py-3 px-4 font-bold text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]">
                                            {overview.recentAttempts.map((att, i) => (
                                                <tr key={i} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{att.candidateName}</td>
                                                    <td className="py-3.5 px-4 font-mono text-[var(--primary)] font-bold">{att.candidateRoll}</td>
                                                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{att.examTitle}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-[var(--text-primary)]">
                                                        {att.obtainedMarks} / {att.totalMarks}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className="font-mono font-bold text-xs bg-[var(--success)]/20 text-[var(--success)] px-2.5 py-0.5 rounded border border-[var(--success)]/40">
                                                            {att.percentage}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <Link
                                                            to={`/results/${att.id}`}
                                                            className="text-xs font-bold text-[var(--primary)] hover:underline"
                                                        >
                                                            Review Solutions
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-[var(--text-muted)] text-sm">No recent submissions recorded yet.</p>
                            )}
                        </section>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
