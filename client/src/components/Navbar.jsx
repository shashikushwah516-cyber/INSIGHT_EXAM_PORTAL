import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility, THEMES } from '../context/AccessibilityContext';
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
    X,
    PlayCircle,
    Sparkles,
    HelpCircle,
    MoreVertical,
    Volume2,
    VolumeX,
    Keyboard,
    Target,
    Sun,
    Moon,
    Palette,
    Check
} from 'lucide-react';
import AIAssistantModal from './common/AIAssistantModal';
import KeyboardHelpModal from './common/KeyboardHelpModal';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { preferences, updatePref, announce, speak, themesList } = useAccessibility();
    const location = useLocation();
    const navigate = useNavigate();

    // Dropdown states
    const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [keyboardModalOpen, setKeyboardModalOpen] = useState(false);

    // Click outside refs
    const themeRef = useRef(null);
    const langRef = useRef(null);
    const moreRef = useRef(null);

    // Current theme object
    const themes = themesList || THEMES;
    const currentTheme = themes.find((t) => t.id === preferences.theme) || themes[0];

    // Close dropdowns on outside click & escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (themeRef.current && !themeRef.current.contains(e.target)) {
                setThemeDropdownOpen(false);
            }
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangDropdownOpen(false);
            }
            if (moreRef.current && !moreRef.current.contains(e.target)) {
                setMoreDropdownOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setThemeDropdownOpen(false);
                setLangDropdownOpen(false);
                setMoreDropdownOpen(false);
                setMobileMenuOpen(false);
                setAiModalOpen(false);
                setKeyboardModalOpen(false);
            }
            // Global Alt+A for AI Assistant
            if (e.altKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                setAiOpenSafe();
            }
            // Global Alt+K or '?' for Keyboard Help
            if ((e.altKey && (e.key === 'k' || e.key === 'K')) || (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName))) {
                e.preventDefault();
                setKeyboardModalOpen((prev) => !prev);
            }
        };

        const setAiOpenSafe = () => {
            setAiModalOpen((prev) => !prev);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setThemeDropdownOpen(false);
        setLangDropdownOpen(false);
        setMoreDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        const msg = preferences.language === 'hi'
            ? 'परीक्षा पोर्टल से लॉगआउट कर दिया गया है। आपका सत्र सुरक्षित रूप से समाप्त हुआ।'
            : 'Logged out of Insight Exam Portal. Session ended securely.';
        speak(msg);
        announce(msg, 'polite');
        setMoreDropdownOpen(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/login');
    };

    const handleLanguageChange = (langCode) => {
        updatePref('language', langCode);
        setLangDropdownOpen(false);
        const confirmText = langCode === 'hi'
            ? 'पोर्टल की भाषा हिन्दी में बदल दी गई है।'
            : 'Portal language changed to English.';
        speak(confirmText, { lang: langCode === 'hi' ? 'hi-IN' : 'en-US' });
        announce(confirmText, 'polite');
    };

    const handleThemeSelect = (themeId) => {
        updatePref('theme', themeId);
        setThemeDropdownOpen(false);
        setMoreDropdownOpen(false);

        const target = themes.find((t) => t.id === themeId);
        const text = `Display theme changed to ${target?.name || themeId}`;
        speak(text);
        announce(text, 'polite');
    };

    const handleThemeCycle = () => {
        const order = ['clean-light', 'high-contrast-yellow', 'high-contrast-cyan', 'standard-dark'];
        const currentIdx = order.indexOf(preferences.theme);
        const nextTheme = order[(currentIdx + 1) % order.length];
        handleThemeSelect(nextTheme);
    };

    const handleSpeechToggle = () => {
        const nextState = !preferences.speechEnabled;
        updatePref('speechEnabled', nextState);
        const text = nextState ? 'Voice narration enabled' : 'Voice narration muted';
        speak(text);
        announce(text, 'polite');
    };

    // Navigation Items list
    const navLinks = [
        { name: 'Login', path: '/login', icon: LogIn },
        { name: 'Register', path: '/register', icon: UserPlus },
        { name: 'Exam Window', path: '/exam-window', icon: PlayCircle },
        { name: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Admin Dashboard', path: '/admin', icon: Shield }
    ];

    const isLinkActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard' || location.pathname === '/student-dashboard';
        }
        if (path === '/admin') {
            return location.pathname.startsWith('/admin');
        }
        if (path === '/exam-window') {
            return location.pathname === '/exam-window' || location.pathname.startsWith('/exams');
        }
        return location.pathname === path;
    };

    return (
        <>
            <header className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] text-[var(--text-primary)] sticky top-0 z-50 shadow-xs transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between min-h-[4.25rem] py-2 gap-3 lg:gap-6">
                        
                        {/* 1. TITLE & BRANDING (TOP-LEFT) */}
                        <div className="flex items-center gap-3 shrink-0 min-w-0">
                            <Link
                                to="/"
                                className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl p-1 transition-all"
                                aria-label="Insight Exam Portal - Go to Homepage"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)] text-[var(--accent-text)] flex items-center justify-center shadow-xs shrink-0 font-black">
                                    <BookOpen className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <span className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight leading-tight truncate">
                                        Insight Exam Portal
                                    </span>
                                    <span className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase flex items-center gap-1.5 leading-none mt-0.5 truncate">
                                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                                        Accessible Platform
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* 2. NAVIGATION LINKS */}
                        <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5" aria-label="Main Application Navigation">
                            {navLinks.map((item) => {
                                const active = isLinkActive(item.path);
                                const IconComponent = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-150 flex items-center gap-2 border ${
                                            active
                                                ? 'bg-[var(--accent-color)] text-[var(--accent-text)] border-[var(--border-accent)] font-bold shadow-xs'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-transparent'
                                        } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]`}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        <IconComponent className="w-4 h-4 shrink-0" aria-hidden="true" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* 3. UTILITY CONTROLS (FAR-RIGHT) */}
                        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                            
                            {/* 4-Mode Accessibility Color Switcher Dropdown */}
                            <div className="relative" ref={themeRef}>
                                <button
                                    type="button"
                                    onClick={() => setThemeDropdownOpen((prev) => !prev)}
                                    aria-haspopup="true"
                                    aria-expanded={themeDropdownOpen}
                                    aria-label={`Visual theme mode, currently ${currentTheme.name}`}
                                    title="Switch Color / Accessibility Mode"
                                    className="h-10 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                                >
                                    <Palette className="w-4 h-4 text-[var(--accent-color)] shrink-0" aria-hidden="true" />
                                    <span className="hidden md:inline font-bold">{currentTheme.shortName}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${themeDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>

                                {themeDropdownOpen && (
                                    <div
                                        role="menu"
                                        aria-label="Color Accessibility Themes"
                                        className="absolute right-0 mt-2 w-72 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                    >
                                        <div className="px-3 py-2 border-b border-[var(--border-color)] mb-1">
                                            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                                4 Accessibility Theme Modes
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            {themes.map((t) => {
                                                const isSelected = preferences.theme === t.id;
                                                return (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        role="menuitem"
                                                        onClick={() => handleThemeSelect(t.id)}
                                                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-start gap-2.5 transition-colors border ${
                                                            isSelected
                                                                ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] border-[var(--border-accent)]'
                                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border-transparent'
                                                        }`}
                                                    >
                                                        <span
                                                            className="w-4 h-4 rounded-full border border-black/30 shrink-0 mt-0.5"
                                                            style={{ backgroundColor: t.color }}
                                                            aria-hidden="true"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold truncate">{t.name}</span>
                                                                {isSelected && <Check className="w-4 h-4 text-[var(--accent-color)] shrink-0" />}
                                                            </div>
                                                            <p className="text-[10px] font-normal text-[var(--text-muted)] mt-0.5 line-clamp-2">
                                                                {t.desc}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Language Selector Dropdown */}
                            <div className="relative" ref={langRef}>
                                <button
                                    type="button"
                                    onClick={() => setLangDropdownOpen((prev) => !prev)}
                                    aria-haspopup="true"
                                    aria-expanded={langDropdownOpen}
                                    aria-label={`Select Language, currently ${preferences.language === 'hi' ? 'Hindi' : 'English'}`}
                                    className="h-10 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                                >
                                    <EarthIcon className="w-4 h-4 text-[var(--accent-color)]" aria-hidden="true" />
                                    <span>{preferences.language === 'hi' ? 'हिंदी' : 'EN'}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>

                                {langDropdownOpen && (
                                    <div
                                        role="menu"
                                        aria-label="Language selection options"
                                        className="absolute right-0 mt-2 w-48 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                    >
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => handleLanguageChange('en')}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                                                preferences.language === 'en'
                                                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                            }`}
                                        >
                                            <span>English (US / IN)</span>
                                            {preferences.language === 'en' && <Check className="w-4 h-4 text-[var(--accent-color)]" />}
                                        </button>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => handleLanguageChange('hi')}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors mt-1 ${
                                                preferences.language === 'hi'
                                                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                            }`}
                                        >
                                            <span>हिन्दी (Hindi)</span>
                                            {preferences.language === 'hi' && <Check className="w-4 h-4 text-[var(--accent-color)]" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Link */}
                            <Link
                                to="/profile"
                                className="h-10 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-2 transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                                aria-label="User Profile"
                                title="View User Profile"
                            >
                                <div className="w-6 h-6 rounded-lg bg-[var(--accent-color)] text-[var(--accent-text)] flex items-center justify-center font-bold">
                                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                                </div>
                                <span className="hidden sm:inline font-mono">
                                    {user?.rollNumber || (isAuthenticated ? 'Account' : 'Profile')}
                                </span>
                            </Link>

                            {/* Help Link */}
                            <Link
                                to="/help"
                                className="h-10 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                                aria-label="Help & Accessibility Support Center"
                                title="Help & Support"
                            >
                                <HelpCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                <span className="hidden md:inline">Help</span>
                            </Link>

                            {/* Three-Dot Menu Icon for Extended Utilities */}
                            <div className="relative" ref={moreRef}>
                                <button
                                    type="button"
                                    onClick={() => setMoreDropdownOpen((prev) => !prev)}
                                    aria-haspopup="true"
                                    aria-expanded={moreDropdownOpen}
                                    aria-label="Additional application options and accessibility utilities"
                                    className={`h-10 w-10 rounded-xl border border-[var(--border-color)] flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shadow-xs ${
                                        moreDropdownOpen
                                            ? 'bg-[var(--bg-hover)] text-[var(--accent-color)] border-[var(--border-accent)]'
                                            : 'bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                                    }`}
                                >
                                    <MoreVertical className="w-4 h-4" aria-hidden="true" />
                                </button>

                                {moreDropdownOpen && (
                                    <div
                                        role="menu"
                                        aria-label="Extended Options Menu"
                                        className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                    >
                                        <div className="px-3 py-2 border-b border-[var(--border-color)] mb-1">
                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Quick Utilities</p>
                                        </div>

                                        <div className="space-y-1">
                                            <Link
                                                to="/accessibility"
                                                onClick={() => setMoreDropdownOpen(false)}
                                                role="menuitem"
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 transition-colors"
                                            >
                                                <Sliders className="w-4 h-4 text-[var(--accent-color)]" aria-hidden="true" />
                                                <span>Accessibility Settings</span>
                                            </Link>

                                            <Link
                                                to="/practice"
                                                onClick={() => setMoreDropdownOpen(false)}
                                                role="menuitem"
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 transition-colors"
                                            >
                                                <Target className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                <span>Practice & Mock Portal</span>
                                            </Link>

                                            <Link
                                                to="/results"
                                                onClick={() => setMoreDropdownOpen(false)}
                                                role="menuitem"
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 transition-colors"
                                            >
                                                <Award className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                                <span>Exam Results & Review</span>
                                            </Link>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => {
                                                    setMoreDropdownOpen(false);
                                                    setAiModalOpen(true);
                                                }}
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-between transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                                                    <span>AI Voice Assistant</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Alt+A</span>
                                            </button>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => {
                                                    setMoreDropdownOpen(false);
                                                    setKeyboardModalOpen(true);
                                                }}
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-between transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Keyboard className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                    <span>Keyboard Shortcuts</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Alt+K</span>
                                            </button>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={handleThemeCycle}
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-between transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Sun className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                                                    <span>Cycle Theme Mode</span>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-[var(--accent-color)] capitalize">
                                                    {currentTheme.shortName}
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={handleSpeechToggle}
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-between transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {preferences.speechEnabled ? (
                                                        <Volume2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                    ) : (
                                                        <VolumeX className="w-4 h-4 text-red-500" aria-hidden="true" />
                                                    )}
                                                    <span>Speech Narration</span>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                                                    {preferences.speechEnabled ? 'ACTIVE' : 'MUTED'}
                                                </span>
                                            </button>
                                        </div>

                                        {isAuthenticated && (
                                            <div className="pt-2 mt-2 border-t border-[var(--border-color)]">
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" aria-hidden="true" />
                                                    <span>Sign Out Securely</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Hamburger Trigger */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                                className="xl:hidden h-10 w-10 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
                                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5 text-[var(--text-primary)]" aria-hidden="true" />
                                ) : (
                                    <Menu className="w-5 h-5 text-[var(--text-primary)]" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBILE / RESPONSIVE DROPDOWN MENU */}
                {mobileMenuOpen && (
                    <div className="xl:hidden border-t border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200 shadow-xl">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">Portal Navigation</p>
                            {navLinks.map((item) => {
                                const active = isLinkActive(item.path);
                                const IconComponent = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                            active
                                                ? 'bg-[var(--accent-color)] text-[var(--accent-text)] font-bold'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                        }`}
                                    >
                                        <IconComponent className="w-4 h-4 shrink-0" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-2">
                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border-color)]"
                            >
                                <User className="w-4 h-4 text-[var(--accent-color)]" />
                                <span>My Profile</span>
                            </Link>

                            <Link
                                to="/help"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border-color)]"
                            >
                                <HelpCircle className="w-4 h-4 text-emerald-600" />
                                <span>Help Center</span>
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Global AI Assistant Modal */}
            <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} isExamActive={false} />

            {/* Global Keyboard Help Modal */}
            <KeyboardHelpModal isOpen={keyboardModalOpen} onClose={() => setKeyboardModalOpen(false)} />
        </>
    );
}