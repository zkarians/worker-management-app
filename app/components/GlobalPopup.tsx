'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Schedule {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    type: string;
    // ... other fields
}

export default function GlobalPopup() {
    const [popups, setPopups] = useState<Schedule[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchPopups = async () => {
            try {
                const res = await fetch('/api/schedules/active-popups');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        // Filter out popups that have been dismissed today?
                        // For now, let's show them every time the app loads (or maybe session based)
                        // A more advanced version would use localStorage with a date key

                        // Simple check: Don't show if already dismissed in this session
                        const dismissed = sessionStorage.getItem('dismissedPopups');
                        const dismissedIds = dismissed ? JSON.parse(dismissed) : [];

                        const newPopups = data.filter((p: Schedule) => !dismissedIds.includes(p.id));

                        if (newPopups.length > 0) {
                            setPopups(newPopups);
                            setIsVisible(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch popups', error);
            }
        };

        // Only fetch if user is logged in? 
        // Since this component will be in layout, it might run on login page too.
        // We should probably check if we are in a protected route or check auth state.
        // For now, let's assume it runs everywhere but the API might return empty if not relevant,
        // OR we just let it run. The requirement said "when worker/manager logs in".
        // So ideally this is placed in `app/dashboard/layout.tsx`.

        fetchPopups();
    }, []);

    const handleDismiss = (dontShowAgain = false) => {
        const currentPopup = popups[currentIndex];

        if (dontShowAgain) {
            // Logic to save to localStorage to not show for the rest of the day
            const dismissedToday = localStorage.getItem('dismissedPopupsToday');
            const today = new Date().toISOString().split('T')[0];
            let data = dismissedToday ? JSON.parse(dismissedToday) : { date: today, ids: [] };

            if (data.date !== today) {
                data = { date: today, ids: [] };
            }

            data.ids.push(currentPopup.id);
            localStorage.setItem('dismissedPopupsToday', JSON.stringify(data));
        }

        // Mark as dismissed in session
        const dismissed = sessionStorage.getItem('dismissedPopups');
        const dismissedIds = dismissed ? JSON.parse(dismissed) : [];
        sessionStorage.setItem('dismissedPopups', JSON.stringify([...dismissedIds, currentPopup.id]));

        if (currentIndex < popups.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsVisible(false);
        }
    };

    if (!isVisible || popups.length === 0) return null;

    const currentPopup = popups[currentIndex];

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                            <span className="text-xl">📢</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">{currentPopup.title}</h3>
                    </div>
                    <button
                        onClick={() => handleDismiss()}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2.5 transition-colors shrink-0 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto overscroll-contain">
                    {currentPopup.imageUrl && (
                        <div className="mb-6 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                            <img
                                src={currentPopup.imageUrl}
                                alt={currentPopup.title}
                                className="w-full h-auto max-h-[40vh] object-contain mx-auto"
                            />
                        </div>
                    )}
                    <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-[15px]">
                        {currentPopup.description || '내용이 없습니다.'}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center gap-4 mt-auto">
                    <button
                        onClick={() => handleDismiss(true)}
                        className="text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors py-2 px-1 rounded hover:bg-slate-200/50 active:bg-slate-200"
                    >
                        오늘 하루 그만 보기
                    </button>

                    <button
                        onClick={() => handleDismiss()}
                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm hover:shadow active:shadow-none min-w-[80px]"
                    >
                        확인
                    </button>
                </div>

                {popups.length > 1 && (
                    <div className="bg-indigo-50/50 px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-indigo-600/70 border-t border-indigo-100/50">
                        {currentIndex + 1} / {popups.length}
                    </div>
                )}
            </div>
        </div>
    );
}
