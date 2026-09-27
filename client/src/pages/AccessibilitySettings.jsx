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
        speak(sampleText);
    };

    const themes = [
        {
            id: 'high-contrast-yellow',
            name: 'High Contrast Yellow on Black',
            desc: 'Maximum contrast recommended for low-vision candidates (Yellow accents on deep black background)',
            border: 'border-[#ffe600]'
        },
        {
            id: 'high-contrast-cyan',
            name: 'High Contrast Cyan on Navy',
            desc: 'Vibrant cyan accents on midnight navy background with high legibility',
            border: 'border-cyan-400'
        },
        {
            id: 'standard-dark',
            name: 'Standard Dark Mode',
            desc: 'Muted slate background with soft blue accents for reduced eye strain',
            border: 'border-slate-500'
        },
        {
            id: 'soft-light',
            name: 'Soft Light / Warm Cream',
            desc: 'Non-glare light background for candidates sensitive to dark backgrounds',
            border: 'border-amber-600'
        }
    ];

    const fontSizes = [
        { id: 'normal', name: 'Standard (16px)', desc: 'Standard readable typography' },
        { id: 'large', name: 'Large (19px)', desc: 'Enhanced legibility for comfortable reading' },
        { id: 'extra-large', name: 'Extra Large (22px)', desc: 'Maximum size for low-vision reading' }
    ];

    return (
        <main id="main-content" className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <Sliders className="w-8 h-8 text-[#ffe600]" aria-hidden="true" />
                <div>
                    <h1 className="text-3xl font-bold text-white">Accessibility & Display Preferences</h1>
                    <p className="text-neutral-300 text-sm mt-1">
                        Tailor visual contrast, typography scaling, text-to-speech, and voice controls to your needs.
                    </p>
                </div>
            </div>

            {savedNotice && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-6 p-4 bg-emerald-950 border-2 border-emerald-500 text-emerald-200 rounded-xl flex items-center gap-2"
                >
                    <Check className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                    <span>Your preferences have been saved and applied.</span>
                </div>
            )}

            <div className="space-y-8">
                {/* 1. Theme Selection */}
                <section aria-labelledby="theme-heading" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                        <h2 id="theme-heading" className="text-xl font-bold text-white">
                            High-Contrast Color Theme
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                    updatePref('theme', t.id);
                                    announce(`Theme changed to ${t.name}`, 'polite');
                                }}
                                className={`text-left p-4 rounded-xl border-2 transition relative ${
                                    preferences.theme === t.id
                                        ? `${t.border} bg-neutral-800 ring-2 ring-[#ffe600]`
                                        : 'border-neutral-700 bg-neutral-950 hover:bg-neutral-850'
                                }`}
                                aria-pressed={preferences.theme === t.id}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-white">{t.name}</span>
                                    {preferences.theme === t.id && (
                                        <Check className="w-5 h-5 text-[#ffe600]" aria-hidden="true" />
                                    )}
                                </div>
                                <p className="text-xs text-neutral-400">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Font Size Scaling */}
                <section aria-labelledby="font-heading" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Type className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                        <h2 id="font-heading" className="text-xl font-bold text-white">
                            Text & Typography Scaling
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {fontSizes.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => {
                                    updatePref('fontSize', f.id);
                                    announce(`Font size changed to ${f.name}`, 'polite');
                                }}
                                className={`p-4 rounded-xl border-2 text-left transition ${
                                    preferences.fontSize === f.id
                                        ? 'border-[#ffe600] bg-neutral-800 ring-2 ring-[#ffe600]'
                                        : 'border-neutral-700 bg-neutral-950 hover:bg-neutral-850'
                                }`}
                                aria-pressed={preferences.fontSize === f.id}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-white">{f.name}</span>
                                    {preferences.fontSize === f.id && (
                                        <Check className="w-5 h-5 text-[#ffe600]" aria-hidden="true" />
                                    )}
                                </div>
                                <p className="text-xs text-neutral-400">{f.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. Text-To-Speech Settings */}
                <section aria-labelledby="speech-heading" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Volume2 className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                        <h2 id="speech-heading" className="text-xl font-bold text-white">
                            Text-To-Speech Audio Settings
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {/* Language Selection */}
                        <div>
                            <label htmlFor="pref-lang" className="block text-sm font-bold text-neutral-200 mb-2">
                                Voice & Audio Language
                            </label>
                            <select
                                id="pref-lang"
                                value={preferences.language}
                                onChange={(e) => {
                                    updatePref('language', e.target.value);
                                    announce(`Language set to ${e.target.value === 'hi' ? 'Hindi' : 'English'}`, 'polite');
                                }}
                                className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-2.5 text-base focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none"
                            >
                                <option value="en">English (Default)</option>
                                <option value="hi">हिंदी (Hindi)</option>
                            </select>
                        </div>

                        {/* Speech Rate */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="pref-rate" className="text-sm font-bold text-neutral-200">
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
                                className="w-full accent-[#ffe600] h-2 bg-neutral-700 rounded-lg cursor-pointer"
                                aria-valuemin="0.75"
                                aria-valuemax="1.5"
                                aria-valuenow={preferences.speechRate}
                                aria-valuetext={`${preferences.speechRate} times speed`}
                            />
                            <div className="flex justify-between text-xs text-neutral-400 mt-1">
                                <span>0.75x (Slower)</span>
                                <span>1.0x (Normal)</span>
                                <span>1.25x</span>
                                <span>1.5x (Faster)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-800">
                        <button
                            type="button"
                            onClick={handleTestSpeech}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-800 text-[#ffe600] font-bold rounded-lg border border-[#ffe600] hover:bg-neutral-700 transition"
                        >
                            <Volume2 className="w-5 h-5" aria-hidden="true" />
                            <span>Test Audio Voice</span>
                        </button>
                    </div>
                </section>

                {/* 4. Examination Auto-Features */}
                <section aria-labelledby="controls-heading" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Mic className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                        <h2 id="controls-heading" className="text-xl font-bold text-white">
                            Interactive Accessibility Features
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer hover:bg-neutral-850">
                            <input
                                type="checkbox"
                                checked={preferences.autoReadQuestion}
                                onChange={(e) => updatePref('autoReadQuestion', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-[#ffe600] rounded"
                            />
                            <div>
                                <span className="font-bold text-white block">Auto-read Questions on Change</span>
                                <span className="text-xs text-neutral-400 block">
                                    When you advance or step back through questions, automatically speak the question text and options aloud.
                                </span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer hover:bg-neutral-850">
                            <input
                                type="checkbox"
                                checked={preferences.voiceCommands}
                                onChange={(e) => updatePref('voiceCommands', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-[#ffe600] rounded"
                            />
                            <div>
                                <span className="font-bold text-white block">Enable Voice Recognition Microphone</span>
                                <span className="text-xs text-neutral-400 block">
                                    Allows hands-free examination answering using speech commands (e.g., "Next Question", "Option 1", "Submit").
                                </span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer hover:bg-neutral-850">
                            <input
                                type="checkbox"
                                checked={preferences.reducedMotion}
                                onChange={(e) => updatePref('reducedMotion', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-[#ffe600] rounded"
                            />
                            <div>
                                <span className="font-bold text-white block">Reduced Motion Mode</span>
                                <span className="text-xs text-neutral-400 block">
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
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ffe600] text-black font-bold text-lg rounded-xl hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition"
                    >
                        <Save className="w-5 h-5" aria-hidden="true" />
                        <span>Save Preferences</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
