import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
    BookOpen,
    HelpCircle,
    Settings,
    LogOut,
    User,
    Award,
    Shield,
    Volume2,
    Globe as EarthIcon,
    MoreVertical,
    Check,
    Sliders,
    ChevronDown,
    PlayCircle,
    LogIn,
    UserPlus,
    LayoutDashboard,
    Menu,
    X,
    Sparkles
} from 'lucide-react';
import KeyboardHelpModal from './KeyboardHelpModal';
import NavigationDrawer from '../layout/NavigationDrawer';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const {
        preferences,
        updatePref,
        announce,
        speak
    } = useAccessibility();

    const navigate = useNavigate();
    const location = useLocation();

    // Dropdown / Modal States
    const [helpOpen, setHelpOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Refs for outside click handling
    const langRef = useRef(null);
    const moreRef = useRef(null);
    const profileRef = useRef(null);

    // Close on outside click and Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setLangDropdownOpen(false);
            }
            if (moreRef.current && !moreRef.current.contains(event.target)) {
                setMoreMenuOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setLangDropdownOpen(false);
                setMoreMenuOpen(false);
                setProfileDropdownOpen(false);
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleLogout = async () => {
        const msg = preferences.language === 'hi'
            ? 'परीक्षा पोर्टल से लॉगआउट कर दिया गया है। आपका सत्र सुरक्षित रूप से समाप्त हुआ।'
            : 'Logged out of Insight Exam Portal. Session ended securely.';
        speak(msg);
        announce(msg, 'polite');
        setProfileDropdownOpen(false);
        setMoreMenuOpen(false);
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

    const handleThemeChange = (themeId, themeName) => {
        updatePref('theme', themeId);
        const text = `Display contrast theme set to ${themeName}.`;
        speak(text);
        announce(text, 'polite');
    };

    const handleFontSizeChange = (sizeId, sizeName) => {
        updatePref('fontSize', sizeId);
        const text = `Font size set to ${sizeName}.`;
        speak(text);
        announce(text, 'polite');
    };

    const handleTestAudio = () => {
        const testPhrase =
            preferences.language === 'hi'
                ? 'यह दृष्टिबाधित परीक्षा पोर्टल की ऑडियो आवाज परीक्षण है। आपकी आवाज सेटिंग सही काम कर रही है।'
                : 'This is a sample audio test of the self-reading voice engine in Insight Exam Portal.';
        speak(testPhrase);
    };

    const isActive = (path) => {
        if (path === '/exams') {
            return location.pathname === '/exams' || location.pathname === '/exam-window' || location.pathname.startsWith('/exams');
        }
        return location.pathname === path;
    };

    return (
        <header className="bg-neutral-950/95 backdrop-blur-md border-b-2 border-neutral-800 text-white sticky top-0 z-50 shadow-2xl transition-colors">
            <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 gap-2">
                    {/* 1. TOP-LEFT: Prominent Title "Insight Exam Portal Accessible Digital Platform" in Large Text */}
                    <div className="flex items-center gap-3.5 shrink-0">
                        <Link
                            to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'}
                            className="flex items-center gap-3 sm:gap-3.5 group focus-visible:ring-2 focus-visible:ring-[#ffe600] rounded-2xl p-1.5 transition-all hover:bg-neutral-900/60"
                            aria-label="Insight Exam Portal Accessible Digital Platform"
                            title="Insight Exam Portal Accessible Digital Platform"
                        >
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#ffe600] via-yellow-400 to-amber-500 flex items-center justify-center text-black font-black shadow-lg shadow-yellow-500/25 group-hover:scale-105 group-hover:shadow-yellow-400/40 transition-all duration-200 shrink-0 border border-yellow-300">
                                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-xl sm:text-2xl lg:text-[1.65rem] font-black text-white tracking-tight group-hover:text-[#ffe600] transition-colors leading-tight">
                                    Insight Exam Portal
                                </span>
                                <span className="text-[11px] sm:text-xs lg:text-sm font-extrabold text-[#ffe600] tracking-wider leading-none mt-1 uppercase flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-[#ffe600] animate-pulse" aria-hidden="true"></span>
                                    Accessible Digital Platform
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* 2. CENTER-RIGHT: Navigation Bar Aligned Horizontally towards Center-Right containing:
                        "Login", "Register", "Exam Window", "Student Dashboard", and "Admin Dashboard" */}
                    <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 ml-auto mr-2 xl:mr-4" aria-label="Main Navigation">
                        <Link
                            to="/login"
                            className={`px-2.5 xl:px-3.5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 ${
                                isActive('/login')
                                    ? 'bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] shadow-sm shadow-yellow-400/10'
                                    : 'text-neutral-200 hover:text-white hover:bg-neutral-850 border-2 border-transparent hover:border-neutral-700/80 hover:-translate-y-0.5'
                            }`}
                            aria-current={isActive('/login') ? 'page' : undefined}
                        >
                            <LogIn className="w-4 h-4 text-[#ffe600] shrink-0" aria-hidden="true" />
                            <span>Login</span>
                        </Link>

                        <Link
                            to="/register"
                            className={`px-2.5 xl:px-3.5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 ${
                                isActive('/register')
                                    ? 'bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] shadow-sm shadow-yellow-400/10'
                                    : 'text-neutral-200 hover:text-white hover:bg-neutral-850 border-2 border-transparent hover:border-neutral-700/80 hover:-translate-y-0.5'
                            }`}
                            aria-current={isActive('/register') ? 'page' : undefined}
                        >
                            <UserPlus className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
                            <span>Register</span>
                        </Link>

                        <Link
                            to="/exams"
                            className={`px-2.5 xl:px-3.5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 ${
                                isActive('/exams')
                                    ? 'bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] shadow-sm shadow-yellow-400/10'
                                    : 'text-neutral-200 hover:text-white hover:bg-neutral-850 border-2 border-transparent hover:border-neutral-700/80 hover:-translate-y-0.5'
                            }`}
                            aria-current={isActive('/exams') ? 'page' : undefined}
                        >
                            <PlayCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                            <span>Exam Window</span>
                        </Link>

                        <Link
                            to="/dashboard"
                            className={`px-2.5 xl:px-3.5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 ${
                                isActive('/dashboard')
                                    ? 'bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] shadow-sm shadow-yellow-400/10'
                                    : 'text-neutral-200 hover:text-white hover:bg-neutral-850 border-2 border-transparent hover:border-neutral-700/80 hover:-translate-y-0.5'
                            }`}
                            aria-current={isActive('/dashboard') ? 'page' : undefined}
                        >
                            <LayoutDashboard className="w-4 h-4 text-purple-400 shrink-0" aria-hidden="true" />
                            <span>Student Dashboard</span>
                        </Link>

                        <Link
                            to="/admin"
                            className={`px-2.5 xl:px-3.5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 ${
                                isActive('/admin')
                                    ? 'bg-neutral-800 text-[#ffe600] border-2 border-[#ffe600] shadow-sm shadow-yellow-400/10'
                                    : 'text-neutral-200 hover:text-white hover:bg-neutral-850 border-2 border-transparent hover:border-neutral-700/80 hover:-translate-y-0.5'
                            }`}
                            aria-current={isActive('/admin') ? 'page' : undefined}
                        >
                            <Shield className="w-4 h-4 text-[#ffe600] shrink-0" aria-hidden="true" />
                            <span>Admin Dashboard</span>
                        </Link>
                    </nav>

                    {/* 3. FAR-RIGHT: Utilities Section with "Profile", "Help", Language Selector (Earth Icon), and Three-Dot Menu */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                        {/* Profile Button with Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                                aria-haspopup="true"
                                aria-expanded={profileDropdownOpen}
                                aria-label="Profile and user account menu"
                                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#ffe600] shadow-sm ${
                                    profileDropdownOpen
                                        ? 'bg-neutral-800 border-[#ffe600] text-[#ffe600]'
                                        : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-700 text-neutral-200 hover:text-white hover:border-[#ffe600]/80'
                                }`}
                            >
                                <div className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#ffe600] shrink-0">
                                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                                </div>
                                <span className="font-semibold text-xs sm:text-sm">
                                    {isAuthenticated ? user?.rollNumber || 'Profile' : 'Profile'}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                            </button>

                            {/* Profile Dropdown */}
                            {profileDropdownOpen && (
                                <div
                                    role="menu"
                                    aria-label="Profile and account options"
                                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border-2 border-neutral-700 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                >
                                    {isAuthenticated ? (
                                        <>
                                            <div className="pb-3 mb-2 border-b border-neutral-800">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-white text-sm">{user?.name || 'Candidate'}</span>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-[#ffe600] border border-neutral-700 uppercase font-bold">
                                                        {user?.role || 'Student'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-neutral-400 font-mono mt-0.5">Roll: {user?.rollNumber}</p>
                                                {user?.email && <p className="text-xs text-neutral-400 truncate">{user.email}</p>}
                                            </div>

                                            <div className="space-y-1">
                                                <Link
                                                    to="/accessibility"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    role="menuitem"
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-200 hover:text-white hover:bg-neutral-800 flex items-center gap-2.5 transition"
                                                >
                                                    <Settings className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                                    <span>Accessibility Settings</span>
                                                </Link>

                                                <Link
                                                    to={isAdmin ? '/admin' : '/dashboard'}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    role="menuitem"
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-200 hover:text-white hover:bg-neutral-800 flex items-center gap-2.5 transition"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                                    <span>My Portal Dashboard</span>
                                                </Link>

                                                <Link
                                                    to="/results"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    role="menuitem"
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-200 hover:text-white hover:bg-neutral-800 flex items-center gap-2.5 transition"
                                                >
                                                    <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                                                    <span>My Results & Scores</span>
                                                </Link>
                                            </div>

                                            <div className="pt-2 mt-2 border-t border-neutral-800">
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-2.5 font-bold transition"
                                                >
                                                    <LogOut className="w-4 h-4" aria-hidden="true" />
                                                    <span>Sign Out (Logout)</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-xs text-neutral-400 font-semibold mb-2">Candidate Session</p>
                                            <Link
                                                to="/login"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="w-full py-2 px-3 bg-[#ffe600] text-black font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 hover:bg-yellow-400 transition"
                                            >
                                                <LogIn className="w-4 h-4" aria-hidden="true" />
                                                <span>Log In to Account</span>
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="w-full py-2 px-3 bg-neutral-800 text-white font-bold text-sm rounded-lg border border-neutral-700 flex items-center justify-center gap-1.5 hover:bg-neutral-700 transition"
                                            >
                                                <UserPlus className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                                <span>Register Account</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Help Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setHelpOpen(true);
                                speak('Opening Keyboard Shortcuts and Help Guide.');
                            }}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 text-neutral-200 hover:text-[#ffe600] hover:border-[#ffe600] text-xs sm:text-sm font-bold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#ffe600] shadow-sm"
                            aria-label="Help Options and Keyboard Shortcuts"
                            title="Help Options (? or H)"
                        >
                            <HelpCircle className="w-4 h-4 text-[#ffe600] shrink-0" aria-hidden="true" />
                            <span className="hidden sm:inline">Help</span>
                        </button>

                        {/* Language Selector Dropdown (Represented by an Earth Icon) */}
                        <div className="relative" ref={langRef}>
                            <button
                                type="button"
                                onClick={() => setLangDropdownOpen((prev) => !prev)}
                                aria-haspopup="true"
                                aria-expanded={langDropdownOpen}
                                aria-label={`Select language. Current language: ${preferences.language === 'hi' ? 'Hindi' : 'English'}`}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#ffe600] shadow-sm ${
                                    langDropdownOpen
                                        ? 'bg-neutral-800 border-cyan-400 text-cyan-300'
                                        : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-700 hover:border-cyan-400 text-neutral-200 hover:text-white'
                                }`}
                                title="Language Selector (Earth Icon)"
                            >
                                <EarthIcon className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
                                <span className="font-mono text-xs uppercase">{preferences.language === 'hi' ? 'HI' : 'EN'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                            </button>

                            {/* Language Dropdown Menu */}
                            {langDropdownOpen && (
                                <div
                                    role="menu"
                                    aria-label="Language options"
                                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-neutral-900 border-2 border-neutral-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                >
                                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 flex items-center gap-1.5">
                                        <EarthIcon className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                                        <span>Select Language</span>
                                    </div>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleLanguageChange('en')}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition ${
                                            preferences.language === 'en'
                                                ? 'bg-neutral-800 text-[#ffe600] font-bold'
                                                : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">EN</span>
                                            <span>English</span>
                                        </div>
                                        {preferences.language === 'en' && <Check className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />}
                                    </button>

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleLanguageChange('hi')}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition ${
                                            preferences.language === 'hi'
                                                ? 'bg-neutral-800 text-[#ffe600] font-bold'
                                                : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">HI</span>
                                            <span>हिंदी (Hindi)</span>
                                        </div>
                                        {preferences.language === 'hi' && <Check className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Three-Dot Menu Icon with Dropdown */}
                        <div className="relative" ref={moreRef}>
                            <button
                                type="button"
                                onClick={() => setMoreMenuOpen((prev) => !prev)}
                                aria-haspopup="true"
                                aria-expanded={moreMenuOpen}
                                aria-label="Additional portal and accessibility options"
                                className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#ffe600] ${
                                    moreMenuOpen
                                        ? 'bg-[#ffe600] text-black border-[#ffe600]'
                                        : 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-[#ffe600] hover:border-[#ffe600] hover:bg-neutral-850'
                                }`}
                                title="Additional Options (...)"
                            >
                                <MoreVertical className="w-5 h-5" aria-hidden="true" />
                            </button>

                            {/* Three-Dot Dropdown Panel */}
                            {moreMenuOpen && (
                                <div
                                    role="menu"
                                    aria-label="Additional accessibility and portal options"
                                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-neutral-900 border-2 border-neutral-700 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                >
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
                                        <div className="flex items-center gap-2">
                                            <Sliders className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                            <span className="text-sm font-bold text-white">Accessibility & Display</span>
                                        </div>
                                        <Link
                                            to="/accessibility"
                                            onClick={() => setMoreMenuOpen(false)}
                                            className="text-xs text-[#ffe600] hover:underline font-bold"
                                        >
                                            Full Settings
                                        </Link>
                                    </div>

                                    {/* Contrast Theme Switcher */}
                                    <div className="mb-4">
                                        <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                            High Contrast Themes
                                        </span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('high-contrast-yellow', 'High Contrast Yellow')}
                                                className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                                                    preferences.theme === 'high-contrast-yellow'
                                                        ? 'bg-neutral-800 border-[#ffe600] text-[#ffe600]'
                                                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                                }`}
                                            >
                                                <span>Yellow / Black</span>
                                                {preferences.theme === 'high-contrast-yellow' && <Check className="w-3.5 h-3.5" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('high-contrast-cyan', 'High Contrast Cyan')}
                                                className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                                                    preferences.theme === 'high-contrast-cyan'
                                                        ? 'bg-neutral-800 border-cyan-400 text-cyan-400'
                                                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                                }`}
                                            >
                                                <span>Cyan / Navy</span>
                                                {preferences.theme === 'high-contrast-cyan' && <Check className="w-3.5 h-3.5" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('standard-dark', 'Standard Dark')}
                                                className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                                                    preferences.theme === 'standard-dark'
                                                        ? 'bg-neutral-800 border-slate-400 text-white'
                                                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                                }`}
                                            >
                                                <span>Standard Dark</span>
                                                {preferences.theme === 'standard-dark' && <Check className="w-3.5 h-3.5" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('soft-light', 'Soft Light')}
                                                className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                                                    preferences.theme === 'soft-light'
                                                        ? 'bg-neutral-800 border-amber-500 text-amber-300'
                                                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                                }`}
                                            >
                                                <span>Soft Light</span>
                                                {preferences.theme === 'soft-light' && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Text Scaling */}
                                    <div className="mb-4">
                                        <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                            Text Scaling
                                        </span>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleFontSizeChange('normal', 'Standard 16px')}
                                                className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                                                    preferences.fontSize === 'normal'
                                                        ? 'bg-neutral-800 border-[#ffe600] text-[#ffe600]'
                                                        : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                                                }`}
                                            >
                                                Normal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleFontSizeChange('large', 'Large 19px')}
                                                className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                                                    preferences.fontSize === 'large'
                                                        ? 'bg-neutral-800 border-[#ffe600] text-[#ffe600]'
                                                        : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                                                }`}
                                            >
                                                Large
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleFontSizeChange('extra-large', 'Extra Large 22px')}
                                                className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                                                    preferences.fontSize === 'extra-large'
                                                        ? 'bg-neutral-800 border-[#ffe600] text-[#ffe600]'
                                                        : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                                                }`}
                                            >
                                                XL
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2 pt-2 border-t border-neutral-800">
                                        <button
                                            type="button"
                                            onClick={handleTestAudio}
                                            className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold flex items-center justify-between border border-neutral-700 transition"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Volume2 className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                                                <span>Test Audio Speech</span>
                                            </span>
                                            <span className="font-mono text-[10px] text-neutral-400">{preferences.speechRate}x</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMoreMenuOpen(false);
                                                setHelpOpen(true);
                                            }}
                                            className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold flex items-center gap-2 border border-neutral-700 transition"
                                        >
                                            <HelpCircle className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                            <span>Shortcuts & Voice Help</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Three-Line Menu / Drawer Toggle Button */}
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Open portal navigation menu"
                                title="Open portal navigation drawer"
                                className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white hover:border-[#ffe600] focus-visible:ring-2 focus-visible:ring-[#ffe600] transition"
                            >
                                <Menu className="w-5 h-5 sm:w-5 sm:h-5 text-neutral-200" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Structured Navigation Drawer (Grouped by Student, Exam, Practice, Support, Account) */}
            <NavigationDrawer
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                onOpenHelp={() => setHelpOpen(true)}
            />

            {/* Keyboard Shortcuts & Help Modal */}
            <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </header>
    );
}
