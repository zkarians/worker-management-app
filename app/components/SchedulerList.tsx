'use client';

import { GlassCard } from './GlassCard';
import { isHoliday } from '@/app/lib/holidays';
import { Calendar, AlertCircle } from 'lucide-react';

interface DailyLog {
    id: string;
    date: string;
    content: string;
    author: { name: string };
}

interface LeaveRequest {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    status: string;
    user: { name: string };
}

interface SchedulerListProps {
    year: number;
    month: number;
    logs: DailyLog[];
    leaves: LeaveRequest[];
    onDateClick: (date: string) => void;
}

export function SchedulerList({ year, month, logs, leaves, onDateClick }: SchedulerListProps) {
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDataForDate = (day: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(dateStr);

        const dayLogs = logs.filter(log => log.date.split('T')[0] === dateStr);

        const dayLeaves = leaves.filter(leave => {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            const d = new Date(dateStr);
            const s = new Date(startDate.toISOString().split('T')[0]);
            const e = new Date(endDate.toISOString().split('T')[0]);
            return d >= s && d <= e && leave.status === 'APPROVED';
        });

        return { dayLogs, dayLeaves };
    };

    const getDayLabel = (date: Date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    };

    return (
        <GlassCard className="w-full bg-white border-slate-200 shadow-sm h-full overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                {days.map(day => {
                    const date = new Date(year, month - 1, day);
                    const dayOfWeek = date.getDay();
                    const holiday = isHoliday(date);
                    const isSunday = dayOfWeek === 0;
                    const isSaturday = dayOfWeek === 6;

                    const { dayLogs, dayLeaves } = getDataForDate(day);

                    // Determine color
                    let dateColorClass = 'text-slate-700';
                    let bgColorClass = 'bg-slate-100';
                    if (isSunday || holiday) {
                        dateColorClass = 'text-red-700';
                        bgColorClass = 'bg-red-100';
                    } else if (isSaturday) {
                        dateColorClass = 'text-blue-700';
                        bgColorClass = 'bg-blue-100';
                    }

                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasContent = dayLogs.length > 0 || dayLeaves.length > 0;

                    return (
                        <div
                            key={day}
                            onClick={() => onDateClick(dateStr)}
                            className="group relative p-3 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                        >
                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-100/0 group-hover:from-indigo-50/50 group-hover:to-indigo-100/20 transition-all duration-200 pointer-events-none"></div>

                            <div className="relative z-10">
                                {/* Date header */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 ${bgColorClass} rounded-full`}>
                                        <Calendar size={11} className={dateColorClass} />
                                        <span className={`text-xs font-bold ${dateColorClass}`}>
                                            {String(month).padStart(2, '0')}-{String(day).padStart(2, '0')} {getDayLabel(date)}
                                        </span>
                                    </div>

                                    {!hasContent && (
                                        <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            + 추가
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                {hasContent ? (
                                    <div className="space-y-1.5">
                                        {/* Leaves */}
                                        {dayLeaves.map(leave => (
                                            <div key={leave.id} className="text-xs px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-medium">
                                                {leave.user.name} 휴무
                                            </div>
                                        ))}

                                        {/* Logs */}
                                        {dayLogs.map(log => (
                                            <div key={log.id} className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium px-2 py-1 bg-slate-50 rounded-lg">
                                                {log.content}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-2">
                                        <AlertCircle size={16} className="text-slate-300 opacity-0 group-hover:opacity-50 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
}
