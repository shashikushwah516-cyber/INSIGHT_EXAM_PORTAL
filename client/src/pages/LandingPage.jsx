import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import examService from '../services/examService';
import {
    BookOpen,
    Volume2,
    Keyboard,
    Clock,
    ArrowRight,
    Award,
    Shield,
    CheckCircle2,
    Sliders,
    PlayCircle,
    Target,
    HelpCircle,
    ChevronDown,
    Zap,
    Check,
    FileText,
    Headphones,
    Compass,
    Radio,
    Sparkles,
    Eye
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function LandingPage() {
    const { speak, cancel, speaking } = useSpeech();
    const { isAuthenticated, isAdmin } = useAuth();
    const { announce, preferences } = useAccessibility();

    const [liveExams, setLiveExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);
    const [demoOption, setDemoOption] = useState(2); // Option B selected by default

    useEffect(() => {
        const welcome = 'Welcome to Insight Exam Portal. Professional voice-first accessible competitive examination platform. Prepare, practice, and participate independently.';
        speak(welcome);
        announce(welcome, 'polite');
    }, [speak, announce]);

    // Load actual supported exams from backend database
    useEffect(() => {
        let isMounted = true;
        const fetchExams = async () => {
            try {
                const res = await examService.getExams();
                if (isMounted && res.success && res.exams?.length > 0) {
                    setLiveExams(res.exams.slice(0, 3));
                }
            } catch (err) {
                console.warn('Could not fetch exams for landing page:', err);
            } finally {
                if (isMounted) setLoadingExams(false);
            }
        };
        fetchExams();
        return () => { isMounted = false; };
    }, []);

    const faqs = [
        {
            q: 'How does a visually impaired candidate take exams independently?',
            a: 'The platform integrates the browser native Speech Synthesis API (window.speechSynthesis) to speak questions, options, status changes, and timer alerts automatically. Candidates can navigate entirely without a mouse using standardized keyboard controls (1-4 for options, arrows for navigation, Space to repeat).'
        },
        {
            q: 'What keyboard shortcuts are available during an examination?',
            a: 'Press Up/Down arrows to move between options, 1 through 4 to select options directly, Enter to confirm, Left/Right arrows to change questions, Spacebar to repeat the question and options, and M to mark for review. Press ? or H at any time to open the keyboard cheat sheet.'
        },
        {
            q: 'Are answers automatically saved if the connection drops?',
            a: 'Yes. Answers are saved immediately to both client local storage and the server database with atomic save confirmations. In case of momentary network disruption, candidate progress is preserved without data loss.'
        },
        {
            q: 'Can low-vision candidates customize colors and text sizes?',
            a: 'Yes! Candidates can select between 4 high-contrast themes (Clean Light Default, Yellow on Black, Cyan on Navy, and Soft Warm Light) and scale typography up to 22px in Accessibility Settings.'
        }
    ];

    const toggleFaq = (idx) => {
        setOpenFaq(openFaq === idx ? null : idx);
        if (openFaq !== idx) {
            speak(`${faqs[idx].q}. ${faqs[idx].a}`);
        }
    };

    const handleDemoOptionSelect = (optIndex, optText) => {
        setDemoOption(optIndex);
        speak(`Option ${optIndex}, ${optText}, selected. Answer saved.`);
    };

    return (
        <PublicLayout>
            <main id="main-content" className="py-6 sm:py-10">
                <div className="container-app space-y-16 sm:space-y-24">
                    
                    {/* 1. HERO SECTION (2-Column Responsive Layout) */}
                    <section aria-labelledby="hero-title" className="pt-2 sm:pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                            
                            {/* Left Column: Platform Pitch & Core CTAs */}
                            <div className="lg:col-span-7 space-y-6 text-left">
                                {/* Small Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 shadow-2xs">
                                    <Award className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                                    <span>Accessible Digital Examination Platform</span>
                                </div>

                                {/* Main Heading */}
                                <h1 id="hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] break-words">
                                    Independent Competitive Examinations for <span className="text-blue-600">Everyone</span>
                                </h1>

                                {/* Supporting Text */}
                                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                                    Prepare, practice, and participate in competitive examinations through an accessible digital environment engineered with controlled keyboard navigation, built-in voice assistance, and high-contrast ergonomics.
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Link
                                        to="/exams"
                                        className="btn-primary"
                                        aria-label="Explore Examinations"
                                    >
                                        <span>Explore Exams</span>
                                        <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                                    </Link>

                                    <Link
                                        to="/practice"
                                        className="btn-secondary"
                                        aria-label="Start Practice Session"
                                    >
                                        <Target className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                                        <span>Start Practice</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            speak(
                                                'Insight Exam Portal enables visually impaired candidates to prepare for, practice, and take competitive examinations independently. Questions and options are self-reading, answers auto-save, and controls can be operated with zero mouse dependency.'
                                            )
                                        }
                                        className="btn-secondary"
                                        aria-label="Listen to Audio Introduction of Platform"
                                    >
                                        <Volume2 className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                                        <span>Listen to Overview</span>
                                    </button>
                                </div>

                                {/* Feature Checkmarks */}
                                <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                        <span>Zero-Mouse Keyboard Flow</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                        <span>Built-in Speech Synthesis</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                        <span>WCAG 2.2 Level AA Standard</span>
                                    </span>
                                </div>
                            </div>

                            {/* Right Column: Clean Accessibility-Focused Visual Exam Card */}
                            <div className="lg:col-span-5">
                                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md shadow-slate-100 relative">
                                    
                                    {/* Exam Card Header */}
                                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                                            <span className="text-xs font-bold text-slate-800">Live Exam Simulation</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-mono font-bold border border-blue-200 flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-blue-600" />
                                                <span>44:18 left</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Question Header */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                        <span className="font-bold text-blue-700">Question 5 of 20</span>
                                        <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">General Awareness</span>
                                    </div>

                                    {/* Question Text */}
                                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-4">
                                        Which schedule of the Constitution of India specifies the official languages recognized by the Union?
                                    </p>

                                    {/* Interactive Option Cards */}
                                    <div className="space-y-2 mb-4" role="radiogroup" aria-label="Demo Question Options">
                                        {[
                                            { id: 1, label: 'Seventh Schedule' },
                                            { id: 2, label: 'Eighth Schedule' },
                                            { id: 3, label: 'Ninth Schedule' },
                                            { id: 4, label: 'Tenth Schedule' }
                                        ].map((opt) => {
                                            const isSelected = demoOption === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    onClick={() => handleDemoOptionSelect(opt.id, opt.label)}
                                                    className={`w-full p-2.5 sm:p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold flex items-start justify-between gap-3 transition ${
                                                        isSelected
                                                            ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-2xs'
                                                            : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2.5 min-w-0">
                                                        <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                                                            isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                                                        }`}>
                                                            {opt.id}
                                                        </span>
                                                        <span className="break-words pt-0.5">{opt.label}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Card Footer Bar */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Answer Auto-Saved</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (speaking) {
                                                    cancel();
                                                } else {
                                                    speak(
                                                        'Question 5 of 20: Which schedule of the Constitution of India specifies the official languages recognized by the Union? Option 1: Seventh Schedule. Option 2: Eighth Schedule. Option 3: Ninth Schedule. Option 4: Tenth Schedule.',
                                                        { force: true }
                                                    );
                                                }
                                            }}
                                            className={`font-bold flex items-center gap-1 cursor-pointer transition ${
                                                speaking ? 'text-amber-600 animate-pulse' : 'text-blue-700 hover:text-blue-900'
                                            }`}
                                            aria-label="Speak Demo Question Aloud"
                                        >
                                            <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'text-amber-600' : 'text-blue-600'}`} />
                                            <span>{speaking ? 'Stop Reading' : 'Read Aloud'}</span>
                                        </button>
                                    </div>

                                    {/* Keyboard Navigation Cheatsheet tag */}
                                    <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-600">
                                        <span>[1-4] Select</span>
                                        <span>[Space] Repeat</span>
                                        <span>[Enter] Confirm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. HOW IT WORKS (3-4 Step Process) */}
                    <section id="how-it-works" aria-labelledby="how-it-works-heading">
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1.5">
                                Simplified Candidate Journey
                            </span>
                            <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                How Insight Exam Portal Works
                            </h2>
                            <p className="text-slate-500 text-sm sm:text-base mt-2">
                                A structured 4-step workflow engineered so candidates can prepare, practice, and take examinations without human assistance.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-xs transition h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-sm flex items-center justify-center mb-4 shrink-0">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Register & Login</h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                    Sign in using your roll number or email. All form fields feature visible labels, clear error states, and voice announcements.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-xs transition h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-sm flex items-center justify-center mb-4 shrink-0">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Select Exam or Practice</h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                    Choose an official scheduled examination or practice by subject (General Knowledge, Reasoning, Quantitative Aptitude).
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-xs transition h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-sm flex items-center justify-center mb-4 shrink-0">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Keyboard & Voice Flow</h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                    Listen to self-reading questions, select options with numeric keys 1-4, navigate with arrow keys, and auto-save answers.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-xs transition h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-sm flex items-center justify-center mb-4 shrink-0">
                                    04
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Submit & View Results</h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                    Server-authoritative scoring computes marks, deductions, and percentage instantly with complete audio review and solutions.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. ACCESSIBLE EXAMINATION ARCHITECTURE */}
                    <section aria-labelledby="accessible-exam-heading">
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1.5">
                                Universal Design Architecture
                            </span>
                            <h2 id="accessible-exam-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Accessible Examination Architecture
                            </h2>
                            <p className="text-slate-500 text-sm sm:text-base mt-2">
                                Accessibility is integrated directly into the core examination engine, ensuring complete candidate autonomy.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shrink-0">
                                    <Headphones className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Voice-First Self-Reading</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Native Web Speech synthesis (window.speechSynthesis) vocalizes questions, options, countdown alerts, and save confirmations without external paid tools.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shrink-0">
                                    <Keyboard className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Controlled Keyboard Flow</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Up/Down arrows cycle options, numeric keys 1-4 directly select answers, Left/Right change questions, and Spacebar repeats the current prompt.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 shrink-0">
                                    <Shield className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Atomic Server Auto-Save</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Every candidate selection is saved to the database immediately. The interface announces "Answer saved" to eliminate anxiety over connection drops.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shrink-0">
                                    <Clock className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Audible Timer Warnings</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Spoken alerts automatically trigger at 30 minutes, 15 minutes, 10 minutes, 5 minutes, and 1 minute remaining, preventing silent timeouts.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4 shrink-0">
                                    <Compass className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Visual & Auditory Parity</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Every visual question state (Answered, Unanswered, Marked for Review) has an exact spoken audio and ARIA live region counterpart.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-start">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shrink-0">
                                    <Sparkles className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">Independent Operation</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Designed so visually impaired and low-vision candidates can sit for formal examinations without relying on a human scribe or assistant.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. PRACTICE & PREPARATION */}
                    <section aria-labelledby="practice-prep-heading">
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xs">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/80">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                                        Practice Portal & Mock Tests
                                    </span>
                                    <h2 id="practice-prep-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Comprehensive Practice & Mock Tests
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Build examination confidence with instant audio feedback and step-by-step explanations.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 shrink-0">
                                    <Link to="/practice" className="btn-primary">
                                        <Target className="w-4 h-4" />
                                        <span>Open Practice Portal</span>
                                    </Link>
                                    <Link to="/exams" className="btn-secondary">
                                        <PlayCircle className="w-4 h-4 text-blue-600" />
                                        <span>Timed Mock Exams</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between">
                                    <div>
                                        <span className="text-[11px] font-mono font-bold text-blue-700 block mb-1">01 / SUBJECT DRILLS</span>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">Subject-Wise Practice</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">Filter questions by General Knowledge, Reasoning, or Quantitative Aptitude.</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between">
                                    <div>
                                        <span className="text-[11px] font-mono font-bold text-emerald-700 block mb-1">02 / INSTANT FEEDBACK</span>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">Instant Audio Answers</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">Hear whether your answer is correct immediately, followed by the conceptual explanation.</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between">
                                    <div>
                                        <span className="text-[11px] font-mono font-bold text-purple-700 block mb-1">03 / TIMED SIMULATION</span>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">Official Mock Tests</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">Simulate real examination pacing, negative marking rules, and time constraints.</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between">
                                    <div>
                                        <span className="text-[11px] font-mono font-bold text-amber-700 block mb-1">04 / PERFORMANCE</span>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">Topic Analytics</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">Review past scores, accuracy percentages, and average time per question.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. SUPPORTED EXAMINATIONS (Configurable from Database) */}
                    <section aria-labelledby="supported-exams-heading">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1.5">
                                    Examination Catalog
                                </span>
                                <h2 id="supported-exams-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Supported Competitive Examinations
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    All examinations are database-configured and fully verified for zero-mouse accessibility.
                                </p>
                            </div>
                            <Link to="/exams" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0">
                                <span>Browse All Examinations</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {loadingExams ? (
                            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-sm">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <span>Loading available examinations...</span>
                            </div>
                        ) : liveExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {liveExams.map((exam) => (
                                    <div
                                        key={exam._id || exam.id}
                                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between hover:shadow-xs hover:border-slate-300 transition h-full"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3 text-xs">
                                                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                                                    {exam.subject || 'Competitive Exam'}
                                                </span>
                                                <span className="font-mono text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {exam.durationMinutes} mins
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                                                {exam.title}
                                            </h3>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                                                {exam.description || 'Comprehensive evaluation covering multiple subject categories with full audio question narration.'}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                            <span className="text-slate-500 font-semibold">{exam.totalQuestions} Questions</span>
                                            <Link
                                                to={`/exams/${exam._id || exam.id}/instructions`}
                                                className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <span>View Exam</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center justify-between mb-3 text-xs">
                                            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                                                Aptitude & Reasoning
                                            </span>
                                            <span className="font-mono text-slate-500">60 mins</span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mb-2">Civil Services Aptitude Evaluation</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                            General studies, logical reasoning, and comprehension assessment structured with accessible screen reader labels.
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-slate-500">20 Questions</span>
                                        <Link to="/exams" className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                            <span>Explore</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center justify-between mb-3 text-xs">
                                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                                                Quantitative
                                            </span>
                                            <span className="font-mono text-slate-500">45 mins</span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mb-2">Banking & Financial Aptitude</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                            Numerical speed tests, data interpretation, and quantitative reasoning with audio readout of mathematical options.
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-slate-500">15 Questions</span>
                                        <Link to="/exams" className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                            <span>Explore</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center justify-between mb-3 text-xs">
                                            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-100">
                                                General Knowledge
                                            </span>
                                            <span className="font-mono text-slate-500">30 mins</span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mb-2">General Awareness & Polity</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                            Constitution of India, contemporary national events, and fundamental rights verified for audio clarity.
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-slate-500">20 Questions</span>
                                        <Link to="/exams" className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                            <span>Explore</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 6. ACCESSIBILITY SUITE HIGHLIGHTS */}
                    <section aria-labelledby="a11y-suite-heading">
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1.5">
                                Candidate Personalization
                            </span>
                            <h2 id="a11y-suite-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Accessibility Settings & Ergonomics
                            </h2>
                            <p className="text-slate-500 text-sm sm:text-base mt-2">
                                Customize your auditory, visual, and operational preferences to your exact comfort level.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                        <Volume2 className="w-5 h-5 stroke-[2.2]" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-1">Speech Speed & Voice</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                                        Choose speech playback speeds from 0.75x to 2.0x and adjust utterance volume to match your pace.
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold text-blue-600 pt-2 border-t border-slate-100">0.75x - 2.0x Speeds</span>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                        <Eye className="w-5 h-5 stroke-[2.2]" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-1">High Contrast Themes</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                                        Switch between Clean Light, Yellow-on-Black, Cyan-on-Navy, and Soft Warm Light.
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold text-amber-600 pt-2 border-t border-slate-100">4 Ergonomic Themes</span>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                        <FileText className="w-5 h-5 stroke-[2.2]" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-1">Text Sizing Scaling</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                                        Scale font sizes from Normal (16px) to Large (19px) and Extra-Large (22px) seamlessly.
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-600 pt-2 border-t border-slate-100">Up to 22px Typography</span>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                                        <Keyboard className="w-5 h-5 stroke-[2.2]" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-1">Zero-Mouse Keyboard</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                                        Full application-level keyboard shortcuts for options, questions, review, and time announcements.
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold text-purple-600 pt-2 border-t border-slate-100">Pure Keyboard Flow</span>
                            </div>
                        </div>
                    </section>

                    {/* 7. FREQUENTLY ASKED QUESTIONS */}
                    <section aria-labelledby="landing-faq-heading" className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                                Questions & Answers
                            </span>
                            <h2 id="landing-faq-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Frequently Asked Questions
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        aria-expanded={openFaq === idx}
                                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition"
                                    >
                                        <span className="text-sm sm:text-base">{faq.q}</span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-4 sm:px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 8. CALL TO ACTION SECTION */}
                    <section aria-labelledby="cta-heading" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 sm:p-12 shadow-sm text-center">
                        <div className="max-w-2xl mx-auto space-y-4">
                            <h2 id="cta-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Ready to Begin Your Accessible Examination Preparation?
                            </h2>
                            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                                Join candidates preparing independently for competitive examinations with full voice assistance and keyboard control.
                            </p>
                            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                                <Link
                                    to="/exams"
                                    className="h-11 px-6 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-xs transition"
                                >
                                    Explore Exams
                                </Link>
                                <Link
                                    to="/practice"
                                    className="h-11 px-6 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white border border-blue-400/40 font-bold text-sm transition"
                                >
                                    Start Practice
                                </Link>
                                {!isAuthenticated && (
                                    <Link
                                        to="/register"
                                        className="h-11 px-6 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-white border border-blue-400/20 font-bold text-sm transition"
                                    >
                                        Register Candidate
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </PublicLayout>
    );
}
