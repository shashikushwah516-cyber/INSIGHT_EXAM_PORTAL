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
    FileCheck
} from 'lucide-react';

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
        <main id="main-content" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Available Competitive Examinations</h1>
                    <p className="text-neutral-300 text-sm mt-1">
                        Select an examination to read its instructions, rules, and begin your timed session.
                    </p>
                </div>

                <button
                    onClick={() => {
                        const listSummary = exams.map((e, idx) => `Examination ${idx + 1}: ${e.title}, duration ${e.durationMinutes} minutes`).join('. ');
                        speak(`There are ${exams.length} examinations available. ${listSummary}`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-[#ffe600] border border-[#ffe600] rounded-xl hover:bg-neutral-800 font-bold transition shrink-0"
                    aria-label="Read full list of available examinations aloud"
                >
                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                    <span>Read Exam List Aloud</span>
                </button>
            </div>

            {loading ? (
                <div role="status" aria-live="polite" className="text-center py-12 text-neutral-400">
                    <p className="text-lg">Loading available examinations...</p>
                </div>
            ) : exams.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                    <AlertCircle className="w-12 h-12 text-neutral-500 mx-auto mb-3" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-white mb-2">No Examinations Currently Published</h2>
                    <p className="text-neutral-400 text-sm max-w-md mx-auto">
                        There are currently no active examinations scheduled. Please check back later or try subject practice.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam, index) => (
                        <div
                            key={exam.id || exam._id}
                            className="bg-neutral-900 border-2 border-neutral-800 hover:border-[#ffe600] rounded-2xl p-6 transition flex flex-col justify-between shadow-lg"
                        >
                            <div>
                                <div className="flex justify-between items-start gap-3 mb-3">
                                    <span className="text-xs font-mono bg-neutral-800 text-[#ffe600] px-3 py-1 rounded border border-neutral-700">
                                        {exam.subject || 'General'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => readExamDetails(exam)}
                                        className="p-1.5 text-neutral-400 hover:text-[#ffe600] rounded-lg transition"
                                        aria-label={`Read details for ${exam.title}`}
                                        title="Hear details aloud"
                                    >
                                        <Volume2 className="w-5 h-5" aria-hidden="true" />
                                    </button>
                                </div>

                                <h2 className="text-xl font-bold text-white mb-2">{exam.title}</h2>
                                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                                    {exam.description}
                                </p>

                                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-neutral-950 rounded-xl border border-neutral-800 mb-6 text-center">
                                    <div>
                                        <span className="text-xs text-neutral-400 block font-semibold">Duration</span>
                                        <span className="font-bold text-white text-base">
                                            {exam.durationMinutes} mins
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block font-semibold">Questions</span>
                                        <span className="font-bold text-white text-base">
                                            {exam.totalQuestions}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block font-semibold">Total Marks</span>
                                        <span className="font-bold text-[#ffe600] text-base">
                                            {exam.totalMarks}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/exams/${exam.id || exam._id}/instructions`}
                                className="inline-flex items-center justify-between w-full px-6 py-3.5 bg-[#ffe600] text-black font-bold text-base rounded-xl hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition"
                            >
                                <span>View Instructions & Start</span>
                                <ArrowRight className="w-5 h-5" aria-hidden="true" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
