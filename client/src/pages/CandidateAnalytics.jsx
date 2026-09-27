import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import resultService from '../services/resultService';
import {
    BarChart3,
    Award,
    Clock,
    Target,
    CheckCircle2,
    Volume2,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function CandidateAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await resultService.getCandidateAnalytics();
                if (res.success && res.analytics) {
                    setAnalytics(res.analytics);
                    const msg = `Performance analytics loaded. Your overall accuracy is ${res.analytics.accuracy} percent across ${res.analytics.totalExamsAttempted} examinations.`;
                    speak(msg);
                    announce(msg, 'polite');
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [speak, announce]);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Calculating Analytics...">
                <div role="status" aria-live="polite" className="panel-card bg-neutral-900 border-neutral-800 text-center py-16 text-neutral-400">
                    <div className="w-8 h-8 border-4 border-[#ffe600] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-white font-bold">Calculating preparation analytics and accuracy metrics...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!analytics || analytics.totalExamsAttempted === 0) {
        return (
            <DashboardLayout pageTitle="Performance Analytics" pageDescription="Detailed accuracy tracking, subject mastery, and examination progress over time.">
                <div className="panel-card bg-neutral-900 border-neutral-800 text-center py-12 max-w-lg mx-auto">
                    <BarChart3 className="w-12 h-12 text-[#ffe600] mx-auto mb-3" aria-hidden="true" />
                    <h1 className="text-2xl font-bold text-white mb-2">No Examination Data Yet</h1>
                    <p className="text-neutral-400 text-sm mb-6">
                        Complete your first competitive mock examination to generate performance metrics and subject accuracy breakdown.
                    </p>
                    <Link
                        to="/exams"
                        className="btn-primary"
                    >
                        <span>Start an Examination</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            pageTitle="Performance Analytics & Insights"
            pageDescription="Detailed breakdown of your competitive exam preparation, accuracy, and weak areas."
        >
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">Performance Overview</h2>
                        <p className="text-neutral-400 text-sm">Real-time statistics across all attempted competitive papers</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const recs = analytics.recommendations.join('. ');
                            speak(
                                `Analytics Summary: Accuracy is ${analytics.accuracy} percent. Average time per question is ${analytics.averageTimePerQuestion} seconds. Recommendations: ${recs}`
                            );
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-950 text-[#ffe600] border border-[#ffe600] rounded-xl hover:bg-neutral-800 font-bold transition shrink-0"
                        aria-label="Read complete analytics summary aloud"
                    >
                        <Volume2 className="w-5 h-5" aria-hidden="true" />
                        <span>Read Summary Aloud</span>
                    </button>
                </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-neutral-900 border-2 border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-neutral-400">Total Exams</span>
                        <Award className="w-5 h-5 text-[#ffe600]" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-extrabold text-white">{analytics.totalExamsAttempted}</p>
                    <span className="text-xs text-neutral-400 mt-1 block">Completed sessions</span>
                </div>

                <div className="bg-neutral-900 border-2 border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-neutral-400">Overall Accuracy</span>
                        <Target className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-extrabold text-emerald-400">{analytics.accuracy}%</p>
                    <span className="text-xs text-neutral-400 mt-1 block">Correct vs Attempted</span>
                </div>

                <div className="bg-neutral-900 border-2 border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-neutral-400">Attempt Rate</span>
                        <TrendingUp className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-extrabold text-cyan-400">{analytics.attemptRate}%</p>
                    <span className="text-xs text-neutral-400 mt-1 block">Questions answered</span>
                </div>

                <div className="bg-neutral-900 border-2 border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-neutral-400">Average Pacing</span>
                        <Clock className="w-5 h-5 text-purple-400" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-extrabold text-purple-400">
                        {analytics.averageTimePerQuestion}s
                    </p>
                    <span className="text-xs text-neutral-400 mt-1 block">Per question answered</span>
                </div>
            </div>

            {/* Subject-Wise Accuracy Section */}
            <section aria-labelledby="subject-acc-title" className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
                <h2 id="subject-acc-title" className="text-2xl font-bold text-white mb-6">
                    Subject-Wise Competence & Accuracy
                </h2>

                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-xs">
                                <th className="py-3 px-4 font-bold">Subject</th>
                                <th className="py-3 px-4 font-bold text-center">Total Answered</th>
                                <th className="py-3 px-4 font-bold text-center">Correct Answers</th>
                                <th className="py-3 px-4 font-bold text-right">Accuracy Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {analytics.subjectAccuracy.map((sa, i) => (
                                <tr key={i} className="hover:bg-neutral-850">
                                    <td className="py-3.5 px-4 font-bold text-white">{sa.subject}</td>
                                    <td className="py-3.5 px-4 text-center text-neutral-300">{sa.total}</td>
                                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{sa.correct}</td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-32 bg-neutral-950 h-3 rounded-full overflow-hidden border border-neutral-700 hidden sm:block">
                                                <div
                                                    className="bg-[#ffe600] h-full rounded-full transition-all"
                                                    style={{ width: `${sa.accuracy}%` }}
                                                />
                                            </div>
                                            <span className="font-mono font-bold text-[#ffe600] w-12 text-right">
                                                {sa.accuracy}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Personalized Recommendations */}
            <section aria-labelledby="recs-title" className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-[#ffe600]" aria-hidden="true" />
                    <h2 id="recs-title" className="text-xl font-bold text-white">
                        Personalized Preparation Recommendations
                    </h2>
                </div>

                <div className="space-y-3">
                    {analytics.recommendations.map((rec, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-sm text-neutral-200"
                        >
                            <span className="w-6 h-6 rounded-full bg-[#ffe600]/20 text-[#ffe600] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#ffe600]/40">
                                {idx + 1}
                            </span>
                            <span className="leading-relaxed">{rec}</span>
                        </div>
                    ))}
                </div>
            </section>
            </div>
        </DashboardLayout>
    );
}
