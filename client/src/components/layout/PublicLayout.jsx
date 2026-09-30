import React from 'react';
import Footer from './Footer';

export default function PublicLayout({ children }) {
    return (
        <div className="flex-1 flex flex-col transition-colors">
            <div className="flex-1">
                {children}
            </div>
            <Footer />
        </div>
    );
}
