import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import SkipLink from './components/common/SkipLink';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AccessibilitySettings from './pages/AccessibilitySettings';
import CandidateDashboard from './pages/CandidateDashboard';
import AvailableExams from './pages/AvailableExams';
import ExamInstructions from './pages/ExamInstructions';
import ActiveExamWindow from './pages/ActiveExamWindow';
import PracticePortal from './pages/PracticePortal';
import ResultsPage from './pages/ResultsPage';
import DetailedResult from './pages/DetailedResult';
import CandidateAnalytics from './pages/CandidateAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminExams from './pages/admin/AdminExams';
import AdminAttempts from './pages/admin/AdminAttempts';

export default function App() {
    return (
        <AuthProvider>
            <AccessibilityProvider>
                <Router>
                    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
                        <SkipLink />
                        <Navbar />

                        <div className="flex-1">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/accessibility" element={<AccessibilitySettings />} />

                                {/* Candidate Protected Routes */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <CandidateDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/exams"
                                    element={
                                        <ProtectedRoute>
                                            <AvailableExams />
                                        </ProtectedRoute>
                                    }
                                />
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
                                <Route
                                    path="/practice"
                                    element={
                                        <ProtectedRoute>
                                            <PracticePortal />
                                        </ProtectedRoute>
                                    }
                                />
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

                                {/* Backward compatibility routes for exam path */}
                                <Route path="/exam" element={<Navigate to="/exams" replace />} />
                                <Route path="/exam-window" element={<Navigate to="/exams" replace />} />

                                {/* Admin Protected Routes */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <AdminDashboard />
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

                                {/* Fallback route */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </div>
                </Router>
            </AccessibilityProvider>
        </AuthProvider>
    );
}