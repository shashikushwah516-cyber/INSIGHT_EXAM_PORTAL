import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
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
    Volume2,
    Globe
} from 'lucide-react';

export default function AdminLayout({ children, pageTitle, pageDescription }) {
    const { user, logout } = useAuth();
    const { speak } = useAccessibility();
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        speak('Logged out of Administrator Console.');
        await logout();
        navigate('/login');
    };

    const navItems = [
        {
            group: 'ADMINISTRATION MANAGEMENT',
            items: [
                { label: 'Admin Dashboard', path: '/admin', icon: Shield },
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
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col transition-colors">
            {/* 1. TOP ADMIN HEADER */}
            <header className="h-16 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="lg:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffe600]"
                        aria-label="Toggle Administrator Sidebar"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <Link to="/admin" className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#ffe600] rounded-xl p-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffe600] to-amber-500 flex items-center justify-center text-black font-black shadow-sm shrink-0">
                            <Shield className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black text-white leading-tight">Insight Exam Portal</span>
                            <span className="text-[10px] font-extrabold text-[#ffe600] uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ffe600] animate-pulse"></span>
                                Administrator Console
                            </span>
                        </div>
                    </Link>

                    {/* Breadcrumbs */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400 border-l border-neutral-800 pl-4 ml-1">
                        <span>Admin</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-[#ffe600] font-bold">{pageTitle || 'Console'}</span>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => speak(`${pageTitle || 'Admin Console'}. ${pageDescription || 'Administrator overview and examination management.'}`)}
                        className="h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#ffe600] text-neutral-300 hover:text-[#ffe600] text-xs font-bold flex items-center gap-1.5 transition"
                        aria-label="Read page summary aloud"
                    >
                        <Volume2 className="w-4 h-4 text-[#ffe600]" aria-hidden="true" />
                        <span className="hidden sm:inline">Read Summary</span>
                    </button>

                    <Link
                        to="/dashboard"
                        className="h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white text-xs font-bold hidden sm:inline-flex items-center gap-1.5 transition"
                    >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                        <span>Student View</span>
                    </Link>

                    {/* Admin Profile Badge */}
                    <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                        <div className="w-8 h-8 rounded-xl bg-neutral-850 border border-neutral-700 flex items-center justify-center text-[#ffe600] font-bold text-xs">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-xs font-bold text-white leading-none">{user?.name || 'Administrator'}</span>
                            <span className="text-[10px] font-mono text-[#ffe600] mt-0.5">{user?.rollNumber || 'ADMIN001'}</span>
                        </div>
                    </div>

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

            {/* 2. ADMIN BODY: SIDEBAR + MAIN CONTENT */}
            <div className="flex-1 flex max-w-7xl 2xl:max-w-[1536px] w-full mx-auto">
                {/* Admin Sidebar Navigation */}
                <aside
                    aria-label="Administrator Sidebar Navigation"
                    className={`
                        fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-neutral-950 border-r border-neutral-800 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <div className="space-y-6 overflow-y-auto">
                        {navItems.map((group, gIdx) => (
                            <div key={gIdx}>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 px-3 block mb-2">
                                    {group.group}
                                </span>
                                <nav className="space-y-1">
                                    {group.items.map((item, iIdx) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.path);
                                        return (
                                            <Link
                                                key={iIdx}
                                                to={item.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`
                                                    w-full h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150
                                                    ${active
                                                        ? 'bg-neutral-900 text-[#ffe600] border border-[#ffe600]/40 shadow-sm'
                                                        : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60 border border-transparent'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Icon className={`w-4 h-4 ${active ? 'text-[#ffe600]' : 'text-neutral-400'}`} />
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-850 text-neutral-300 border border-neutral-700">
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

                    {/* Admin Status Footer */}
                    <div className="pt-4 border-t border-neutral-800">
                        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                            <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Role</span>
                            <span className="text-white font-bold block">Super Administrator</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Database Connected
                            </span>
                        </div>
                    </div>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/70 z-20 lg:hidden"
                        aria-hidden="true"
                    />
                )}

                {/* 3. ADMIN MAIN CONTENT */}
                <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {/* Page Header */}
                    {(pageTitle || pageDescription) && (
                        <div className="mb-6 pb-4 border-b border-neutral-800">
                            {pageTitle && (
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {pageTitle}
                                </h1>
                            )}
                            {pageDescription && (
                                <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                                    {pageDescription}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
