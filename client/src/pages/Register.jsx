import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    UserPlus,
    AlertCircle,
    Eye,
    EyeOff,
    User,
    Mail,
    Lock,
    Sliders,
    Globe as EarthIcon,
    CheckCircle2
} from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';

export default function Register() {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('candidate');
    const [preferredLanguage, setPreferredLanguage] = useState('en');
    const [preferredTheme, setPreferredTheme] = useState('high-contrast-yellow');

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const { speak } = useSpeech();
    const { announce, updatePref } = useAccessibility();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!rollNumber.trim()) {
            const msg = 'Please provide a valid Candidate Roll Number.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (password.length < 6) {
            const msg = 'Password must be at least 6 characters long.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        setIsSubmitting(true);
        try {
            await register({
                name: name.trim() || `Candidate ${rollNumber.trim().toUpperCase()}`,
                rollNumber: rollNumber.trim().toUpperCase(),
                email: email.trim() || undefined,
                password,
                role
            });

            // Apply selected preferences
            updatePref('language', preferredLanguage);
            updatePref('theme', preferredTheme);

            const welcomeMsg = `Registration successful. Welcome ${name || rollNumber}. Your accessible account is ready.`;
            speak(welcomeMsg);
            announce(welcomeMsg, 'polite');

            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.message || 'Registration failed. Please check details.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Candidate Registration"
            subtitle="Register for universally accessible competitive examinations."
        >
            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-cyan-400/10 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-cyan-400/30 shadow-inner">
                        <UserPlus className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Candidate Registration
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-sm mx-auto">
                        Create your universally accessible profile with personalized audio and visual preferences.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="bg-red-950/80 border-2 border-red-500 text-red-200 p-3.5 rounded-xl mb-6 flex items-start gap-2.5 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Registration Form with Logical Groups */}
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* GROUP 1: PERSONAL INFORMATION */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
                            <User className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                                1. Personal & Examination Identification
                            </h2>
                        </div>

                        <div>
                            <label htmlFor="reg-name" className="form-label">
                                Full Candidate Name
                            </label>
                            <input
                                id="reg-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Alex Johnson"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="reg-roll" className="form-label">
                                Candidate Roll Number <span className="text-[#ffe600]">*</span>
                            </label>
                            <input
                                id="reg-roll"
                                type="text"
                                required
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                placeholder="e.g. CAND202"
                                aria-required="true"
                                className="form-input font-mono uppercase"
                            />
                        </div>
                    </div>

                    {/* GROUP 2: ACCOUNT INFORMATION */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
                            <Mail className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                                2. Account Credentials & Role
                            </h2>
                        </div>

                        <div>
                            <label htmlFor="reg-email" className="form-label">
                                Email Address (Optional)
                            </label>
                            <input
                                id="reg-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. candidate@example.com"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="reg-role" className="form-label">
                                Account Role
                            </label>
                            <select
                                id="reg-role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="form-input text-white bg-neutral-950"
                            >
                                <option value="candidate">Candidate (Student Examination Portal)</option>
                                <option value="admin">Exam Administrator</option>
                            </select>
                        </div>
                    </div>

                    {/* GROUP 3: ACCESSIBILITY PREFERENCES */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
                            <Sliders className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                                3. Accessibility & Language Preferences
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="reg-lang" className="form-label">
                                    Audio TTS Language
                                </label>
                                <select
                                    id="reg-lang"
                                    value={preferredLanguage}
                                    onChange={(e) => setPreferredLanguage(e.target.value)}
                                    className="form-input text-white bg-neutral-950"
                                >
                                    <option value="en">English (Default)</option>
                                    <option value="hi">हिंदी (Hindi)</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="reg-theme" className="form-label">
                                    Display Contrast Theme
                                </label>
                                <select
                                    id="reg-theme"
                                    value={preferredTheme}
                                    onChange={(e) => setPreferredTheme(e.target.value)}
                                    className="form-input text-white bg-neutral-950"
                                >
                                    <option value="high-contrast-yellow">Yellow / Black (High Contrast)</option>
                                    <option value="high-contrast-cyan">Cyan / Navy (High Contrast)</option>
                                    <option value="standard-dark">Standard Dark</option>
                                    <option value="soft-light">Soft Light</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* GROUP 4: ACCOUNT SECURITY */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
                            <Lock className="w-4 h-4 text-purple-400" aria-hidden="true" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                                4. Account Security
                            </h2>
                        </div>

                        <div>
                            <label htmlFor="reg-password" className="form-label">
                                Password (Min. 6 Characters) <span className="text-[#ffe600]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a secure password"
                                    aria-required="true"
                                    className="form-input pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-[#ffe600]"
                                    aria-label={showPassword ? 'Hide password' : 'Show password as plain text'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="w-4 h-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full h-12 text-base mt-4 shadow-lg shadow-yellow-500/10"
                    >
                        <UserPlus className="w-5 h-5" aria-hidden="true" />
                        <span>{isSubmitting ? 'Registering Account...' : 'Complete Candidate Registration'}</span>
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 pt-4 border-t border-neutral-800/60 text-center">
                    <p className="text-xs text-neutral-400">
                        Already have an examination account?{' '}
                        <Link
                            to="/login"
                            className="text-[#ffe600] hover:underline font-bold focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded"
                        >
                            Log In Here
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
