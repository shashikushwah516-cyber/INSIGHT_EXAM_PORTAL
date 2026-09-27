import React, { useEffect } from 'react';
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
    Sliders
} from 'lucide-react';

export default function LandingPage() {
    const { speak } = useSpeech();
    const { isAuthenticated, isAdmin } = useAuth();

    useEffect(() => {
        // Announce welcome message on load
        const welcome = 'Welcome to the Accessible Online Examination and Practice Platform for Visually Impaired Candidates. Use Tab to navigate or press Enter on Start Examination.';
        speak(welcome);
    }, [speak]);

    return (
        <main id="main-content" className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <section className="text-center py-12 px-6 bg-neutral-900 border-2 border-neutral-800 rounded-2xl mb-12 shadow-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800 text-[#ffe600] text-sm font-semibold mb-6 border border-neutral-700">
                    <Award className="w-4 h-4" aria-hidden="true" />
                    <span>Universally Accessible Examination Standard</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
                    Accessible Online Examination & Practice Platform
                </h1>

                <p className="text-lg sm:text-xl text-neutral-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                    Designed specifically for visually impaired and low-vision candidates to independently prepare for and participate in competitive examinations through universally accessible digital interfaces, keyboard navigation, and self-reading text-to-speech.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                    {isAuthenticated ? (
                        <Link
                            to={isAdmin ? '/admin' : '/dashboard'}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#ffe600] text-black font-bold text-lg rounded-xl hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition"
                        >
                            <span>Go to {isAdmin ? 'Admin Portal' : 'Candidate Dashboard'}</span>
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#ffe600] text-black font-bold text-lg rounded-xl hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition"
                            >
                                <span>Candidate Login</span>
                                <ArrowRight className="w-5 h-5" aria-hidden="true" />
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-800 text-white font-bold text-lg rounded-xl border border-neutral-700 hover:bg-neutral-700 transition"
                            >
                                <span>Register Account</span>
                            </Link>
                        </>
                    )}

                    <button
                        onClick={() =>
                            speak(
                                'This platform allows you to take competitive examinations independently without requiring a human scribe. All questions, options, and timers can be read aloud. You can navigate questions using arrow keys and select options with keys 1 to 4.'
                            )
                        }
                        className="inline-flex items-center gap-2 px-6 py-4 bg-neutral-800 text-[#ffe600] font-bold text-lg rounded-xl border-2 border-[#ffe600] hover:bg-neutral-700 transition"
                        aria-label="Listen to Audio Introduction of Platform"
                    >
                        <Volume2 className="w-5 h-5" aria-hidden="true" />
                        <span>Listen to Audio Intro</span>
                    </button>
                </div>
            </section>

            {/* Core Accessibility Pillars */}
            <section className="mb-12" aria-labelledby="pillars-title">
                <h2 id="pillars-title" className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
                    Empowering Independence in Competitive Exams
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-[#ffe600]/10 flex items-center justify-center mb-4 text-[#ffe600]">
                            <Volume2 className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Self-Reading TTS</h3>
                        <p className="text-neutral-300 text-sm">
                            Hear questions, options, instructions, and remaining time read aloud in English or Hindi with configurable speeds.
                        </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400">
                            <Keyboard className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Keyboard-First Flow</h3>
                        <p className="text-neutral-300 text-sm">
                            Zero mouse dependency. Navigate questions with Arrow keys, select options with 1-4, mark for review with M, and clear with C.
                        </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                            <Mic className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Voice Commands</h3>
                        <p className="text-neutral-300 text-sm">
                            Hands-free voice recognition support for answering, navigating, and submitting examinations with bilingual commands.
                        </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                            <Sliders className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">High Contrast Modes</h3>
                        <p className="text-neutral-300 text-sm">
                            Four high-contrast themes including Yellow-on-Black and Cyan-on-Navy, with large font scaling for low-vision clarity.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Demo Credentials Info for Hackathon Evaluators */}
            <section className="bg-neutral-950 border-2 border-neutral-700 p-6 rounded-xl mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-white">Evaluation Demonstration Accounts</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                        <p className="text-[#ffe600] font-bold mb-1">Candidate Account:</p>
                        <p className="text-neutral-300">Roll Number: <span className="text-white font-bold">CAND101</span></p>
                        <p className="text-neutral-300">Password: <span className="text-white font-bold">candidate123</span></p>
                    </div>
                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                        <p className="text-[#ffe600] font-bold mb-1">Administrator Account:</p>
                        <p className="text-neutral-300">Roll Number: <span className="text-white font-bold">ADMIN001</span></p>
                        <p className="text-neutral-300">Password: <span className="text-white font-bold">admin123</span></p>
                    </div>
                </div>
            </section>
        </main>
    );
}
