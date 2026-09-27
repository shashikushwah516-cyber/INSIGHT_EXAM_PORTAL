import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
    BookOpen,
    Globe as EarthIcon,
    ChevronDown,
    LogIn,
    UserPlus,
    LayoutDashboard,
    Shield,
    User,
    LogOut,
    Sliders,
    Award,
    Menu,
    PlayCircle
} from 'lucide-react';
import NavigationDrawer from '../layout/NavigationDrawer';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { preferences, updatePref, announce, speak } = useAccessibility();
    const location = useLocation();
    const navigate = useNavigate();

    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const langRef = useRef(null);
    const profileRef = useRef(null);

    // Outside click & Escape key listener
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangDropdownOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileDropdownOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setLangDropdownOpen(false);
                setProfileDropdownOpen(false);
                setDrawerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleLogout = async () => {
        const msg = preferences.language === 'hi'
            ? 'परीक्षा पोर्टल से लॉगआउट कर दिया गया है। आपका सत्र सुरक्षित रूप से समाप्त हुआ।'
            : 'Logged out of Insight Exam Portal. Session ended securely.';
        speak(msg);
        announce(msg, 'polite');
        setProfileDropdownOpen(false);
        await logout();
        navigate('/login');
    };

    const handleLanguageChange = (langCode) => {
        updatePref('language', langCode);
        setLangDropdownOpen(false);
        const confirmText =
            langCode === 'hi'
                ? 'भाषा को हिंदी में सेट कर दिया गया है।'
                : 'Language set to English.';
        speak(confirmText, { lang: langCode === 'hi' ? 'hi-IN' : 'en-US' });
        announce(confirmText, 'polite');
    };

    return (
        <>
            <header className="bg-neutral-950/95 backdrop-blur-md border-b-2 border-neutral-800 text-white sticky top-0 z-40 shadow-xl transition-colors">
                <div className="container-app">
                    <div className="flex items-center justify-between h-20 gap-4">
                        {/* 1. LEFT: Application Logo & Name */}
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                to="/"
                                className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#ffe600] rounded-2xl p-1.5 transition-all hover:bg-neutral-900/60"
                                aria-label="Insight Exam Portal Home"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ffe600] via-yellow-400 to-amber-500 flex items-center justify-center text-black font-black shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-all shrink-0 border border-yellow-300">
                                    <BookOpen className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-[#ffe600] transition-colors leading-tight">
                                        Insight Exam Portal
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-extrabold text-[#ffe600] tracking-wider leading-none mt-1 uppercase flex items-center gap-1.5">
                                        <span className="inline-block w-2 h-2 rounded-full bg-[#ffe600] animate-pulse" aria-hidden="true"></span>
                                        Accessible Digital Platform
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* 2. CENTER: Public Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Public Platform Navigation">
                            <a
                                href="/#features"
                                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                            >
                                Features
                            </a>
                            <a
                                href="/#how-it-works"
                                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                            >
                                How It Works
                            </a>
                            <a
                                href="/#accessibility"
                                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                            >
                                Accessibility
                            </a>
                            <a
                                href="/#exams-info"
                                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                            >
                                Examination Info
                            </a>
                            <a
                                href="/#faq"
                                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                            >
                                FAQ
                            </a>
                        </nav>

                        {/* 3. RIGHT: Actions & Authentication Hierarchy */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {/* Language Selector Dropdown */}
                            <div className="relative" ref={langRef}>
                                <button
                                    type="button"
                                    onClick={() => setLangDropdownOpen((prev) => !prev)}
                                    aria-haspopup="true"
                                    aria-expanded={langDropdownOpen}
                                    aria-label={`Select Language, currently ${preferences.language === 'hi' ? 'Hindi' : 'English'}`}
                                    className="h-10 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                                >
                                    <EarthIcon className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                    <span>{preferences.language === 'hi' ? 'हिंदी' : 'EN'}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>

                                {langDropdownOpen && (
                                    <div
                                        role="menu"
                                        aria-label="Language Options"
                                        className="absolute right-0 mt-2 w-44 rounded-2xl bg-neutral-900 border-2 border-neutral-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                    >
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => handleLanguageChange('en')}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                                                preferences.language === 'en'
                                                    ? 'bg-neutral-800 text-[#ffe600] border border-[#ffe600]/40'
                                                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                            }`}
                                        >
                                            <span>English (US / IN)</span>
                                            {preferences.language === 'en' && <span className="w-2 h-2 rounded-full bg-[#ffe600]" />}
                                        </button>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => handleLanguageChange('hi')}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition mt-1 ${
                                                preferences.language === 'hi'
                                                    ? 'bg-neutral-800 text-[#ffe600] border border-[#ffe600]/40'
                                                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                            }`}
                                        >
                                            <span>हिन्दी (Hindi)</span>
                                            {preferences.language === 'hi' && <span className="w-2 h-2 rounded-full bg-[#ffe600]" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Authentication CTAs or User Profile */}
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    {/* Primary Application CTA */}
                                    <Link
                                        to={isAdmin ? '/admin' : '/dashboard'}
                                        className="btn-primary h-10 px-4 text-xs font-bold hidden sm:inline-flex"
                                    >
                                        {isAdmin ? (
                                            <>
                                                <Shield className="w-4 h-4 text-black" aria-hidden="true" />
                                                <span>Admin Console</span>
                                            </>
                                        ) : (
                                            <>
                                                <LayoutDashboard className="w-4 h-4 text-black" aria-hidden="true" />
                                                <span>Student Dashboard</span>
                                            </>
                                        )}
                                    </Link>

                                    {/* Profile Menu Dropdown */}
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            type="button"
                                            onClick={() => setProfileDropdownOpen((prev) => !prev)}
                                            aria-haspopup="true"
                                            aria-expanded={profileDropdownOpen}
                                            aria-label="User account menu"
                                            className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition focus-visible:ring-2 focus-visible:ring-[#ffe600] ${
                                                profileDropdownOpen
                                                    ? 'bg-neutral-800 border-[#ffe600] text-[#ffe600]'
                                                    : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-700 text-neutral-200'
                                            }`}
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#ffe600]">
                                                <User className="w-3.5 h-3.5" aria-hidden="true" />
                                            </div>
                                            <span className="hidden sm:inline font-mono text-xs">
                                                {user?.rollNumber || 'User'}
                                            </span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                        </button>

                                        {profileDropdownOpen && (
                                            <div
                                                role="menu"
                                                aria-label="Account options"
                                                className="absolute right-0 mt-2 w-60 rounded-2xl bg-neutral-900 border-2 border-neutral-700 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                            >
                                                <div className="pb-3 mb-2 border-b border-neutral-800">
                                                    <p className="font-bold text-white text-sm">{user?.name || 'Candidate'}</p>
                                                    <p className="text-xs text-neutral-400 font-mono mt-0.5">Roll: {user?.rollNumber}</p>
                                                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-[#ffe600] border border-neutral-700 uppercase font-bold">
                                                        {user?.role || 'Student'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <Link
                                                        to={isAdmin ? '/admin' : '/dashboard'}
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        role="menuitem"
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 flex items-center gap-2.5 transition"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                                        <span>Workspace Dashboard</span>
                                                    </Link>

                                                    <Link
                                                        to="/exams"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        role="menuitem"
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 flex items-center gap-2.5 transition"
                                                    >
                                                        <PlayCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                                                        <span>Available Exams</span>
                                                    </Link>

                                                    <Link
                                                        to="/accessibility"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        role="menuitem"
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 flex items-center gap-2.5 transition"
                                                    >
                                                        <Sliders className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                                        <span>Accessibility Settings</span>
                                                    </Link>

                                                    <Link
                                                        to="/results"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        role="menuitem"
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 flex items-center gap-2.5 transition"
                                                    >
                                                        <Award className="w-4 h-4 text-amber-400" aria-hidden="true" />
                                                        <span>My Results</span>
                                                    </Link>
                                                </div>

                                                <div className="pt-2 mt-2 border-t border-neutral-800">
                                                    <button
                                                        type="button"
                                                        role="menuitem"
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-2 transition"
                                                    >
                                                        <LogOut className="w-4 h-4" aria-hidden="true" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="h-10 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-neutral-200 hover:text-white hover:bg-neutral-900 border border-neutral-700/80 hover:border-neutral-500 transition inline-flex items-center gap-1.5"
                                    >
                                        <LogIn className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                        <span>Student Login</span>
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="btn-primary h-10 px-4 sm:px-5 text-xs sm:text-sm font-extrabold shadow-md"
                                    >
                                        <UserPlus className="w-4 h-4" aria-hidden="true" />
                                        <span>Register</span>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Hamburger Drawer Trigger */}
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(true)}
                                className="lg:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white hover:border-[#ffe600] transition"
                                aria-label="Open mobile navigation drawer"
                            >
                                <Menu className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile / Keyboard Structured Navigation Drawer */}
            <NavigationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    );
}
