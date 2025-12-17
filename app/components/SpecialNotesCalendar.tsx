'use client';

import { GlassCard } from './GlassCard';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { isHoliday } from '@/app/lib/holidays';

interface DailyLog {
    id: string;
    date: string;
    content: string;
    author: { name: string };
}

interface Attendance {
    id: string;
    date: string;
    overtimeHours: number;
}

interface LeaveRequest {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    status: string;
    user: { name: string };
}

interface SpecialNotesCalendarProps {
    year: number;
    month: number;
    logs: DailyLog[];
    attendance: Attendance[];
    leaves: LeaveRequest[];
    onMonthChange: (year: number, month: number) => void;
    onDateClick?: (date: string) => void;
    onDeleteNote?: (id: string) => void;
    isManager?: boolean;
}

export function SpecialNotesCalendar({
    year,
    month,
    logs,
    attendance,
    leaves,
    onMonthChange,
    onDateClick,
    onDeleteNote,
    isManager = false
}: SpecialNotesCalendarProps) {

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month - 1, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const prevMonth = () => {
        if (month === 1) {
            onMonthChange(year - 1, 12);
        } else {
            onMonthChange(year, month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 12) {
            onMonthChange(year + 1, 1);
        } else {
            onMonthChange(year, month + 1);
        }
    };

    const getDataForDate = (day: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(dateStr);
        const dayLogs = logs.filter(log => log.date.split('T')[0] === dateStr);

        // Calculate overtime logic
        const dayAttendance = attendance.filter(a => a.date.split('T')[0] === dateStr);
        const totalWorkers = dayAttendance.length;

        let displayOvertime = 0;

        if (totalWorkers > 0) {
            const overtimeWorkers = dayAttendance.filter(a => (a.overtimeHours || 0) >= 1);

            // If half or more workers have overtime >= 1
            if (overtimeWorkers.length >= totalWorkers / 2) {
                displayOvertime = Math.max(...dayAttendance.map(a => a.overtimeHours || 0));
            }
        }

        // Get leave requests for this date
        const dayLeaves = leaves.filter(leave => {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            // Normalize dates to YYYY-MM-DD for comparison to avoid time issues
            const d = new Date(dateStr);
            const s = new Date(startDate.toISOString().split('T')[0]);
            const e = new Date(endDate.toISOString().split('T')[0]);
            return d >= s && d <= e;
        });

        return { dayLogs, displayOvertime, dayLeaves };
    };

    const getDayColor = (day: number) => {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const holiday = isHoliday(date);

        if (holiday) {
            return 'text-red-600 font-semibold';
        }
        if (dayOfWeek === 0) {
            return 'text-red-500 font-semibold';
        }
        if (dayOfWeek === 6) {
            return 'text-blue-500 font-semibold';
        }
        return 'text-slate-700';
    };

    return (
        <GlassCard className="w-full bg-white border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100 gap-3 sm:gap-0 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
                        <CalendarIcon className="text-indigo-600" size={20} />
                    </div>
                    <span className="hidden sm:inline">월간 특이사항</span>
                    <span className="sm:hidden">특이사항</span>
                </h2>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 sm:p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                        aria-label="이전 달"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-slate-900 font-bold text-base sm:text-lg min-w-[90px] sm:min-w-[100px] text-center">
                        {year}년 {month}월
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 sm:p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                        aria-label="다음 달"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">

                {/* Mobile View: Agenda List */}
                <div className="block sm:hidden space-y-3 pb-4">
                    {days.map((day) => {
                        const { dayLogs, displayOvertime, dayLeaves } = getDataForDate(day);
                        const today = new Date();
                        const isToday = today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;
                        const date = new Date(year, month - 1, day);
                        const dayOfWeek = date.getDay();
                        const holiday = isHoliday(date);
                        const dayColor = getDayColor(day);

                        // Format date string for mobile header (e.g., "12-01 월")
                        const dateString = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}`;

                        const hasContent = dayLogs.length > 0 || dayLeaves.length > 0 || displayOvertime > 0;

                        // Skip empty days in mobile view if you want to save space, 
                        // BUT for a calendar it's often better to show all or at least have an option.
                        // For now, let's show all days to allow adding notes if isManager, 
                        // or maybe just show days with content? 
                        // User request: "Make it look better". A full list of 30 empty cards is boring.
                        // Let's show all days but compact empty ones, or just standard cards.
                        // Given the "Special Notes" context, showing only active days might be cleaner,
                        // but then how do they add a note?
                        // Let's render ALL days but style them nicely.

                        return (
                            <div
                                key={day}
                                onClick={() => onDateClick?.(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                                className={`p-3 rounded-xl border transition-all ${isToday
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                        : 'bg-white border-slate-100 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={14} className="text-slate-400" />
                                        <span className={`text-sm font-bold ${dayColor}`}>
                                            {dateString}
                                        </span>
                                        {isToday && (
                                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded-full">
                                                Today
                                            </span>
                                        )}
                                        {holiday && (
                                            <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded-full">
                                                휴일
                                            </span>
                                        )}
                                    </div>
                                    {displayOvertime > 0 && (
                                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            <Clock size={10} /> {displayOvertime}h
                                        </span>
                                    )}
                                </div>

                                {/* Mobile Content List */}
                                <div className="space-y-1.5">
                                    {/* Pending Leaves */}
                                    {dayLeaves.filter(l => l.status === 'PENDING').map(leave => (
                                        <div key={leave.id} className="text-xs p-2 rounded-lg bg-yellow-50 border border-yellow-100 text-yellow-800 font-medium">
                                            {leave.user.name} 휴무 신청
                                        </div>
                                    ))}

                                    {/* Logs */}
                                    {(() => {
                                        // Reuse grouping logic
                                        const groupedLogs: { [key: string]: { ids: string[], names: string[], status: string } } = {};
                                        const otherLogs: DailyLog[] = [];

                                        dayLogs.forEach(log => {
                                            const match = log.content.match(/^\[(.*?)\]\s*(.*)$/);
                                            if (match) {
                                                const status = match[1];
                                                const name = match[2];
                                                if (['결근', '지각', '조퇴', '휴무'].includes(status)) {
                                                    if (!groupedLogs[status]) groupedLogs[status] = { ids: [], names: [], status };
                                                    groupedLogs[status].ids.push(log.id);
                                                    groupedLogs[status].names.push(name);
                                                } else {
                                                    otherLogs.push(log);
                                                }
                                            } else {
                                                otherLogs.push(log);
                                            }
                                        });

                                        const hasFullHoliday = otherLogs.some(log => log.content.includes('웅동 휴무'));
                                        if (hasFullHoliday && groupedLogs['휴무']) delete groupedLogs['휴무'];

                                        return (
                                            <>
                                                {Object.values(groupedLogs).map((group) => {
                                                    const uniqueNames = Array.from(new Set(group.names.map(n => n.trim()))).filter(Boolean).sort();
                                                    const content = `[${group.status}] ${uniqueNames.join(', ')}`;

                                                    let statusColor = '';
                                                    switch (group.status) {
                                                        case '휴무': statusColor = 'bg-blue-50 border-blue-100 text-blue-700'; break;
                                                        case '결근': statusColor = 'bg-red-50 border-red-100 text-red-700'; break;
                                                        case '지각': statusColor = 'bg-orange-50 border-orange-100 text-orange-700'; break;
                                                        case '조퇴': statusColor = 'bg-yellow-50 border-yellow-100 text-yellow-700'; break;
                                                        default: statusColor = 'bg-slate-50 border-slate-100 text-slate-700';
                                                    }

                                                    return (
                                                        <div key={`m-group-${group.status}-${group.ids[0]}`} className={`text-xs p-2 rounded-lg border font-medium ${statusColor}`}>
                                                            {content}
                                                        </div>
                                                    );
                                                })}

                                                {otherLogs.map(log => {
                                                    const isMissingPositionNote = log.content.includes('근무성립불가');
                                                    let logColor = '';
                                                    if (isMissingPositionNote) logColor = 'bg-red-50 border-red-100 text-red-700';
                                                    else if (log.content.includes('[휴무]')) logColor = 'bg-blue-50 border-blue-100 text-blue-700';
                                                    else if (log.content.includes('[결근]')) logColor = 'bg-red-50 border-red-100 text-red-700';
                                                    else if (log.content.includes('[지각]')) logColor = 'bg-orange-50 border-orange-100 text-orange-700';
                                                    else if (log.content.includes('[조퇴]')) logColor = 'bg-yellow-50 border-yellow-100 text-yellow-700';
                                                    else logColor = 'bg-slate-50 border-slate-100 text-slate-700';

                                                    return (
                                                        <div key={log.id} className={`relative text-xs p-2 rounded-lg border font-medium ${logColor}`}>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <span className="flex-1 whitespace-pre-wrap">{log.content}</span>
                                                                {isManager && onDeleteNote && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('이 특이사항을 삭제하시겠습니까?')) onDeleteNote(log.id);
                                                                        }}
                                                                        className="text-slate-400 hover:text-red-600 p-1 -mr-1 -mt-1"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        );
                                    })()}

                                    {!hasContent && (
                                        <div className="text-xs text-slate-300 italic p-1">특이사항 없음</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop View: Grid Calendar */}
                <div className="hidden sm:block h-full">
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 h-full auto-rows-fr">
                        {/* Weekday headers */}
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                            <div
                                key={day}
                                className={`p-1.5 sm:p-2 text-center text-[10px] sm:text-xs font-bold bg-gradient-to-b from-slate-50 to-white rounded-lg ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'
                                    }`}
                            >
                                {day}
                            </div>
                        ))}

                        {/* Blank days */}
                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="bg-slate-50/50 rounded-lg"></div>
                        ))}

                        {/* Calendar days */}
                        {days.map((day) => {
                            const { dayLogs, displayOvertime, dayLeaves } = getDataForDate(day);
                            const today = new Date();
                            const isToday = today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;
                            const date = new Date(year, month - 1, day);
                            const dayOfWeek = date.getDay();
                            const holiday = isHoliday(date);
                            const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                            const dayColor = getDayColor(day);

                            const hasMissingPositionNote = dayLogs.some(log => log.content.includes('근무성립불가'));
                            const approvedLeaves = dayLeaves.filter(l => l.status === 'APPROVED');
                            const pendingLeaves = dayLeaves.filter(l => l.status === 'PENDING');

                            return (
                                <div
                                    key={day}
                                    onClick={() => onDateClick?.(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                                    className={`p-1 sm:p-1.5 relative group transition-all cursor-pointer rounded-lg border-2 flex flex-col min-h-[70px] sm:min-h-[80px] ${hasMissingPositionNote
                                        ? 'bg-red-100 border-red-400 shadow-md ring-2 ring-red-300 hover:bg-red-200'
                                        : isToday
                                            ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300 shadow-md ring-2 ring-indigo-200'
                                            : holiday
                                                ? 'bg-red-50/50 border-red-200 hover:bg-red-50 hover:border-red-300'
                                                : isWeekendDay
                                                    ? 'bg-slate-50/30 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                    : 'bg-white border-slate-100 hover:bg-indigo-50/30 hover:border-indigo-200'
                                        }`}
                                >
                                    {/* Day number and overtime */}
                                    <div className="flex justify-between items-start mb-0.5 sm:mb-1 flex-shrink-0">
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            <span className={`text-xs sm:text-sm font-bold ${dayColor}`}>
                                                {day}
                                            </span>
                                            {isToday && (
                                                <span className="text-[7px] sm:text-[8px] text-indigo-600 font-semibold bg-indigo-200 px-1 py-0.5 rounded-full">
                                                    오늘
                                                </span>
                                            )}
                                        </div>
                                        {displayOvertime > 0 && (
                                            <span className="text-[7px] sm:text-[8px] text-emerald-700 font-semibold flex items-center gap-0.5 bg-emerald-100 px-0.5 sm:px-1 py-0.5 rounded-full shadow-sm">
                                                <Clock size={8} /> {displayOvertime}h
                                            </span>
                                        )}
                                    </div>

                                    {/* Events list */}
                                    <div className="space-y-0.5 overflow-y-auto h-full scrollbar-hide flex-1">
                                        {/* Pending leaves */}
                                        {pendingLeaves.map(leave => (
                                            <div
                                                key={leave.id}
                                                className="text-[7px] sm:text-[8px] p-0.5 px-1 rounded bg-yellow-100 border border-yellow-200 text-yellow-800 font-medium truncate"
                                                title={`${leave.user.name} 신청`}
                                            >
                                                {leave.user.name} 신청
                                            </div>
                                        ))}

                                        {/* Special notes */}
                                        {/* Special notes (Grouped) */}
                                        {(() => {
                                            // Group logs by status tag [Status]
                                            const groupedLogs: { [key: string]: { ids: string[], names: string[], status: string } } = {};
                                            const otherLogs: DailyLog[] = [];

                                            dayLogs.forEach(log => {
                                                const match = log.content.match(/^\[(.*?)\]\s*(.*)$/);
                                                if (match) {
                                                    const status = match[1];
                                                    const name = match[2];
                                                    // Only group specific statuses if needed, or all bracketed tags
                                                    if (['결근', '지각', '조퇴', '휴무'].includes(status)) {
                                                        if (!groupedLogs[status]) {
                                                            groupedLogs[status] = { ids: [], names: [], status };
                                                        }
                                                        groupedLogs[status].ids.push(log.id);
                                                        groupedLogs[status].names.push(name);
                                                    } else {
                                                        otherLogs.push(log);
                                                    }
                                                } else {
                                                    otherLogs.push(log);
                                                }
                                            });

                                            // Check if '웅동 휴무' exists in otherLogs
                                            const hasFullHoliday = otherLogs.some(log => log.content.includes('웅동 휴무'));

                                            // If '웅동 휴무' exists, remove '휴무' group
                                            if (hasFullHoliday && groupedLogs['휴무']) {
                                                delete groupedLogs['휴무'];
                                            }

                                            return (
                                                <>
                                                    {/* Render Grouped Logs - Single badge with comma-separated names */}
                                                    {Object.values(groupedLogs).map((group) => {
                                                        const uniqueNames = Array.from(new Set(group.names.map(n => n.trim()))).filter(Boolean).sort();
                                                        const content = `[${group.status}] ${uniqueNames.join(', ')}`;

                                                        // 상태별 색상 설정
                                                        let statusColor = '';
                                                        switch (group.status) {
                                                            case '휴무':
                                                                statusColor = 'bg-blue-100 border-blue-300 text-blue-800';
                                                                break;
                                                            case '결근':
                                                                statusColor = 'bg-red-100 border-red-400 text-red-900';
                                                                break;
                                                            case '지각':
                                                                statusColor = 'bg-orange-100 border-orange-300 text-orange-800';
                                                                break;
                                                            case '조퇴':
                                                                statusColor = 'bg-yellow-100 border-yellow-400 text-yellow-900';
                                                                break;
                                                            default:
                                                                statusColor = 'bg-gray-100 border-gray-300 text-gray-800';
                                                        }

                                                        return (
                                                            <div
                                                                key={`group-${group.status}-${group.ids[0]}`}
                                                                className={`group/note relative text-[7px] sm:text-[8px] p-0.5 px-1 rounded border font-semibold flex items-start gap-0.5 sm:gap-1 ${statusColor}`}
                                                                title={content}
                                                            >
                                                                <span className="flex-1 whitespace-normal break-words leading-tight">{content}</span>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Render Other Logs */}
                                                    {otherLogs.map(log => {
                                                        const isMissingPositionNote = log.content.includes('근무성립불가');

                                                        // 상태별 색상 설정
                                                        let logColor = '';
                                                        if (isMissingPositionNote) {
                                                            logColor = 'bg-red-100 border-red-400 text-red-900';
                                                        } else if (log.content.includes('[휴무]')) {
                                                            logColor = 'bg-blue-100 border-blue-300 text-blue-800';
                                                        } else if (log.content.includes('[결근]')) {
                                                            logColor = 'bg-red-100 border-red-400 text-red-900';
                                                        } else if (log.content.includes('[지각]')) {
                                                            logColor = 'bg-orange-100 border-orange-300 text-orange-800';
                                                        } else if (log.content.includes('[조퇴]')) {
                                                            logColor = 'bg-yellow-100 border-yellow-400 text-yellow-900';
                                                        } else {
                                                            logColor = 'bg-gray-100 border-gray-300 text-gray-800';
                                                        }

                                                        return (
                                                            <div
                                                                key={log.id}
                                                                className={`group/note relative text-[7px] sm:text-[8px] p-0.5 px-1 rounded border font-semibold flex items-start gap-0.5 sm:gap-1 ${logColor}`}
                                                                title={log.content}
                                                            >
                                                                <span className="flex-1 whitespace-normal break-words leading-tight">{log.content}</span>
                                                                {isManager && onDeleteNote && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('이 특이사항을 삭제하시겠습니까?')) {
                                                                                onDeleteNote(log.id);
                                                                            }
                                                                        }}
                                                                        className="opacity-0 group-hover/note:opacity-100 transition-opacity text-red-600 hover:text-red-700 flex-shrink-0"
                                                                        title="삭제"
                                                                    >
                                                                        <X size={9} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
