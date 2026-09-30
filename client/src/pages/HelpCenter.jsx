import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    HelpCircle,
    Keyboard,
    Volume2,
    BookOpen,
    PlayCircle,
    Award,
    Shield,
    Sliders,
    ChevronDown,
    Search,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Headphones,
    UserCheck
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function HelpCenter() {
    const { speak } = useSpeech();
    const { announce } = useAccessibility();
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategory, setOpenCategory] = useState(0);

    useEffect(() => {
        const text = 'Insight Exam Portal Help and Support Center. Find guides on keyboard controls, speech synthesis, taking examinations, and platform features. Use Tab to navigate help topics.';
        speak(text);
        announce(text, 'polite');
    }, [speak, announce]);

    const categories = [
        {
            id: 'keyboard',
            title: 'Controlled Keyboard Navigation Cheatsheet',
            icon: Keyboard,
            desc: 'Operate the entire examination and practice system with zero mouse dependency.',
            audioSummary: 'Keyboard Navigation Cheatsheet: Use Up and Down arrows to move between options. Press 1 through 4 to select options directly. Press Left and Right arrows to switch questions. Press Space to re-read current question. Press M to mark for review. Press T for remaining time. Press Alt plus A for the AI Assistant. Press Question mark or H for shortcut help.',
            items: [
                { key: '1, 2, 3, 4', action: 'Directly select Option 1, 2, 3, or 4 for the active question.' },
                { key: '↑ / ↓ (Up / Down)', action: 'Navigate between available multiple-choice options.' },
                { key: 'Enter', action: 'Confirm option selection or trigger focused action button.' },
                { key: '← / → (Left / Right)', action: 'Navigate to previous (Left) or next (Right) question.' },
                { key: 'Spacebar', action: 'Repeat audio readout of the current question statement and options.' },
                { key: 'M', action: 'Toggle "Mark for Review" status on the current question.' },
                { key: 'C or Backspace', action: 'Clear selected answer on the current question.' },
                { key: 'T', action: 'Announce remaining examination time aloud.' },
                { key: 'Alt + A', action: 'Open or close the Voice-First AI Assistant modal dialog.' },
                { key: '? or H', action: 'Open accessible Keyboard Shortcuts overlay guide anytime.' },
                { key: 'Escape', action: 'Close any active modal, dialog, or navigation menu.' }
            ]
        },
        {
            id: 'speech',
            title: 'Speech Synthesis & Text-to-Speech (TTS)',
            icon: Volume2,
            desc: 'Self-reading exam narration engine using modern browser speech synthesis.',
            audioSummary: 'Speech synthesis guide: Questions and options read aloud automatically upon question changes. You can adjust speech speed from 0.75x to 1.5x in Accessibility Settings. Both English and Hindi are fully supported.',
            items: [
                { key: 'Auto-Read Mode', action: 'Questions and options are automatically voiced when switching questions.' },
                { key: 'Speed Control', action: 'Set speech rate from 0.75x (slower) to 1.5x (faster) in Accessibility Settings.' },
                { key: 'Pitch Control', action: 'Adjust voice frequency to your preferred pitch level.' },
                { key: 'Bilingual Support', action: 'Supports both standard English (US/IN) and Hindi (हिन्दी) synthesis.' },
                { key: 'Mute / Unmute', action: 'Quickly toggle voice reading from top navigation bar anytime.' }
            ]
        },
        {
            id: 'exams',
            title: 'Taking Examinations & Auto-Save Assurance',
            icon: BookOpen,
            desc: 'Step-by-step guidance on timed assessments and connection safety.',
            audioSummary: 'Taking examinations: Answers auto-save to both local browser storage and database upon selection. Timers alert at 10 minutes and 5 minutes remaining. Results provide comprehensive breakdown by topic.',
            items: [
                { key: 'Instant Auto-Save', action: 'Every selection is immediately recorded to prevent accidental data loss.' },
                { key: 'Audio Timers', action: 'Spoken warnings sound at 10 minutes, 5 minutes, and 1 minute remaining.' },
                { key: 'Review Palette', action: 'Visual and screen-reader-friendly palette displays answered, flagged, and unanswered items.' },
                { key: 'Detailed Scorecards', action: 'Instant score reports with accuracy rates, percentile indicators, and full solution explanations.' }
            ]
        },
        {
            id: 'modes',
            title: 'The Four Accessibility Color Modes',
            icon: Sliders,
            desc: 'Tailored visual ergonomics designed for maximum contrast and low-vision ease.',
            audioSummary: 'Four color modes are available: Clean Light Default, High Contrast Yellow on Black, High Contrast Cyan on Navy, and Standard Dark Mode.',
            items: [
                { key: 'Clean Light', action: 'Crisp white surfaces with executive blue accents and deep slate typography.' },
                { key: 'Yellow on Black', action: 'Deep black background with vivid yellow highlights for maximum contrast acuity.' },
                { key: 'Cyan on Navy', action: 'Midnight navy background with glowing cyan accents for low-light comfort.' },
                { key: 'Standard Dark', action: 'Subtle dark graphite background with gentle neutral contrast.' }
            ]
        }
    ];

    const filteredCategories = categories.filter((cat) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            cat.title.toLowerCase().includes(q) ||
            cat.desc.toLowerCase().includes(q) ||
            cat.items.some((i) => i.key.toLowerCase().includes(q) || i.action.toLowerCase().includes(q))
        );
    });

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-12 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
                <div className="container-app space-y-8">
                    {/* Header Banner */}
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-bold border border-[var(--border-color)] shadow-xs">
                            <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>Candidate Knowledge Base</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
                            Help & Support Center
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                            Master the voice-first accessible exam portal. Learn keyboard shortcuts, voice navigation, audio synthesis options, and assessment workflows.
                        </p>

                        {/* Search Input */}
                        <div className="mt-8 max-w-xl mx-auto relative">
                            <label htmlFor="help-search" className="sr-only">Search help topics</label>
                            <Search className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                            <input
                                id="help-search"
                                type="search"
                                placeholder="Search shortcuts, TTS, exams, practice..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] text-sm shadow-xs transition"
                            />
                        </div>
                    </div>

                    {/* Quick Demo Credentials Box */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] border border-[var(--border-color)] text-[var(--primary)] flex items-center justify-center shrink-0">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-[var(--text-primary)]">Evaluator & Demonstration Accounts</h2>
                                <p className="text-xs text-[var(--text-secondary)]">Ready-to-test credentials for immediate evaluation.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                            <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]">
                                <span className="text-[var(--primary)] font-bold">Candidate:</span> CAND101 / candidate123
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]">
                                <span className="text-[var(--success)] font-bold">Admin:</span> ADMIN001 / admin123
                            </div>
                        </div>
                    </div>

                    {/* Categories Accordion */}
                    <div className="space-y-6">
                        {filteredCategories.map((cat, idx) => {
                            const IconComponent = cat.icon;
                            const isOpen = openCategory === idx;
                            return (
                                <div
                                    key={cat.id}
                                    className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl shadow-sm overflow-hidden transition"
                                >
                                    {/* Accordion Header */}
                                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-color)]">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--primary)] shrink-0 shadow-xs">
                                                <IconComponent className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-snug">
                                                    {cat.title}
                                                </h2>
                                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                                                    {cat.desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => speak(cat.audioSummary)}
                                                className="h-10 px-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-color)] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                                aria-label={`Listen to summary of ${cat.title}`}
                                            >
                                                <Volume2 className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                                                <span>Listen</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setOpenCategory(isOpen ? -1 : idx)}
                                                className="h-10 px-3.5 rounded-xl bg-[var(--primary-subtle)] hover:opacity-90 text-[var(--primary)] text-xs font-bold border border-[var(--border-color)] flex items-center gap-1 transition cursor-pointer"
                                                aria-expanded={isOpen}
                                                aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${cat.title}`}
                                            >
                                                <span>{isOpen ? 'Collapse' : 'Details'}</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Accordion Body */}
                                    {isOpen && (
                                        <div className="p-6 bg-[var(--bg-surface)]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {cat.items.map((item, iIdx) => (
                                                    <div
                                                        key={iIdx}
                                                        className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex flex-col justify-between"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <kbd className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-xs font-bold text-[var(--text-primary)] shadow-xs">
                                                                {item.key}
                                                            </kbd>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                                                            {item.action}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Contact & Support Help Box */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl text-center md:text-left">
                            <h2 className="text-2xl sm:text-3xl font-black">Need Direct Assistance?</h2>
                            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                                Our accessible support helpline is available for candidates requiring guidance on assistive device configuration or examination enrollment.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/contact"
                                className="h-12 px-6 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 font-bold text-sm flex items-center gap-2 shadow-sm transition"
                            >
                                <span>Contact Support Desk</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                            <Link
                                to="/accessibility"
                                className="h-12 px-6 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-primary)] font-bold text-sm flex items-center gap-2 transition"
                            >
                                <Sliders className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                                <span>Preferences</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}
