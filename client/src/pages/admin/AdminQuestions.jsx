import React, { useEffect, useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
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
    const [selectedSubject, setSelectedSubject] = useState('all');

    // Form state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

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

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedSubject !== 'all') params.subject = selectedSubject;
            if (searchTerm) params.search = searchTerm;

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
        const fetchMeta = async () => {
            try {
                const meta = await questionService.getSubjectsMeta();
                if (meta.success) {
                    setSubjects(meta.distinctSubjects || []);
                }
            } catch (e) {
                // ignore
            }
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [selectedSubject, searchTerm]);

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!newQuestion.questionText.trim()) {
            setFormError('Question text is required.');
            return;
        }

        const validOptions = newQuestion.options.every((opt) => opt.trim() !== '');
        if (!validOptions) {
            setFormError('All 4 options must be filled.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await questionService.createQuestion(newQuestion);
            if (res.success) {
                setFormSuccess('Question created and stored in Question Bank successfully.');
                speak('Question added to question bank.');
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
            setFormError(err.message || 'Error creating question.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await questionService.deleteQuestion(id);
            setQuestions((prev) => prev.filter((q) => q._id !== id));
            speak('Question deleted from question bank.');
        } catch (err) {
            alert('Failed to delete question.');
        }
    };

    return (
        <AdminLayout
            pageTitle="Question Bank Management"
            pageDescription="Repository of questions with multi-subject categorization, explanations, and accessibility audio cues."
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="w-8 h-8 text-[#ffe600]" aria-hidden="true" />
                        <div>
                            <h1 className="text-3xl font-extrabold text-white">Question Bank Management</h1>
                            <p className="text-neutral-300 text-sm mt-0.5">
                                Repository of questions with multi-subject categorization and accessibility audio cues.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#ffe600] text-black font-bold rounded-xl hover:bg-yellow-400 transition shrink-0"
                    >
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        <span>Create New Question</span>
                    </button>
                </div>

            {/* Filter and Search Bar */}
            <div className="bg-neutral-900 border-2 border-neutral-800 p-4 rounded-xl mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-3" aria-hidden="true" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search question text..."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#ffe600] outline-none"
                    />
                </div>

                <div className="w-full sm:w-64">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#ffe600] outline-none"
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
                <div role="status" aria-live="polite" className="text-center py-16 text-neutral-400">
                    <p className="text-xl">Loading question bank...</p>
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                    <p className="text-xl font-bold text-white mb-2">No Questions Found</p>
                    <p className="text-neutral-400 text-sm">Add questions using the "Create New Question" button.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div
                            key={q._id}
                            className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-mono bg-neutral-800 text-[#ffe600] px-2.5 py-0.5 rounded border border-neutral-700">
                                        {q.subject}
                                    </span>
                                    <span className="text-xs text-neutral-400 font-mono">
                                        {q.topic} • {q.difficulty?.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-emerald-400 font-mono">
                                        +{q.marks || 1} mark / -{q.negativeMarks || 0.25} neg
                                    </span>
                                </div>

                                <h2 className="text-base font-bold text-white leading-snug">{q.questionText}</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 pt-1">
                                    {q.options.map((opt, oIdx) => (
                                        <div
                                            key={oIdx}
                                            className={`p-2 rounded border ${
                                                q.correctOption === oIdx
                                                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold'
                                                    : 'border-neutral-800 bg-neutral-950'
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
                                            `Question: ${q.questionText}. Option 1: ${q.options[0]}. Option 2: ${q.options[1]}. Option 3: ${q.options[2]}. Option 4: ${q.options[3]}. Correct answer: Option ${q.correctOption + 1}: ${q.options[q.correctOption]}.`
                                        )
                                    }
                                    className="p-2 text-neutral-300 hover:text-[#ffe600] bg-neutral-800 rounded-lg border border-neutral-700"
                                    aria-label="Listen to question text and options aloud"
                                    title="Listen Aloud"
                                >
                                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q._id)}
                                    className="p-2 text-red-400 hover:text-red-300 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-red-500 transition"
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-q-title"
                >
                    <div className="bg-neutral-900 border-2 border-[#ffe600] rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-white max-h-[92vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-neutral-800">
                            <h2 id="create-q-title" className="text-2xl font-extrabold text-[#ffe600]">
                                Add Question to Question Bank
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

                        <form onSubmit={handleCreateQuestion} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-200 mb-1">
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
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-[#ffe600] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newQuestion.subject}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, subject: e.target.value })
                                        }
                                        placeholder="e.g. Reasoning"
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Topic</label>
                                    <input
                                        type="text"
                                        value={newQuestion.topic}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, topic: e.target.value })
                                        }
                                        placeholder="e.g. Syllogism"
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Difficulty</label>
                                    <select
                                        value={newQuestion.difficulty}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, difficulty: e.target.value })
                                        }
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* 4 Options */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-neutral-200">
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
                                                className="w-4 h-4 accent-[#ffe600]"
                                            />
                                            <span className="font-bold text-neutral-300">Option {i + 1}</span>
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
                                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Marks (+)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={newQuestion.marks}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, marks: parseFloat(e.target.value) })
                                        }
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1">Negative Marks (-)</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        value={newQuestion.negativeMarks}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, negativeMarks: parseFloat(e.target.value) })
                                        }
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#ffe600] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-200 mb-1">
                                    Solution Explanation
                                </label>
                                <textarea
                                    rows={2}
                                    value={newQuestion.explanation}
                                    onChange={(e) =>
                                        setNewQuestion({ ...newQuestion, explanation: e.target.value })
                                    }
                                    placeholder="Detailed rationale and steps for candidates reviewing solutions..."
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-[#ffe600] outline-none"
                                />
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
