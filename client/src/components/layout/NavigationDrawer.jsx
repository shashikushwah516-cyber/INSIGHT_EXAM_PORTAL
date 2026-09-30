import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
    X,
    Home,
    LayoutDashboard,
    User,
    BookOpen,
    PlayCircle,
    Award,
    Target,
    BarChart3,
    HelpCircle,
    Settings,
    LogOut,
    LogIn,
    UserPlus,
    Volume2,
    Shield,
    Sliders,
    Sparkles,
    Phone,
    Info,
    CheckCircle2
} from 'lucide-react';

export default function NavigationDrawer({ isOpen, onClose, onOpenAI }) {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { preferences, speak } = useAccessibility();
    const location = useLocation();
    const drawerRef = useRef(null);
    const closeBtnRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            speak('Navigation menu opened. Use Tab to navigate sections or press Escape to close.');
            if (closeBtnRef.current) {
                closeBtnRef.current.focus();
            }
        }
    }, [isOpen, speak]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isActive = (path) => location.pathname === path;

    const navItemClass = (path) => `
        w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all duration-150
        ${isActive(path)
            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
        }
    `;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Application Navigation Drawer"
            ref={drawerRef}
        >
            <div
                className="w-full max-w-sm sm:max-w-md h-full bg-white border-l border-slate-200 text-slate-900 flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-250"
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shadow-xs">
                            <BookOpen className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-base font-black text-slate-900 block leading-tight">Insight Exam Portal</span>
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Universal Navigation</span>
                        </div>
                    </div>
                    <button
                        ref={closeBtnRef}
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 transition"
                        aria-label="Close navigation drawer"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Body: Grouped Sections */}
                <div className="flex-1 p-4 sm:p-5 space-y-6">
                    {/* SECTION 1: PUBLIC DISCOVERY */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                            <span>Public Website</span>
                        </h2>
                        <div className="space-y-1">
                            <Link to="/" onClick={onClose} className={navItemClass('/')}>
                                <span className="flex items-center gap-2.5">
                                    <Home className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                    <span>Home Overview</span>
                                </span>
                            </Link>

                            <Link to="/about" onClick={onClose} className={navItemClass('/about')}>
                                <span className="flex items-center gap-2.5">
                                    <Info className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                                    <span>About Platform</span>
                                </span>
                            </Link>

                            <Link to="/how-it-works" onClick={onClose} className={navItemClass('/how-it-works')}>
                                <span className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                    <span>How It Works</span>
                                </span>
                            </Link>

                            <Link to="/contact" onClick={onClose} className={navItemClass('/contact')}>
                                <span className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                    <span>Contact & Helpline</span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION 2: CANDIDATE PORTAL */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
                            <span>Candidate Workspace</span>
                        </h2>
                        <div className="space-y-1">
                            <Link to="/dashboard" onClick={onClose} className={navItemClass('/dashboard')}>
                                <span className="flex items-center gap-2.5">
                                    <LayoutDashboard className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                    <span>Candidate Dashboard</span>
                                </span>
                                {isAuthenticated && <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">Active</span>}
                            </Link>

                            <Link to="/accessibility" onClick={onClose} className={navItemClass('/accessibility')}>
                                <span className="flex items-center gap-2.5">
                                    <Sliders className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                    <span>Accessibility Settings</span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION 3: EXAMINATION & PRACTICE */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                            <span>Testing & Preparation</span>
                        </h2>
                        <div className="space-y-1">
                            <Link to="/exams" onClick={onClose} className={navItemClass('/exams')}>
                                <span className="flex items-center gap-2.5">
                                    <PlayCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                    <span>Available Examinations</span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Timed
                                </span>
                            </Link>

                            <Link to="/practice" onClick={onClose} className={navItemClass('/practice')}>
                                <span className="flex items-center gap-2.5">
                                    <Target className="w-4 h-4 text-cyan-600" aria-hidden="true" />
                                    <span>Practice Questions & Explanations</span>
                                </span>
                                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                                    Audio
                                </span>
                            </Link>

                            <Link to="/results" onClick={onClose} className={navItemClass('/results')}>
                                <span className="flex items-center gap-2.5">
                                    <Award className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                    <span>My Exam Results & Solutions</span>
                                </span>
                            </Link>

                            <Link to="/analytics" onClick={onClose} className={navItemClass('/analytics')}>
                                <span className="flex items-center gap-2.5">
                                    <BarChart3 className="w-4 h-4 text-pink-600" aria-hidden="true" />
                                    <span>Performance Analytics</span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION 4: ACCESSIBILITY & AI ASSISTANT */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                            <span>Guidance & Assistive Tools</span>
                        </h2>
                        <div className="space-y-1">
                            <Link to="/help" onClick={onClose} className={navItemClass('/help')}>
                                <span className="flex items-center gap-2.5">
                                    <HelpCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                    <span>Help Center & Keyboard Guide</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">? / H</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    if (onOpenAI) onOpenAI();
                                }}
                                className="w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Sparkles className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                    <span>Voice-First AI Assistant</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Alt+A</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    speak('Self reading audio engine test. Insight Exam Portal voice synthesizer active.');
                                }}
                                className="w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Volume2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                    <span>Audio Speech Test</span>
                                </span>
                                <span className="text-xs font-mono text-slate-500">{preferences.speechRate}x</span>
                            </button>
                        </div>
                    </div>

                    {/* SECTION 5: ADMINISTRATOR PORTAL (If admin) */}
                    {isAdmin && (
                        <div>
                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                                <span>Administrator Control</span>
                            </h2>
                            <div className="space-y-1">
                                <Link to="/admin" onClick={onClose} className={navItemClass('/admin')}>
                                    <span className="flex items-center gap-2.5">
                                        <Shield className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                        <span>Admin Examination Console</span>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Account Section */}
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 sticky bottom-0">
                    {isAuthenticated ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || user?.rollNumber}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Roll: {user?.rollNumber}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono">
                                    {user?.role || 'Candidate'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    onClose();
                                    await logout();
                                }}
                                className="w-full h-10 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                            >
                                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Sign Out from Portal</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="flex-1 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 shadow-xs transition"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Student Login</span>
                            </Link>
                            <Link
                                to="/register"
                                onClick={onClose}
                                className="flex-1 h-10 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition"
                            >
                                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                                <span>Register</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
