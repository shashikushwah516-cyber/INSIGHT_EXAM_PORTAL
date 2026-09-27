import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
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
    Bell,
    Globe as EarthIcon,
    Shield
} from 'lucide-react';
import KeyboardHelpModal from '../common/KeyboardHelpModal';

export default function DashboardLayout({ children, pageTitle, pageDescription, activeTab }) {
    const { user, logout, isAdmin } = useAuth();
    const { preferences, speak } = useAccessibility();
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    const handleLogout = async () => {
        speak('Logged out securely from your examination portal.');
        await logout();
        navigate('/login');
    };

    const navItems = [
        {
            group: 'STUDENT PORTAL',
            items: [
                { label: 'Overview & Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { label: 'Accessibility Settings', path: '/accessibility', icon: Sliders }
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
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col transition-colors">
            {/* Top Dashboard Header Bar */}
            <header className="h-16 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="lg:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffe600]"
                        aria-label="Toggle Dashboard Sidebar Menu"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <Link to="/" className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#ffe600] rounded-xl p-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffe600] via-yellow-400 to-amber-500 flex items-center justify-center text-black font-black shadow-sm shrink-0">
                            <BookOpen className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-base font-black text-white leading-tight">Insight Exam Portal</span>
                            <span className="text-[10px] font-extrabold text-[#ffe600] uppercase tracking-wider">Candidate Workspace</span>
                        </div>
                    </Link>

                    {/* Breadcrumbs */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400 border-l border-neutral-800 pl-4 ml-1">
                        <span>Portal</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-[#ffe600] font-bold">{pageTitle || 'Dashboard'}</span>
                    </div>
                </div>

                {/* Right Top Header Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Read Page Audio Button */}
                    <button
                        type="button"
                        onClick={() => speak(`${pageTitle || 'Dashboard'}. ${pageDescription || 'Welcome to your candidate examination workspace.'}`)}
                        className="h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-[#ffe600] text-neutral-200 hover:text-[#ffe600] text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        aria-label="Listen to page summary"
                    >
                        <Volume2 className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                        <span className="hidden sm:inline">Audio Summary</span>
                    </button>

                    {/* Help Button */}
                    <button
                        type="button"
                        onClick={() => setHelpOpen(true)}
                        className="h-9 px-2.5 sm:px-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-[#ffe600] text-neutral-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        aria-label="Open keyboard shortcuts help"
                        title="Shortcuts (? or H)"
                    >
                        <HelpCircle className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                        <span className="hidden sm:inline">Help</span>
                    </button>

                    {/* User Profile Pill */}
                    <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                        <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#ffe600] font-bold text-xs">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-xs font-bold text-white leading-none">{user?.name || user?.rollNumber || 'Candidate'}</span>
                            <span className="text-[10px] font-mono text-[#ffe600] mt-0.5">{user?.rollNumber || 'CANDIDATE'}</span>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="h-9 px-2.5 rounded-xl bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-800/80 text-xs font-bold transition"
                        aria-label="Sign Out"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Dashboard Body (Sidebar + Content Workspace) */}
            <div className="flex-1 flex max-w-7xl 2xl:max-w-[1536px] w-full mx-auto">
                {/* Desktop & Collapsible Mobile Sidebar */}
                <aside
                    className={`
                        fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-neutral-950 border-r border-neutral-800 p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    aria-label="Candidate Workspace Navigation"
                >
                    <nav className="space-y-6">
                        {navItems.map((group, gIdx) => (
                            <div key={gIdx}>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-2">
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
                                                        ? 'bg-neutral-850 text-[#ffe600] border-2 border-[#ffe600] shadow-sm font-bold'
                                                        : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border-2 border-transparent'
                                                    }
                                                `}
                                                aria-current={current ? 'page' : undefined}
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <Icon className={`w-4 h-4 ${current ? 'text-[#ffe600]' : 'text-neutral-400'}`} aria-hidden="true" />
                                                    <span>{item.label}</span>
                                                </span>
                                                {item.badge && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[#ffe600]">
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
                    <div className="pt-4 border-t border-neutral-800 mt-6 text-xs text-neutral-400 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>Voice Engine Active</span>
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400">{preferences.speechRate}x</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                            <span className="font-bold text-[#ffe600] block mb-0.5">Accessibility Tip:</span>
                            Press <kbd className="font-mono bg-neutral-800 px-1 rounded text-white">?</kbd> anywhere for keyboard navigation rules.
                        </div>
                    </div>
                </aside>

                {/* Backdrop for mobile drawer */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Main Content Workspace */}
                <main id="main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {/* Header Title & Subtitle within Content */}
                    {(pageTitle || pageDescription) && (
                        <div className="mb-6 pb-4 border-b border-neutral-800">
                            {pageTitle && (
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {pageTitle}
                                </h1>
                            )}
                            {pageDescription && (
                                <p className="text-sm text-neutral-300 mt-1 max-w-3xl leading-relaxed">
                                    {pageDescription}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>

            <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </div>
    );
}
