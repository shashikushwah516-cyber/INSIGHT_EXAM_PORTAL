import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    User,
    Mail,
    Award,
    Shield,
    Sliders,
    PlayCircle,
    Calendar,
    LogOut,
    CheckCircle2,
    AlertCircle,
    Edit3,
    Volume2,
    BookOpen,
    HelpCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';

export default function ProfilePage() {
    const { user, isAuthenticated, isAdmin, logout, updateProfile } = useAuth();
    const { preferences, speak, announce } = useAccessibility();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [savedMsg, setSavedMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);
        try {
            const res = await updateProfile({ name, email });
            if (res && res.success) {
                setIsEditing(false);
                setSavedMsg(res.message || 'Profile updated successfully.');
                speak('Profile details saved successfully.');
                announce('Profile details saved successfully.', 'polite');
                setTimeout(() => setSavedMsg(''), 4000);
            } else {
                setErrorMsg(res?.message || 'Could not update profile.');
                speak('Error updating profile.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to update profile.';
            setErrorMsg(msg);
            speak(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        speak('Logged out securely.');
        await logout();
        navigate('/login');
    };

    const roleBadge = isAdmin ? 'System Administrator' : 'Exam Candidate / Student';
    const rollNumber = user?.rollNumber || (isAdmin ? 'ADMIN001' : 'CAND101');
    const displayName = name || user?.name || (isAdmin ? 'Administrator' : 'Candidate');
    const displayEmail = email || user?.email || 'student@examportal.edu';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Profile Card */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[var(--primary)] text-[var(--bg-primary)] flex items-center justify-center text-3xl font-extrabold shadow-md shrink-0 border-2 border-[var(--border-color)]">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {displayName}
                                </h1>
                                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-[var(--border-color)] bg-[var(--primary-subtle)] text-[var(--primary)]">
                                    {roleBadge}
                                </span>
                            </div>
                            <p className="text-[var(--text-secondary)] font-mono text-sm mt-1">Roll No / ID: {rollNumber}</p>
                            <p className="text-[var(--text-secondary)] text-sm mt-2 flex items-center justify-center sm:justify-start gap-2">
                                <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                                {displayEmail}
                            </p>
                        </div>
                        <div className="flex sm:flex-col gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    setErrorMsg('');
                                }}
                                className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold transition flex items-center gap-2 border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                            >
                                <Edit3 className="w-4 h-4 text-[var(--primary)]" />
                                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-xl bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 text-[var(--danger)] text-xs font-bold transition flex items-center gap-2 border border-[var(--danger)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--danger)]"
                            >
                                <LogOut className="w-4 h-4 text-[var(--danger)]" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {savedMsg && (
                        <div className="mt-4 p-3 rounded-xl bg-[var(--success)]/15 border border-[var(--success)]/40 text-[var(--success)] text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                            <span>{savedMsg}</span>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="mt-4 p-3 rounded-xl bg-[var(--danger)]/15 border border-[var(--danger)]/40 text-[var(--danger)] text-xs font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {isEditing && (
                        <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Full Legal Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    required
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Registered Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)] outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-semibold border border-[var(--border-color)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] text-sm font-bold shadow-sm transition hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        to={isAdmin ? '/admin' : '/dashboard'}
                        className="p-5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition group flex flex-col justify-between shadow-sm"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center mb-3">
                                <Award className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] text-base">
                                {isAdmin ? 'Admin Console' : 'Student Dashboard'}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-xs mt-1">
                                {isAdmin ? 'Manage questions, exams & proctoring' : 'View assigned exams & performance track'}
                            </p>
                        </div>
                        <span className="inline-flex items-center text-xs font-bold text-[var(--primary)] mt-4 gap-1 group-hover:translate-x-1 transition-transform">
                            Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </Link>

                    <Link
                        to="/exams"
                        className="p-5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition group flex flex-col justify-between shadow-sm"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--success)]/15 text-[var(--success)] flex items-center justify-center mb-3">
                                <PlayCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] text-base">Examination Portal</h3>
                            <p className="text-[var(--text-secondary)] text-xs mt-1">
                                Launch accessible examinations with keyboard & audio assistance
                            </p>
                        </div>
                        <span className="inline-flex items-center text-xs font-bold text-[var(--success)] mt-4 gap-1 group-hover:translate-x-1 transition-transform">
                            Browse Exams <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </Link>

                    <Link
                        to="/accessibility"
                        className="p-5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition group flex flex-col justify-between shadow-sm"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/15 text-[var(--warning)] flex items-center justify-center mb-3">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] text-base">Accessibility Studio</h3>
                            <p className="text-[var(--text-secondary)] text-xs mt-1">
                                Adjust high contrast, audio speech rates, keyboard shortcuts
                            </p>
                        </div>
                        <span className="inline-flex items-center text-xs font-bold text-[var(--warning)] mt-4 gap-1 group-hover:translate-x-1 transition-transform">
                            Configure <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </Link>
                </div>

                {/* Profile Preferences & System Diagnostics */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[var(--primary)]" />
                        Active Accessibility & Portal Preferences
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                            <span className="text-xs text-[var(--text-muted)] font-semibold block">Color Theme</span>
                            <span className="text-sm font-bold text-[var(--text-primary)] mt-1 capitalize block">
                                {preferences.theme ? preferences.theme.replace(/-/g, ' ') : 'Clean Light'}
                            </span>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                            <span className="text-xs text-[var(--text-muted)] font-semibold block">Portal Language</span>
                            <span className="text-sm font-bold text-[var(--text-primary)] mt-1 block">
                                {preferences.language === 'hi' ? 'हिन्दी (Hindi)' : 'English (US/IN)'}
                            </span>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                            <span className="text-xs text-[var(--text-muted)] font-semibold block">Voice Readout</span>
                            <span className="text-sm font-bold text-[var(--success)] mt-1 block">
                                {preferences.speechEnabled ? 'Enabled (Active)' : 'Muted'}
                            </span>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                            <span className="text-xs text-[var(--text-muted)] font-semibold block">Keyboard Nav</span>
                            <span className="text-sm font-bold text-[var(--primary)] mt-1 block">
                                Standard Mode (1-4, Arrows)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
