import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, ShieldCheck, Volume2 } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

export default function AuthLayout({ children, title, subtitle }) {
    const { speak } = useSpeech();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between transition-colors">
            {/* Minimal Accessible Top Header */}
            <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#ffe600] rounded-xl p-1"
                        aria-label="Insight Exam Portal Accessible Digital Platform - Return to Home"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffe600] via-yellow-400 to-amber-500 flex items-center justify-center text-black font-black shadow-md">
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

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => speak(`${title || 'Authentication'}. ${subtitle || 'Please fill in your credentials to continue.'}`)}
                            className="p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-[#ffe600] hover:border-[#ffe600] text-xs font-bold flex items-center gap-1.5 transition"
                            aria-label="Listen to page instructions"
                        >
                            <Volume2 className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                            <span className="hidden sm:inline">Read Instructions</span>
                        </button>

                        <Link
                            to="/"
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white px-3 py-2 rounded-xl border border-neutral-800 hover:border-neutral-700 transition"
                        >
                            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Form Area */}
            <main id="main-content" className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
                <div className="w-full max-w-md sm:max-w-lg">
                    {children}
                </div>
            </main>

            {/* Bottom Accessibility Notice & Demo Credentials */}
            <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 px-4 sm:px-6 text-center text-xs text-neutral-400">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-neutral-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                        <span>Protected by 256-bit Secure Exam Authentication</span>
                    </div>
                    <p>© 2026 Insight Exam Portal • Universally Accessible Digital Platform</p>
                </div>
            </footer>
        </div>
    );
}
