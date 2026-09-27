import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    CheckCircle2
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function AvailableExams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        const loadExams = async () => {
            try {
                const res = await examService.getExams();
                if (res.success) {
                    setExams(res.exams || []);
                    const msg = `Found ${res.exams?.length || 0} competitive examinations available.`;
                    speak(msg);
                    announce(msg, 'polite');
                }
            } catch (err) {
                console.error('Error fetching exams:', err);
            } finally {
                setLoading(false);
            }
        };

        loadExams();
    }, [speak, announce]);

    const readExamDetails = (exam) => {
        const text = `${exam.title}. Subject: ${exam.subject || 'All Subjects'}. Duration: ${exam.durationMinutes} minutes. Total Questions: ${exam.totalQuestions}. Total Marks: ${exam.totalMarks}. Negative marking: ${exam.negativeMarking ? 'Yes, point two five marks per wrong answer' : 'No'}. Click or press Enter to read instructions.`;
        speak(text);
    };

    return (
        <DashboardLayout
            pageTitle="Available Competitive Examinations"
            pageDescription="Select an examination to read its instructions, rules, and begin your timed session with server auto-save."
        >
            <div className="space-y-6">
                {/* Audio Summary Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                        <span className="text-xs sm:text-sm font-bold text-white">
                            {exams.length} Examination{exams.length === 1 ? '' : 's'} Ready for Candidates
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            const listSummary = exams.map((e, idx) => `Examination ${idx + 1}: ${e.title}, duration ${e.durationMinutes} minutes`).join('. ');
                            speak(`There are ${exams.length} examinations available. ${listSummary}`);
                        }}
                        className="btn-outline h-9 text-xs"
                        aria-label="Listen to All Examinations Overview"
                    >
                        <Volume2 className="w-4 h-4" aria-hidden="true" />
                        <span>Listen to Overview of All Exams</span>
                    </button>
                </div>

                {/* Exam List Grid */}
                {loading ? (
                    <div className="panel-card bg-neutral-900 border-neutral-800 text-center py-16">
                        <div className="w-8 h-8 border-4 border-[#ffe600] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-white font-bold">Loading available examinations...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="panel-card bg-neutral-900 border-neutral-800 text-center py-16">
                        <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                        <p className="text-lg font-bold text-white">No active examinations found.</p>
                        <p className="text-sm text-neutral-400 mt-1">Check back later or prepare using the Practice Modules.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exams.map((exam, index) => (
                            <div
                                key={exam._id}
                                className="panel-card panel-card-hover bg-neutral-900 border-neutral-800 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <span className="text-xs font-mono font-bold text-[#ffe600] bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-700">
                                            {exam.subject || 'All Subjects'}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold">
                                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                            <span>{exam.durationMinutes} Mins</span>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                                        {exam.title}
                                    </h2>

                                    <p className="text-sm text-neutral-300 mb-4 line-clamp-2 leading-relaxed">
                                        {exam.description || 'Full competitive examination with timed sections, keyboard shortcuts, and audio question explanations.'}
                                    </p>

                                    <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 mb-5 text-center text-xs">
                                        <div>
                                            <span className="text-neutral-400 block text-[10px] uppercase">Questions</span>
                                            <strong className="text-white text-sm">{exam.totalQuestions}</strong>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400 block text-[10px] uppercase">Marks</span>
                                            <strong className="text-white text-sm">{exam.totalMarks}</strong>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400 block text-[10px] uppercase">Negative</span>
                                            <strong className="text-white text-sm">{exam.negativeMarking ? '-0.25' : 'None'}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        to={`/exams/${exam._id}/instructions`}
                                        className="btn-primary flex-1 h-11 text-sm shadow-md"
                                        aria-label={`Start Examination ${exam.title}`}
                                    >
                                        <PlayCircle className="w-4 h-4" aria-hidden="true" />
                                        <span>Instructions & Start</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => readExamDetails(exam)}
                                        className="h-11 px-3.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-[#ffe600] border border-neutral-700 transition"
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
        </DashboardLayout>
    );
}
