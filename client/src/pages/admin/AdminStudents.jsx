import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
    Users,
    UserPlus,
    Search,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    UserCheck,
    Lock,
    Mail,
    Award,
    X,
    Shield
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminStudents() {
    const { speak, announce } = useAccessibility();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [attemptsModalOpen, setAttemptsModalOpen] = useState(false);

    // Selected / Active Student
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAttempts, setStudentAttempts] = useState([]);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        email: '',
        password: '',
        role: 'candidate',
        isActive: true
    });

    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (roleFilter !== 'all') params.role = roleFilter;
            if (statusFilter !== 'all') params.status = statusFilter;

            const res = await authService.getStudents(params);
            if (res.success && res.students) {
                setStudents(res.students);
            }
        } catch (err) {
            console.error('Failed to load students:', err);
            setMessage({ type: 'error', text: err.message || 'Unable to fetch students list.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, roleFilter, statusFilter]);

    const showNotification = (type, text) => {
        setMessage({ type, text });
        speak(text);
        announce(text, type === 'error' ? 'assertive' : 'polite');
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        setFormData({
            name: '',
            rollNumber: '',
            email: '',
            password: '',
            role: 'candidate',
            isActive: true
        });
        setCreateModalOpen(true);
    };

    // Submit Create Student
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.rollNumber.trim() || !formData.password.trim()) {
            showNotification('error', 'Roll Number and Password are required.');
            return;
        }

        setActionLoading(true);
        try {
            const res = await authService.createStudent(formData);
            showNotification('success', res.message || 'Candidate registered successfully.');
            setCreateModalOpen(false);
            fetchStudents();
        } catch (err) {
            showNotification('error', err.message || 'Failed to create candidate.');
        } finally {
            setActionLoading(false);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name || '',
            rollNumber: student.rollNumber || '',
            email: student.email || '',
            password: '', // blank unless changing
            role: student.role || 'candidate',
            isActive: student.isActive !== false
        });
        setEditModalOpen(true);
    };

    // Submit Edit Student
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                rollNumber: formData.rollNumber,
                role: formData.role,
                isActive: formData.isActive
            };
            if (formData.password && formData.password.trim().length >= 6) {
                payload.newPassword = formData.password.trim();
            }

            const res = await authService.updateStudent(selectedStudent._id, payload);
            showNotification('success', res.message || 'Candidate details updated successfully.');
            setEditModalOpen(false);
            fetchStudents();
        } catch (err) {
            showNotification('error', err.message || 'Failed to update student details.');
        } finally {
            setActionLoading(false);
        }
    };

    // Open Delete Modal
    const handleOpenDelete = (student) => {
        setSelectedStudent(student);
        setDeleteModalOpen(true);
    };

    // Confirm Delete Student
    const handleDeleteSubmit = async () => {
        setActionLoading(true);
        try {
            const res = await authService.deleteStudent(selectedStudent._id);
            showNotification('success', res.message || 'Student deleted successfully.');
            setDeleteModalOpen(false);
            fetchStudents();
        } catch (err) {
            showNotification('error', err.message || 'Failed to delete student.');
        } finally {
            setActionLoading(false);
        }
    };

    // View Attempts
    const handleViewAttempts = async (student) => {
        setSelectedStudent(student);
        try {
            const res = await authService.getStudentById(student._id);
            if (res.success) {
                setStudentAttempts(res.attempts || []);
                setAttemptsModalOpen(true);
            }
        } catch (err) {
            showNotification('error', 'Unable to load student examination history.');
        }
    };

    return (
        <AdminLayout
            pageTitle="Student & Candidate Management"
            pageDescription="Monitor enrolled candidates, register students, configure access privileges, and manage assessment records."
        >
            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold border border-[var(--border-color)]">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Enrolled Candidates</h2>
                            <p className="text-xs text-[var(--text-secondary)]">Total Records: <strong className="text-[var(--text-primary)]">{students.length}</strong></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="py-2.5 px-4 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Enroll New Candidate</span>
                    </button>
                </div>

                {/* Notification Banner */}
                {message.text && (
                    <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
                        message.type === 'error'
                            ? 'bg-[var(--danger)]/15 border-[var(--danger)] text-[var(--danger)]'
                            : 'bg-[var(--success)]/15 border-[var(--success)] text-[var(--success)]'
                    }`}>
                        {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Filters & Search Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative sm:col-span-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Roll No, Name or Email..."
                            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs focus:border-[var(--focus-ring)] outline-none"
                        />
                    </div>

                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs focus:border-[var(--focus-ring)] outline-none cursor-pointer"
                        >
                            <option value="all">All Roles (Student / Admin)</option>
                            <option value="candidate">Candidates / Students</option>
                            <option value="admin">Administrators</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs focus:border-[var(--focus-ring)] outline-none cursor-pointer"
                        >
                            <option value="all">All Account Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Disabled Only</option>
                        </select>
                    </div>
                </div>

                {/* Students Data Table */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12 text-center text-[var(--text-muted)]">
                            <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm font-semibold">Loading student records from database...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-12 text-center text-[var(--text-muted)]">
                            <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
                            <p className="text-base font-bold text-[var(--text-primary)]">No Candidate Records Found</p>
                            <p className="text-xs mt-1">Try modifying your search criteria or register a new candidate.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                                        <th className="py-3 px-4">Roll Number</th>
                                        <th className="py-3 px-4">Full Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Enrolled On</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {students.map((student) => {
                                        const isActive = student.isActive !== false;
                                        return (
                                            <tr key={student._id} className="hover:bg-[var(--bg-tertiary)]/50 transition">
                                                <td className="py-3 px-4 font-mono font-bold text-[var(--primary)]">
                                                    {student.rollNumber}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                                                    {student.name || 'Candidate'}
                                                </td>
                                                <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">
                                                    {student.email || '—'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                        student.role === 'admin'
                                                            ? 'bg-[var(--warning)]/20 border-[var(--warning)]/50 text-[var(--warning)]'
                                                            : 'bg-[var(--primary-subtle)] border-[var(--primary)]/40 text-[var(--primary)]'
                                                    }`}>
                                                        {student.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 font-bold ${
                                                        isActive ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                                                    }`}>
                                                        {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                        <span>{isActive ? 'Active' : 'Disabled'}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-[var(--text-muted)] font-mono">
                                                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewAttempts(student)}
                                                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition border border-[var(--border-color)] cursor-pointer"
                                                            title="View Examination Attempts"
                                                        >
                                                            <Award className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(student)}
                                                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition border border-[var(--border-color)] cursor-pointer"
                                                            title="Edit Candidate Details"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDelete(student)}
                                                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--danger)]/15 text-[var(--text-muted)] hover:text-[var(--danger)] border border-[var(--border-color)] hover:border-[var(--danger)]/50 transition cursor-pointer"
                                                            title="Delete Candidate Record"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MODAL: CREATE STUDENT */}
                {createModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                                <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-[var(--primary)]" />
                                    Enroll New Candidate
                                </h3>
                                <button type="button" onClick={() => setCreateModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Ramesh Chandra"
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Roll / Candidate Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                                        placeholder="e.g. CAND202"
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs font-mono outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Registered Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="candidate@university.edu"
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Initial Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="At least 6 characters"
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Account Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none cursor-pointer"
                                    >
                                        <option value="candidate">Student / Candidate</option>
                                        <option value="admin">Platform Administrator</option>
                                    </select>
                                </div>

                                <div className="flex gap-2.5 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setCreateModalOpen(false)}
                                        className="flex-1 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition border border-[var(--border-color)] cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {actionLoading ? 'Saving...' : 'Save Candidate'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: EDIT STUDENT */}
                {editModalOpen && selectedStudent && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                                <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-[var(--primary)]" />
                                    Edit Candidate Record
                                </h3>
                                <button type="button" onClick={() => setEditModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Roll / Candidate Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs font-mono outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Registered Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Reset Password <span className="text-[var(--text-muted)] font-normal">(Leave blank to keep current)</span></label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter new password if resetting"
                                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus-ring)]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none cursor-pointer"
                                        >
                                            <option value="candidate">Candidate</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Account Status</label>
                                        <select
                                            value={formData.isActive ? 'active' : 'inactive'}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-xs outline-none cursor-pointer"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Disabled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditModalOpen(false)}
                                        className="flex-1 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition border border-[var(--border-color)] cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {actionLoading ? 'Saving...' : 'Update Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: DELETE CONFIRMATION */}
                {deleteModalOpen && selectedStudent && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="max-w-sm w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/15 border border-[var(--danger)]/40 text-[var(--danger)] flex items-center justify-center mx-auto">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-[var(--text-primary)] text-base">Delete Candidate Record?</h3>
                                <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                                    Are you sure you want to delete <strong className="text-[var(--text-primary)]">{selectedStudent.name || selectedStudent.rollNumber}</strong> ({selectedStudent.rollNumber})? This will also remove all their associated exam attempt logs.
                                </p>
                            </div>
                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition border border-[var(--border-color)] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleDeleteSubmit}
                                    className="flex-1 py-2 rounded-xl bg-[var(--danger)] text-white hover:opacity-90 text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer"
                                >
                                    {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: STUDENT ATTEMPTS LOG */}
                {attemptsModalOpen && selectedStudent && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="max-w-2xl w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                                <div>
                                    <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
                                        <Award className="w-4 h-4 text-[var(--primary)]" />
                                        Exam History: {selectedStudent.name || selectedStudent.rollNumber}
                                    </h3>
                                    <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">Roll No: {selectedStudent.rollNumber}</p>
                                </div>
                                <button type="button" onClick={() => setAttemptsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3">
                                {studentAttempts.length === 0 ? (
                                    <div className="py-10 text-center text-[var(--text-muted)]">
                                        <p className="text-sm font-semibold">No examination attempts logged for this student.</p>
                                    </div>
                                ) : (
                                    studentAttempts.map((attempt) => (
                                        <div key={attempt._id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs">
                                            <div>
                                                <h4 className="font-bold text-[var(--text-primary)] text-sm">{attempt.examTitle}</h4>
                                                <p className="text-[var(--text-muted)] mt-1 font-mono">
                                                    Submitted: {new Date(attempt.submittedAt || attempt.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-[var(--success)] block">
                                                    {attempt.score?.obtainedMarks || 0} / {attempt.score?.totalMarks || 0} Marks
                                                </span>
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                                    {attempt.score?.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-2 border-t border-[var(--border-color)] flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setAttemptsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold transition border border-[var(--border-color)] cursor-pointer"
                                >
                                    Close History
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
