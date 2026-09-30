import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility, THEMES } from '../../context/AccessibilityContext';
import {
    BookOpen,
    LayoutDashboard,
    PlayCircle,
    Target,
    Award,
    BarChart3,
    Sliders,
    HelpCircle,
    LogOut,
    User,
    Volume2,
    Menu,
    X,
    ChevronRight,
    Shield,
    Sparkles,
    Palette,
    Check
} from 'lucide-react';
import KeyboardHelpModal from '../common/KeyboardHelpModal';
import AIAssistantModal from '../common/AIAssistantModal';

export default function DashboardLayout({ children, pageTitle, pageDescription }) {
    const { user, logout, isAdmin } = useAuth();
    const { preferences, updatePref, speak, announce, themesList } = useAccessibility();
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const themeRef = useRef(null);

    const themes = themesList || THEMES;
    const currentTheme = themes.find((t) => t.id === preferences.theme) || themes[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (themeRef.current && !themeRef.current.contains(e.target)) {
                setThemeOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.altKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                setAiOpen((prev) => !prev);
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
        speak('Logged out securely from your examination portal.');
        await logout();
        navigate('/login');
    };

    const handleThemeSelect = (themeId) => {
        updatePref('theme', themeId);
        setThemeOpen(false);
        const target = themes.find((t) => t.id === themeId);
        const text = `Theme changed to ${target?.name || themeId}`;
        speak(text);
        announce(text, 'polite');
    };

    const navItems = [
        {
            group: 'STUDENT PORTAL',
            items: [
                { label: 'Overview & Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { label: 'Candidate Preferences', path: '/accessibility', icon: Sliders }
            ]
        },
        {
            group: 'EXAMINATIONS',
            items: [
                { label: 'Available Exams', path: '/exams', icon: PlayCircle, badge: 'Timed' },
                { label: 'My Exam Results', path: '/results', icon: Award }
            ]
        },
        {
            group: 'PREPARATION & PRACTICE',
            items: [
                { label: 'Practice & Mock Tests', path: '/practice', icon: Target, badge: 'Audio' },
                { label: 'Performance Analytics', path: '/analytics', icon: BarChart3 }
            ]
        }
    ];

    if (isAdmin) {
        navItems.push({
            group: 'ADMINISTRATOR CONSOLE',
            items: [
                { label: 'Switch to Admin Console', path: '/admin', icon: Shield, badge: 'Admin' }
            ]
        });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col transition-colors duration-150">
            {/* 1. Top Dashboard Header Bar */}
            <header className="min-h-16 py-2 border-b border-[var(--border-color)] bg-[var(--bg-surface)] sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="lg:hidden p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
                        aria-label="Toggle Dashboard Sidebar Menu"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <Link to="/" className="flex items-center gap-2 sm:gap-2.5 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl p-1 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--accent-color)] text-[var(--accent-text)] flex items-center justify-center font-black shadow-xs shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div className="hidden sm:flex flex-col min-w-0">
                            <span className="text-sm sm:text-base font-black text-[var(--text-primary)] leading-tight truncate">Insight Exam Portal</span>
                            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider truncate">Candidate Workspace</span>
                        </div>
                    </Link>

                    {/* Breadcrumbs */}
                    <div className="hidden xl:flex items-center gap-1.5 text-xs text-[var(--text-muted)] border-l border-[var(--border-color)] pl-4 ml-1">
                        <span>Portal</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        <span className="text-[var(--accent-color)] font-bold">{pageTitle || 'Dashboard'}</span>
                    </div>
                </div>

                {/* Right Top Header Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Theme Switcher Dropdown */}
                    <div className="relative" ref={themeRef}>
                        <button
                            type="button"
                            onClick={() => setThemeOpen((prev) => !prev)}
                            aria-label={`Current theme: ${currentTheme.name}. Click to change theme.`}
                            className="h-9 px-2 sm:px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                        >
                            <Palette className="w-4 h-4 text-[var(--accent-color)]" aria-hidden="true" />
                            <span className="hidden md:inline font-bold">{currentTheme.shortName}</span>
                        </button>

                        {themeOpen && (
                            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-3 py-2 border-b border-[var(--border-color)] mb-1">
                                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                        Color Theme Modes
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => handleThemeSelect(t.id)}
                                            className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border ${
                                                preferences.theme === t.id
                                                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] border-[var(--border-accent)]'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border-transparent'
                                            }`}
                                        >
                                            <span className="w-4 h-4 rounded-full border border-black/30 shrink-0" style={{ backgroundColor: t.color }} />
                                            <span className="flex-1 truncate">{t.name}</span>
                                            {preferences.theme === t.id && <Check className="w-4 h-4 text-[var(--accent-color)]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Assistant Button */}
                    <button
                        type="button"
                        onClick={() => setAiOpen(true)}
                        className="h-9 px-2 sm:px-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] hover:border-[var(--border-accent)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                        aria-label="Open AI Assistant (Alt+A)"
                        title="AI Assistant (Alt+A)"
                    >
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
                        <span className="hidden lg:inline">AI Voice</span>
                    </button>

                    {/* Read Page Audio Button */}
                    <button
                        type="button"
                        onClick={() => speak(`${pageTitle || 'Dashboard'}. ${pageDescription || 'Welcome to your candidate examination workspace.'}`)}
                        className="h-9 px-2.5 sm:px-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] hover:border-[var(--border-accent)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                        aria-label="Listen to page summary"
                    >
                        <Volume2 className="w-4 h-4 text-[var(--accent-color)] shrink-0" aria-hidden="true" />
                        <span className="hidden lg:inline">Summary</span>
                    </button>

                    {/* Help Button */}
                    <button
                        type="button"
                        onClick={() => setHelpOpen(true)}
                        className="h-9 px-2.5 sm:px-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] hover:border-[var(--border-accent)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                        aria-label="Open keyboard shortcuts help"
                        title="Shortcuts (? or H)"
                    >
                        <HelpCircle className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                        <span className="hidden xl:inline">Help</span>
                    </button>

                    {/* User Profile Pill */}
                    <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[var(--border-color)]">
                        <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)] text-[var(--accent-text)] flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="hidden md:flex flex-col text-left min-w-0 max-w-[120px]">
                            <span className="text-xs font-bold text-[var(--text-primary)] leading-none truncate">{user?.name || user?.rollNumber || 'Candidate'}</span>
                            <span className="text-[10px] font-mono text-[var(--accent-color)] mt-0.5 truncate">{user?.rollNumber || 'CANDIDATE'}</span>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="h-9 px-2.5 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-red-50 dark:hover:bg-red-950/40 text-[var(--text-muted)] hover:text-red-600 border border-[var(--border-color)] hover:border-red-300 text-xs font-bold transition shrink-0"
                        aria-label="Sign Out"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* 2. Dashboard Body (Sidebar + Content Workspace) */}
            <div className="flex-1 flex max-w-7xl 2xl:max-w-[1536px] w-full mx-auto">
                {/* Desktop & Collapsible Mobile Sidebar */}
                <aside
                    className={`
                        fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    aria-label="Candidate Workspace Navigation"
                >
                    <nav className="space-y-6">
                        {navItems.map((group, gIdx) => (
                            <div key={gIdx}>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-2">
                                    {group.group}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item, iIdx) => {
                                        const Icon = item.icon;
                                        const current = isActive(item.path);
                                        return (
                                            <Link
                                                key={iIdx}
                                                to={item.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`
                                                    h-10 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-150
                                                    ${current
                                                        ? 'bg-[var(--accent-color)] text-[var(--accent-text)] font-bold shadow-xs'
                                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent'
                                                    }
                                                `}
                                                aria-current={current ? 'page' : undefined}
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                                    <span>{item.label}</span>
                                                </span>
                                                {item.badge && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                        current ? 'bg-white/20 text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Sidebar Footer System Status */}
                    <div className="pt-4 border-t border-[var(--border-color)] mt-6 text-xs text-[var(--text-muted)] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Voice Engine Ready</span>
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">{preferences.speechRate}x</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] shadow-xs">
                            <span className="font-bold text-[var(--text-primary)] block mb-0.5">Accessibility Tip:</span>
                            Press <kbd className="font-mono bg-[var(--bg-hover)] px-1 rounded text-[var(--text-primary)] border border-[var(--border-color)]">?</kbd> anywhere for keyboard shortcuts.
                        </div>
                    </div>
                </aside>

                {/* Backdrop for mobile drawer */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* 3. Main Content Workspace */}
                <main id="main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {/* Header Title & Subtitle within Content */}
                    {(pageTitle || pageDescription) && (
                        <div className="mb-6 pb-4 border-b border-[var(--border-color)]">
                            {pageTitle && (
                                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                                    {pageTitle}
                                </h1>
                            )}
                            {pageDescription && (
                                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
                                    {pageDescription}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>

            <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
            <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} isExamActive={false} />
        </div>
    );
}
