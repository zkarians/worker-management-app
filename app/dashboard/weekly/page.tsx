'use client';

import { useState, useRef } from 'react';
import { DashboardDayView } from '@/app/components/DashboardDayView';
import { useUser } from '@/app/components/UserContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Camera, Loader2 } from 'lucide-react';
import { toBlob } from 'html-to-image';

export default function WeeklyDashboardPage() {
    const user = useUser();
    const isManager = user?.role === 'MANAGER';
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    });

    const changeDate = (days: number) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + days);
        const offset = currentDate.getTimezoneOffset() * 60000;
        setStartDate(new Date(currentDate.getTime() - offset).toISOString().split('T')[0]);
    };

    const getDates = () => {
        const dates = [];
        const current = new Date(startDate);
        for (let i = 0; i < 5; i++) {
            const date = new Date(current);
            date.setDate(current.getDate() + i);
            const offset = date.getTimezoneOffset() * 60000;
            dates.push(new Date(date.getTime() - offset).toISOString().split('T')[0]);
        }
        return dates;
    };

    const handleScreenshot = async () => {
        if (!scrollContainerRef.current) return;
        setIsCapturing(true);

        try {
            // Wait a bit for any pending renders
            await new Promise(resolve => setTimeout(resolve, 100));

            const blob = await toBlob(scrollContainerRef.current, {
                quality: 0.95,
                backgroundColor: '#f8fafc', // match bg-slate-50
                width: scrollContainerRef.current.scrollWidth,
                height: scrollContainerRef.current.scrollHeight,
                style: {
                    overflow: 'visible' // Ensure full content is captured
                }
            });

            if (!blob) {
                throw new Error('이미지 생성에 실패했습니다.');
            }

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            alert('클립보드에 복사되었습니다!');

        } catch (error: any) {
            console.error('Screenshot failed', error);
            alert(`스크린샷 생성 실패: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setIsCapturing(false);
        }
    };

    const dates = getDates();

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="text-indigo-600" />
                    주간 근무 현황 (5일)
                </h1>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleScreenshot}
                        disabled={isCapturing}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                    >
                        {isCapturing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                캡처 중...
                            </>
                        ) : (
                            <>
                                <Camera size={18} />
                                스크린샷 복사
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button
                            onClick={() => changeDate(-1)}
                            className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700"
                        />
                        <button
                            onClick={() => changeDate(1)}
                            className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="overflow-x-auto pb-6">
                <div ref={scrollContainerRef} className="flex gap-4 min-w-max p-1">
                    {dates.map((date) => (
                        <div key={date} className="w-[400px] flex-shrink-0">
                            <DashboardDayView
                                date={date}
                                isManager={isManager}
                                compact={true}
                                className="bg-white/50 rounded-xl p-4 border border-slate-200 shadow-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
