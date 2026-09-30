import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import examService from '../services/examService';
import resultService from '../services/resultService';
import practiceService from '../services/practiceService';
import {
    BookOpen,
    PlayCircle,
    CheckCircle2,
    BarChart3,
    Award,
    Clock,
    ArrowRight,
    Volume2,
    VolumeX,
    AlertCircle,
    Zap,
    Target,
    Sliders,
    ChevronRight,
    TrendingUp,
    RefreshCw,
    Search,
    Calendar,
    Flame,
    Check
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function CandidateDashboard() {
    const { user } = useAuth();
    const { speak, cancel, speaking } = useSpeech();
    const { announce, preferences } = useAccessibility();
    const navigate = useNavigate();

    // Live API states
    const [exams, setExams] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [recentResults, setRecentResults] = useState([]);
    const [practiceHistory, setPracticeHistory] = useState([]);
    const [practiceStats, setPracticeStats] = useState({
        totalPracticed: 0,
        totalCorrect: 0,
        overallAccuracy: 0
    });
    const [activeAttempt, setActiveAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'practice' | 'results' | 'analytics' | 'accessibility'
    const [examSearch, setExamSearch] = useState('');

    const initialGreetedRef = useRef(false);

    // Fetch all real-time dashboard data in parallel
    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            if (apiClient.clearCache) apiClient.clearCache();
            setRefreshing(true);
        }
        try {
            const [examsRes, analyticsRes, resultsRes, practiceRes, activeSessionRes] = await Promise.allSettled([
                examService.getExams(),
                resultService.getCandidateAnalytics(),
                resultService.getCandidateResults(),
                practiceService.getHistory(),
                examService.getActiveSession()
            ]);

            let loadedExamsCount = 0;
            let loadedPracticedCount = 0;

            if (examsRes.status === 'fulfilled' && examsRes.value.success) {
                const examList = examsRes.value.exams || [];
                setExams(examList);
                loadedExamsCount = examList.length;
            }

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
                setAnalytics(analyticsRes.value.analytics);
                if (analyticsRes.value.analytics?.totalPracticed) {
                    loadedPracticedCount = analyticsRes.value.analytics.totalPracticed;
                }
            }

            if (resultsRes.status === 'fulfilled' && resultsRes.value.success) {
                setRecentResults(resultsRes.value.results || []);
            }

            if (practiceRes.status === 'fulfilled' && practiceRes.value.success) {
                setPracticeHistory(practiceRes.value.history || []);
                const stats = {
                    totalPracticed: practiceRes.value.totalPracticed ?? practiceRes.value.stats?.totalPracticed ?? 0,
                    totalCorrect: practiceRes.value.totalCorrect ?? practiceRes.value.stats?.totalCorrect ?? 0,
                    overallAccuracy: practiceRes.value.overallAccuracy ?? practiceRes.value.stats?.overallAccuracy ?? 0
                };
                setPracticeStats(stats);
                if (stats.totalPracticed > 0) {
                    loadedPracticedCount = stats.totalPracticed;
                }
            }

            if (activeSessionRes.status === 'fulfilled' && activeSessionRes.value.success) {
                setActiveAttempt(activeSessionRes.value.activeAttempt || null);
            }

            if (isRefresh) {
                const refreshMsg = `Dashboard refreshed with latest examination and practice metrics.`;
                speak(refreshMsg);
                announce(refreshMsg, 'polite');
            } else if (!initialGreetedRef.current) {
                initialGreetedRef.current = true;
                const greeting = `Candidate Dashboard loaded for ${user?.name || user?.rollNumber || 'Candidate'}. You have ${loadedExamsCount} available examinations and ${loadedPracticedCount} practiced questions ready.`;
                speak(greeting);
                announce(greeting, 'polite');
            }
        } catch (e) {
            console.error('Error fetching dashboard data:', e);
            announce('Failed to refresh some dashboard data. Retrying...', 'polite');
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    }, [user?.name, user?.rollNumber]);

    useEffect(() => {
        fetchDashboardData(false);
    }, []);

    const readSummaryAloud = () => {
        const accuracyVal = analytics?.accuracy || practiceStats.overallAccuracy || 0;
        const text = `Dashboard summary for ${user?.name || user?.rollNumber}. You have ${exams.length} active examinations scheduled, ${practiceStats.totalPracticed || analytics?.totalPracticed || 0} practice questions attempted, overall accuracy of ${accuracyVal} percent, and ${recentResults.length} scored examinations.`;
        speak(text, { force: true });
    };

    const subjects = [
        { name: 'Quantitative Aptitude', code: 'QA', desc: 'Arithmetic, Percentages, and Numerical Reasoning', count: '100+ Questions', query: 'Quantitative Aptitude' },
        { name: 'Logical Reasoning', code: 'LR', desc: 'Deductive Logic, Patterns, and Verbal Reasoning', count: '80+ Questions', query: 'Reasoning' },
        { name: 'English Comprehension', code: 'EN', desc: 'Grammar, Passages, and Vocabulary', count: '120+ Questions', query: 'English' },
        { name: 'General Awareness', code: 'GA', desc: 'Current Affairs, Constitution, and Economy', count: '90+ Questions', query: 'General Awareness' }
    ];

    const filteredExams = exams.filter((exam) => {
        if (!examSearch.trim()) return true;
        const q = examSearch.toLowerCase();
        return (
            exam.title?.toLowerCase().includes(q) ||
            exam.subject?.toLowerCase().includes(q) ||
            exam.description?.toLowerCase().includes(q)
        );
    });

    return (
        <DashboardLayout
            pageTitle="Candidate Dashboard"
            pageDescription="Your central workspace for timed examinations, self-reading practice, and performance analytics."
        >
            <div className="space-y-8">
                {/* 1. TOP WELCOME & REAL-TIME CONTROLS BANNER */}
                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] relative overflow-hidden shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-[11px] font-mono font-bold bg-[var(--accent-color)] text-[var(--accent-text)] px-2.5 py-0.5 rounded-full shadow-xs">
                                    CANDIDATE SESSION
                                </span>
                                <span className="text-[11px] font-mono bg-[var(--bg-subtle)] text-[var(--text-primary)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)] shadow-xs">
                                    ROLL: {user?.rollNumber || 'CANDIDATE'}
                                </span>
                                <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-xs font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    REAL-TIME API CONNECTED
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                                Welcome, <span className="text-[var(--accent-color)]">{user?.name || 'Candidate'}</span>!
                            </h1>
                            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                                Universal accessibility mode is active. All examinations support full keyboard navigation, self-reading voice narration, and high-contrast color themes.
                            </p>
                        </div>

                        {/* Top Real-time Actions */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => fetchDashboardData(true)}
                                disabled={refreshing}
                                className="btn-secondary h-11 text-xs sm:text-sm px-3.5"
                                aria-label="Refresh real-time dashboard data"
                                title="Sync with live database"
                            >
                                <RefreshCw className={`w-4 h-4 text-[var(--accent-color)] ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                <span>{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={readSummaryAloud}
                                className={`h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition shadow-xs ${
                                    speaking
                                        ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--border-accent)]'
                                }`}
                                aria-label={speaking ? 'Stop audio' : 'Listen to dashboard summary'}
                                title="Hear full statistics summary aloud"
                            >
                                {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[var(--accent-color)]" />}
                                <span>{speaking ? 'Stop Audio' : 'Read Summary'}</span>
                            </button>

                            <Link
                                to="/exams"
                                className="btn-primary h-11 text-xs sm:text-sm shadow-xs"
                            >
                                <PlayCircle className="w-4 h-4" aria-hidden="true" />
                                <span>Start Exam</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. ONGOING IN-PROGRESS EXAM ALERT (IF APPLICABLE) */}
                {activeAttempt && (
                    <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                                <Clock className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-white shadow-2xs">
                                        Active Exam In Progress
                                    </span>
                                    <span className="text-xs text-amber-900 font-mono font-bold">
                                        {Math.floor(activeAttempt.remainingSeconds / 60)} Min Remaining
                                    </span>
                                </div>
                                <h2 className="text-lg font-black text-slate-900 leading-tight">
                                    {activeAttempt.examTitle}
                                </h2>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Server auto-save is synchronized ({activeAttempt.answersCount} answers recorded). You can resume right where you left off.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Link
                                to={`/exams/${activeAttempt.examId}/take`}
                                className="btn-primary bg-amber-600 hover:bg-amber-700 text-white border-amber-600 h-10 text-xs sm:text-sm font-bold shadow-sm"
                            >
                                <PlayCircle className="w-4 h-4" />
                                <span>Resume Examination →</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() =>
                                    speak(
                                        `Ongoing examination: ${activeAttempt.examTitle}. ${Math.floor(
                                            activeAttempt.remainingSeconds / 60
                                        )} minutes remaining. ${activeAttempt.answersCount} answers saved. Click Resume Examination to continue.`
                                    )
                                }
                                className="btn-secondary h-10 px-3 bg-white"
                                aria-label="Listen to ongoing exam status"
                            >
                                <Volume2 className="w-4 h-4 text-amber-700" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. REAL-TIME KPI METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Available Exams</span>
                            <PlayCircle className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{exams.length}</p>
                        <span className="text-[11px] text-[var(--success)] font-semibold mt-1 block">Live & Scheduled</span>
                    </div>

                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Questions Practiced</span>
                            <Target className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                            {practiceStats.totalPracticed || analytics?.totalPracticed || 0}
                        </p>
                        <span className="text-[11px] text-[var(--primary)] font-semibold mt-1 block">Interactive Narration</span>
                    </div>

                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Overall Accuracy</span>
                            <TrendingUp className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                            {analytics?.accuracy || practiceStats.overallAccuracy || 0}%
                        </p>
                        <span className="text-[11px] text-[var(--primary)] font-semibold mt-1 block">Preparation Score</span>
                    </div>

                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Exams Submitted</span>
                            <Award className="w-4 h-4 text-[var(--success)]" aria-hidden="true" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{recentResults.length}</p>
                        <span className="text-[11px] text-[var(--success)] font-semibold mt-1 block">Official Scorecards</span>
                    </div>
                </div>

                {/* 4. STRUCTURED TABS NAVIGATION */}
                <div>
                    <div
                        className="border-b border-[var(--border-color)] flex gap-1 sm:gap-2 overflow-x-auto pb-1"
                        role="tablist"
                        tabIndex={0}
                        aria-label="Dashboard sections"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'exams'}
                            onClick={() => {
                                setActiveTab('exams');
                                speak(`Showing ${exams.length} available competitive examinations.`);
                            }}
                            className={`
                                min-h-[2.75rem] py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-lg
                                ${activeTab === 'exams'
                                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-subtle)]'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
                                }
                            `}
                        >
                            <PlayCircle className="w-4 h-4 shrink-0" />
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
                                min-h-[2.75rem] py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-lg
                                ${activeTab === 'practice'
                                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-subtle)]'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
                                }
                            `}
                        >
                            <Target className="w-4 h-4 shrink-0" />
                            <span>Subject Practice</span>
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
                                min-h-[2.75rem] py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-lg
                                ${activeTab === 'results'
                                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-subtle)]'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
                                }
                            `}
                        >
                            <Award className="w-4 h-4 shrink-0" />
                            <span>Recent Results ({recentResults.length})</span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'analytics'}
                            onClick={() => {
                                setActiveTab('analytics');
                                speak('Showing preparation analytics and performance breakdown.');
                            }}
                            className={`
                                min-h-[2.75rem] py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-lg
                                ${activeTab === 'analytics'
                                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-subtle)]'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
                                }
                            `}
                        >
                            <BarChart3 className="w-4 h-4 shrink-0" />
                            <span>Insights & Accuracy</span>
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
                                min-h-[2.75rem] py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-lg
                                ${activeTab === 'accessibility'
                                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-subtle)]'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
                                }
                            `}
                        >
                            <Sliders className="w-4 h-4 shrink-0" />
                            <span>Accessibility Tools</span>
                        </button>
                    </div>

                    {/* TAB CONTENT PANELS */}
                    <div className="pt-6">
                        {/* TAB 1: AVAILABLE EXAMINATIONS */}
                        {activeTab === 'exams' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Live Competitive Examinations</h2>
                                        <p className="text-xs text-[var(--text-muted)]">Official timed test sessions with live answer autosave</p>
                                    </div>

                                    {/* Search Filter */}
                                    <div className="relative w-full sm:w-64">
                                        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={examSearch}
                                            onChange={(e) => setExamSearch(e.target.value)}
                                            placeholder="Search examinations..."
                                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                                        />
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-12 text-[var(--text-muted)]">
                                        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <p className="text-[var(--text-primary)] font-bold">Synchronizing examinations from server...</p>
                                    </div>
                                ) : filteredExams.length === 0 ? (
                                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-12">
                                        <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                                        <p className="text-[var(--text-primary)] font-bold">No matching examinations found.</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">Check back later or prepare with Subject Practice Modules.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredExams.map((exam) => (
                                            <div
                                                key={exam._id}
                                                className="panel-card panel-card-hover bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-3">
                                                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border-color)] font-bold">
                                                            {exam.subject || 'Comprehensive'}
                                                        </span>
                                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-bold">
                                                            {exam.durationMinutes} Minutes
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 leading-tight">
                                                        {exam.title}
                                                    </h3>

                                                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                                                        {exam.description || 'Full competitive examination with timed sections and audio question explanations.'}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4 pb-4 border-b border-[var(--border-color)]">
                                                        <span>Questions: <strong className="text-[var(--text-primary)]">{exam.totalQuestions}</strong></span>
                                                        <span>Marks: <strong className="text-[var(--text-primary)]">{exam.totalMarks}</strong></span>
                                                        <span>Negative: <strong className="text-[var(--text-primary)]">{exam.negativeMarking ? 'Yes (-0.25)' : 'No'}</strong></span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/exams/${exam._id}/instructions`}
                                                        className="btn-primary flex-1 min-h-[2.5rem] py-2 px-3 text-xs"
                                                    >
                                                        <PlayCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                                        <span>Start Timed Exam</span>
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            speak(
                                                                `${exam.title}. Duration ${exam.durationMinutes} minutes. Total questions: ${exam.totalQuestions}. Total marks: ${exam.totalMarks}. Negative marking: ${exam.negativeMarking ? 'Yes' : 'No'}.`
                                                            )
                                                        }
                                                        className="min-h-[2.5rem] px-3.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-[var(--primary)] border border-[var(--border-color)] transition flex items-center justify-center shrink-0"
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

                        {/* TAB 2: SUBJECT PRACTICE MODULES */}
                        {activeTab === 'practice' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Interactive Subject Practice</h2>
                                        <p className="text-xs text-[var(--text-muted)]">Instant answers, spoken explanations, and recorded mastery</p>
                                    </div>
                                    <Link to="/practice" className="btn-primary text-xs h-9">
                                        <span>Open Full Practice Arena →</span>
                                    </Link>
                                </div>

                                {/* Real-time Practice KPI Banner */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                                        <span className="text-xs text-[var(--text-muted)] font-semibold block">Total Practiced</span>
                                        <span className="text-2xl font-black text-[var(--primary)]">{practiceStats.totalPracticed} Questions</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                                        <span className="text-xs text-[var(--text-muted)] font-semibold block">Correct Answers</span>
                                        <span className="text-2xl font-black text-[var(--success)]">{practiceStats.totalCorrect}</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                                        <span className="text-xs text-[var(--text-muted)] font-semibold block">Practice Accuracy</span>
                                        <span className="text-2xl font-black text-[var(--primary)]">{practiceStats.overallAccuracy}%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {subjects.map((sub, idx) => (
                                        <div key={idx} className="panel-card panel-card-hover bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-mono text-[var(--primary)] font-bold block mb-1">
                                                    {sub.code} • {sub.count}
                                                </span>
                                                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{sub.name}</h3>
                                                <p className="text-xs text-[var(--text-secondary)] mb-4">{sub.desc}</p>
                                            </div>
                                            <Link
                                                to="/practice"
                                                className="btn-secondary w-full min-h-[2.5rem] py-2 px-3 text-xs"
                                            >
                                                <span>Practice Now</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Practice Attempts Table */}
                                {practiceHistory.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Recent Practice Sets</h3>
                                        <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-0 overflow-hidden shadow-xs">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)] uppercase text-[10px] font-bold border-b border-[var(--border-color)]">
                                                    <tr>
                                                        <th className="p-3">Subject</th>
                                                        <th className="p-3">Attempted</th>
                                                        <th className="p-3">Score</th>
                                                        <th className="p-3">Accuracy</th>
                                                        <th className="p-3">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                                    {practiceHistory.slice(0, 5).map((ph, i) => (
                                                        <tr key={ph._id || i} className="hover:bg-[var(--bg-tertiary)] transition">
                                                            <td className="p-3 font-bold text-[var(--text-primary)]">{ph.subject || 'General'}</td>
                                                            <td className="p-3">{ph.attempted} / {ph.totalQuestions}</td>
                                                            <td className="p-3 font-mono font-bold text-[var(--primary)]">{ph.correct}</td>
                                                            <td className="p-3 font-mono font-bold text-[var(--success)]">{ph.accuracy}%</td>
                                                            <td className="p-3 text-[var(--text-muted)] font-mono">{new Date(ph.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: RECENT RESULTS & OFFICIAL SCORECARDS */}
                        {activeTab === 'results' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Exam Attempts & Scores</h2>
                                        <p className="text-xs text-[var(--text-muted)]">Official verified results with question-by-question audio explanations</p>
                                    </div>
                                    <Link to="/results" className="text-xs text-[var(--primary)] hover:underline font-bold">
                                        View Complete History →
                                    </Link>
                                </div>

                                {recentResults.length === 0 ? (
                                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-10">
                                        <Award className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                                        <p className="text-[var(--text-primary)] font-bold">No exam attempts recorded yet.</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">Take an examination from the Available Examinations tab to view your score.</p>
                                    </div>
                                ) : (
                                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-0 overflow-hidden shadow-xs">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs sm:text-sm">
                                                <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)]">
                                                    <tr>
                                                        <th className="p-3.5 font-bold">Status</th>
                                                        <th className="p-3.5 font-bold">Examination</th>
                                                        <th className="p-3.5 font-bold">Score</th>
                                                        <th className="p-3.5 font-bold">Percentage</th>
                                                        <th className="p-3.5 font-bold">Date</th>
                                                        <th className="p-3.5 font-bold text-right">Review & Audio</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                                    {recentResults.slice(0, 10).map((res) => {
                                                        const sc = res.score || {};
                                                        const obtained = typeof sc.obtainedMarks === 'number' ? sc.obtainedMarks : (typeof res.score === 'number' ? res.score : 0);
                                                        const total = typeof sc.totalMarks === 'number' ? sc.totalMarks : 100;
                                                        const percentage = typeof sc.percentage === 'number' ? sc.percentage : (res.accuracy || 0);
                                                        const isPassed = sc.passed || percentage >= 40;
                                                        const examTitle = res.examTitle || res.exam?.title || 'Competitive Mock Examination';
                                                        const attemptId = res.id || res.attemptId || res._id;
                                                        const dateStr = res.submittedAt || res.createdAt ? new Date(res.submittedAt || res.createdAt).toLocaleDateString() : 'Recent';

                                                        return (
                                                            <tr key={attemptId} className="hover:bg-[var(--bg-tertiary)] transition">
                                                                <td className="p-3.5">
                                                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                                                                        isPassed
                                                                            ? 'bg-[var(--bg-tertiary)] text-[var(--success)] border-[var(--border-color)]'
                                                                            : 'bg-[var(--bg-tertiary)] text-[var(--danger)] border-[var(--border-color)]'
                                                                    }`}>
                                                                        {isPassed ? 'Passed' : 'Needs Practice'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3.5 font-bold text-[var(--text-primary)]">
                                                                    {examTitle}
                                                                </td>
                                                                <td className="p-3.5 text-[var(--primary)] font-mono font-bold">
                                                                    {obtained} / {total}
                                                                </td>
                                                                <td className="p-3.5 font-mono text-[var(--text-primary)] font-bold">
                                                                    {percentage}%
                                                                </td>
                                                                <td className="p-3.5 text-[var(--text-muted)] font-mono text-xs">
                                                                    {dateStr}
                                                                </td>
                                                                <td className="p-3.5 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                speak(
                                                                                    `Result for ${examTitle}: Scored ${obtained} out of ${total} marks. Percentage: ${percentage} percent. Status: ${
                                                                                        isPassed ? 'Passed' : 'Needs Practice'
                                                                                    }.`
                                                                                )
                                                                            }
                                                                            className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] transition"
                                                                            aria-label={`Listen to result for ${examTitle}`}
                                                                        >
                                                                            <Volume2 className="w-4 h-4" />
                                                                        </button>
                                                                        <Link
                                                                            to={`/results/${attemptId}`}
                                                                            className="text-xs text-[var(--primary)] hover:underline font-bold"
                                                                        >
                                                                            Solutions & Audio →
                                                                        </Link>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: ACCURACY & INSIGHTS */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Preparation Analytics & Accuracy</h2>
                                        <p className="text-xs text-[var(--text-muted)]">AI-driven recommendations and subject-wise mastery tracking</p>
                                    </div>
                                    <Link to="/analytics" className="btn-secondary text-xs h-9">
                                        <span>Full Analytics Studio →</span>
                                    </Link>
                                </div>

                                {/* Dynamic AI Recommendations */}
                                {analytics?.recommendations && analytics.recommendations.length > 0 && (
                                    <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Flame className="w-5 h-5 text-[var(--primary)]" />
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Personalized Preparation Insights</h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => speak(`Preparation Insights: ${analytics.recommendations.join('. ')}`)}
                                                className="text-xs text-[var(--primary)] font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <Volume2 className="w-3.5 h-3.5" />
                                                <span>Hear Recommendations</span>
                                            </button>
                                        </div>
                                        <ul className="space-y-2">
                                            {analytics.recommendations.map((rec, i) => (
                                                <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Subject Accuracy Breakdown */}
                                {analytics?.subjectAccuracy && analytics.subjectAccuracy.length > 0 ? (
                                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Subject Accuracy Breakdown</h3>
                                        <div className="space-y-4">
                                            {analytics.subjectAccuracy.map((sa, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
                                                        <span>{sa.subject}</span>
                                                        <span className="font-mono text-[var(--primary)]">{sa.accuracy}% ({sa.correct}/{sa.totalQuestions})</span>
                                                    </div>
                                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                sa.accuracy >= 75
                                                                    ? 'bg-[var(--success)]'
                                                                    : sa.accuracy >= 50
                                                                    ? 'bg-[var(--primary)]'
                                                                    : 'bg-[var(--warning)]'
                                                            }`}
                                                            style={{ width: `${Math.min(100, Math.max(5, sa.accuracy))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-10">
                                        <BarChart3 className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                                        <p className="text-[var(--text-primary)] font-bold">No subject breakdown yet.</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">Complete examinations to generate subject-specific analytics.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 5: ACCESSIBILITY & AUDIO TOOLS */}
                        {activeTab === 'accessibility' && (
                            <div className="space-y-4">
                                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
                                    <h2 className="text-base font-bold text-[var(--text-primary)] mb-2">Accessibility Quick Configuration</h2>
                                    <p className="text-xs text-[var(--text-secondary)] mb-6">
                                        Customize your visual contrast, audio speech synthesizer rate, and keyboard settings.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                                            <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider block mb-2">
                                                Self-Reading Audio Test
                                            </span>
                                            <p className="text-xs text-[var(--text-secondary)] mb-4">
                                                Test the speech synthesizer with your current voice rate ({preferences.speechRate}x) and language ({preferences.language}).
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => speak('This is a test of the self-reading audio speech engine in Insight Exam Portal.', { force: true })}
                                                className="btn-secondary min-h-[2.5rem] py-2 px-3 text-xs w-full"
                                            >
                                                <Volume2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                                                <span>Play Test Audio Sample</span>
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                                            <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider block mb-2">
                                                Complete Preferences Manager
                                            </span>
                                            <p className="text-xs text-[var(--text-secondary)] mb-4">
                                                Adjust font size scaling, speech pitch, high-contrast themes, and voice command parameters.
                                            </p>
                                            <Link
                                                to="/accessibility"
                                                className="btn-secondary min-h-[2.5rem] py-2 px-3 text-xs w-full"
                                            >
                                                <Sliders className="w-4 h-4 text-[var(--primary)] shrink-0" />
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
