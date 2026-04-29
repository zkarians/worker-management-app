'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Schedule {
    id: string;
    title: string;
    description?: string;
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">{currentPopup.title}</h3>
                    <button onClick={() => handleDismiss()} className="hover:bg-blue-700 rounded p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 min-h-[200px] flex flex-col">
                    <div className="flex-grow whitespace-pre-wrap text-gray-800 text-lg">
                        {currentPopup.description || 'No description provided.'}
                    </div>

                    <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                        <button
                            onClick={() => handleDismiss(true)}
                            className="text-sm text-gray-500 hover:text-gray-800 underline"
                        >
                            오늘 하루 보지 않기
                        </button>

                        <button
                            onClick={() => handleDismiss()}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                </div>

                {popups.length > 1 && (
                    <div className="bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
                        {currentIndex + 1} of {popups.length}
                    </div>
                )}
            </div>
        </div>
    );
}
