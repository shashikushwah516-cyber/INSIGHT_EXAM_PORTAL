import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Heart, Volume2, Keyboard, Award, ArrowUpRight } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

export default function Footer() {
    const { speak } = useSpeech();

    const handleReadFooter = () => {
        speak('Insight Exam Portal Accessible Digital Platform. Built to empower visually impaired and low vision candidates to prepare for and take competitive examinations independently. WCAG 2.2 AA compliant.');
    };

    return (
        <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 mt-auto transition-colors" role="contentinfo">
            {/* Top Bar / Accessibility Notice */}
            <div className="border-b border-neutral-800/80 bg-neutral-900/40 py-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                        <span className="font-semibold">WCAG 2.2 Level AA Accessible Platform Standard</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleReadFooter}
                        className="text-[#ffe600] hover:underline font-bold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#ffe600] rounded p-1"
                        aria-label="Listen to Audio Description of Insight Exam Portal"
                    >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Listen to Platform Summary</span>
                    </button>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Column (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="flex items-center gap-3 group inline-flex" aria-label="Insight Exam Portal Home">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffe600] via-yellow-400 to-amber-500 flex items-center justify-center text-black font-black shadow-md shrink-0">
                                <BookOpen className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-white group-hover:text-[#ffe600] transition-colors leading-tight">
                                    Insight Exam Portal
                                </span>
                                <span className="text-xs font-bold text-[#ffe600] uppercase tracking-wider">
                                    Accessible Digital Platform
                                </span>
                            </div>
                        </Link>

                        <p className="text-sm text-neutral-300 max-w-sm leading-relaxed">
                            A production-grade competitive examination and practice ecosystem engineered specifically for visually impaired candidates, featuring self-reading audio speech, keyboard-only control, and high-contrast ergonomics.
                        </p>

                        <div className="pt-2 flex items-center gap-3 text-xs text-neutral-400">
                            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 font-mono text-[#ffe600]">
                                React + Tailwind CSS
                            </span>
                            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 font-mono text-cyan-400">
                                WCAG 2.2 AA
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links Column */}
                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                            Platform Navigation
                        </h2>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/" className="hover:text-white transition focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded">
                                    Home / Overview
                                </Link>
                            </li>
                            <li>
                                <Link to="/exams" className="hover:text-white transition focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded">
                                    Available Exams
                                </Link>
                            </li>
                            <li>
                                <Link to="/practice" className="hover:text-white transition focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded">
                                    Practice & Mock Tests
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-white transition focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded">
                                    Student Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin" className="hover:text-white transition focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded">
                                    Admin Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Accessibility Suite Column */}
                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                            Accessibility Suite
                        </h2>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/accessibility" className="hover:text-[#ffe600] transition focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded">
                                    Contrast Themes
                                </Link>
                            </li>
                            <li>
                                <Link to="/accessibility" className="hover:text-[#ffe600] transition focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded">
                                    Speech Rate & Pitch
                                </Link>
                            </li>
                            <li>
                                <span className="text-neutral-400">
                                    Bilingual TTS (EN & HI)
                                </span>
                            </li>
                            <li>
                                <span className="text-neutral-400">
                                    Voice Command Dictation
                                </span>
                            </li>
                            <li>
                                <span className="text-neutral-400">
                                    Zero-Mouse Keyboard Flow
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Evaluation Column */}
                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                            Evaluator Accounts
                        </h2>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs space-y-2 font-mono">
                            <div>
                                <span className="text-[#ffe600] font-bold block">Candidate Demo:</span>
                                <span className="text-white">CAND101 / candidate123</span>
                            </div>
                            <div className="pt-1 border-t border-neutral-800">
                                <span className="text-cyan-400 font-bold block">Administrator Demo:</span>
                                <span className="text-white">ADMIN001 / admin123</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
                    <p>© 2026 Insight Exam Portal. Universal Accessibility Standard for Competitive Exams.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/accessibility" className="hover:text-white transition">Accessibility Statement</Link>
                        <Link to="/login" className="hover:text-[#ffe600] transition">Candidate Login</Link>
                        <Link to="/register" className="hover:text-cyan-400 transition">Register Account</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
