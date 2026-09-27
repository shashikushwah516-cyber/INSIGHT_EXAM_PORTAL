import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import examService from '../services/examService';
import {
    FileText,
    Volume2,
    Clock,
    Award,
    AlertTriangle,
    Keyboard,
    Play,
    ArrowLeft
} from 'lucide-react';

export default function ExamInstructions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { speak, cancel } = useSpeech();
    const { announce } = useAccessibility();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await examService.getExamById(id);
                if (res.success && res.exam) {
                    setExam(res.exam);
                    const prompt = `Instructions for ${res.exam.title}. Please review the examination rules and keyboard navigation keys before starting.`;
                    speak(prompt);
                    announce(prompt, 'polite');
                }
            } catch (err) {
                console.error('Error fetching exam:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [id, speak, announce]);

    const readAllInstructions = () => {
        if (!exam) return;
        const text = `Examination Instructions for ${exam.title}. Total Duration: ${exam.durationMinutes} minutes. Total Questions: ${exam.questions?.length || exam.totalQuestions}. Marking Scheme: Positive marks for correct answers, negative marking of zero point two five marks for wrong answers. Keyboard navigation shortcuts: Press Arrow Right or N for Next Question. Press Arrow Left or P for Previous Question. Press keys 1, 2, 3, or 4 to choose your answer. Press R to hear the current question read aloud. Press M to mark the question for review. Press C to clear your chosen answer. Press T to hear the remaining time. When ready, press Enter on the Start Examination button.`;
        speak(text);
    };

    const handleStartExam = async () => {
        setStarting(true);
        cancel();
        try {
            const startRes = await examService.startExam(id);
            if (startRes.success) {
                speak('Examination started. Question 1 loading.');
                navigate(`/exams/${id}/take`, { state: { attemptData: startRes } });
            }
        } catch (err) {
            console.error('Error starting exam:', err);
            const errText = err.message || 'Unable to start examination session.';
            speak(errText);
            announce(errText, 'assertive');
            setStarting(false);
        }
    };

    if (loading) {
        return (
            <main id="main-content" className="max-w-4xl mx-auto py-12 px-4 text-center text-neutral-400">
                <p className="text-xl">Loading examination instructions...</p>
            </main>
        );
    }

    if (!exam) {
        return (
            <main id="main-content" className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Examination Not Found</h1>
                <Link to="/exams" className="text-[#ffe600] underline font-bold">
                    Return to Available Examinations
                </Link>
            </main>
        );
    }

    return (
        <main id="main-content" className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link
                    to="/exams"
                    className="inline-flex items-center gap-2 text-neutral-300 hover:text-[#ffe600] text-sm font-semibold transition"
                >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Back to Examination List</span>
                </Link>
            </div>

            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                {/* Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-6">
                    <div>
                        <span className="text-xs font-mono bg-neutral-800 text-[#ffe600] px-3 py-1 rounded border border-neutral-700">
                            {exam.subject || 'Competitive Exam'}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                            {exam.title}
                        </h1>
                        <p className="text-neutral-300 text-sm mt-1">Official Candidate Instructions</p>
                    </div>

                    <button
                        onClick={readAllInstructions}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] rounded-xl hover:bg-neutral-700 font-bold transition shrink-0"
                        aria-label="Read all examination rules and shortcuts aloud"
                    >
                        <Volume2 className="w-5 h-5" aria-hidden="true" />
                        <span>Read Rules Aloud</span>
                    </button>
                </div>

                {/* Exam Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-950 rounded-xl border border-neutral-800 mb-8 text-center">
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Duration</span>
                        <span className="text-lg font-bold text-white">{exam.durationMinutes} Minutes</span>
                    </div>
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Total Questions</span>
                        <span className="text-lg font-bold text-white">{exam.questions?.length || exam.totalQuestions}</span>
                    </div>
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Total Marks</span>
                        <span className="text-lg font-bold text-[#ffe600]">{exam.totalMarks}</span>
                    </div>
                    <div>
                        <span className="text-xs text-neutral-400 block font-semibold">Negative Marking</span>
                        <span className="text-lg font-bold text-red-400">
                            {exam.negativeMarking ? `-${exam.negativeMarksPerQuestion || 0.25}` : 'None'}
                        </span>
                    </div>
                </div>

                {/* General Examination Rules */}
                <section aria-labelledby="rules-heading" className="mb-8">
                    <h2 id="rules-heading" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#ffe600]" aria-hidden="true" />
                        <span>Examination Protocol & Rules</span>
                    </h2>
                    <ul className="space-y-3 text-neutral-300 text-sm leading-relaxed">
                        <li className="flex items-start gap-2">
                            <span className="text-[#ffe600] font-bold">•</span>
                            <span>
                                Once started, the examination countdown timer cannot be paused. The timer is verified by the server.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#ffe600] font-bold">•</span>
                            <span>
                                Every answered question is automatically saved to the database. If you refresh or briefly lose connection, your answers remain safely stored.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#ffe600] font-bold">•</span>
                            <span>
                                When the countdown reaches zero, the examination will automatically finalize and submit your responses.
                            </span>
                        </li>
                    </ul>
                </section>

                {/* Keyboard & Audio Navigation Reference */}
                <section aria-labelledby="shortcuts-heading" className="mb-8">
                    <h2 id="shortcuts-heading" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Keyboard className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                        <span>Dedicated Examination Keyboard Shortcuts</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Next Question</span>
                            <span className="font-mono text-[#ffe600] font-bold">Arrow Right / N</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Previous Question</span>
                            <span className="font-mono text-[#ffe600] font-bold">Arrow Left / P</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Choose Option 1 to 4</span>
                            <span className="font-mono text-[#ffe600] font-bold">Keys 1, 2, 3, 4</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Read Question Aloud</span>
                            <span className="font-mono text-[#ffe600] font-bold">Key R or Q</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Mark for Review</span>
                            <span className="font-mono text-[#ffe600] font-bold">Key M</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Clear Answer</span>
                            <span className="font-mono text-[#ffe600] font-bold">Key C</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Announce Remaining Time</span>
                            <span className="font-mono text-[#ffe600] font-bold">Key T</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between">
                            <span className="text-neutral-300">Stop Speech</span>
                            <span className="font-mono text-[#ffe600] font-bold">Escape</span>
                        </div>
                    </div>
                </section>

                {/* Confirmation Checkbox & Start Button */}
                <div className="pt-6 border-t border-neutral-800">
                    <label className="flex items-start gap-3 mb-6 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="w-5 h-5 mt-0.5 accent-[#ffe600] rounded"
                        />
                        <span className="text-sm font-semibold text-white">
                            I have reviewed the examination instructions, scoring rules, and keyboard controls. I am ready to begin my timed attempt.
                        </span>
                    </label>

                    <button
                        type="button"
                        disabled={!confirmed || starting}
                        onClick={handleStartExam}
                        className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-[#ffe600] text-black font-bold text-lg rounded-xl hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Play className="w-6 h-6" aria-hidden="true" />
                        <span>{starting ? 'Initializing Session...' : 'Start Examination Now (Enter)'}</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
