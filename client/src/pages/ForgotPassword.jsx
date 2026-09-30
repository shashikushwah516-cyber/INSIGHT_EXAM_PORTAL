import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    KeyRound,
    Lock,
    User,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ShieldCheck
} from 'lucide-react';

export default function ForgotPassword() {
    const [identifier, setIdentifier] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { speak, announce } = useAccessibility();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!identifier.trim()) {
            const msg = 'Please enter your Roll Number or registered Email.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            const msg = 'New password must be at least 6 characters in length.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (newPassword !== confirmPassword) {
            const msg = 'Passwords do not match. Please verify both password fields.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        setIsSubmitting(true);
        speak('Resetting your password. Please wait...');

        try {
            const payload = {
                rollNumber: identifier.trim(),
                email: identifier.includes('@') ? identifier.trim() : undefined,
                newPassword
            };

            const res = await authService.forgotPassword(payload);
            const okMsg = res.message || 'Password reset successfully. Redirecting to login.';
            setSuccessMsg(okMsg);
            speak(okMsg);
            announce(okMsg, 'polite');

            setTimeout(() => {
                navigate('/login');
            }, 1800);
        } catch (err) {
            let errMsg = err.message || 'Unable to reset password. Please check your credentials.';
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
                        <KeyRound className="w-7 h-7 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                        Reset Password
                    </h1>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Insight Exam Portal Candidate Security Center
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm backdrop-blur-sm">
                    {error && (
                        <div role="alert" className="mb-6 p-4 rounded-xl bg-[var(--danger)]/15 border border-[var(--danger)] text-[var(--danger)] text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block">Reset Error</strong>
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
                        {/* Identifier */}
                        <div>
                            <label htmlFor="reset-id" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                Roll Number or Registered Email <span className="text-[var(--danger)]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="reset-id"
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="e.g. CAND101 or student@insightexam.org"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="reset-pass" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                New Password <span className="text-[var(--danger)]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="reset-pass"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
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
                            <label htmlFor="reset-confirm-pass" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                Confirm New Password <span className="text-[var(--danger)]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="reset-confirm-pass"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] font-bold text-sm shadow-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{isSubmitting ? 'Updating Password...' : 'Save New Password'}</span>
                        </button>
                    </form>

                    {/* Return to Login */}
                    <div className="mt-6 pt-5 border-t border-[var(--border-color)] text-center">
                        <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-semibold inline-flex items-center gap-1.5 transition">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
