import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    UserPlus,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Sliders,
    Globe as EarthIcon,
    Shield,
    Award,
    ArrowRight
} from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('candidate');
    const [preferredLanguage, setPreferredLanguage] = useState('en');
    const [preferredTheme, setPreferredTheme] = useState('clean-light');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const { speak, announce, updatePref } = useAccessibility();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!name.trim() || !rollNumber.trim() || !password.trim()) {
            const msg = 'Please fill out all mandatory fields: Full Name, Roll Number, and Password.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            const msg = 'Please provide a valid email address format.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (password.length < 6) {
            const msg = 'Password must be at least 6 characters in length.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (password !== confirmPassword) {
            const msg = 'Passwords do not match. Please ensure both password fields match.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        setIsSubmitting(true);
        speak('Creating your examination portal account. Please wait...');

        try {
            const userData = {
                name: name.trim(),
                rollNumber: rollNumber.trim().toUpperCase(),
                email: email.trim() || `${rollNumber.trim().toLowerCase()}@insightportal.edu`,
                password,
                role: role === 'admin' ? 'admin' : 'candidate',
                preferences: {
                    theme: preferredTheme,
                    language: preferredLanguage
                }
            };

            await register(userData);

            // Sync accessibility context with chosen preferences
            updatePref('theme', preferredTheme);
            updatePref('language', preferredLanguage);

            const okText = 'Registration successful! Redirecting to your workspace.';
            setSuccessMsg(okText);
            speak(okText);
            announce(okText, 'polite');

            setTimeout(() => {
                navigate(role === 'admin' ? '/admin' : '/dashboard');
            }, 800);

        } catch (err) {
            let errMsg = err.response?.data?.message || err.message || 'Registration failed. Roll number may already exist.';
            if (!err.response && (errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('failed'))) {
                errMsg = 'Cannot connect to backend server. Please ensure the server is running on port 5001 (npm run dev:all).';
            }
            setError(errMsg);
            speak(errMsg);
            announce(errMsg, 'assertive');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="w-full max-w-xl">
                {/* Brand / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-[var(--primary)] text-[var(--bg-primary)] items-center justify-center shadow-md mb-4 border border-[var(--border-color)]">
                        <UserPlus className="w-7 h-7 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                        Create Your Candidate Account
                    </h1>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Join Insight Exam Portal Accessible Digital Platform
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm backdrop-blur-sm">
                    {error && (
                        <div role="alert" className="mb-6 p-4 rounded-xl bg-[var(--danger)]/15 border border-[var(--danger)] text-[var(--danger)] text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block">Registration Error</strong>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {successMsg && (
                        <div role="status" className="mb-6 p-4 rounded-xl bg-[var(--success)]/15 border border-[var(--success)] text-[var(--success)] text-sm flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <span className="font-bold">{successMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="reg-name" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                Full Name <span className="text-[var(--danger)]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="reg-name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Aarav Sharma"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Roll Number & Role Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="reg-roll" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                    Roll / Registration No. <span className="text-[var(--danger)]">*</span>
                                </label>
                                <input
                                    id="reg-roll"
                                    type="text"
                                    required
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                                    placeholder="e.g. CAND101"
                                    className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                            </div>

                            <div>
                                <label htmlFor="reg-role" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                    Account Role <span className="text-[var(--danger)]">*</span>
                                </label>
                                <select
                                    id="reg-role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition cursor-pointer"
                                >
                                    <option value="candidate">Student / Candidate</option>
                                    <option value="admin">Platform Administrator</option>
                                </select>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <label htmlFor="reg-email" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                Email Address <span className="text-[var(--text-muted)] font-normal">(Optional for Candidates)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="reg-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="aarav@university.edu"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="reg-password" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                Secure Password <span className="text-[var(--danger)]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className="w-full pl-10 pr-11 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                Confirm Password <span className="text-[var(--danger)]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="reg-confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Accessibility Presets */}
                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                                <Sliders className="w-4 h-4 text-[var(--primary)]" />
                                <span>Default Accessibility Settings</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label htmlFor="reg-theme" className="block text-[var(--text-secondary)] mb-1 font-semibold">Color Theme</label>
                                    <select
                                        id="reg-theme"
                                        value={preferredTheme}
                                        onChange={(e) => setPreferredTheme(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                                    >
                                        <option value="clean-light">Clean Light</option>
                                        <option value="high-contrast-yellow">High Contrast Yellow on Black</option>
                                        <option value="high-contrast-cyan">High Contrast Cyan on Navy</option>
                                        <option value="standard-dark">Standard Dark</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="reg-lang" className="block text-[var(--text-secondary)] mb-1 font-semibold">Preferred Language</label>
                                    <select
                                        id="reg-lang"
                                        value={preferredLanguage}
                                        onChange={(e) => setPreferredLanguage(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                                    >
                                        <option value="en">English (US / IN)</option>
                                        <option value="hi">हिन्दी (Hindi)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] font-bold text-sm shadow-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{isSubmitting ? 'Creating Account...' : 'Complete Registration'}</span>
                        </button>
                    </form>

                    {/* Bottom Link */}
                    <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-center">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Already registered on Insight Exam Portal?{' '}
                            <Link to="/login" className="text-[var(--primary)] hover:underline font-bold inline-flex items-center gap-1 transition">
                                Sign In here <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}