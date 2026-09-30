import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Volume2, Award, Sparkles } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

export default function Footer() {
    const { speak } = useSpeech();

    const handleReadFooter = () => {
        speak('Insight Exam Portal Accessible Digital Platform. Built to empower visually impaired and low vision candidates to prepare for and take competitive examinations independently. WCAG 2.2 AA compliant.');
    };

    return (
        <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-color)] text-[var(--text-secondary)] mt-auto transition-colors" role="contentinfo">
            {/* Top Bar / Accessibility Notice */}
            <div className="border-b border-[var(--border-color)] bg-[var(--bg-primary)] py-3">
                <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--success)]" aria-hidden="true" />
                        <span className="font-semibold">WCAG 2.2 Level AA Accessible Platform Standard</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleReadFooter}
                        className="text-[var(--primary)] hover:opacity-80 font-bold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded p-1 cursor-pointer"
                        aria-label="Listen to Audio Description of Insight Exam Portal"
                    >
                        <Volume2 className="w-3.5 h-3.5 text-[var(--primary)]" aria-hidden="true" />
                        <span>Listen to Platform Summary</span>
                    </button>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="container-app py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Column (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="flex items-center gap-3 group inline-flex" aria-label="Insight Exam Portal Home">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-[var(--bg-primary)] font-black shadow-xs shrink-0 border border-[var(--border-color)]">
                                <BookOpen className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                                    Insight Exam Portal
                                </span>
                                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                                    Accessible Digital Platform
                                </span>
                            </div>
                        </Link>

                        <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
                            A production-grade competitive examination and practice ecosystem engineered specifically for visually impaired candidates, featuring self-reading audio speech, keyboard-only control, and high-contrast ergonomics.
                        </p>

                        <div className="pt-2 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                            <span className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-[var(--primary)] font-semibold shadow-2xs">
                                React + Tailored CSS Tokens
                            </span>
                            <span className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-[var(--success)] font-semibold shadow-2xs">
                                WCAG 2.2 AA
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links Column */}
                    <div>
                        <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                            Platform Navigation
                        </h2>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    Home / Overview
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    About Platform
                                </Link>
                            </li>
                            <li>
                                <Link to="/how-it-works" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link to="/exams" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    Available Exams
                                </Link>
                            </li>
                            <li>
                                <Link to="/practice" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    Practice & Mock Tests
                                </Link>
                            </li>
                            <li>
                                <Link to="/help" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    Help & Support Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    Contact & Helpline
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Accessibility Suite Column */}
                    <div>
                        <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                            Accessibility Suite
                        </h2>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/accessibility" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    Contrast Themes
                                </Link>
                            </li>
                            <li>
                                <Link to="/accessibility" className="hover:text-[var(--primary)] transition focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded">
                                    Speech Rate & Pitch
                                </Link>
                            </li>
                            <li>
                                <span className="text-[var(--text-muted)]">
                                    Bilingual TTS (EN & HI)
                                </span>
                            </li>
                            <li>
                                <span className="text-[var(--text-muted)]">
                                    Voice Command Dictation
                                </span>
                            </li>
                            <li>
                                <Link to="/help" className="text-[var(--primary)] hover:underline transition">
                                    Keyboard Shortcuts Cheatsheet
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Evaluation Column */}
                    <div>
                        <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                            Evaluator Accounts
                        </h2>
                        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-3 text-xs space-y-2 font-mono shadow-2xs">
                            <div>
                                <span className="text-[var(--primary)] font-bold block">Candidate Demo:</span>
                                <span className="text-[var(--text-primary)] font-medium">CAND101 / candidate123</span>
                            </div>
                            <div className="pt-1 border-t border-[var(--border-color)]">
                                <span className="text-[var(--success)] font-bold block">Administrator Demo:</span>
                                <span className="text-[var(--text-primary)] font-medium">ADMIN001 / admin123</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
                    <p>© 2026 Insight Exam Portal. Universal Accessibility Standard for Competitive Exams.</p>
                    <div className="flex flex-wrap items-center gap-6">
                        <Link to="/about" className="hover:text-[var(--primary)] transition">About</Link>
                        <Link to="/accessibility" className="hover:text-[var(--primary)] transition">Accessibility</Link>
                        <Link to="/help" className="hover:text-[var(--primary)] transition">Help Center</Link>
                        <Link to="/contact" className="hover:text-[var(--primary)] transition">Contact</Link>
                        <Link to="/login" className="hover:text-[var(--primary)] transition">Login</Link>
                        <Link to="/register" className="hover:text-[var(--primary)] transition">Register</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
