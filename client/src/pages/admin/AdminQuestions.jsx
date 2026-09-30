import React, { useEffect, useState, useRef } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { useAccessibility } from '../../context/AccessibilityContext';
import questionService from '../../services/questionService';
import {
    HelpCircle,
    Plus,
    Trash2,
    Check,
    Volume2,
    Search,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminQuestions() {
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');

    // Form state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        subject: 'Quantitative Aptitude',
        topic: 'General',
        difficulty: 'medium',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 1,
        negativeMarks: 0.25,
        explanation: '',
        audioText: ''
    });

    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    // Debounce search term to prevent rapid API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedSubject !== 'all') params.subject = selectedSubject;
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

            const res = await questionService.getQuestions(params);
            if (res.success) {
                setQuestions(res.questions || []);
            }
        } catch (err) {
            console.error('Failed to load questions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const fetchMeta = async () => {
            try {
                const meta = await questionService.getSubjectsMeta();
                if (isMounted && meta.success) {
                    setSubjects(meta.distinctSubjects || []);
                }
            } catch (e) {
                // ignore
            }
        };
        fetchMeta();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [selectedSubject, debouncedSearch]);

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!newQuestion.questionText.trim()) {
            const msg = 'Question text is required.';
            setFormError(msg);
            speak(msg);
            return;
        }

        const validOptions = newQuestion.options.every((opt) => opt.trim() !== '');
        if (!validOptions) {
            const msg = 'All 4 options must be filled.';
            setFormError(msg);
            speak(msg);
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await questionService.createQuestion(newQuestion);
            if (res.success) {
                const okMsg = 'Question created and stored in Question Bank successfully.';
                setFormSuccess(okMsg);
                speak('Question added to question bank.');
                announce(okMsg, 'polite');
                // Reset form
                setNewQuestion({
                    questionText: '',
                    subject: newQuestion.subject,
                    topic: 'General',
                    difficulty: 'medium',
                    options: ['', '', '', ''],
                    correctOption: 0,
                    marks: 1,
                    negativeMarks: 0.25,
                    explanation: '',
                    audioText: ''
                });
                fetchQuestions();
                setTimeout(() => setShowCreateModal(false), 1200);
            }
        } catch (err) {
            const errMsg = err.message || 'Error creating question.';
            setFormError(errMsg);
            speak(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await questionService.deleteQuestion(id);
            setQuestions((prev) => prev.filter((q) => q._id !== id));
            const msg = 'Question deleted from question bank.';
            setActionMsg(msg);
            speak(msg);
            announce(msg, 'polite');
            setTimeout(() => setActionMsg(''), 4000);
        } catch (err) {
            const errText = 'Failed to delete question.';
            setActionMsg(errText);
            speak(errText);
        }
    };

    return (
        <AdminLayout
            pageTitle="Question Bank Management"
            pageDescription="Repository of questions with multi-subject categorization and accessibility audio cues."
        >
            <div className="space-y-6">
                {/* Header Action Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                            <HelpCircle className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Question Bank Management</h2>
                            <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                                Repository of questions with multi-subject categorization and accessibility audio cues.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setFormError('');
                            setFormSuccess('');
                            setShowCreateModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 font-bold rounded-xl shadow-sm text-sm transition shrink-0 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        <span>Create New Question</span>
                    </button>
                </div>

                {actionMsg && (
                    <div role="status" className="p-3.5 bg-[var(--primary-subtle)] border border-[var(--border-color)] text-[var(--primary)] rounded-xl text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{actionMsg}</span>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 rounded-xl flex flex-col sm:flex-row gap-4 shadow-sm">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-[var(--text-muted)] absolute left-3 top-3" aria-hidden="true" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search question text..."
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                        />
                    </div>

                    <div className="w-full sm:w-64">
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none cursor-pointer"
                        >
                            <option value="all">All Subjects</option>
                            {subjects.map((sub, i) => (
                                <option key={i} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Questions Table */}
                {loading ? (
                    <div role="status" aria-live="polite" className="text-center py-16 text-[var(--text-muted)]">
                        <p className="text-xl font-bold">Loading question bank...</p>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 shadow-sm">
                        <p className="text-xl font-bold text-[var(--text-primary)] mb-2">No Questions Found</p>
                        <p className="text-[var(--text-muted)] text-sm">Add questions using the "Create New Question" button.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div
                                key={q._id}
                                className="p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-sm hover:border-[var(--focus-ring)] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono bg-[var(--primary-subtle)] text-[var(--primary)] px-2.5 py-0.5 rounded border border-[var(--border-color)] font-bold">
                                            {q.subject}
                                        </span>
                                        <span className="text-xs text-[var(--text-muted)] font-mono">
                                            {q.topic} • {q.difficulty?.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-[var(--success)] font-mono font-semibold">
                                            +{q.marks || 1} mark / -{q.negativeMarks || 0.25} neg
                                        </span>
                                    </div>

                                    <h2 className="text-base font-bold text-[var(--text-primary)] leading-snug">{q.questionText}</h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                                        {q.options.map((opt, oIdx) => (
                                            <div
                                                key={oIdx}
                                                className={`p-2 rounded border ${
                                                    q.correctOption === oIdx
                                                        ? 'border-[var(--success)]/50 bg-[var(--success)]/15 text-[var(--success)] font-bold'
                                                        : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                                }`}
                                            >
                                                <span className="font-mono mr-1.5">{oIdx + 1}.</span>
                                                <span>{opt}</span>
                                                {q.correctOption === oIdx && ' (Correct Key)'}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            speak(
                                                `Question: ${q.questionText}. Option 1: ${q.options[0]}. Option 2: ${q.options[1]}. Option 3: ${q.options[2]}. Option 4: ${q.options[3]}. Correct answer: Option ${q.correctOption + 1}: ${q.options[q.correctOption]}.`,
                                                { force: true }
                                            )
                                        }
                                        className="p-2 text-[var(--primary)] hover:bg-[var(--primary-subtle)] bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] transition cursor-pointer"
                                        aria-label="Listen to question text and options aloud"
                                        title="Listen Aloud"
                                    >
                                        <Volume2 className="w-5 h-5" aria-hidden="true" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteQuestion(q._id)}
                                        className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/15 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--danger)]/50 transition cursor-pointer"
                                        aria-label={`Delete question: ${q.questionText}`}
                                        title="Delete Question"
                                    >
                                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Question Modal Dialog */}
                {showCreateModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-q-title"
                    >
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-[var(--text-primary)] max-h-[92vh] overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border-color)]">
                                <h2 id="create-q-title" className="text-2xl font-extrabold text-[var(--text-primary)]">
                                    Add Question to Question Bank
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

                            <form onSubmit={handleCreateQuestion} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                                        Question Text *
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={newQuestion.questionText}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, questionText: e.target.value })
                                        }
                                        placeholder="Enter complete competitive exam question..."
                                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Subject *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newQuestion.subject}
                                            onChange={(e) =>
                                                setNewQuestion({ ...newQuestion, subject: e.target.value })
                                            }
                                            placeholder="e.g. Reasoning"
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Topic</label>
                                        <input
                                            type="text"
                                            value={newQuestion.topic}
                                            onChange={(e) =>
                                                setNewQuestion({ ...newQuestion, topic: e.target.value })
                                            }
                                            placeholder="e.g. Syllogism"
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Difficulty</label>
                                        <select
                                            value={newQuestion.difficulty}
                                            onChange={(e) =>
                                                setNewQuestion({ ...newQuestion, difficulty: e.target.value })
                                            }
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none cursor-pointer"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 4 Options */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[var(--text-secondary)]">
                                        Options (Specify 4 choices and select the correct answer key) *
                                    </label>
                                    {newQuestion.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <label className="flex items-center gap-1.5 cursor-pointer text-xs shrink-0">
                                                <input
                                                    type="radio"
                                                    name="correctOptionRadio"
                                                    checked={newQuestion.correctOption === i}
                                                    onChange={() => setNewQuestion({ ...newQuestion, correctOption: i })}
                                                    className="w-4 h-4 accent-[var(--primary)]"
                                                />
                                                <span className="font-bold text-[var(--text-secondary)]">Option {i + 1}</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={opt}
                                                onChange={(e) => {
                                                    const updated = [...newQuestion.options];
                                                    updated[i] = e.target.value;
                                                    setNewQuestion({ ...newQuestion, options: updated });
                                                }}
                                                placeholder={`Option ${i + 1} text`}
                                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Marks (+)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={newQuestion.marks}
                                            onChange={(e) =>
                                                setNewQuestion({ ...newQuestion, marks: parseFloat(e.target.value) })
                                            }
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Negative Marks (-)</label>
                                        <input
                                            type="number"
                                            step="0.25"
                                            value={newQuestion.negativeMarks}
                                            onChange={(e) =>
                                                setNewQuestion({ ...newQuestion, negativeMarks: parseFloat(e.target.value) })
                                            }
                                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                                        Solution Explanation
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={newQuestion.explanation}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, explanation: e.target.value })
                                        }
                                        placeholder="Detailed rationale and steps for candidates reviewing solutions..."
                                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:border-[var(--focus-ring)] outline-none"
                                    />
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
                                        {isSubmitting ? 'Saving Question...' : 'Save Question to Bank'}
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
