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
        const fetchOverview = async () => {
            try {
                const res = await resultService.getAdminOverview();
                if (res.success && res.overview) {
                    setOverview(res.overview);
                }
            } catch (err) {
                console.error('Error fetching admin overview:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    return (
        <AdminLayout
            pageTitle="Administrator Control Center"
            pageDescription="Overview of platform assessments, candidate results, question banks, and system metrics."
        >
            <div className="space-y-8">
            {/* Header Greeting Banner */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border-2 border-neutral-800 p-6 sm:p-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono font-bold bg-[#ffe600] text-black px-3 py-1 rounded-full shadow-sm">
                                ADMIN CONSOLE
                            </span>
                            <span className="text-xs font-mono bg-neutral-800 text-cyan-400 px-3 py-1 rounded-full border border-neutral-700">
                                SYSTEM CONTROLLER
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                            Administrator Control Center
                        </h1>
                        <p className="text-neutral-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                            Oversee competitive examination scheduling, question bank items, candidate submissions, and platform-wide accessibility compliance.
                        </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() =>
                                speak(
                                    `Administrator Dashboard. Registered candidates: ${overview?.totalCandidates || 0}. Total examinations: ${overview?.totalExams || 0}. Question bank count: ${overview?.totalQuestions || 0}. Completed exam submissions: ${overview?.totalAttempts || 0}. Platform mean score: ${overview?.averageScore || 0} percent.`
                                )
                            }
                            className="inline-flex items-center gap-2 px-4 py-3 bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] rounded-xl hover:bg-neutral-700 font-bold text-sm transition-all shadow-md active:scale-95"
                            aria-label="Read admin platform overview metrics aloud"
                        >
                            <Volume2 className="w-5 h-5" aria-hidden="true" />
                            <span>Read Metrics Aloud</span>
                        </button>

                        <Link
                            to="/admin/questions"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-[#ffe600] text-black font-extrabold rounded-xl hover:bg-yellow-400 text-sm transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
                        >
                            <Plus className="w-5 h-5" aria-hidden="true" />
                            <span>Add Question</span>
                        </Link>
                    </div>
                </div>
            </div>

            {loading ? (
                <div role="status" aria-live="polite" className="text-center py-16 text-neutral-400">
                    <p className="text-xl">Loading platform metrics...</p>
                </div>
            ) : (
                <>
                    {/* Platform Summary Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                        <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-cyan-400 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Candidates</span>
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                    <Users className="w-4 h-4" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white">{overview?.totalCandidates || 0}</p>
                            <span className="text-xs text-neutral-400 mt-1 block">Registered students</span>
                        </div>

                        <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-purple-400 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Question Bank</span>
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white">{overview?.totalQuestions || 0}</p>
                            <span className="text-xs text-neutral-400 mt-1 block">Active question items</span>
                        </div>

                        <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-[#ffe600] p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Exams Scheduled</span>
                                <div className="w-8 h-8 rounded-lg bg-[#ffe600]/10 flex items-center justify-center text-[#ffe600]">
                                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-[#ffe600]">{overview?.totalExams || 0}</p>
                            <span className="text-xs text-neutral-400 mt-1 block">Competitive tests</span>
                        </div>

                        <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-emerald-500 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Submissions</span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-emerald-400">{overview?.totalAttempts || 0}</p>
                            <span className="text-xs text-neutral-400 mt-1 block">Completed exams</span>
                        </div>

                        <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-amber-400 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Platform Mean</span>
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                    <TrendingUp className="w-4 h-4" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-amber-300">
                                {overview?.averageScore || 0}%
                            </p>
                            <span className="text-xs text-neutral-400 mt-1 block">Candidate average</span>
                        </div>
                    </div>

                    {/* Quick Management Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Link
                            to="/admin/questions"
                            className="p-6 bg-neutral-900/90 border-2 border-neutral-800 hover:border-[#ffe600] rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-[#ffe600]/10 flex items-center justify-center text-[#ffe600] mb-4 border border-[#ffe600]/20">
                                    <HelpCircle className="w-7 h-7" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Question Bank Management</h2>
                                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                                    Add, edit, and organize competitive exam questions with 4 options, correct answer keys, marks, negative marking, and accessible audio descriptions.
                                </p>
                            </div>
                            <span className="text-sm font-bold text-[#ffe600] inline-flex items-center gap-1.5">
                                <span>Manage Question Bank</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </span>
                        </Link>

                        <Link
                            to="/admin/exams"
                            className="p-6 bg-neutral-900/90 border-2 border-neutral-800 hover:border-cyan-400 rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20">
                                    <BookOpen className="w-7 h-7" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Examination Builder</h2>
                                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                                    Configure new timed examinations, set durations, select questions from the bank, toggle negative marking, and publish them to candidate portals.
                                </p>
                            </div>
                            <span className="text-sm font-bold text-cyan-400 inline-flex items-center gap-1.5">
                                <span>Create & Publish Exams</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </span>
                        </Link>

                        <Link
                            to="/admin/attempts"
                            className="p-6 bg-neutral-900/90 border-2 border-neutral-800 hover:border-emerald-500 rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                                    <Activity className="w-7 h-7" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Candidate Attempts Monitor</h2>
                                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                                    Inspect candidate exam attempts in real time, audit submission scores, and analyze pass/fail outcomes across subjects.
                                </p>
                            </div>
                            <span className="text-sm font-bold text-emerald-400 inline-flex items-center gap-1.5">
                                <span>Monitor Candidate Attempts</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </span>
                        </Link>
                    </div>

                    {/* Recent Candidate Submissions Log */}
                    <section aria-labelledby="recent-attempts-title" className="bg-neutral-900/90 border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 id="recent-attempts-title" className="text-xl font-bold text-white">
                                    Recent Candidate Submissions
                                </h2>
                                <p className="text-xs text-neutral-400 mt-0.5">Live assessment log across all competitive tests</p>
                            </div>
                            <Link
                                to="/admin/attempts"
                                className="text-xs font-bold text-[#ffe600] hover:underline inline-flex items-center gap-1"
                            >
                                <span>View All Records</span>
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </Link>
                        </div>

                        {overview?.recentAttempts && overview.recentAttempts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-xs">
                                            <th className="py-3 px-4 font-bold">Candidate</th>
                                            <th className="py-3 px-4 font-bold">Roll Number</th>
                                            <th className="py-3 px-4 font-bold">Examination</th>
                                            <th className="py-3 px-4 font-bold text-center">Score</th>
                                            <th className="py-3 px-4 font-bold text-center">Percentage</th>
                                            <th className="py-3 px-4 font-bold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800">
                                        {overview.recentAttempts.map((att, i) => (
                                            <tr key={i} className="hover:bg-neutral-850/80 transition-colors">
                                                <td className="py-3.5 px-4 font-bold text-white">{att.candidateName}</td>
                                                <td className="py-3.5 px-4 font-mono text-[#ffe600] font-bold">{att.candidateRoll}</td>
                                                <td className="py-3.5 px-4 text-neutral-300">{att.examTitle}</td>
                                                <td className="py-3.5 px-4 text-center font-bold text-white">
                                                    {att.obtainedMarks} / {att.totalMarks}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="font-mono font-bold text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500">
                                                        {att.percentage}%
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <Link
                                                        to={`/results/${att.id}`}
                                                        className="text-xs font-bold text-[#ffe600] hover:underline"
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
                            <p className="text-neutral-400 text-sm">No recent submissions recorded yet.</p>
                        )}
                    </section>
                </>
            )}
            </div>
        </AdminLayout>
    );
}
