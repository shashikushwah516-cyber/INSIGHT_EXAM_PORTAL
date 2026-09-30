import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    Sliders,
    Target,
    Clock,
    Award,
    Volume2,
    ArrowRight,
    CheckCircle2,
    Keyboard,
    Play,
    RotateCcw,
    Shield,
    Sparkles,
    Check
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function HowItWorks() {
    const { speak } = useSpeech();
    const { announce } = useAccessibility();
    const [simStep, setSimStep] = useState(0);

    useEffect(() => {
        const text = 'How Insight Exam Portal Works. A four-step accessible examination journey: Configure Accessibility, Practice, Timed Examination, and Results Analysis.';
        speak(text);
        announce(text, 'polite');
    }, [speak, announce]);

    const steps = [
        {
            num: '01',
            title: 'Configure Your Accessibility Preferences',
            subtitle: 'Personalize your auditory, visual, and navigation comfort before starting.',
            icon: Sliders,
            details: [
                'Set speech playback speed from 0.75x to 1.5x to match your listening comprehension pace.',
                'Select between English or Hindi audio synthesis engines.',
                'Choose from 4 high-contrast themes (Clean Light, Yellow on Black, Cyan on Navy, Soft Warm Light).',
                'Scale text sizing from Normal (16px) to Large (19px) and Extra-Large (22px).'
            ],
            audioSample: 'Step 1: Configure Accessibility. Choose your speech rate, voice, contrast theme, and keyboard preferences to personalize your testing environment.'
        },
        {
            num: '02',
            title: 'Practice with Instant Audio Explanations',
            subtitle: 'Master competitive exam topics at your own pace with real-time feedback.',
            icon: Target,
            details: [
                'Filter questions by Subject (General Knowledge, Quantitative Aptitude, Logical Reasoning) and Difficulty.',
                'Listen to complete question statements and 4 multiple-choice options automatically.',
                'Press 1 through 4 to select options or Arrow Keys to navigate.',
                'Receive immediate audio confirmation of whether your choice was correct, followed by a step-by-step rationale.'
            ],
            audioSample: 'Step 2: Practice Portal. Answer questions with zero-mouse keyboard controls and receive immediate spoken explanations for every option.'
        },
        {
            num: '03',
            title: 'Take Official Timed Examinations',
            subtitle: 'Participate in secure, standardized competitive exams with automated proctoring.',
            icon: Clock,
            details: [
                'Full keyboard-only operation: 1-4 for options, arrows for navigation, Space to repeat questions, and M to mark for review.',
                'Automatic audio countdown alerts at 10 minutes and 5 minutes remaining.',
                'Real-time answer persistence to local storage and server database prevents data loss during disruptions.',
                'Review questions palette with status indicators (answered, flagged, unanswered).'
            ],
            audioSample: 'Step 3: Timed Examinations. Full keyboard-only operation, auto-saving every selection, with audio countdowns and question palettes.'
        },
        {
            num: '04',
            title: 'Objective Results & Competence Analytics',
            subtitle: 'Receive instant scoring, percentile metrics, and complete solution walk-throughs.',
            icon: Award,
            details: [
                'Total score, attempted count, correct count, and negative marks calculated instantly on the server.',
                'Complete question review with candidate selection versus correct answer and detailed explanation.',
                'Topic-wise and subject-wise accuracy percentages to identify strengths and areas for improvement.',
                'Full audio readout of results for candidates relying on speech.'
            ],
            audioSample: 'Step 4: Objective Results and Analytics. Receive instant percentage, score, topic breakdown, and hear complete question solutions read aloud.'
        }
    ];

    const playSimulation = (index) => {
        setSimStep(index);
        speak(steps[index].audioSample);
    };

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-14 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
                <div className="container-app space-y-16">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-bold border border-[var(--border-color)] shadow-xs">
                            <Sliders className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>End-to-End Candidate Workflow</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                            How <span className="text-[var(--primary)]">Insight Exam Portal</span> Works
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-normal">
                            Engineered from the ground up so that candidates can practice, prepare, and take competitive examinations completely without human assistance.
                        </p>
                    </div>

                    {/* Step-by-Step Breakdown */}
                    <div className="space-y-8">
                        {steps.map((step, idx) => {
                            const IconComponent = step.icon;
                            return (
                                <div
                                    key={step.num}
                                    className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-10 shadow-sm transition hover:border-[var(--focus-ring)]"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 sm:gap-8">
                                        {/* Left Column: Number & Title */}
                                        <div className="lg:w-1/3">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] border border-[var(--border-color)] text-[var(--primary)] font-black text-xl flex items-center justify-center">
                                                    {step.num}
                                                </span>
                                                <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--primary)]">
                                                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                                                </div>
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight">
                                                {step.title}
                                            </h2>
                                            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                                                {step.subtitle}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => playSimulation(idx)}
                                                className="mt-4 h-10 px-4 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-2 border border-[var(--border-color)] transition cursor-pointer"
                                                aria-label={`Listen to description of Step ${step.num}: ${step.title}`}
                                            >
                                                <Volume2 className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
                                                <span>Listen to Step {step.num}</span>
                                            </button>
                                        </div>

                                        {/* Right Column: Key Details */}
                                        <div className="lg:w-2/3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                                                Accessibility Highlights
                                            </h3>
                                            <ul className="space-y-3">
                                                {step.details.map((detail, dIdx) => (
                                                    <li key={dIdx} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                                                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
                                                        <span className="leading-relaxed">{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Interactive Audio Simulator Box */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-10 shadow-sm">
                        <div className="max-w-3xl">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block mb-2">
                                Voice Demonstration
                            </span>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">
                                Test the Examination Audio Experience
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)] mb-6">
                                Click any of the demonstration buttons below to hear how Insight Exam Portal vocalizes questions, options, and countdown alerts during live testing.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        speak(
                                            'Question 1 of 20. What is the national currency of Japan? Option 1: Yen. Option 2: Yuan. Option 3: Won. Option 4: Ringgit.'
                                        )
                                    }
                                    className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-color)] text-left flex items-center justify-between transition shadow-xs cursor-pointer"
                                >
                                    <span>Sample Question Readout</span>
                                    <Volume2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        speak('Option 1, Yen, selected. Answer saved to server database.')
                                    }
                                    className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-color)] text-left flex items-center justify-between transition shadow-xs cursor-pointer"
                                >
                                    <span>Answer Selection & Auto-Save</span>
                                    <Volume2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        speak(
                                            'Attention candidate: 5 minutes remaining in your examination session. Please review flagged questions.'
                                        )
                                    }
                                    className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-color)] text-left flex items-center justify-between transition shadow-xs cursor-pointer"
                                >
                                    <span>5-Minute Timer Warning</span>
                                    <Volume2 className="w-4 h-4 text-[var(--warning)] shrink-0" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="text-center pt-8 border-t border-[var(--border-color)]">
                        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3">
                            Start Practicing or Take an Examination
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-6 text-sm">
                            Configure your preferences once and practice hundreds of competitive exam questions with audio feedback.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/practice"
                                className="h-12 px-7 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 font-bold flex items-center gap-2 shadow-sm transition"
                            >
                                <span>Go to Practice Portal</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                            <Link
                                to="/accessibility"
                                className="h-12 px-7 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold border border-[var(--border-color)] shadow-xs transition"
                            >
                                <span>Customize Preferences</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}
