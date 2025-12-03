'use client';

import { GlassCard } from './GlassCard';
import { isHoliday } from '@/app/lib/holidays';

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
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return days[date.getDay()];
    };

    const formatDate = (year: number, month: number, day: number) => {
        const yy = String(year).slice(-2);
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${yy}-${mm}-${dd}`;
    };

    return (
        <GlassCard className="w-full bg-white border-slate-200 shadow-sm h-full overflow-hidden flex flex-col p-0">
            <div className="overflow-y-auto flex-1">
                <table className="w-full text-xs border-collapse">
                    <tbody className="divide-y divide-slate-200">
                        {days.map(day => {
                            const date = new Date(year, month - 1, day);
                            const dayOfWeek = date.getDay();
                            const holiday = isHoliday(date);
                            const isSunday = dayOfWeek === 0;
                            const isSaturday = dayOfWeek === 6;

                            const { dayLogs, dayLeaves } = getDataForDate(day);

                            // Determine row style
                            let dateColor = 'text-slate-900';
                            if (isSunday || holiday) dateColor = 'text-red-600 font-bold';
                            else if (isSaturday) dateColor = 'text-blue-600 font-bold';

                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                            return (
                                <tr
                                    key={day}
                                    onClick={() => onDateClick(dateStr)}
                                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                >
                                    <td className={`p-2 border-r border-slate-200 w-[100px] whitespace-nowrap ${dateColor} bg-slate-50/30 text-[10px]`}>
                                        {formatDate(year, month, day)} {getDayLabel(date)}
                                    </td>
                                    <td className="p-2 align-top">
                                        <div className="flex flex-col gap-0.5">
                                            {/* Leaves */}
                                            {dayLeaves.length > 0 && (
                                                <div className="text-slate-700 text-[10px]">
                                                    <span className="font-medium">{dayLeaves.map(l => l.user.name).join(', ')}</span>
                                                    <span className="text-slate-500 ml-1">휴무</span>
                                                </div>
                                            )}

                                            {/* Logs */}
                                            {dayLogs.map(log => (
                                                <div key={log.id} className="text-slate-800 font-medium whitespace-pre-wrap text-[10px]">
                                                    {log.content}
                                                </div>
                                            ))}

                                            {/* Empty state placeholder for hover effect */}
                                            {dayLeaves.length === 0 && dayLogs.length === 0 && (
                                                <div className="text-slate-300 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                                                    + 내용 추가
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
