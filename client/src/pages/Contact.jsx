import React, { useState, useEffect } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import {
    Phone,
    Mail,
    MapPin,
    Send,
    CheckCircle2,
    AlertCircle,
    Volume2,
    Clock,
    ShieldCheck
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function Contact() {
    const { speak } = useSpeech();
    const { announce } = useAccessibility();

    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        category: 'technical',
        message: ''
    });

    const [status, setStatus] = useState({
        submitting: false,
        submitted: false,
        error: null
    });

    useEffect(() => {
        const text = 'Contact Insight Exam Portal Support Desk. Use this page to reach out for technical assistance, accessibility accommodations, or examination grievances.';
        speak(text);
        announce(text, 'polite');
    }, [speak, announce]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
            setStatus({ submitting: false, submitted: false, error: 'Please fill in all required fields.' });
            speak('Please fill in all required fields: name, contact, and your message.');
            return;
        }

        setStatus({ submitting: true, submitted: false, error: null });
        speak('Submitting your support inquiry. Please wait.');

        // Simulated submission with immediate accessibility feedback
        setTimeout(() => {
            setStatus({ submitting: false, submitted: true, error: null });
            const successMsg = 'Inquiry submitted successfully. A ticket reference has been logged. Our accessibility desk will respond within 24 hours.';
            speak(successMsg);
            announce(successMsg, 'assertive');
            setFormData({
                name: '',
                contact: '',
                category: 'technical',
                message: ''
            });
        }, 800);
    };

    return (
        <PublicLayout>
            <main id="main-content" className="py-8 sm:py-12 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
                <div className="container-app space-y-8">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-bold border border-[var(--border-color)] shadow-xs">
                            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>Candidate Assistance Desk</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
                            Contact Support & Grievances
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                            Have questions about assistive equipment compatibility, keyboard configurations, or special exam accommodations? We are here to support you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Support Channels (1 col) */}
                        <div className="space-y-6">
                            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
                                    Direct Contact Channels
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border-color)] shrink-0">
                                            <Phone className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">Toll-Free Helpline</h3>
                                            <p className="text-base font-bold text-[var(--text-primary)] mt-0.5">1800-467-4448</p>
                                            <p className="text-xs text-[var(--text-muted)]">Mon - Sat (9:00 AM - 6:00 PM IST)</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 rounded-xl bg-[var(--success)]/15 text-[var(--success)] border border-[var(--border-color)] shrink-0">
                                            <Mail className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">Email Support</h3>
                                            <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">support@insightexamportal.gov.in</p>
                                            <p className="text-xs text-[var(--text-muted)]">Guaranteed 24-hour turnaround</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 rounded-xl bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--border-color)] shrink-0">
                                            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">Grievance Cell</h3>
                                            <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">grievance@insightexamportal.gov.in</p>
                                            <p className="text-xs text-[var(--text-muted)]">For formal examination complaints</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border-color)] shrink-0">
                                            <MapPin className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">National Headquarters</h3>
                                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                                                Competitive Examination & Universal Accessibility Directorate, Pragati Maidan, New Delhi - 110001
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        speak(
                                            'Insight Exam Portal Contact Channels: Toll free helpline 1800 467 4448. Support email: support at insight exam portal dot gov dot in. Grievance email: grievance at insight exam portal dot gov dot in.'
                                        )
                                    }
                                    className="w-full h-10 px-4 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-color)] flex items-center justify-center gap-2 transition cursor-pointer"
                                    aria-label="Listen to Support Channels"
                                >
                                    <Volume2 className="w-4 h-4 text-[var(--primary)]" />
                                    <span>Listen to Contact Details</span>
                                </button>
                            </div>
                        </div>

                        {/* Inquiry Form (2 cols) */}
                        <div className="lg:col-span-2">
                            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-10 shadow-sm">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                                    Send an Accessible Inquiry
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)] mb-6">
                                    All form fields are screen-reader accessible with clear labeling and keyboard focus indicators.
                                </p>

                                {status.submitted && (
                                    <div className="p-4 mb-6 rounded-2xl bg-[var(--success)]/15 border border-[var(--success)]/40 text-[var(--success)] flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-bold">Inquiry Submitted Successfully!</p>
                                            <p className="text-xs mt-0.5 font-medium">
                                                Ticket #INQ-{Math.floor(100000 + Math.random() * 900000)} has been created. Our team will contact you promptly.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {status.error && (
                                    <div className="p-4 mb-6 rounded-2xl bg-[var(--danger)]/15 border border-[var(--danger)]/40 text-[var(--danger)] flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm font-semibold">{status.error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="contact-name" className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                                                Full Name <span className="text-[var(--danger)]">*</span>
                                            </label>
                                            <input
                                                id="contact-name"
                                                type="text"
                                                required
                                                placeholder="Candidate or Evaluator Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--focus-ring)] focus:ring-1 focus:ring-[var(--focus-ring)] transition"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="contact-email" className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                                                Email Address or Roll Number <span className="text-[var(--danger)]">*</span>
                                            </label>
                                            <input
                                                id="contact-email"
                                                type="text"
                                                required
                                                placeholder="e.g. candidate@domain.com or CAND101"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--focus-ring)] focus:ring-1 focus:ring-[var(--focus-ring)] transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="contact-category" className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                                            Inquiry Category
                                        </label>
                                        <select
                                            id="contact-category"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--focus-ring)] focus:ring-1 focus:ring-[var(--focus-ring)] transition cursor-pointer"
                                        >
                                            <option value="technical">Technical Issue or Screen Reader Compatibility</option>
                                            <option value="keyboard">Keyboard Shortcuts or Speech Synthesis</option>
                                            <option value="exam">Examination Scheduling or Question Content</option>
                                            <option value="grievance">Formal Accommodation Grievance</option>
                                            <option value="other">General Platform Inquiries</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="contact-message" className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                                            Your Message <span className="text-[var(--danger)]">*</span>
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            required
                                            rows={4}
                                            placeholder="Describe your inquiry, accommodation requirement, or issue in detail..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--focus-ring)] focus:ring-1 focus:ring-[var(--focus-ring)] transition"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status.submitting}
                                        className="h-12 px-7 rounded-xl bg-[var(--primary)] text-[var(--bg-primary)] hover:opacity-90 disabled:opacity-50 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                                    >
                                        {status.submitting ? (
                                            <span>Submitting Inquiry...</span>
                                        ) : (
                                            <>
                                                <span>Submit Inquiry</span>
                                                <Send className="w-4 h-4" aria-hidden="true" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}
