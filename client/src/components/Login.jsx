import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    LogIn,
    User,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Shield,
    Sparkles,
    KeyRound
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [demoFilled, setDemoFilled] = useState('');

    const { login } = useAuth();
    const { speak, announce } = useAccessibility();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectFrom = location.state?.from?.pathname;

    useEffect(() => {
        speak('Welcome to Insight Exam Portal. Please enter your roll number and password, or use 1-click demo login.');
    }, [speak]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!rollNumber.trim() || !password.trim()) {
            const msg = 'Please enter both your Roll Number and Password.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        setIsSubmitting(true);
        speak('Authenticating your credentials. Please wait...');

        try {
            const res = await login(rollNumber.trim().toUpperCase(), password);
            const msg = 'Login successful! Opening your examination portal.';
            speak(msg);
            announce(msg, 'polite');

            if (onLoginSuccess && res?.token) {
                onLoginSuccess(res.token);
            }

            const destination =
                res?.user?.role !== 'admin' && redirectFrom?.startsWith('/admin')
                    ? '/dashboard'
                    : (redirectFrom || (res?.user?.role === 'admin' ? '/admin' : '/dashboard'));
            navigate(destination);
        } catch (err) {
            let errMsg = err.response?.data?.message || err.message || 'Login failed. Please verify roll number and password.';
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

    // 1-Click Instant Demo Login
    const handleInstantLogin = async (targetRoll, targetPass, role) => {
        setRollNumber(targetRoll);
        setPassword(targetPass);
        setError('');
        setDemoFilled(`Signing in as ${role === 'admin' ? 'Administrator' : 'Student'} (${targetRoll})...`);
        setIsSubmitting(true);
        speak(`Signing in as ${role === 'admin' ? 'Administrator' : 'Student'}.`);

        try {
            const res = await login(targetRoll, targetPass);
            if (onLoginSuccess && res?.token) onLoginSuccess(res.token);
            navigate(role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            let errMsg = err.response?.data?.message || err.message || 'Demo login failed. Please try again.';
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
            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-[var(--primary)] text-[var(--bg-primary)] items-center justify-center shadow-md mb-4 border border-[var(--border-color)]">
                        <LogIn className="w-7 h-7 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                        Portal Sign In
                    </h1>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Insight Exam Portal Accessible Digital Platform
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm backdrop-blur-sm">
                    {error && (
                        <div role="alert" className="mb-6 p-4 rounded-xl bg-[var(--danger)]/15 border border-[var(--danger)] text-[var(--danger)] text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block">Sign In Error</strong>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {demoFilled && (
                        <div role="status" className="mb-4 p-3 rounded-xl bg-[var(--primary-subtle)] border border-[var(--border-color)] text-[var(--primary)] text-xs flex items-center gap-2">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span>{demoFilled}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Roll Number */}
                        <div>
                            <label htmlFor="login-roll" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                Roll Number / User ID <span className="text-[var(--danger)]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="login-roll"
                                    type="text"
                                    required
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                                    placeholder="e.g. CAND101 or ADMIN001"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="login-password" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    Secure Password <span className="text-[var(--danger)]">*</span>
                                </label>
                                <Link to="/forgot-password" className="text-xs text-[var(--primary)] hover:underline font-bold transition">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] font-bold text-sm shadow-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{isSubmitting ? 'Signing In...' : 'Sign In to Portal'}</span>
                        </button>
                    </form>

                    {/* Quick Demo Credentials */}
                    <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center mb-3">
                            Instant 1-Click Demo Access
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleInstantLogin('CAND101', 'candidate123', 'student')}
                                className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] text-left transition flex flex-col cursor-pointer"
                            >
                                <span className="text-xs font-bold text-[var(--primary)] flex items-center gap-1">
                                    <User className="w-3 h-3" /> Student Demo
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">CAND101</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleInstantLogin('ADMIN001', 'admin123', 'admin')}
                                className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] text-left transition flex flex-col cursor-pointer"
                            >
                                <span className="text-xs font-bold text-[var(--warning)] flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Admin Demo
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">ADMIN001</span>
                            </button>
                        </div>
                    </div>

                    {/* Register Link */}
                    <div className="mt-6 pt-5 border-t border-[var(--border-color)] text-center">
                        <p className="text-sm text-[var(--text-secondary)]">
                            New candidate?{' '}
                            <Link to="/register" className="text-[var(--primary)] hover:underline font-bold inline-flex items-center gap-1 transition">
                                Create an account <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}