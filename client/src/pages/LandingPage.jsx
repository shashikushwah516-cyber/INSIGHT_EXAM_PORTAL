import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen,
    Volume2,
    Keyboard,
    Mic,
    CheckCircle,
    ArrowRight,
    Award,
    Shield,
    Sliders,
    PlayCircle,
    Target,
    HelpCircle,
    ChevronDown,
    Zap,
    Clock,
    Sparkles,
    Check
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function LandingPage() {
    const { speak } = useSpeech();
    const { isAuthenticated, isAdmin } = useAuth();
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        const welcome = 'Welcome to the Insight Exam Portal Accessible Digital Platform. Built to empower visually impaired and low vision candidates to independently take competitive examinations. Use Tab to navigate.';
        speak(welcome);
    }, [speak]);

    const faqs = [
        {
            q: 'How does a candidate take exams independently without a human scribe?',
            a: 'The platform integrates native text-to-speech audio engines that automatically read questions, options, timers, and alerts aloud in English or Hindi. Candidates use standard keyboard keys (1-4 for options, arrows for navigation) or voice dictation to answer questions.'
        },
        {
            q: 'What keyboard shortcuts are available during an exam?',
            a: 'You can navigate with Arrow keys or N/P, select options with 1, 2, 3, or 4, re-read the question with R, toggle Mark for Review with M, clear your answer with C, and check remaining time with T. Press ? or H at any time to open the guide.'
        },
        {
            q: 'Can low-vision candidates customize colors and text sizes?',
            a: 'Yes! Candidates can select between 4 high-contrast themes (Yellow on Black, Cyan on Navy, Standard Dark, and Soft Light) and scale text from Normal (16px) to Large (19px) and Extra Large (22px).'
        },
        {
            q: 'Are answers automatically saved if the network drops?',
            a: 'Yes. Answers are saved immediately to both client local storage and the server with atomic auto-save timestamps. In case of disruption, candidate progress is preserved.'
        }
    ];

    const toggleFaq = (idx) => {
        setOpenFaq(openFaq === idx ? null : idx);
        if (openFaq !== idx) {
            speak(`${faqs[idx].q}. ${faqs[idx].a}`);
        }
    };

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
                    {/* 1. HERO SECTION */}
                    <section className="text-center pt-4 sm:pt-8 pb-12 sm:pb-16 bg-gradient-to-b from-neutral-900/90 to-neutral-950 border-2 border-neutral-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffe600]/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 max-w-4xl mx-auto">
                            {/* Standard Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800 text-[#ffe600] text-xs sm:text-sm font-bold mb-6 border border-neutral-700 shadow-sm">
                                <Award className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                <span>WCAG 2.2 Level AA Accessible Digital Platform</span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                                Independent Competitive Examinations for <span className="text-[#ffe600]">Visually Impaired Candidates</span>
                            </h1>

                            <p className="text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
                                A universally accessible examination and practice environment featuring self-reading audio speech, zero-mouse keyboard-first flow, high-contrast visual ergonomics, and bilingual voice commands.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
                                {isAuthenticated ? (
                                    <Link
                                        to={isAdmin ? '/admin' : '/dashboard'}
                                        className="btn-primary h-13 px-8 text-base shadow-xl shadow-yellow-500/10"
                                    >
                                        <span>Go to {isAdmin ? 'Admin Console' : 'Student Dashboard'}</span>
                                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="btn-primary h-12 px-7 text-base shadow-xl shadow-yellow-500/10"
                                        >
                                            <span>Student Login</span>
                                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="btn-secondary h-12 px-7 text-base"
                                        >
                                            <span>Register Candidate</span>
                                        </Link>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        speak(
                                            'Insight Exam Portal enables visually impaired candidates to take competitive tests independently. All questions, options, and countdown timers are read aloud. Use 1 to 4 to select answers, arrow keys to navigate questions, and M to mark for review.'
                                        )
                                    }
                                    className="btn-outline h-12 px-6 text-sm"
                                    aria-label="Listen to Audio Introduction of Platform"
                                >
                                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                                    <span>Listen to Audio Overview</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 2. HOW IT WORKS (STEP-BY-STEP) */}
                    <section aria-labelledby="how-it-works-title">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#ffe600] block mb-2">
                                Seamless Candidate Journey
                            </span>
                            <h2 id="how-it-works-title" className="text-2xl sm:text-4xl font-black text-white">
                                How Insight Exam Portal Works
                            </h2>
                            <p className="text-neutral-400 text-sm sm:text-base mt-2">
                                Built from the ground up so that candidates can practice, prepare, and take examinations without requiring human assistance.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="panel-card bg-neutral-900/60 border-neutral-800 relative">
                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-[#ffe600] font-black text-lg flex items-center justify-center mb-4">
                                    1
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Setup Preferences</h3>
                                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                                    Configure speech rate, audio pitch, language (English / Hindi), and contrast theme to fit your visual or hearing needs.
                                </p>
                            </div>

                            <div className="panel-card bg-neutral-900/60 border-neutral-800 relative">
                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-cyan-400 font-black text-lg flex items-center justify-center mb-4">
                                    2
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Practice & Mock Tests</h3>
                                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                                    Practice with random subject questions. Receive instant audio explanations and accuracy feedback after each question.
                                </p>
                            </div>

                            <div className="panel-card bg-neutral-900/60 border-neutral-800 relative">
                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-emerald-400 font-black text-lg flex items-center justify-center mb-4">
                                    3
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Timed Examination</h3>
                                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                                    Enter the secure exam window. Questions are self-reading, options are keyed (1-4), and answers auto-save securely to the server.
                                </p>
                            </div>

                            <div className="panel-card bg-neutral-900/60 border-neutral-800 relative">
                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-purple-400 font-black text-lg flex items-center justify-center mb-4">
                                    4
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Results & Review</h3>
                                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                                    Instantly inspect your scorecard, review correct answers with detailed audio explanations, and track your performance trends.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. CORE ACCESSIBILITY PILLARS */}
                    <section aria-labelledby="pillars-title">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                                Universal Design Architecture
                            </span>
                            <h2 id="pillars-title" className="text-2xl sm:text-4xl font-black text-white">
                                Engineered for Complete Independence
                            </h2>
                            <p className="text-neutral-400 text-sm sm:text-base mt-2">
                                Meeting international accessibility standards while giving candidates natural control over their testing experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="panel-card panel-card-hover bg-neutral-900/80 border-neutral-800 p-6">
                                <div className="w-12 h-12 rounded-xl bg-[#ffe600]/10 flex items-center justify-center mb-4 text-[#ffe600] border border-[#ffe600]/20">
                                    <Volume2 className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Self-Reading TTS</h3>
                                <p className="text-neutral-300 text-sm leading-relaxed">
                                    Hear questions, options, instructions, and timers read aloud in English or Hindi with configurable speeds and pitch.
                                </p>
                            </div>

                            <div className="panel-card panel-card-hover bg-neutral-900/80 border-neutral-800 p-6">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400 border border-cyan-500/20">
                                    <Keyboard className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Keyboard-First Flow</h3>
                                <p className="text-neutral-300 text-sm leading-relaxed">
                                    Zero mouse dependency. Navigate questions with Arrow keys, select options with 1-4, mark for review with M, and clear with C.
                                </p>
                            </div>

                            <div className="panel-card panel-card-hover bg-neutral-900/80 border-neutral-800 p-6">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400 border border-emerald-500/20">
                                    <Mic className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Voice Commands</h3>
                                <p className="text-neutral-300 text-sm leading-relaxed">
                                    Hands-free voice recognition support for answering, navigating, and submitting examinations with bilingual speech commands.
                                </p>
                            </div>

                            <div className="panel-card panel-card-hover bg-neutral-900/80 border-neutral-800 p-6">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400 border border-purple-500/20">
                                    <Sliders className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">High Contrast Themes</h3>
                                <p className="text-neutral-300 text-sm leading-relaxed">
                                    Four accessible themes including Yellow-on-Black and Cyan-on-Navy, paired with text scaling up to 22px for low-vision clarity.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. EXAMINATION MODULES & PRACTICE OVERVIEW */}
                    <section className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-10" aria-labelledby="modules-title">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 pb-6 border-b border-neutral-800">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-[#ffe600] block mb-1">
                                    Curriculum & Subjects
                                </span>
                                <h2 id="modules-title" className="text-2xl sm:text-3xl font-black text-white">
                                    Competitive Exam Subjects
                                </h2>
                                <p className="text-neutral-300 text-sm mt-1">
                                    Real-world question bank categorized by subject with full audio explanations.
                                </p>
                            </div>

                            <div className="flex gap-3 shrink-0">
                                <Link to="/exams" className="btn-primary h-11 text-xs sm:text-sm">
                                    <PlayCircle className="w-4 h-4" aria-hidden="true" />
                                    <span>View Timed Exams</span>
                                </Link>
                                <Link to="/practice" className="btn-secondary h-11 text-xs sm:text-sm">
                                    <Target className="w-4 h-4" aria-hidden="true" />
                                    <span>Practice Modules</span>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                                <span className="text-xs font-mono font-bold text-[#ffe600] block mb-1">01 / QUANTITATIVE</span>
                                <h3 className="text-base font-bold text-white mb-1">Quantitative Aptitude</h3>
                                <p className="text-xs text-neutral-400">Arithmetic, percentages, ratios, and algebra optimized for self-reading audio.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                                <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">02 / REASONING</span>
                                <h3 className="text-base font-bold text-white mb-1">Logical Reasoning</h3>
                                <p className="text-xs text-neutral-400">Deductive sequences, syllogisms, and coding problems structured for screen readers.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">03 / ENGLISH</span>
                                <h3 className="text-base font-bold text-white mb-1">English Comprehension</h3>
                                <p className="text-xs text-neutral-400">Grammar, vocabulary, antonyms, and passage comprehension with adjustable speech speeds.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                                <span className="text-xs font-mono font-bold text-purple-400 block mb-1">04 / GENERAL</span>
                                <h3 className="text-base font-bold text-white mb-1">General Awareness</h3>
                                <p className="text-xs text-neutral-400">Current affairs, Indian polity, constitution, and general science updates.</p>
                            </div>
                        </div>
                    </section>

                    {/* 5. FREQUENTLY ASKED QUESTIONS */}
                    <section aria-labelledby="faq-title" className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#ffe600] block mb-2">
                                Support & Guidance
                            </span>
                            <h2 id="faq-title" className="text-2xl sm:text-3xl font-black text-white">
                                Frequently Asked Questions
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="panel-card bg-neutral-900 border-neutral-800 overflow-hidden p-0"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        aria-expanded={openFaq === idx}
                                        className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-white hover:text-[#ffe600] transition"
                                    >
                                        <span className="text-base sm:text-lg">{faq.q}</span>
                                        <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#ffe600]' : ''}`} />
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-5 pb-5 pt-1 text-neutral-300 text-sm leading-relaxed border-t border-neutral-800 animate-in fade-in duration-150">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 6. EVALUATOR DEMO CREDENTIALS */}
                    <section className="panel-card bg-neutral-950 border-2 border-neutral-700/80 p-6 sm:p-8 rounded-3xl max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                            <h2 className="text-xl font-bold text-white">
                                Hackathon Evaluation Credentials
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-6">
                            Pre-seeded accounts are ready for testing candidate and administrator experiences:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
                            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                                <span className="text-xs text-[#ffe600] font-bold block mb-1">CANDIDATE SESSION</span>
                                <p className="text-neutral-300">Roll: <span className="text-white font-bold">CAND101</span></p>
                                <p className="text-neutral-300">Password: <span className="text-white font-bold">candidate123</span></p>
                            </div>
                            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                                <span className="text-xs text-cyan-400 font-bold block mb-1">ADMINISTRATOR SESSION</span>
                                <p className="text-neutral-300">Roll: <span className="text-white font-bold">ADMIN001</span></p>
                                <p className="text-neutral-300">Password: <span className="text-white font-bold">admin123</span></p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </PublicLayout>
    );
}
