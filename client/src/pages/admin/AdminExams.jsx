import React, { useEffect, useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import examService from '../../services/examService';
import questionService from '../../services/questionService';
import {
    BookOpen,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Check,
    Clock,
    Award,
    CheckCircle2
} from 'lucide-react';

export default function AdminExams() {
    const [exams, setExams] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const [newExam, setNewExam] = useState({
        title: '',
        description: '',
        subject: 'General Competitive',
        durationMinutes: 20,
        totalMarks: 10,
        passingMarks: 4,
        negativeMarking: true,
        negativeMarksPerQuestion: 0.25,
        isPublished: true,
        selectedQuestionIds: []
    });

    const { speak } = useSpeech();

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await examService.getExams();
            if (res.success) {
                setExams(res.exams || []);
            }
        } catch (err) {
            console.error('Failed to load exams:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
        const loadBankQuestions = async () => {
            try {
                const res = await questionService.getQuestions();
                if (res.success) {
                    setAvailableQuestions(res.questions || []);
                }
            } catch (err) {
                console.warn('Could not load bank questions:', err);
            }
        };
        loadBankQuestions();
    }, []);

    const handleToggleQuestionSelect = (qId) => {
        setNewExam((prev) => {
            const exists = prev.selectedQuestionIds.includes(qId);
            const updated = exists
                ? prev.selectedQuestionIds.filter((id) => id !== qId)
                : [...prev.selectedQuestionIds, qId];
            return {
                ...prev,
                selectedQuestionIds: updated,
                totalMarks: updated.length
            };
        });
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!newExam.title.trim() || !newExam.description.trim()) {
            setFormError('Exam title and description are required.');
            return;
        }

        if (newExam.selectedQuestionIds.length === 0) {
            setFormError('Please select at least one question from the Question Bank.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Find full question objects
            const selectedQs = availableQuestions
                .filter((q) => newExam.selectedQuestionIds.includes(q._id))
                .map((q) => ({
                    questionText: q.questionText,
                    options: q.options,
                    correctOption: q.correctOption,
                    marks: q.marks || 1,
                    negativeMarks: q.negativeMarks || 0.25,
                    explanation: q.explanation || '',
                    subject: q.subject,
                    topic: q.topic
                }));

            const payload = {
                title: newExam.title.trim(),
                description: newExam.description.trim(),
                subject: newExam.subject,
                durationMinutes: Number(newExam.durationMinutes) || 20,
                totalMarks: selectedQs.length,
                passingMarks: Number(newExam.passingMarks) || Math.round(selectedQs.length * 0.4),
                negativeMarking: newExam.negativeMarking,
                negativeMarksPerQuestion: Number(newExam.negativeMarksPerQuestion) || 0.25,
                isPublished: newExam.isPublished,
                questions: selectedQs
            };

            const res = await examService.createExam(payload);
            if (res.success) {
                setFormSuccess('Examination created and published successfully.');
                speak('Examination created and available to candidates.');
                fetchExams();
                setTimeout(() => setShowCreateModal(false), 1200);
            }
        } catch (err) {
            setFormError(err.message || 'Error creating exam.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTogglePublish = async (exam) => {
        try {
            const updatedStatus = !exam.isPublished;
            await examService.updateExam(exam.id || exam._id, { isPublished: updatedStatus });
            setExams((prev) =>
                prev.map((e) => ((e.id || e._id) === (exam.id || exam._id) ? { ...e, isPublished: updatedStatus } : e))
            );
            speak(`Exam ${updatedStatus ? 'published' : 'unpublished'}.`);
        } catch (err) {
            alert('Could not update exam publication status.');
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Are you sure you want to delete this examination?')) return;
        try {
            await examService.deleteExam(id);
            setExams((prev) => prev.filter((e) => (e.id || e._id) !== id));
            speak('Examination deleted.');
        } catch (err) {
            alert('Failed to delete examination.');
        }
    };

    return (
        <main id="main-content" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-[#ffe600]" aria-hidden="true" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-white">Competitive Exam Management</h1>
                        <p className="text-neutral-300 text-sm mt-0.5">
                            Assemble question sets into official timed examinations for candidates.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#ffe600] text-black font-bold rounded-xl hover:bg-yellow-400 transition shrink-0"
                >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    <span>Create Examination</span>
                </button>
            </div>

            {loading ? (
                <div role="status" aria-live="polite" className="text-center py-16 text-neutral-400">
                    <p className="text-xl">Loading examinations...</p>
                </div>
            ) : exams.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                    <p className="text-xl font-bold text-white mb-2">No Examinations Available</p>
                    <p className="text-neutral-400 text-sm">Create an examination using the button above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam) => (
                        <div
                            key={exam.id || exam._id}
                            className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono bg-neutral-800 text-[#ffe600] px-2.5 py-0.5 rounded border border-neutral-700">
                                        {exam.subject || 'Competitive'}
                                    </span>
                                    <span
                                        className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                            exam.isPublished
                                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                        }`}
                                    >
                                        {exam.isPublished ? 'Published' : 'Draft / Hidden'}
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold text-white mb-2">{exam.title}</h2>
                                <p className="text-neutral-300 text-sm leading-relaxed mb-6">{exam.description}</p>

                                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-neutral-950 rounded-xl border border-neutral-800 mb-6 text-center text-sm">
                                    <div>
                                        <span className="text-xs text-neutral-400 block">Duration</span>
                                        <span className="font-bold text-white">{exam.durationMinutes}m</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block">Questions</span>
                                        <span className="font-bold text-white">{exam.totalQuestions}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block">Total Marks</span>
                                        <span className="font-bold text-[#ffe600]">{exam.totalMarks}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => handleTogglePublish(exam)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg border border-neutral-700 transition"
                                >
                                    {exam.isPublished ? (
                                        <>
                                            <EyeOff className="w-4 h-4 text-amber-400" aria-hidden="true" />
                                            <span>Unpublish</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                                            <span>Publish</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteExam(exam.id || exam._id)}
                                    className="p-2 text-red-400 hover:text-red-300 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-red-500 transition"
                                    aria-label={`Delete exam: ${exam.title}`}
                                >
                                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Exam Modal Dialog */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-exam-title"
                >
                    <div className="bg-neutral-900 border-2 border-[#ffe600] rounded-2xl max-w-3xl w-full p-6 sm:p-8 text-white max-h-[92vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-neutral-800">
                            <h2 id="create-exam-title" className="text-2xl font-extrabold text-[#ffe600]">
                                Configure New Competitive Examination
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-neutral-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div role="alert" className="p-3 bg-red-950 border border-red-500 text-red-200 rounded-lg mb-4 text-sm">
                                {formError}
                            </div>
                        )}
                        {formSuccess && (
                            <div role="status" className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 rounded-lg mb-4 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>{formSuccess}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateExam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-200 mb-1">
                                    Examination Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newExam.title}
                                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                    placeholder="e.g. All India Banking Aptitude Examination"
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-[#ffe600] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-200 mb-1">
                                    Description & Instructions
                                </label>
                                <textarea
                                    rows={2}
                                    required
                                    value={newExam.description}
                                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                                    placeholder="Detailed description of coverage and competitive scope..."
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-[#ffe600] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Duration (Minutes) *</label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="180"
                                        required
                                        value={newExam.durationMinutes}
                                        onChange={(e) => setNewExam({ ...newExam, durationMinutes: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={newExam.subject}
                                        onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Negative Marking / Question</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        value={newExam.negativeMarksPerQuestion}
                                        onChange={(e) => setNewExam({ ...newExam, negativeMarksPerQuestion: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Select Questions from Question Bank */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-neutral-200">
                                        Select Questions from Bank ({newExam.selectedQuestionIds.length} Selected) *
                                    </label>
                                </div>

                                <div className="max-h-56 overflow-y-auto space-y-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                                    {availableQuestions.map((q) => {
                                        const isSelected = newExam.selectedQuestionIds.includes(q._id);
                                        return (
                                            <label
                                                key={q._id}
                                                className={`p-2.5 rounded-lg border flex items-start gap-3 cursor-pointer text-xs transition ${
                                                    isSelected
                                                        ? 'bg-neutral-800 border-[#ffe600] text-white'
                                                        : 'border-neutral-800 text-neutral-300 hover:bg-neutral-900'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleQuestionSelect(q._id)}
                                                    className="w-4 h-4 mt-0.5 accent-[#ffe600]"
                                                />
                                                <div className="flex-1">
                                                    <span className="font-bold text-[#ffe600] mr-2">[{q.subject}]</span>
                                                    <span>{q.questionText}</span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#ffe600] text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating Exam...' : 'Create & Publish Exam'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
