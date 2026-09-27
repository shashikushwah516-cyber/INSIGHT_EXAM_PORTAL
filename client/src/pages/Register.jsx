import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const { speak } = useSpeech();
    const { announce } = useAccessibility();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!rollNumber.trim()) {
            const msg = 'Please provide a valid Roll Number.';
            setError(msg);
            speak(msg);
            return;
        }

        if (password.length < 6) {
            const msg = 'Password must be at least 6 characters long.';
            setError(msg);
            speak(msg);
            return;
        }

        setIsSubmitting(true);
        try {
            await register({
                name: name.trim() || `Candidate ${rollNumber.trim()}`,
                rollNumber: rollNumber.trim().toUpperCase(),
                email: email.trim() || undefined,
                password,
                role
            });

            const welcomeMsg = `Registration successful. Welcome ${name || rollNumber}.`;
            speak(welcomeMsg);
            announce(welcomeMsg, 'polite');

            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.message || 'Registration failed. Please check details.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main id="main-content" className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
            <div className="bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-neutral-800 text-[#ffe600] rounded-xl flex items-center justify-center mx-auto mb-3 border border-neutral-700">
                        <UserPlus className="w-8 h-8" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Candidate Registration</h1>
                    <p className="text-sm text-neutral-300 mt-1">Create an accessible examination account</p>
                </div>

                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="bg-red-950/80 border-2 border-red-500 text-red-200 p-3 rounded-lg mb-6 flex items-start gap-2 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="reg-name" className="block text-sm font-bold text-neutral-200 mb-1">
                            Full Name
                        </label>
                        <input
                            id="reg-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-2.5 text-base focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-roll" className="block text-sm font-bold text-neutral-200 mb-1">
                            Roll Number *
                        </label>
                        <input
                            id="reg-roll"
                            type="text"
                            required
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. CAND202"
                            className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-2.5 text-base focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-email" className="block text-sm font-bold text-neutral-200 mb-1">
                            Email Address (Optional)
                        </label>
                        <input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="candidate@example.com"
                            className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-2.5 text-base focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-pass" className="block text-sm font-bold text-neutral-200 mb-1">
                            Password *
                        </label>
                        <input
                            id="reg-pass"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-2.5 text-base focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-role" className="block text-sm font-bold text-neutral-200 mb-1">
                            Account Type
                        </label>
                        <select
                            id="reg-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-2.5 text-base focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none"
                        >
                            <option value="candidate">Examination Candidate</option>
                            <option value="admin">Administrator / Examiner</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#ffe600] text-black font-bold py-3 px-4 rounded-xl text-lg hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? 'Registering...' : 'Register and Continue'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-neutral-300 hover:text-[#ffe600] underline">
                        Already have an account? Login here
                    </Link>
                </div>
            </div>
        </main>
    );
}
