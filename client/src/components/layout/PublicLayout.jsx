import React from 'react';
import Navbar from '../common/Navbar';
import SkipLink from '../common/SkipLink';
import Footer from './Footer';

export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
            <SkipLink />
            <Navbar />
            <div className="flex-1">
                {children}
            </div>
            <Footer />
        </div>
    );
}
