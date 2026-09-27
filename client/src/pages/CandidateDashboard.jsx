import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import examService from '../services/examService';
import resultService from '../services/resultService';
import {
    BookOpen,
    PlayCircle,
    CheckCircle2,
    BarChart3,
    Award,
    Clock,
    ArrowRight,
    Keyboard,
    Volume2,
    AlertCircle,
    Zap,
    FileCheck,
    Compass,
    Sparkles
} from 'lucide-react';

export default function CandidateDashboard() {
    const { user } = useAuth();
    const { speak } = useSpeech();
    const { announce } = useAccessibility();
    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [examsRes, analyticsRes] = await Promise.allSettled([
                    examService.getExams(),
                    resultService.getCandidateAnalytics()
                ]);

                if (examsRes.status === 'fulfilled' && examsRes.value.success) {
                    setExams(examsRes.value.exams || []);
                }
                if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
                    setAnalytics(analyticsRes.value.analytics);
                }
            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        const greeting = `Student Dashboard. Welcome ${user?.name || user?.rollNumber}. You have ${exams.length} examinations and practice modules ready.`;
        speak(greeting);
        announce(greeting, 'polite');
    }, [user, speak, announce]);

    const firstExam = exams[0] || null;

    return (
        <main id="main-content" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header Greeting Banner with Glassmorphism */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border-2 border-neutral-800 p-6 sm:p-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffe600]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono font-bold bg-[#ffe600] text-black px-3 py-1 rounded-full shadow-sm">
                                STUDENT PORTAL
                            </span>
                            <span className="text-xs font-mono bg-neutral-800 text-[#ffe600] px-3 py-1 rounded-full border border-neutral-700">
                                ROLL: {user?.rollNumber || 'CANDIDATE'}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                            Welcome back, <span className="text-[#ffe600]">{user?.name || 'Candidate'}</span>!
                        </h1>
                        <p className="text-neutral-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                            Your accessible competitive examination and preparation hub. All interfaces support keyboard-first navigation and self-reading audio speech.
                        </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() =>
                                speak(
                                    `Student Dashboard Summary. You have ${exams.length} competitive examinations available. Your current accuracy rate is ${analytics?.accuracy || 0} percent. Press Tab to move to the Exam Window or Subject Practice.`
                                )
                            }
                            className="inline-flex items-center gap-2 px-4 py-3 bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] rounded-xl hover:bg-neutral-700 font-bold text-sm transition-all shadow-md active:scale-95"
                            aria-label="Listen to Audio Summary of Dashboard"
                        >
                            <Volume2 className="w-5 h-5" aria-hidden="true" />
                            <span>Audio Summary</span>
                        </button>

                        <Link
                            to="/exams"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-[#ffe600] text-black font-extrabold rounded-xl hover:bg-yellow-400 text-sm transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
                        >
                            <PlayCircle className="w-5 h-5" aria-hidden="true" />
                            <span>Launch Exam Window</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-[#ffe600] p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Available Exams</span>
                        <div className="w-8 h-8 rounded-lg bg-[#ffe600]/10 flex items-center justify-center text-[#ffe600]">
                            <BookOpen className="w-4 h-4" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">{exams.length}</p>
                    <span className="text-xs text-neutral-400 mt-1 block">Live competitive mocks</span>
                </div>

                <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-emerald-500 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Completed Exams</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-emerald-400">{analytics?.totalExamsAttempted || 0}</p>
                    <span className="text-xs text-neutral-400 mt-1 block">Scored submissions</span>
                </div>

                <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-cyan-400 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Overall Accuracy</span>
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Award className="w-4 h-4" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-cyan-400">
                        {analytics?.accuracy !== undefined ? `${analytics.accuracy}%` : 'N/A'}
                    </p>
                    <span className="text-xs text-neutral-400 mt-1 block">Success rate</span>
                </div>

                <div className="bg-neutral-900/90 border-2 border-neutral-800 hover:border-purple-400 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Average Speed</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-purple-400">
                        {analytics?.averageTimePerQuestion ? `${analytics.averageTimePerQuestion}s` : 'N/A'}
                    </p>
                    <span className="text-xs text-neutral-400 mt-1 block">Time per question</span>
                </div>
            </div>

            {/* Featured Active Exam Window Card */}
            {firstExam && (
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border-2 border-[#ffe600]/80 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffe600]/10 text-[#ffe600] text-xs font-bold border border-[#ffe600]/30">
                                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Featured Competitive Examination</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">
                                {firstExam.title}
                            </h2>
                            <p className="text-neutral-300 text-sm max-w-2xl leading-relaxed">
                                {firstExam.description}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2 text-xs text-neutral-300 font-mono">
                                <span className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                                    <Clock className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                    {firstExam.durationMinutes} Minutes
                                </span>
                                <span className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                                    <BookOpen className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                    {firstExam.totalQuestions} Questions
                                </span>
                                <span className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                                    <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                                    {firstExam.totalMarks} Total Marks
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                            <Link
                                to={`/exams/${firstExam.id || firstExam._id}/instructions`}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#ffe600] text-black font-extrabold text-base rounded-2xl hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition-all shadow-xl shadow-yellow-500/10 active:scale-95"
                            >
                                <span>Enter Exam Window</span>
                                <ArrowRight className="w-5 h-5" aria-hidden="true" />
                            </Link>

                            <Link
                                to="/exams"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 text-neutral-200 hover:text-white font-bold text-sm rounded-xl border border-neutral-700 hover:border-neutral-500 transition"
                            >
                                <span>View All Examinations</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Core Action Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Exam Window Module */}
                <div className="bg-neutral-900 border-2 border-neutral-800 hover:border-[#ffe600] rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-[#ffe600]/10 flex items-center justify-center text-[#ffe600] mb-4 border border-[#ffe600]/20">
                            <PlayCircle className="w-7 h-7" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Timed Examination Window</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                            Take timed mock competitive examinations with real-time audio reading, keyboard shortcuts, autosaved answers, and server-side scoring.
                        </p>
                    </div>
                    <Link
                        to="/exams"
                        className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-neutral-800 hover:bg-[#ffe600] text-white hover:text-black font-bold text-sm rounded-xl border border-neutral-700 hover:border-[#ffe600] transition"
                    >
                        <span>Open Exam Window</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>

                {/* 2. Practice Portal Module */}
                <div className="bg-neutral-900 border-2 border-neutral-800 hover:border-cyan-400 rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20">
                            <Compass className="w-7 h-7" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Subject-Wise Practice</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                            Practice questions across Quantitative Aptitude, Reasoning, English, and General Awareness with instant audio feedback and solutions.
                        </p>
                    </div>
                    <Link
                        to="/practice"
                        className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-neutral-800 hover:bg-cyan-400 text-white hover:text-black font-bold text-sm rounded-xl border border-neutral-700 hover:border-cyan-400 transition"
                    >
                        <span>Practice Questions</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>

                {/* 3. Results & Solutions Module */}
                <div className="bg-neutral-900 border-2 border-neutral-800 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                            <Award className="w-7 h-7" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Results & Detailed Solutions</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                            Review your past examination scores, analyze incorrect answers, and hear spoken step-by-step explanations.
                        </p>
                    </div>
                    <Link
                        to="/results"
                        className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-neutral-800 hover:bg-emerald-500 text-white hover:text-black font-bold text-sm rounded-xl border border-neutral-700 hover:border-emerald-500 transition"
                    >
                        <span>View Past Results</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>

            {/* Preparation Recommendations Section */}
            <div className="bg-neutral-900/90 border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-white">Smart Preparation Recommendations</h2>
                    </div>
                    <Link
                        to="/analytics"
                        className="text-sm font-bold text-[#ffe600] hover:underline inline-flex items-center gap-1.5"
                    >
                        <span>View Full Performance Analytics</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>

                {analytics && analytics.recommendations && analytics.recommendations.length > 0 ? (
                    <div className="space-y-3 mt-4">
                        {analytics.recommendations.map((rec, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-sm text-neutral-200"
                            >
                                <CheckCircle2 className="w-5 h-5 text-[#ffe600] shrink-0 mt-0.5" aria-hidden="true" />
                                <span className="leading-relaxed">{rec}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-neutral-400 text-sm">
                        Complete your first examination or practice session to unlock personalized preparation tips.
                    </p>
                )}
            </div>
        </main>
    );
}
