import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import resultService from '../../services/resultService';
import {
    Users,
    Calendar,
    ArrowRight,
    Award,
    CheckCircle2
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminAttempts() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchAttempts = async () => {
            try {
                const res = await resultService.getAdminOverview();
                if (isMounted && res.success && res.overview) {
                    setOverview(res.overview);
                }
            } catch (err) {
                console.error('Failed to load attempts:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAttempts();
        return () => { isMounted = false; };
    }, []);

    const attempts = overview?.recentAttempts || [];

    return (
        <AdminLayout
            pageTitle="Candidate Assessment Monitoring"
            pageDescription="Log of submitted examinations, candidate results, and verification records."
        >
            <div className="space-y-6">
                {loading ? (
                    <div role="status" aria-live="polite" className="text-center py-16 text-[var(--text-muted)]">
                        <p className="text-xl font-bold">Loading candidate submissions...</p>
                    </div>
                ) : attempts.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 shadow-sm">
                        <Award className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" aria-hidden="true" />
                        <p className="text-xl font-bold text-[var(--text-primary)] mb-2">No Candidate Attempts Logged</p>
                        <p className="text-[var(--text-muted)] text-sm">Candidates will appear here after taking examinations.</p>
                    </div>
                ) : (
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                        <div className="overflow-x-auto scrollbar-thin">
                            <table className="w-full min-w-[620px] text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                                        <th className="py-3 px-4 font-bold">Candidate Name</th>
                                        <th className="py-3 px-4 font-bold">Roll Number</th>
                                        <th className="py-3 px-4 font-bold">Examination</th>
                                        <th className="py-3 px-4 font-bold text-center">Score</th>
                                        <th className="py-3 px-4 font-bold text-center">Percentage</th>
                                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {attempts.map((att) => (
                                        <tr key={att.id} className="hover:bg-[var(--bg-tertiary)]/50 transition">
                                            <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{att.candidateName}</td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-[var(--primary)]">{att.candidateRoll}</td>
                                            <td className="py-3.5 px-4 text-[var(--text-secondary)]">{att.examTitle}</td>
                                            <td className="py-3.5 px-4 text-center font-bold text-[var(--text-primary)]">
                                                {att.obtainedMarks} / {att.totalMarks}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono font-bold">
                                                <span className="bg-[var(--success)]/20 text-[var(--success)] px-2.5 py-0.5 rounded border border-[var(--success)]/40 text-xs">
                                                    {att.percentage}%
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    to={`/results/${att.id}`}
                                                    className="inline-flex items-center gap-1 text-xs text-[var(--primary)] font-bold hover:underline"
                                                >
                                                    <span>Review Solution</span>
                                                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
