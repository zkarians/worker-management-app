'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    sidebarFontSize: string; // 'small' | 'medium' | 'large'
    mainFontSize: string; // 'small' | 'medium' | 'large'
    fontFamily: string; // 'Pretendard' | 'Noto Sans KR' | 'Nanum Gothic'
    setSidebarFontSize: (size: string) => void;
    setMainFontSize: (size: string) => void;
    setFontFamily: (font: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [sidebarFontSize, setSidebarFontSize] = useState('medium');
    const [mainFontSize, setMainFontSize] = useState('medium');
    const [fontFamily, setFontFamily] = useState('Pretendard');

    useEffect(() => {
        // Load settings from localStorage
        const savedSidebarSize = localStorage.getItem('sidebarFontSize');
        const savedMainSize = localStorage.getItem('mainFontSize');
        const savedFontFamily = localStorage.getItem('fontFamily');

        if (savedSidebarSize) setSidebarFontSize(savedSidebarSize);
        if (savedMainSize) setMainFontSize(savedMainSize);
        if (savedFontFamily) setFontFamily(savedFontFamily);
    }, []);

    const updateSidebarFontSize = (size: string) => {
        setSidebarFontSize(size);
        localStorage.setItem('sidebarFontSize', size);
    };

    const updateMainFontSize = (size: string) => {
        setMainFontSize(size);
        localStorage.setItem('mainFontSize', size);
    };

    const updateFontFamily = (font: string) => {
        setFontFamily(font);
        localStorage.setItem('fontFamily', font);

        // Apply font family globally
        document.documentElement.style.setProperty('--font-family-base', font === 'Pretendard' ? '"Pretendard Variable", Pretendard, sans-serif' : font === 'Noto Sans KR' ? '"Noto Sans KR", sans-serif' : '"Nanum Gothic", sans-serif');
    };

    // Apply initial font family
    useEffect(() => {
        document.documentElement.style.setProperty('--font-family-base', fontFamily === 'Pretendard' ? '"Pretendard Variable", Pretendard, sans-serif' : fontFamily === 'Noto Sans KR' ? '"Noto Sans KR", sans-serif' : '"Nanum Gothic", sans-serif');
    }, [fontFamily]);

    return (
        <SettingsContext.Provider value={{
            sidebarFontSize,
            mainFontSize,
            fontFamily,
            setSidebarFontSize: updateSidebarFontSize,
            setMainFontSize: updateMainFontSize,
            setFontFamily: updateFontFamily
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
