import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    BookOpen,
    Volume2,
    ShieldCheck,
    Award,
    Eye,
    Headphones,
    Keyboard,
    Zap,
    CheckCircle2,
    ArrowRight,
    Users,
    FileCheck,
    Cpu
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function AboutPlatform() {
    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        const text = 'About Insight Exam Portal. Professional voice-first accessible competitive examination platform. Built on the core principle: See it if you can, hear it if you need to, and operate it independently.';
        speak(text);
        announce(text, 'polite');
    }, [speak, announce]);

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-14 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
                <div className="container-app space-y-16">
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-xs sm:text-sm font-bold border border-[var(--border-color)] shadow-xs">
                            <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>WCAG 2.2 Level AA Accessible Platform Standard</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                            About <span className="text-[var(--primary)]">Insight Exam Portal</span>
                        </h1>

                        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-normal">
                            An inclusive, high-reliability competitive examination and practice ecosystem engineered to empower visually impaired candidates to prepare for, practice, and participate in formal examinations independently.
                        </p>

                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    speak(
                                        'Core Principle of Insight Exam Portal: See it if you can, hear it if you need to, and operate it independently. Our mission is to eliminate the need for human scribes by providing seamless digital audio narration, controlled keyboard navigation, and server-validated security.'
                                    )
                                }
                                className="h-11 px-5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)] text-[var(--primary)] font-bold border border-[var(--border-color)] flex items-center gap-2 text-sm transition shadow-xs cursor-pointer"
                                aria-label="Listen to Mission Statement"
                            >
                                <Volume2 className="w-4 h-4" aria-hidden="true" />
                                <span>Listen to Mission Statement</span>
                            </button>
                        </div>
                    </div>

                    {/* Mission Quote Banner */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-3xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
                        <div className="max-w-3xl mx-auto">
                            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--primary)] block mb-3">
                                Platform Vision
                            </span>
                            <blockquote className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                                &ldquo;See it if you can, hear it if you need to, and operate it independently.&rdquo;
                            </blockquote>
                            <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                                Accessibility is not a separate afterthought or a stripped-down text page. Insight Exam Portal integrates multi-modal parity: every single visual component, timer announcement, question status, and result analysis has an exact audio and keyboard counterpart.
                            </p>
                        </div>
                    </div>

                    {/* 3 Core Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] border border-[var(--border-color)] text-[var(--primary)] flex items-center justify-center mb-6">
                                    <Headphones className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Voice-First Self-Reading</h2>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    Native Web Speech synthesis reads questions, options, timer countdown warnings (30m, 15m, 10m, 5m, 1m), and auto-save confirmations aloud in English and Hindi without requiring external commercial screen readers.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--primary)]">
                                <span>Self-reliant audio interaction</span>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/15 border border-[var(--border-color)] text-[var(--success)] flex items-center justify-center mb-6">
                                    <Keyboard className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Controlled Keyboard Navigation</h2>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    Operate the entire testing environment with zero mouse dependency. Arrow keys cycle through options, numeric keys 1-4 directly select answers, Space repeats the current prompt, and M marks questions for review.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--success)]">
                                <span>Zero-mouse required workflow</span>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-[var(--warning)]/15 border border-[var(--border-color)] text-[var(--warning)] flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Server-Authoritative Security</h2>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    Answers are never exposed to client code during active tests. The server validates timers, saves progress atomically upon every option selection, and calculates official scores securely on submission.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--warning)]">
                                <span>Tamper-proof examination integrity</span>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
                        <div className="mb-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block mb-1">
                                Accessibility Innovation
                            </span>
                            <h2 className="text-2xl font-black text-[var(--text-primary)]">
                                Traditional Online Testing vs. Insight Exam Portal
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm" role="table">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold bg-[var(--bg-tertiary)]">
                                        <th className="py-3 px-4">Feature / Dimension</th>
                                        <th className="py-3 px-4 text-[var(--danger)]">Traditional Exam Platforms</th>
                                        <th className="py-3 px-4 text-[var(--success)]">Insight Exam Portal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">Visual Independence</td>
                                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">Requires a human scribe or assistant to read questions.</td>
                                        <td className="py-3.5 px-4 font-bold text-[var(--success)]">Candidate reads, listens, and answers completely independently.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">Input Controls</td>
                                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">Mouse-heavy radio buttons with unpredictable Tab orders.</td>
                                        <td className="py-3.5 px-4 font-bold text-[var(--success)]">Standardized keyboard shortcuts (1-4, Arrows, Space, M, T).</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">Timer Warnings</td>
                                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">Silent visual clock only; easy for low vision users to miss.</td>
                                        <td className="py-3.5 px-4 font-bold text-[var(--success)]">Audible warnings at 30m, 15m, 10m, 5m, and 1m remaining.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">Visual Ergonomics</td>
                                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">Fixed bright glare or dark unreadable prototype styling.</td>
                                        <td className="py-3.5 px-4 font-bold text-[var(--success)]">Clean SaaS light default + High Contrast Yellow/Black & Cyan/Navy.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">Answer Reliability</td>
                                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">Uncertain save status; answers can be lost if disconnected.</td>
                                        <td className="py-3.5 px-4 font-bold text-[var(--success)]">Immediate atomic server auto-save with audible confirmation.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* WCAG Compliance & Legal Frameworks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                                <span>Regulatory & Technical Standards</span>
                            </h2>
                            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
                                    <span><strong>WCAG 2.2 AA Compliance:</strong> Complete keyboard accessibility, 4.5:1 text contrast ratios, visible focus indicators, and semantic HTML5 headings.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
                                    <span><strong>RPwD Act 2016 Alignment:</strong> Designed to satisfy public examination accessibility guidelines for candidates with benchmark visual disabilities.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
                                    <span><strong>Screen Reader Parity:</strong> Fully tested with NVDA, JAWS, and VoiceOver via ARIA live regions and semantic form roles.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                                <span>Voice-First AI Assistant</span>
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                                Candidates can press <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded font-mono text-xs text-[var(--text-primary)]">Alt+A</kbd> at any time during practice or navigation to ask questions about platform controls, examination rules, or conceptual topics.
                            </p>
                            <div className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl text-xs text-[var(--text-secondary)] font-medium">
                                <span className="text-[var(--primary)] font-bold block mb-1">Active Exam Security Guardrail:</span>
                                The AI Assistant automatically disables exam answer assistance during live competitive examinations to preserve institutional test integrity.
                            </div>
                        </div>
                    </div>

                    {/* Final Call to Action */}
                    <div className="text-center pt-8 border-t border-[var(--border-color)]">
                        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-4">
                            Ready to Experience Independent Examination?
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-6 text-sm sm:text-base">
                            Create your free candidate account or start practicing with our audio question bank immediately.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="h-12 px-7 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 font-bold flex items-center gap-2 shadow-sm transition"
                            >
                                <span>Register Candidate Account</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                            <Link
                                to="/login"
                                className="h-12 px-7 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold border border-[var(--border-color)] shadow-xs transition"
                            >
                                <span>Sign In to Portal</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}
