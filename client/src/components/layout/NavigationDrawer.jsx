import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
    X,
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
    Globe as EarthIcon,
    FileText
} from 'lucide-react';

export default function NavigationDrawer({ isOpen, onClose, onOpenHelp }) {
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
            ? 'bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] shadow-sm font-bold'
            : 'text-neutral-200 hover:text-white hover:bg-neutral-800/80 border-2 border-transparent hover:-translate-y-0.5'
        }
    `;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Application Navigation Drawer"
            ref={drawerRef}
        >
            <div
                className="w-full max-w-sm sm:max-w-md h-full bg-neutral-950 border-l-2 border-neutral-800 text-white flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-250"
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-950/95 backdrop-blur-md z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#ffe600] text-black font-black flex items-center justify-center">
                            <BookOpen className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-base font-black text-white block leading-tight">Insight Exam Portal</span>
                            <span className="text-[10px] font-bold text-[#ffe600] uppercase tracking-wider block">Structured Portal Navigation</span>
                        </div>
                    </div>
                    <button
                        ref={closeBtnRef}
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-850 focus-visible:ring-2 focus-visible:ring-[#ffe600] transition"
                        aria-label="Close navigation drawer"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Body: Grouped Sections */}
                <div className="flex-1 p-4 sm:p-5 space-y-6">
                    {/* SECTION 1: STUDENT */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                            <span>Student Portal</span>
                        </h2>
                        <div className="space-y-1">
                            <Link
                                to="/dashboard"
                                onClick={onClose}
                                className={navItemClass('/dashboard')}
                            >
                                <span className="flex items-center gap-2.5">
                                    <LayoutDashboard className="w-4 h-4 text-purple-400" aria-hidden="true" />
                                    <span>Student Dashboard</span>
                                </span>
                                {isAuthenticated && <span className="text-[10px] font-mono bg-neutral-900 px-2 py-0.5 rounded text-neutral-400">Active</span>}
                            </Link>
                            <Link
                                to="/accessibility"
                                onClick={onClose}
                                className={navItemClass('/accessibility')}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Sliders className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                    <span>Candidate Preferences</span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION 2: EXAMINATION */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-2">
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            <span>Examination</span>
                        </h2>
                        <div className="space-y-1">
                            <Link
                                to="/exams"
                                onClick={onClose}
                                className={navItemClass('/exams')}
                            >
                                <span className="flex items-center gap-2.5">
                                    <PlayCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                                    <span>Available Examinations</span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                    Timed
                                </span>
                            </Link>

                            <Link
                                to="/results"
                                onClick={onClose}
                                className={navItemClass('/results')}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Award className="w-4 h-4 text-amber-400" aria-hidden="true" />
                                    <span>My Exam Results & Solutions</span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION 3: PRACTICE */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                            <span>Practice & Preparation</span>
                        </h2>
                        <div className="space-y-1">
                            <Link
                                to="/practice"
                                onClick={onClose}
                                className={navItemClass('/practice')}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Target className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                    <span>Practice Questions & Explanations</span>
                                </span>
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                                    Audio
                                </span>
                            </Link>

                            <Link
                                to="/analytics"
                                onClick={onClose}
                                className={navItemClass('/analytics')}
                            >
                                <span className="flex items-center gap-2.5">
                                    <BarChart3 className="w-4 h-4 text-pink-400" aria-hidden="true" />
                                    <span>Performance Analytics</span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION 4: SUPPORT */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-2">
                            <HelpCircle className="w-3.5 h-3.5 text-[#ffe600]" aria-hidden="true" />
                            <span>Support & Guidance</span>
                        </h2>
                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    if (onOpenHelp) onOpenHelp();
                                }}
                                className="w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between text-neutral-200 hover:text-white hover:bg-neutral-800/80 transition"
                            >
                                <span className="flex items-center gap-2.5">
                                    <HelpCircle className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                    <span>Keyboard Shortcuts & Voice Guide</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-[#ffe600] bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">? / H</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    speak('Self reading audio engine test. Insight Exam Portal voice synthesiser active.');
                                }}
                                className="w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between text-neutral-200 hover:text-white hover:bg-neutral-800/80 transition"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Volume2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                    <span>Audio Speech Test</span>
                                </span>
                                <span className="text-xs font-mono text-neutral-400">{preferences.speechRate}x</span>
                            </button>
                        </div>
                    </div>

                    {/* SECTION 5: ADMINISTRATOR PORTAL (If admin) */}
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-yellow-400" aria-hidden="true" />
                            <span>Administrator Control</span>
                        </h2>
                        <div className="space-y-1">
                            <Link
                                to="/admin"
                                onClick={onClose}
                                className={navItemClass('/admin')}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Shield className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                                    <span>Admin Examination Console</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer / Account Section */}
                <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/60 sticky bottom-0">
                    {isAuthenticated ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#ffe600]">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white leading-none">{user?.name || user?.rollNumber}</p>
                                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Roll: {user?.rollNumber}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-[#ffe600] border border-neutral-700 uppercase">
                                    {user?.role || 'Candidate'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    onClose();
                                    await logout();
                                }}
                                className="w-full h-10 px-3 rounded-xl bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/80 text-xs font-bold flex items-center justify-center gap-2 transition"
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
                                className="flex-1 h-10 rounded-xl bg-[#ffe600] text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-yellow-400 transition"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Student Login</span>
                            </Link>
                            <Link
                                to="/register"
                                onClick={onClose}
                                className="flex-1 h-10 rounded-xl bg-neutral-800 text-white font-bold text-xs border border-neutral-700 flex items-center justify-center gap-1.5 hover:bg-neutral-750 transition"
                            >
                                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Register</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
