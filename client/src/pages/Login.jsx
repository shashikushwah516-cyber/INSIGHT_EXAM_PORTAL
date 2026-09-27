import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    LogIn,
    Volume2,
    Eye,
    EyeOff,
    HelpCircle,
    AlertCircle,
    CheckCircle2,
    KeyRound,
    UserCheck,
    Lock
} from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';

export default function Login() {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [forgotModalOpen, setForgotModalOpen] = useState(false);

    const { login } = useAuth();
    const { speak } = useSpeech();
    const { announce, preferences } = useAccessibility();
    const navigate = useNavigate();
    const location = useLocation();

    const rollInputRef = useRef(null);

    useEffect(() => {
        const promptText =
            preferences.language === 'hi'
                ? 'विद्यार्थी लॉगिन पृष्ठ। कृपया अपना रोल नंबर और पासवर्ड दर्ज करें।'
                : 'Student Login Screen. Please enter your Roll Number and Password to access your examination portal.';
        speak(promptText);
        announce(promptText, 'polite');

        if (rollInputRef.current) {
            rollInputRef.current.focus();
        }
    }, [speak, announce, preferences.language]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!rollNumber.trim()) {
            const msg = preferences.language === 'hi' ? 'कृपया रोल नंबर दर्ज करें।' : 'Please enter your Roll Number.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (!password) {
            const msg = preferences.language === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        setIsSubmitting(true);
        const waitMsg = preferences.language === 'hi' ? 'लॉगिन किया जा रहा है...' : 'Logging in, please wait...';
        announce(waitMsg, 'polite');

        try {
            const res = await login(rollNumber.trim(), password);
            const successMsg =
                preferences.language === 'hi'
                    ? `लॉगिन सफल रहा। स्वागत है ${res.user?.name || res.user?.rollNumber}।`
                    : `Login successful. Welcome ${res.user?.name || res.user?.rollNumber}.`;

            speak(successMsg);
            announce(successMsg, 'polite');

            const destination = location.state?.from?.pathname || (res.user?.role === 'admin' ? '/admin' : '/dashboard');
            navigate(destination);
        } catch (err) {
            const errMsg = err.message || (preferences.language === 'hi' ? 'लॉगिन असफल रहा।' : 'Login failed. Please check your credentials.');
            setError(errMsg);
            speak(errMsg);
            announce(errMsg, 'assertive');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fillDemo = (role) => {
        if (role === 'candidate') {
            setRollNumber('CAND101');
            setPassword('candidate123');
            speak('Filled demo candidate credentials for evaluation.');
        } else {
            setRollNumber('ADMIN001');
            setPassword('admin123');
            speak('Filled demo administrator credentials for evaluation.');
        }
    };

    return (
        <AuthLayout
            title="Student Login"
            subtitle="Access your accessible competitive examination portal."
        >
            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-[#ffe600]/10 text-[#ffe600] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#ffe600]/30 shadow-inner">
                        <LogIn className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Student Login
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-sm mx-auto">
                        Sign in to access timed exams, practice modules, and your performance dashboard.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="bg-red-950/80 border-2 border-red-500 text-red-200 p-3.5 rounded-xl mb-6 flex items-start gap-2.5 text-sm animate-in fade-in duration-150"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Roll Number Field */}
                    <div>
                        <label
                            htmlFor="rollNumber"
                            className="form-label"
                        >
                            Candidate Roll Number or Email <span className="text-[#ffe600]">*</span>
                        </label>
                        <input
                            id="rollNumber"
                            ref={rollInputRef}
                            type="text"
                            required
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. CAND101"
                            autoComplete="username"
                            aria-required="true"
                            className="form-input font-medium"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label
                                htmlFor="password"
                                className="form-label mb-0"
                            >
                                Password <span className="text-[#ffe600]">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setForgotModalOpen(true)}
                                className="text-xs font-semibold text-[#ffe600] hover:underline focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your portal password"
                                autoComplete="current-password"
                                aria-required="true"
                                className="form-input pr-11 font-medium"
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full h-12 text-base mt-2 shadow-lg shadow-yellow-500/10"
                    >
                        <LogIn className="w-5 h-5" aria-hidden="true" />
                        <span>{isSubmitting ? 'Logging in to Portal...' : 'Log In to Account (Enter)'}</span>
                    </button>
                </form>

                {/* Instant Evaluation Demo Credentials */}
                <div className="mt-6 pt-5 border-t border-neutral-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 text-center mb-2.5">
                        Evaluation Quick Demo Autofill:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => fillDemo('candidate')}
                            className="h-9 px-2 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-xs text-[#ffe600] font-mono border border-neutral-700/80 hover:border-[#ffe600] transition flex items-center justify-center gap-1.5"
                        >
                            <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Candidate (CAND101)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('admin')}
                            className="h-9 px-2 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-xs text-cyan-400 font-mono border border-neutral-700/80 hover:border-cyan-400 transition flex items-center justify-center gap-1.5"
                        >
                            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Admin (ADMIN001)</span>
                        </button>
                    </div>
                </div>

                {/* Registration Link */}
                <div className="mt-5 pt-4 border-t border-neutral-800/60 text-center">
                    <p className="text-xs text-neutral-400">
                        New candidate preparing for exams?{' '}
                        <Link
                            to="/register"
                            className="text-[#ffe600] hover:underline font-bold focus-visible:ring-1 focus-visible:ring-[#ffe600] rounded"
                        >
                            Register Candidate Account
                        </Link>
                    </p>
                </div>
            </div>

            {/* Forgot Password Helper Modal */}
            {forgotModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="forgot-title"
                >
                    <div className="bg-neutral-900 border-2 border-[#ffe600] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <KeyRound className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                            <h2 id="forgot-title" className="text-xl font-bold text-white">
                                Password Recovery Assistance
                            </h2>
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                            For security on competitive examination platforms, candidate credentials can be verified and reset by your exam center administrator or via your registered examination authority.
                        </p>
                        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 mb-6 space-y-1">
                            <p className="font-bold text-[#ffe600]">Default Hackathon Demo Password:</p>
                            <p className="font-mono text-white">candidate123</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForgotModalOpen(false)}
                            className="btn-primary w-full"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
