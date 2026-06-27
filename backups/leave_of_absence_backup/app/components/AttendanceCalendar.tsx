'use client';

import { Calendar as CalendarIcon } from 'lucide-react';

interface Attendance {
    userId: string;
    date: string;
    status: string;
    overtimeHours: number;
    workHours: number;
    user: { name: string };
}

interface AttendanceCalendarProps {
    attendanceData: Attendance[];
    currentMonth: string; // YYYY-MM format
}

export function AttendanceCalendar({ attendanceData, currentMonth }: AttendanceCalendarProps) {
    const [year, month] = currentMonth.split('-').map(Number);

    // Get days in month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month - 1, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Create calendar grid
    const calendarDays: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    // Get attendance for specific date
    const getAttendanceForDate = (day: number): Attendance | undefined => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const found = attendanceData.find(a => a.date.split('T')[0] === dateStr);
        if (found) {
            console.log(`Found attendance for ${dateStr}:`, {
                status: found.status,
                statusType: typeof found.status,
                statusLength: found.status?.length,
                workHours: found.workHours,
                overtimeHours: found.overtimeHours
            });
        }
        return found;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return 'bg-green-50 border-green-300 text-green-700';
            case 'ABSENT':
                return 'bg-red-50 border-red-300 text-red-700';
            case 'OFF_DAY':
                return 'bg-gray-50 border-gray-300 text-gray-700';
            case 'LATE':
            case 'EARLY_LEAVE':
                return 'bg-yellow-50 border-yellow-300 text-yellow-700';
            case 'SCHEDULED':
                return 'bg-blue-50 border-blue-300 text-blue-700';
            default:
                return 'bg-white border-gray-200 text-gray-400';
        }
    };

    // Get status Korean text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PRESENT': return '출근';
            case 'ABSENT': return '결근';
            case 'OFF_DAY': return '휴무';
            case 'LATE': return '지각';
            case 'EARLY_LEAVE': return '조퇴';
            case 'SCHEDULED': return '예정';
            default: return '-';
        }
    };

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const isToday = (day: number) => {
        return today.getFullYear() === year &&
            today.getMonth() + 1 === month &&
            today.getDate() === day;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <CalendarIcon className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900">
                    {year}년 {month}월 근태 달력
                </h3>
            </div>

            {/* Calendar */}
            <div className="flex-1 overflow-auto">
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day, index) => (
                        <div
                            key={day}
                            className={`text-center text-sm sm:text-base font-bold py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-slate-600'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const attendance = getAttendanceForDate(day);
                        const statusColor = attendance ? getStatusColor(attendance.status) : 'bg-white border-gray-200';
                        const isTodayDate = isToday(day);

                        // Calculate day of week (0 = Sunday, 6 = Saturday)
                        const dayOfWeek = new Date(year, month - 1, day).getDay();
                        const isSunday = dayOfWeek === 0;
                        const isSaturday = dayOfWeek === 6;

                        // Weekend border and text colors
                        const weekendBorderClass = isSunday ? 'border-red-400' : isSaturday ? 'border-blue-400' : '';
                        const weekendTextClass = isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : '';

                        return (
                            <div
                                key={day}
                                className={`aspect-square border rounded-lg p-2 sm:p-3 flex flex-col ${statusColor} ${weekendBorderClass} ${isTodayDate ? 'ring-2 ring-indigo-500' : ''
                                    } transition-all hover:shadow-md overflow-hidden`}
                            >
                                {/* Day number */}
                                <div className={`text-sm sm:text-base font-bold mb-1 ${isTodayDate ? 'text-indigo-600' : weekendTextClass
                                    }`}>
                                    {day}
                                </div>

                                {/* Attendance info - fixed height to prevent cell size changes */}
                                {attendance ? (
                                    <div className="flex-1 flex flex-col justify-center text-center min-h-0 overflow-hidden">
                                        {attendance.status && attendance.status.trim() !== '' && (
                                            <div className="text-xs sm:text-sm font-bold mb-1 truncate">
                                                {getStatusText(attendance.status)}
                                            </div>
                                        )}
                                        <div className="text-[9px] sm:text-xs text-slate-600 font-medium space-y-0.5">
                                            <div className="truncate">근무:{attendance.workHours || 0}h</div>
                                            {(attendance.overtimeHours || 0) > 0 && (
                                                <div className="text-amber-600 truncate">잔업:{attendance.overtimeHours}h</div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-xs text-gray-300">
                                        -
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-50 border border-green-300"></div>
                        <span className="text-slate-600">출근</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-blue-50 border border-blue-300"></div>
                        <span className="text-slate-600">예정</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-50 border border-red-300"></div>
                        <span className="text-slate-600">결근</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-gray-50 border border-gray-300"></div>
                        <span className="text-slate-600">휴무</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300"></div>
                        <span className="text-slate-600">지각/조퇴</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded ring-2 ring-indigo-500"></div>
                        <span className="text-slate-600">오늘</span>
                    </div>
                </div>
            </div>
        </div >
    );
}
