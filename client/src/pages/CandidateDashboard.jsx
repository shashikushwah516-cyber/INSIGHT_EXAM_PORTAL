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
    Sparkles,
    Target,
    Sliders,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function CandidateDashboard() {
    const { user } = useAuth();
    const { speak } = useSpeech();
    const { announce, preferences } = useAccessibility();
    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [recentResults, setRecentResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'practice' | 'results' | 'accessibility'

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [examsRes, analyticsRes, resultsRes] = await Promise.allSettled([
                    examService.getExams(),
                    resultService.getCandidateAnalytics(),
                    resultService.getCandidateResults()
                ]);

                if (examsRes.status === 'fulfilled' && examsRes.value.success) {
                    setExams(examsRes.value.exams || []);
                }
                if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
                    setAnalytics(analyticsRes.value.analytics);
                }
                if (resultsRes.status === 'fulfilled' && resultsRes.value.success) {
                    setRecentResults(resultsRes.value.results || []);
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

    const subjects = [
        { name: 'Quantitative Aptitude', code: 'QA', desc: 'Arithmetic, Percentages, and Numerical Reasoning', count: '100+ Questions' },
        { name: 'Logical Reasoning', code: 'LR', desc: 'Deductive Logic, Patterns, and Verbal Reasoning', count: '80+ Questions' },
        { name: 'English Comprehension', code: 'EN', desc: 'Grammar, Passages, and Vocabulary', count: '120+ Questions' },
        { name: 'General Awareness', code: 'GA', desc: 'Current Affairs, Constitution, and Economy', count: '90+ Questions' }
    ];

    return (
        <DashboardLayout
            pageTitle="Candidate Dashboard"
            pageDescription="Your central workspace for timed examinations, self-reading practice, and performance analytics."
        >
            <div className="space-y-8">
                {/* 1. TOP WELCOME & STATS BANNER */}
                <div className="panel-card bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border-neutral-800 relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[11px] font-mono font-bold bg-[#ffe600] text-black px-2.5 py-0.5 rounded-full">
                                    CANDIDATE SESSION
                                </span>
                                <span className="text-[11px] font-mono bg-neutral-800 text-[#ffe600] px-2.5 py-0.5 rounded-full border border-neutral-700">
                                    ROLL: {user?.rollNumber || 'CANDIDATE'}
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">
                                Welcome, <span className="text-[#ffe600]">{user?.name || 'Candidate'}</span>!
                            </h2>
                            <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                                Universal accessibility mode is active. All examinations support full keyboard navigation, self-reading voice TTS, and high-contrast color themes.
                            </p>
                        </div>

                        {/* Quick Jump Buttons */}
                        <div className="flex flex-wrap gap-2.5 shrink-0">
                            <Link
                                to="/exams"
                                className="btn-primary h-11 text-xs sm:text-sm"
                            >
                                <PlayCircle className="w-4 h-4" aria-hidden="true" />
                                <span>Exam Window</span>
                            </Link>

                            <Link
                                to="/practice"
                                className="btn-secondary h-11 text-xs sm:text-sm"
                            >
                                <Target className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                <span>Practice Hub</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. KPI METRICS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="panel-card bg-neutral-900/80 border-neutral-800 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Available Exams</span>
                            <PlayCircle className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white">{exams.length}</p>
                        <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Live & Timed</span>
                    </div>

                    <div className="panel-card bg-neutral-900/80 border-neutral-800 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Questions Practiced</span>
                            <Target className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white">{analytics?.totalPracticed || 0}</p>
                        <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">With Audio Solutions</span>
                    </div>

                    <div className="panel-card bg-neutral-900/80 border-neutral-800 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Overall Accuracy</span>
                            <TrendingUp className="w-4 h-4 text-purple-400" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white">{analytics?.accuracy || 0}%</p>
                        <span className="text-[11px] text-purple-400 font-semibold mt-1 block">Performance Score</span>
                    </div>

                    <div className="panel-card bg-neutral-900/80 border-neutral-800 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Exams Submitted</span>
                            <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white">{recentResults.length}</p>
                        <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Verified Scores</span>
                    </div>
                </div>

                {/* 3. STRUCTURED TABS NAVIGATION */}
                <div>
                    <div className="border-b border-neutral-800 flex gap-2 sm:gap-4 overflow-x-auto pb-px" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'exams'}
                            onClick={() => {
                                setActiveTab('exams');
                                speak(`Showing ${exams.length} available competitive examinations.`);
                            }}
                            className={`
                                h-11 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap
                                ${activeTab === 'exams'
                                    ? 'border-[#ffe600] text-[#ffe600]'
                                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
                                }
                            `}
                        >
                            <PlayCircle className="w-4 h-4" />
                            <span>Available Examinations ({exams.length})</span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'practice'}
                            onClick={() => {
                                setActiveTab('practice');
                                speak('Showing subject practice preparation modules.');
                            }}
                            className={`
                                h-11 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap
                                ${activeTab === 'practice'
                                    ? 'border-[#ffe600] text-[#ffe600]'
                                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
                                }
                            `}
                        >
                            <Target className="w-4 h-4" />
                            <span>Subject Practice Modules</span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'results'}
                            onClick={() => {
                                setActiveTab('results');
                                speak(`Showing your ${recentResults.length} recent exam scorecards.`);
                            }}
                            className={`
                                h-11 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap
                                ${activeTab === 'results'
                                    ? 'border-[#ffe600] text-[#ffe600]'
                                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
                                }
                            `}
                        >
                            <Award className="w-4 h-4" />
                            <span>Recent Results & Scorecards ({recentResults.length})</span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'accessibility'}
                            onClick={() => {
                                setActiveTab('accessibility');
                                speak('Showing accessibility and audio speech controls.');
                            }}
                            className={`
                                h-11 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap
                                ${activeTab === 'accessibility'
                                    ? 'border-[#ffe600] text-[#ffe600]'
                                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
                                }
                            `}
                        >
                            <Sliders className="w-4 h-4" />
                            <span>Accessibility & Speech Tools</span>
                        </button>
                    </div>

                    {/* TAB CONTENT PANELS */}
                    <div className="pt-6">
                        {/* TAB 1: AVAILABLE EXAMS */}
                        {activeTab === 'exams' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">Live Competitive Examinations</h3>
                                    <span className="text-xs text-neutral-400">All tests feature server auto-save</span>
                                </div>

                                {exams.length === 0 ? (
                                    <div className="panel-card bg-neutral-900 border-neutral-800 text-center py-12">
                                        <Clock className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                                        <p className="text-white font-bold">No active examinations currently scheduled.</p>
                                        <p className="text-xs text-neutral-400 mt-1">Check back later or prepare with Practice Modules.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {exams.map((exam) => (
                                            <div
                                                key={exam._id}
                                                className="panel-card panel-card-hover bg-neutral-900 border-neutral-800 flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-3">
                                                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-[#ffe600] border border-neutral-700 font-bold">
                                                            {exam.subject || 'All Subjects'}
                                                        </span>
                                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                                            {exam.durationMinutes} Minutes
                                                        </span>
                                                    </div>

                                                    <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                                                        {exam.title}
                                                    </h4>

                                                    <p className="text-xs text-neutral-300 line-clamp-2 mb-4 leading-relaxed">
                                                        {exam.description || 'Full competitive examination with timed sections and audio question explanations.'}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4 pb-4 border-b border-neutral-800">
                                                        <span>Questions: <strong className="text-white">{exam.totalQuestions}</strong></span>
                                                        <span>Marks: <strong className="text-white">{exam.totalMarks}</strong></span>
                                                        <span>Negative: <strong className="text-white">{exam.negativeMarking ? 'Yes (-0.25)' : 'No'}</strong></span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/exams/${exam._id}/instructions`}
                                                        className="btn-primary flex-1 h-10 text-xs"
                                                    >
                                                        <PlayCircle className="w-4 h-4" aria-hidden="true" />
                                                        <span>Start Timed Exam</span>
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            speak(
                                                                `${exam.title}. Duration ${exam.durationMinutes} minutes. Total questions: ${exam.totalQuestions}. Negative marking: ${exam.negativeMarking ? 'Yes' : 'No'}.`
                                                            )
                                                        }
                                                        className="h-10 px-3 rounded-xl bg-neutral-800 text-neutral-300 hover:text-[#ffe600] border border-neutral-700 transition"
                                                        aria-label={`Listen to details for ${exam.title}`}
                                                    >
                                                        <Volume2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: SUBJECT PRACTICE */}
                        {activeTab === 'practice' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">Subject Preparation Modules</h3>
                                    <Link to="/practice" className="text-xs text-[#ffe600] hover:underline font-bold">
                                        Open Full Practice Arena →
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {subjects.map((sub, idx) => (
                                        <div key={idx} className="panel-card bg-neutral-900 border-neutral-800 flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                                                    {sub.code} • {sub.count}
                                                </span>
                                                <h4 className="text-base font-bold text-white mb-1">{sub.name}</h4>
                                                <p className="text-xs text-neutral-400 mb-4">{sub.desc}</p>
                                            </div>
                                            <Link
                                                to="/practice"
                                                className="btn-secondary w-full h-9 text-xs"
                                            >
                                                <span>Practice Now</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: RECENT RESULTS */}
                        {activeTab === 'results' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">Recent Exam Attempts & Scores</h3>
                                    <Link to="/results" className="text-xs text-[#ffe600] hover:underline font-bold">
                                        View Complete History →
                                    </Link>
                                </div>

                                {recentResults.length === 0 ? (
                                    <div className="panel-card bg-neutral-900 border-neutral-800 text-center py-10">
                                        <Award className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                                        <p className="text-white font-bold">No exam attempts recorded yet.</p>
                                        <p className="text-xs text-neutral-400 mt-1">Take an examination from the Available Exams tab.</p>
                                    </div>
                                ) : (
                                    <div className="panel-card bg-neutral-900 border-neutral-800 p-0 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs sm:text-sm">
                                                <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                                                    <tr>
                                                        <th className="p-3.5">Examination</th>
                                                        <th className="p-3.5">Score</th>
                                                        <th className="p-3.5">Accuracy</th>
                                                        <th className="p-3.5">Date</th>
                                                        <th className="p-3.5 text-right">Review</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-800 text-white font-medium">
                                                    {recentResults.slice(0, 5).map((res) => (
                                                        <tr key={res._id} className="hover:bg-neutral-850/60 transition">
                                                            <td className="p-3.5 font-bold">
                                                                {res.exam?.title || 'Competitive Examination'}
                                                            </td>
                                                            <td className="p-3.5 text-[#ffe600] font-mono font-bold">
                                                                {res.score} / {res.exam?.totalMarks || 100}
                                                            </td>
                                                            <td className="p-3.5 font-mono">
                                                                {res.accuracy ? `${res.accuracy}%` : 'N/A'}
                                                            </td>
                                                            <td className="p-3.5 text-neutral-400 font-mono text-xs">
                                                                {new Date(res.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-3.5 text-right">
                                                                <Link
                                                                    to={`/results/${res._id}`}
                                                                    className="text-xs text-cyan-400 hover:underline font-bold"
                                                                >
                                                                    Solutions & Audio →
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: ACCESSIBILITY & AUDIO TOOLS */}
                        {activeTab === 'accessibility' && (
                            <div className="space-y-4">
                                <div className="panel-card bg-neutral-900 border-neutral-800">
                                    <h3 className="text-base font-bold text-white mb-2">Accessibility Quick Configuration</h3>
                                    <p className="text-xs text-neutral-300 mb-6">
                                        Customize your visual contrast, audio speech synthesizer rate, and keyboard settings.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                            <span className="text-xs font-bold text-[#ffe600] uppercase tracking-wider block mb-2">
                                                Self-Reading Audio Test
                                            </span>
                                            <p className="text-xs text-neutral-300 mb-4">
                                                Test the speech synthesizer with your current voice rate ({preferences.speechRate}x) and language ({preferences.language}).
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => speak('This is a test of the self-reading audio speech engine in Insight Exam Portal.')}
                                                className="btn-outline h-10 text-xs w-full"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                                <span>Play Test Audio Sample</span>
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                                                Complete Preferences Manager
                                            </span>
                                            <p className="text-xs text-neutral-300 mb-4">
                                                Adjust font size scaling, speech pitch, high-contrast themes, and voice command parameters.
                                            </p>
                                            <Link
                                                to="/accessibility"
                                                className="btn-secondary h-10 text-xs w-full"
                                            >
                                                <Sliders className="w-4 h-4" />
                                                <span>Open Accessibility Studio</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
