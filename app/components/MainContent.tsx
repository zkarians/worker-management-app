'use client';

import React from 'react';
import { useSettings } from '@/app/components/SettingsContext';

export function MainContent({ children }: { children: React.ReactNode }) {
    const { mainFontSize } = useSettings();

    const getFontSizeClass = () => {
        switch (mainFontSize) {
            case 'small': return 'text-sm';
            case 'large': return 'text-lg';
            default: return 'text-base';
        }
    };

    return (
        <main className={`pt-16 min-h-screen transition-all duration-300 md:pl-64 ${getFontSizeClass()} print:pl-0 print:pt-0`}>
            <div className="p-6 md:p-12 lg:p-16 animate-fade-in">
                {children}
            </div>
        </main>
    );
}
