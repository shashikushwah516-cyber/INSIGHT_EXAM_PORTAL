import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import {
    Sliders,
    Volume2,
    Eye,
    Type,
    Mic,
    Check,
    Save,
    RotateCcw
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';

export default function AccessibilitySettings() {
    const { preferences, updatePref, announce } = useAccessibility();
    const { updatePreferences, isAuthenticated } = useAuth();
    const { speak } = useSpeech();
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSave = async () => {
        if (isAuthenticated) {
            await updatePreferences(preferences);
        }
        setSavedNotice(true);
        const msg = 'Accessibility preferences saved successfully.';
        speak(msg);
        announce(msg, 'polite');
        setTimeout(() => setSavedNotice(false), 3000);
    };

    const handleTestSpeech = () => {
        const sampleText =
            preferences.language === 'hi'
                ? 'यह दृष्टिबाधित परीक्षा पोर्टल का ऑडियो परीक्षण है। आपकी आवाज सेटिंग सही काम कर रही है।'
                : 'This is a sample audio test of the examination self-reading speech engine. Your speech settings are configured correctly.';
        speak(sampleText, { force: true });
    };

    const themes = [
        {
            id: 'clean-light',
            name: 'Clean Light Professional (Default)',
            desc: 'Modern, high-legibility crisp white background with accessible contrast designed for competitive examinations',
            badge: 'White Mode'
        },
        {
            id: 'high-contrast-yellow',
            name: 'High Contrast Yellow on Black',
            desc: 'Maximum contrast recommended for low-vision candidates (Yellow accents on deep black background)',
            badge: 'Yellow Mode'
        },
        {
            id: 'high-contrast-cyan',
            name: 'High Contrast Cyan on Navy',
            desc: 'Vibrant cyan accents on midnight navy background with high legibility',
            badge: 'Blue Mode'
        },
        {
            id: 'standard-dark',
            name: 'Standard Dark Mode',
            desc: 'Muted slate background with soft blue accents for reduced eye strain',
            badge: 'Dark Mode'
        },
        {
            id: 'soft-light',
            name: 'Soft Light / Warm Cream',
            desc: 'Non-glare light background for candidates sensitive to bright screens',
            badge: 'Warm Light'
        }
    ];

    const fontSizes = [
        { id: 'normal', name: 'Standard (16px)', desc: 'Standard readable typography' },
        { id: 'large', name: 'Large (19px)', desc: 'Enhanced legibility for comfortable reading' },
        { id: 'extra-large', name: 'Extra Large (22px)', desc: 'Maximum size for low-vision reading' }
    ];

    const content = (
        <div className="max-w-4xl mx-auto space-y-6">
            {savedNotice && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-6 p-4 bg-[var(--success)]/15 border border-[var(--success)]/50 text-[var(--success)] rounded-xl flex items-center gap-2 shadow-xs font-semibold"
                >
                    <Check className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Your preferences have been saved and applied across your portal session.</span>
                </div>
            )}

            <div className="space-y-8">
                {/* 1. Theme Selection */}
                <section aria-labelledby="theme-heading" className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold">
                            <Eye className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="theme-heading" className="text-xl font-bold text-[var(--text-primary)]">
                                Color Theme & Visual Contrast
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">Instant, site-wide color palette switching</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {themes.map((t) => {
                            const isSelected = preferences.theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => {
                                        updatePref('theme', t.id);
                                        announce(`Theme changed to ${t.name}`, 'polite');
                                    }}
                                    className={`text-left p-4 rounded-xl border-2 transition relative cursor-pointer ${
                                        isSelected
                                            ? 'border-[var(--primary)] bg-[var(--primary-subtle)] ring-2 ring-[var(--focus-ring)] shadow-sm'
                                            : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)]'
                                    }`}
                                    aria-pressed={isSelected}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[var(--text-primary)]">{t.name}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                                                {t.badge}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden="true" />
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{t.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 2. Font Size Scaling */}
                <section aria-labelledby="font-heading" className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold">
                            <Type className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="font-heading" className="text-xl font-bold text-[var(--text-primary)]">
                                Text & Typography Scaling
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">Adjust base font scale for effortless legibility</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {fontSizes.map((f) => {
                            const isSelected = preferences.fontSize === f.id;
                            return (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => {
                                        updatePref('fontSize', f.id);
                                        announce(`Font size changed to ${f.name}`, 'polite');
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                                        isSelected
                                            ? 'border-[var(--primary)] bg-[var(--primary-subtle)] ring-2 ring-[var(--focus-ring)] shadow-sm'
                                            : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)]'
                                    }`}
                                    aria-pressed={isSelected}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-[var(--text-primary)]">{f.name}</span>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden="true" />
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)]">{f.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Text-To-Speech Settings */}
                <section aria-labelledby="speech-heading" className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold">
                            <Volume2 className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="speech-heading" className="text-xl font-bold text-[var(--text-primary)]">
                                Text-To-Speech Audio Settings
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">Configure voice synthesizer speed and dialect</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {/* Language Selection */}
                        <div>
                            <label htmlFor="pref-lang" className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                                Voice & Audio Language
                            </label>
                            <select
                                id="pref-lang"
                                value={preferences.language}
                                onChange={(e) => {
                                    updatePref('language', e.target.value);
                                    announce(`Language set to ${e.target.value === 'hi' ? 'Hindi' : 'English'}`, 'polite');
                                }}
                                className="w-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-4 py-2.5 text-base focus:border-[var(--focus-ring)] outline-none cursor-pointer"
                            >
                                <option value="en">English (Default)</option>
                                <option value="hi">हिंदी (Hindi)</option>
                            </select>
                        </div>

                        {/* Speech Rate */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="pref-rate" className="text-sm font-bold text-[var(--text-secondary)]">
                                    Speech Speed Rate: {preferences.speechRate}x
                                </label>
                            </div>
                            <input
                                id="pref-rate"
                                type="range"
                                min="0.75"
                                max="1.5"
                                step="0.25"
                                value={preferences.speechRate}
                                onChange={(e) => updatePref('speechRate', parseFloat(e.target.value))}
                                className="w-full accent-[var(--primary)] h-2 bg-[var(--bg-tertiary)] rounded-lg cursor-pointer"
                                aria-valuemin="0.75"
                                aria-valuemax="1.5"
                                aria-valuenow={preferences.speechRate}
                                aria-valuetext={`${preferences.speechRate} times speed`}
                            />
                            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                                <span>0.75x (Slower)</span>
                                <span>1.0x (Normal)</span>
                                <span>1.25x</span>
                                <span>1.5x (Faster)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border-color)]">
                        <button
                            type="button"
                            onClick={handleTestSpeech}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition cursor-pointer"
                        >
                            <Volume2 className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                            <span>Test Audio Voice</span>
                        </button>
                    </div>
                </section>

                {/* 4. Examination Auto-Features */}
                <section aria-labelledby="controls-heading" className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold">
                            <Mic className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="controls-heading" className="text-xl font-bold text-[var(--text-primary)]">
                                Interactive Accessibility Features
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">Automated speech readout and motion controls</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 p-3.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-surface)] transition">
                            <input
                                type="checkbox"
                                checked={preferences.autoReadQuestion}
                                onChange={(e) => updatePref('autoReadQuestion', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-[var(--primary)] rounded"
                            />
                            <div>
                                <span className="font-bold text-[var(--text-primary)] block">Auto-read Questions on Change</span>
                                <span className="text-xs text-[var(--text-secondary)] block">
                                    When you advance or step back through questions, automatically speak the question text and options aloud.
                                </span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-surface)] transition">
                            <input
                                type="checkbox"
                                checked={preferences.voiceCommands}
                                onChange={(e) => updatePref('voiceCommands', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-[var(--primary)] rounded"
                            />
                            <div>
                                <span className="font-bold text-[var(--text-primary)] block">Enable Voice Recognition Microphone</span>
                                <span className="text-xs text-[var(--text-secondary)] block">
                                    Allows hands-free examination answering using speech commands (e.g., "Next Question", "Option 1", "Submit").
                                </span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-surface)] transition">
                            <input
                                type="checkbox"
                                checked={preferences.reducedMotion}
                                onChange={(e) => updatePref('reducedMotion', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-[var(--primary)] rounded"
                            />
                            <div>
                                <span className="font-bold text-[var(--text-primary)] block">Reduced Motion Mode</span>
                                <span className="text-xs text-[var(--text-secondary)] block">
                                    Disables smooth transitions and UI animations to prevent vestibular disorientation.
                                </span>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 font-bold rounded-xl shadow-sm text-base transition cursor-pointer"
                    >
                        <Save className="w-5 h-5" aria-hidden="true" />
                        <span>Save Preferences</span>
                    </button>
                </div>
            </div>
        </div>
    );

    if (isAuthenticated) {
        return (
            <DashboardLayout
                pageTitle="Accessibility & Display Preferences"
                pageDescription="Tailor visual contrast, typography scaling, text-to-speech, and voice controls to your individual needs."
            >
                {content}
            </DashboardLayout>
        );
    }

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-12 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
                <div className="container-app">
                    <div className="max-w-4xl mx-auto mb-8 text-center sm:text-left">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block mb-1">
                            Candidate Personalization
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
                            Accessibility & Display Preferences
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2 max-w-2xl font-normal leading-relaxed">
                            Tailor visual contrast, typography scaling, text-to-speech, and voice controls to your individual comfort.
                        </p>
                    </div>
                    {content}
                </div>
            </main>
        </PublicLayout>
    );
}
