import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import { LogIn, Volume2, UserCheck, Key, AlertCircle } from 'lucide-react';

export default function Login() {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const { speak } = useSpeech();
    const { announce, preferences } = useAccessibility();
    const navigate = useNavigate();
    const location = useLocation();

    const rollInputRef = useRef(null);

    useEffect(() => {
        const promptText =
            preferences.language === 'hi'
                ? 'परीक्षा पोर्टल में आपका स्वागत है। कृपया अपना रोल नंबर और पासवर्ड दर्ज करें।'
                : 'Welcome to the Accessible Examination Portal. Please enter your Roll Number and Password to log in.';
        speak(promptText);
        announce(promptText, 'polite');

        if (rollInputRef.current) {
            rollInputRef.current.focus();
        }
    }, [speak, announce, preferences.language]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!rollNumber.trim()) {
            const msg = preferences.language === 'hi' ? 'कृपया रोल नंबर दर्ज करें।' : 'Please enter your Roll Number.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        if (!password) {
            const msg = preferences.language === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.';
            setError(msg);
            speak(msg);
            announce(msg, 'assertive');
            return;
        }

        setIsSubmitting(true);
        const waitMsg = preferences.language === 'hi' ? 'लॉगिन किया जा रहा है...' : 'Logging in, please wait...';
        announce(waitMsg, 'polite');

        try {
            const res = await login(rollNumber.trim(), password);
            const successMsg =
                preferences.language === 'hi'
                    ? `लॉगिन सफल रहा। स्वागत है ${res.user?.name || res.user?.rollNumber}।`
                    : `Login successful. Welcome ${res.user?.name || res.user?.rollNumber}.`;

            speak(successMsg);
            announce(successMsg, 'polite');

            const destination = location.state?.from?.pathname || (res.user?.role === 'admin' ? '/admin' : '/dashboard');
            navigate(destination);
        } catch (err) {
            const errMsg = err.message || (preferences.language === 'hi' ? 'लॉगिन असफल रहा।' : 'Login failed. Please check credentials.');
            setError(errMsg);
            speak(errMsg);
            announce(errMsg, 'assertive');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fillDemo = (role) => {
        if (role === 'candidate') {
            setRollNumber('CAND101');
            setPassword('candidate123');
            speak('Filled demo candidate credentials.');
        } else {
            setRollNumber('ADMIN001');
            setPassword('admin123');
            speak('Filled demo administrator credentials.');
        }
    };

    return (
        <main id="main-content" className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
            <div className="bg-neutral-900 border-2 border-[#ffe600] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-[#ffe600]/10 text-[#ffe600] rounded-xl flex items-center justify-center mx-auto mb-3 border border-[#ffe600]/30">
                        <LogIn className="w-8 h-8" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Candidate & Admin Login</h1>
                    <p className="text-sm text-neutral-300 mt-1">
                        Use Tab to navigate fields. Press Enter on Log In.
                    </p>
                </div>

                {/* Error Banner */}
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

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div>
                        <label
                            htmlFor="rollNumber"
                            className="block text-sm font-bold text-neutral-200 mb-1.5"
                        >
                            Roll Number or Email
                        </label>
                        <div className="relative">
                            <input
                                id="rollNumber"
                                ref={rollInputRef}
                                type="text"
                                required
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                placeholder="e.g. CAND101 or roll number"
                                autoComplete="username"
                                aria-required="true"
                                className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-3 text-lg focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-bold text-neutral-200 mb-1.5"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                aria-required="true"
                                className="w-full bg-neutral-950 border-2 border-neutral-700 text-white rounded-lg px-4 py-3 text-lg focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600] outline-none transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#ffe600] text-black font-bold py-3.5 px-4 rounded-xl text-lg hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Logging in...' : 'Log In (Enter)'}
                    </button>
                </form>

                {/* Quick Demo Credentials Autofill */}
                <div className="mt-6 pt-5 border-t border-neutral-800">
                    <p className="text-xs text-neutral-400 text-center mb-2 font-semibold">
                        Instant Demo Credentials:
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fillDemo('candidate')}
                            className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-[#ffe600] font-mono rounded border border-neutral-700 transition"
                        >
                            Autofill Candidate
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('admin')}
                            className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-cyan-400 font-mono rounded border border-neutral-700 transition"
                        >
                            Autofill Admin
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/register" className="text-sm text-neutral-300 hover:text-[#ffe600] underline">
                        New candidate? Register here
                    </Link>
                </div>
            </div>
        </main>
    );
}
