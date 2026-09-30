import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('insight_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('insight_token');
            if (savedToken) {
                try {
                    const response = await authService.getProfile();
                    if (response.success && response.user) {
                        setUser(response.user);
                    } else {
                        localStorage.removeItem('insight_token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Failed to restore user session:', error);
                    localStorage.removeItem('insight_token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (rollNumber, password) => {
        const response = await authService.login(rollNumber, password);
        if (response.success && response.token) {
            localStorage.setItem('insight_token', response.token);
            setToken(response.token);
            setUser(response.user);
            return response;
        }
        throw new Error(response.message || 'Login failed.');
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        if (response.success && response.token) {
            localStorage.setItem('insight_token', response.token);
            setToken(response.token);
            setUser(response.user);
            return response;
        }
        throw new Error(response.message || 'Registration failed.');
    };

    const logout = async () => {
        await authService.logout();
        setToken(null);
        setUser(null);
    };

    const updatePreferences = async (newPrefs) => {
        try {
            const res = await authService.updatePreferences(newPrefs);
            if (res.success && res.preferences) {
                setUser((prev) => (prev ? { ...prev, preferences: res.preferences } : prev));
            }
            return res;
        } catch (error) {
            console.error('Failed to persist preferences to backend:', error);
        }
    };

    const updateProfile = async (profileData) => {
        const res = await authService.updateProfile(profileData);
        if (res.success && res.user) {
            setUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
            const stored = localStorage.getItem('insight_user');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    localStorage.setItem('insight_user', JSON.stringify({ ...parsed, ...res.user }));
                } catch (e) {}
            }
        }
        return res;
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updatePreferences,
        updateProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
