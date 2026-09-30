import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import examService from '../services/examService';
import {
    BookOpen,
    Clock,
    Award,
    AlertCircle,
    ArrowRight,
    Volume2,
    FileCheck,
    PlayCircle,
    CheckCircle2,
    Shield,
    LogIn,
    UserCheck,
    Sparkles
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';

export default function AvailableExams() {
    const { isAuthenticated } = useAuth();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        let isMounted = true;
        const loadExams = async () => {
            try {
                const res = await examService.getExams();
                if (res.success && isMounted) {
                    setExams(res.exams || []);
                    const msg = `Found ${res.exams?.length || 0} competitive examinations available.`;
                    speak(msg);
                    announce(msg, 'polite');
                }
            } catch (err) {
                console.error('Error fetching exams:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadExams();
        return () => { isMounted = false; };
    }, []);

    const readExamDetails = (exam) => {
        const text = `${exam.title}. Subject: ${exam.subject || 'All Subjects'}. Duration: ${exam.durationMinutes} minutes. Total Questions: ${exam.totalQuestions}. Total Marks: ${exam.totalMarks}. Negative marking: ${exam.negativeMarking ? 'Yes, point two five marks per wrong answer' : 'No'}. Click or press Enter to read instructions.`;
        speak(text);
    };

    const mainContent = (
        <div className="space-y-6">
            {/* Unauthenticated Guest Banner */}
            {!isAuthenticated && (
                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">
                                Guest Evaluation Mode
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                You are exploring the live examination catalog. Sign in to take official timed examinations and record your score.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/login"
                        className="btn-primary h-10 px-4 text-xs shrink-0"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In / 1-Click Login</span>
                    </Link>
                </div>
            )}

            {/* Audio Summary Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {exams.length} Examination{exams.length === 1 ? '' : 's'} Ready in Database
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        const listSummary = exams.map((e, idx) => `Examination ${idx + 1}: ${e.title}, duration ${e.durationMinutes} minutes`).join('. ');
                        speak(`There are ${exams.length} examinations available. ${listSummary}`);
                    }}
                    className="btn-secondary px-4 py-2 text-xs"
                    aria-label="Listen to All Examinations Overview"
                >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    <span>Listen to Overview of All Exams</span>
                </button>
            </div>

            {/* Exam List Grid */}
            {loading ? (
                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-16 shadow-xs">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[var(--text-primary)] font-bold">Loading available examinations...</p>
                </div>
            ) : exams.length === 0 ? (
                <div className="panel-card bg-[var(--bg-surface)] border border-[var(--border-color)] text-center py-16 shadow-xs">
                    <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-lg font-bold text-[var(--text-primary)]">No active examinations found.</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Check back later or prepare using the Practice Modules.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam) => (
                        <div
                            key={exam._id || exam.id}
                            className="panel-card panel-card-hover bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)]">
                                        {exam.subject || 'All Subjects'}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)] font-bold">
                                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>{exam.durationMinutes} Mins</span>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 leading-tight">
                                    {exam.title}
                                </h2>

                                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                                    {exam.description || 'Full competitive examination with timed sections, keyboard shortcuts, and audio question explanations.'}
                                </p>

                                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] mb-5 text-center text-xs">
                                    <div>
                                        <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Questions</span>
                                        <strong className="text-[var(--text-primary)] text-sm">{exam.totalQuestions}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Marks</span>
                                        <strong className="text-[var(--text-primary)] text-sm">{exam.totalMarks}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Negative</span>
                                        <strong className="text-[var(--text-primary)] text-sm">{exam.negativeMarking ? '-0.25' : 'None'}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    to={`/exams/${exam._id || exam.id}/instructions`}
                                    className="btn-primary flex-1 h-11 text-sm flex items-center justify-center gap-2"
                                    aria-label={`Start Examination ${exam.title}`}
                                >
                                    <PlayCircle className="w-4 h-4" aria-hidden="true" />
                                    <span>Instructions & Start</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => readExamDetails(exam)}
                                    className="btn-secondary h-11 px-3.5"
                                    aria-label={`Listen to details for ${exam.title}`}
                                    title="Listen to details"
                                >
                                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (isAuthenticated) {
        return (
            <DashboardLayout
                pageTitle="Available Competitive Examinations"
                pageDescription="Select an examination to read its instructions, rules, and begin your timed session with server auto-save."
            >
                {mainContent}
            </DashboardLayout>
        );
    }

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-12">
                <div className="container-app space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-bold border border-[var(--border-color)] mb-3 shadow-xs">
                            <Award className="w-3.5 h-3.5 text-[var(--primary)]" />
                            <span>Competitive Examination Catalog</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
                            Available Competitive Examinations
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2 max-w-2xl font-normal leading-relaxed">
                            Browse published competitive examinations configured with native audio question narration, controlled keyboard controls, and atomic auto-save.
                        </p>
                    </div>

                    {mainContent}
                </div>
            </main>
        </PublicLayout>
    );
}
