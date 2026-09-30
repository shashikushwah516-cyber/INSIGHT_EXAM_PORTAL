import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility, THEMES } from '../../context/AccessibilityContext';
import {
    Shield,
    BookOpen,
    PlayCircle,
    Award,
    LayoutDashboard,
    Sliders,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    Users,
    Volume2,
    Globe,
    Sparkles,
    Palette,
    Check
} from 'lucide-react';
import AIAssistantModal from '../common/AIAssistantModal';

export default function AdminLayout({ children, pageTitle, pageDescription }) {
    const { user, logout } = useAuth();
    const { preferences, updatePref, speak, announce, themesList } = useAccessibility();
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
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
        speak('Logged out of Administrator Console.');
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
            group: 'ADMINISTRATION MANAGEMENT',
            items: [
                { label: 'Admin Dashboard', path: '/admin', icon: Shield },
                { label: 'Student Management', path: '/admin/students', icon: Users, badge: 'Users' },
                { label: 'Question Bank', path: '/admin/questions', icon: BookOpen, badge: 'Live' },
                { label: 'Exam Configuration', path: '/admin/exams', icon: PlayCircle, badge: 'Timed' },
                { label: 'Candidate Submissions', path: '/admin/attempts', icon: Award }
            ]
        },
        {
            group: 'SYSTEM & PORTAL JUMP',
            items: [
                { label: 'Candidate Workspace', path: '/dashboard', icon: LayoutDashboard },
                { label: 'Public Website', path: '/', icon: Globe },
                { label: 'Accessibility Settings', path: '/accessibility', icon: Sliders }
            ]
        }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col transition-colors duration-150">
            {/* 1. TOP ADMIN HEADER */}
            <header className="min-h-16 py-2 border-b border-[var(--border-color)] bg-[var(--bg-surface)] sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="lg:hidden p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
                        aria-label="Toggle Administrator Sidebar"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <Link to="/admin" className="flex items-center gap-2 sm:gap-2.5 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl p-1 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--accent-color)] text-[var(--accent-text)] flex items-center justify-center font-black shadow-xs shrink-0">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div className="hidden sm:flex flex-col min-w-0">
                            <span className="text-sm sm:text-base font-black text-[var(--text-primary)] leading-tight truncate">Insight Exam Portal</span>
                            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Administrator Console
                            </span>
                        </div>
                    </Link>

                    {/* Breadcrumbs */}
                    <div className="hidden xl:flex items-center gap-1.5 text-xs text-[var(--text-muted)] border-l border-[var(--border-color)] pl-4 ml-1">
                        <span>Admin</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        <span className="text-[var(--accent-color)] font-bold">{pageTitle || 'Console'}</span>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Theme Switcher Dropdown */}
                    <div className="relative" ref={themeRef}>
                        <button
                            type="button"
                            onClick={() => setThemeOpen((prev) => !prev)}
                            aria-label={`Theme: ${currentTheme.name}`}
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

                    <button
                        type="button"
                        onClick={() => speak(`${pageTitle || 'Admin Console'}. ${pageDescription || 'Administrator overview and examination management.'}`, { force: true })}
                        className="h-9 px-2.5 sm:px-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] hover:border-[var(--border-accent)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                        aria-label="Read page summary aloud"
                    >
                        <Volume2 className="w-4 h-4 text-[var(--accent-color)] shrink-0" aria-hidden="true" />
                        <span className="hidden lg:inline">Summary</span>
                    </button>

                    <Link
                        to="/dashboard"
                        className="h-9 px-2.5 sm:px-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] hover:border-[var(--border-accent)] text-[var(--text-primary)] text-xs font-bold hidden sm:inline-flex items-center gap-1.5 transition shadow-2xs"
                    >
                        <LayoutDashboard className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
                        <span>Student View</span>
                    </Link>

                    {/* Admin Profile Badge */}
                    <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[var(--border-color)]">
                        <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)] text-[var(--accent-text)] flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="hidden md:flex flex-col text-left min-w-0 max-w-[120px]">
                            <span className="text-xs font-bold text-[var(--text-primary)] leading-none truncate">{user?.name || 'Administrator'}</span>
                            <span className="text-[10px] font-mono text-[var(--accent-color)] mt-0.5 truncate">{user?.rollNumber || 'ADMIN001'}</span>
                        </div>
                    </div>

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

            {/* 2. ADMIN BODY: SIDEBAR + MAIN CONTENT */}
            <div className="flex-1 flex max-w-7xl 2xl:max-w-[1536px] w-full mx-auto">
                {/* Admin Sidebar Navigation */}
                <aside
                    aria-label="Administrator Sidebar Navigation"
                    className={`
                        fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <div className="space-y-6 overflow-y-auto">
                        {navItems.map((group, gIdx) => (
                            <div key={gIdx}>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] px-3 block mb-2">
                                    {group.group}
                                </span>
                                <nav className="space-y-1">
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
                                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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
                                </nav>
                            </div>
                        ))}
                    </div>

                    {/* Admin Status Pill */}
                    <div className="pt-4 border-t border-[var(--border-color)] mt-6 text-xs text-[var(--text-muted)] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Platform Live API</span>
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">Port 5001</span>
                        </div>
                    </div>
                </aside>

                {/* Mobile Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* 3. Main Admin Content Area */}
                <main id="main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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

            <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} isExamActive={false} />
        </div>
    );
}
