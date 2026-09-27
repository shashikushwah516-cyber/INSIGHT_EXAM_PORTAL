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
        const fetchAttempts = async () => {
            try {
                const res = await resultService.getAdminOverview();
                if (res.success && res.overview) {
                    setOverview(res.overview);
                }
            } catch (err) {
                console.error('Failed to load attempts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    const attempts = overview?.recentAttempts || [];

    return (
        <AdminLayout
            pageTitle="Candidate Assessment Monitoring"
            pageDescription="Log of submitted examinations, candidate results, and verification records."
        >
            <div className="space-y-6">

            {loading ? (
                <div role="status" aria-live="polite" className="text-center py-16 text-neutral-400">
                    <p className="text-xl">Loading candidate submissions...</p>
                </div>
            ) : attempts.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                    <Award className="w-12 h-12 text-neutral-500 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-xl font-bold text-white mb-2">No Candidate Attempts Logged</p>
                    <p className="text-neutral-400 text-sm">Candidates will appear here after taking examinations.</p>
                </div>
            ) : (
                <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-6 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-xs">
                                    <th className="py-3 px-4 font-bold">Candidate Name</th>
                                    <th className="py-3 px-4 font-bold">Roll Number</th>
                                    <th className="py-3 px-4 font-bold">Examination</th>
                                    <th className="py-3 px-4 font-bold text-center">Score</th>
                                    <th className="py-3 px-4 font-bold text-center">Percentage</th>
                                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {attempts.map((att) => (
                                    <tr key={att.id} className="hover:bg-neutral-850">
                                        <td className="py-3.5 px-4 font-bold text-white">{att.candidateName}</td>
                                        <td className="py-3.5 px-4 font-mono text-[#ffe600]">{att.candidateRoll}</td>
                                        <td className="py-3.5 px-4 text-neutral-300">{att.examTitle}</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-white">
                                            {att.obtainedMarks} / {att.totalMarks}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                                            {att.percentage}%
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <Link
                                                to={`/results/${att.id}`}
                                                className="inline-flex items-center gap-1 text-xs text-[#ffe600] font-bold hover:underline"
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
