import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import SkipLink from './components/common/SkipLink';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/Navbar';

// Core Application Pages & Components
import LandingPage from './pages/LandingPage';
import AboutPlatform from './pages/AboutPlatform';
import HowItWorks from './pages/HowItWorks';
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProfilePage from './pages/ProfilePage';
import AccessibilitySettings from './pages/AccessibilitySettings';
import ExamWindow from './components/ExamWindow';

// Candidate & Assessment Portal Pages
import CandidateDashboard from './pages/CandidateDashboard';
import AvailableExams from './pages/AvailableExams';
import ExamInstructions from './pages/ExamInstructions';
import ActiveExamWindow from './pages/ActiveExamWindow';
import PracticePortal from './pages/PracticePortal';
import ResultsPage from './pages/ResultsPage';
import DetailedResult from './pages/DetailedResult';
import CandidateAnalytics from './pages/CandidateAnalytics';

// Administrative Console Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminExams from './pages/admin/AdminExams';
import AdminAttempts from './pages/admin/AdminAttempts';

export default function App() {
    return (
        <AuthProvider>
            <AccessibilityProvider>
                <Router>
                    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent-color)] selection:text-[var(--accent-text)] transition-colors duration-200">
                        {/* Universal Accessibility Skip Link for Screen Readers */}
                        <SkipLink />

                        {/* Top Sleek Horizontal Navigation Bar */}
                        <Navbar />

                        {/* Primary Router Outlet Container */}
                        <main id="main-content" className="flex-1 flex flex-col min-w-0" role="main">
                            <Routes>
                                {/* 1. Public & Informational Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/about" element={<AboutPlatform />} />
                                <Route path="/how-it-works" element={<HowItWorks />} />
                                <Route path="/help" element={<HelpCenter />} />
                                <Route path="/contact" element={<Contact />} />
                                
                                {/* 2. Authentication & User Profile Routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/accessibility" element={<AccessibilitySettings />} />

                                {/* 3. Examination Window & Catalog Routes */}
                                <Route path="/exam-window" element={<ExamWindow />} />
                                <Route path="/exams" element={<AvailableExams />} />
                                <Route
                                    path="/exams/:id/instructions"
                                    element={
                                        <ProtectedRoute>
                                            <ExamInstructions />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/exams/:id/take"
                                    element={
                                        <ProtectedRoute>
                                            <ActiveExamWindow />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* 4. Student / Candidate Dashboard & Analytics */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <CandidateDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/student-dashboard" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/practice" element={<PracticePortal />} />
                                <Route
                                    path="/results"
                                    element={
                                        <ProtectedRoute>
                                            <ResultsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/results/:id"
                                    element={
                                        <ProtectedRoute>
                                            <DetailedResult />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/analytics"
                                    element={
                                        <ProtectedRoute>
                                            <CandidateAnalytics />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* 5. Admin Dashboard & Operations Console */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
                                <Route
                                    path="/admin/students"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <AdminStudents />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/questions"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <AdminQuestions />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/exams"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <AdminExams />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/attempts"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <AdminAttempts />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Backward compatibility and wildcards */}
                                <Route path="/exam" element={<Navigate to="/exam-window" replace />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AccessibilityProvider>
        </AuthProvider>
    );
}