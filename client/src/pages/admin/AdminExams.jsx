import React, { useEffect, useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { useAccessibility } from '../../context/AccessibilityContext';
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
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminExams() {
    const [exams, setExams] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [actionMsg, setActionMsg] = useState('');

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
    const { announce } = useAccessibility();

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
        let isMounted = true;
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [examRes, qRes] = await Promise.allSettled([
                    examService.getExams(),
                    questionService.getQuestions()
                ]);
                if (isMounted) {
                    if (examRes.status === 'fulfilled' && examRes.value?.success) {
                        setExams(examRes.value.exams || []);
                    }
                    if (qRes.status === 'fulfilled' && qRes.value?.success) {
                        setAvailableQuestions(qRes.value.questions || []);
                    }
                }
            } catch (err) {
                console.warn('Initial load failed:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadInitialData();
        return () => { isMounted = false; };
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
            const msg = 'Exam title and description are required.';
            setFormError(msg);
            speak(msg);
            return;
        }

        if (newExam.selectedQuestionIds.length === 0) {
            const msg = 'Please select at least one question from the Question Bank.';
            setFormError(msg);
            speak(msg);
            return;
        }

        setIsSubmitting(true);
        try {
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
                const okMsg = 'Examination created and published successfully.';
                setFormSuccess(okMsg);
                speak(okMsg);
                announce(okMsg, 'polite');
                fetchExams();
                setTimeout(() => setShowCreateModal(false), 1200);
            }
        } catch (err) {
            const errMsg = err.message || 'Error creating exam.';
            setFormError(errMsg);
            speak(errMsg);
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
            const msg = `Exam "${exam.title}" ${updatedStatus ? 'published' : 'unpublished'}.`;
            setActionMsg(msg);
            speak(msg);
            announce(msg, 'polite');
            setTimeout(() => setActionMsg(''), 4000);
        } catch (err) {
            const errText = 'Could not update exam publication status.';
            setActionMsg(errText);
            speak(errText);
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Are you sure you want to delete this examination?')) return;
        try {
            await examService.deleteExam(id);
            setExams((prev) => prev.filter((e) => (e.id || e._id) !== id));
            const msg = 'Examination deleted successfully.';
            setActionMsg(msg);
            speak(msg);
            announce(msg, 'polite');
            setTimeout(() => setActionMsg(''), 4000);
        } catch (err) {
            const errText = 'Failed to delete examination.';
            setActionMsg(errText);
            speak(errText);
        }
    };

    return (
        <AdminLayout
            pageTitle="Competitive Exam Management"
            pageDescription="Assemble question sets into official timed examinations for candidates."
        >
            <div className="space-y-6">
                {/* Header Action Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                            <BookOpen className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Examination Assembler</h2>
                            <p className="text-[var(--text-secondary)] text-xs">Configure timed tests, question sets, and negative marking.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setFormError('');
                            setFormSuccess('');
                            setShowCreateModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 font-bold text-sm rounded-xl shadow-sm transition cursor-pointer"
                    >
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        <span>Create Examination</span>
                    </button>
                </div>

                {actionMsg && (
                    <div role="status" className="p-3.5 bg-[var(--primary-subtle)] border border-[var(--border-color)] text-[var(--primary)] rounded-xl text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{actionMsg}</span>
                    </div>
                )}

                {loading ? (
                    <div role="status" aria-live="polite" className="text-center py-16 text-[var(--text-muted)]">
                        <p className="text-xl font-bold">Loading examinations...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 shadow-sm">
                        <p className="text-xl font-bold text-[var(--text-primary)] mb-2">No Examinations Available</p>
                        <p className="text-[var(--text-muted)] text-sm">Create an examination using the button above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exams.map((exam) => (
                            <div
                                key={exam.id || exam._id}
                                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-[var(--focus-ring)] transition"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono bg-[var(--primary-subtle)] text-[var(--primary)] px-2.5 py-0.5 rounded border border-[var(--border-color)] font-bold">
                                            {exam.subject || 'Competitive'}
                                        </span>
                                        <span
                                            className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                                                exam.isPublished
                                                    ? 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/40'
                                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-color)]'
                                            }`}
                                        >
                                            {exam.isPublished ? 'Published' : 'Draft / Hidden'}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{exam.title}</h2>
                                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">{exam.description}</p>

                                    <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] mb-6 text-center text-sm">
                                        <div>
                                            <span className="text-xs text-[var(--text-muted)] block">Duration</span>
                                            <span className="font-bold text-[var(--text-primary)]">{exam.durationMinutes}m</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-[var(--text-muted)] block">Questions</span>
                                            <span className="font-bold text-[var(--text-primary)]">{exam.totalQuestions}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-[var(--text-muted)] block">Total Marks</span>
                                            <span className="font-bold text-[var(--primary)]">{exam.totalMarks}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePublish(exam)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold rounded-lg border border-[var(--border-color)] transition cursor-pointer"
                                    >
                                        {exam.isPublished ? (
                                            <>
                                                <EyeOff className="w-4 h-4 text-[var(--warning)]" aria-hidden="true" />
                                                <span>Unpublish</span>
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4 text-[var(--success)]" aria-hidden="true" />
                                                <span>Publish</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteExam(exam.id || exam._id)}
                                        className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/15 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--danger)]/50 transition cursor-pointer"
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-exam-title"
                    >
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl max-w-3xl w-full p-6 sm:p-8 text-[var(--text-primary)] max-h-[92vh] overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border-color)]">
                                <h2 id="create-exam-title" className="text-2xl font-extrabold text-[var(--text-primary)]">
                                    Configure New Competitive Examination
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {formError && (
                                <div role="alert" className="p-3 bg-[var(--danger)]/15 border border-[var(--danger)] text-[var(--danger)] rounded-lg mb-4 text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}
                            {formSuccess && (
                                <div role="status" className="p-3 bg-[var(--success)]/15 border border-[var(--success)] text-[var(--success)] rounded-lg mb-4 text-sm flex items-center gap-2 font-semibold">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                                    <span>{formSuccess}</span>
                                </div>
                            )}

                            <form onSubmit={handleCreateExam} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                                        Examination Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newExam.title}
                                        onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                        placeholder="e.g. All India Banking Aptitude Examination"
                                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                                        Description & Instructions
                                    </label>
                                    <textarea
                                        rows={2}
                                        required
                                        value={newExam.description}
                                        onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                                        placeholder="Detailed description of coverage and competitive scope..."
                                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Duration (Minutes) *</label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="180"
                                            required
                                            value={newExam.durationMinutes}
                                            onChange={(e) => setNewExam({ ...newExam, durationMinutes: e.target.value })}
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Subject</label>
                                        <input
                                            type="text"
                                            value={newExam.subject}
                                            onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Negative Marking / Question</label>
                                        <input
                                            type="number"
                                            step="0.25"
                                            value={newExam.negativeMarksPerQuestion}
                                            onChange={(e) => setNewExam({ ...newExam, negativeMarksPerQuestion: e.target.value })}
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Select Questions from Question Bank */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-[var(--text-secondary)]">
                                            Select Questions from Bank ({newExam.selectedQuestionIds.length} Selected) *
                                        </label>
                                    </div>

                                    <div className="max-h-56 overflow-y-auto space-y-2 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl">
                                        {availableQuestions.map((q) => {
                                            const isSelected = newExam.selectedQuestionIds.includes(q._id);
                                            return (
                                                <label
                                                    key={q._id}
                                                    className={`p-2.5 rounded-lg border flex items-start gap-3 cursor-pointer text-xs transition ${
                                                        isSelected
                                                            ? 'bg-[var(--primary-subtle)] border-[var(--primary)] text-[var(--text-primary)] font-bold'
                                                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleQuestionSelect(q._id)}
                                                        className="w-4 h-4 mt-0.5 accent-[var(--primary)]"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="font-bold text-[var(--primary)] mr-2">[{q.subject}]</span>
                                                        <span>{q.questionText}</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-5 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold rounded-xl transition border border-[var(--border-color)] cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-[var(--primary)] text-[var(--bg-primary)] font-bold rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                                    >
                                        {isSubmitting ? 'Creating Exam...' : 'Create & Publish Exam'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
