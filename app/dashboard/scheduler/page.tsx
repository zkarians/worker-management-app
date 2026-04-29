'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';
import ScheduleForm from '@/app/components/Scheduler/ScheduleForm';
import { GlassCard } from '@/app/components/GlassCard';
import { isHoliday } from '@/app/lib/holidays';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO,
    getDay,
    getDate,
    getWeekOfMonth,
    lastDayOfMonth
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface Schedule {
    id: string;
    title: string;
    description?: string;
    type: string;
    startDate: string;
    endDate?: string;
    time?: string;
    imageUrl?: string;
    isPopup: boolean;
    isActive: boolean;
    dayOfWeek: number[];
    dayOfMonth?: number;
    weekOfMonth?: number;
}

export default function SchedulerPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const user = useUser();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'MANAGER') {
            alert('접근 권한이 없습니다.');
            router.push('/dashboard');
        }
    }, [user, router]);

    const fetchSchedules = async () => {
        try {
            console.log('Fetching schedules...');
            const res = await fetch('/api/schedules', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                console.log('Schedules fetched:', data);
                setSchedules(data);
            }
        } catch (error) {
            console.error('Failed to fetch schedules', error);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const [activeTab, setActiveTab] = useState<'CALENDAR' | 'LIST'>('CALENDAR');

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        // Optional: Auto-switch to list on mobile when date is clicked
        // setActiveTab('LIST'); 
    };

    const handleEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingSchedule(undefined);
        setIsFormOpen(true);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calendar Grid Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Helper to check if a schedule falls on a given day
    const getSchedulesForDay = (day: Date) => {
        return schedules.filter(schedule => {
            const scheduleStart = parseISO(schedule.startDate);
            const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : null;

            // Basic range check
            if (day < startOfDay(scheduleStart)) return false;
            if (scheduleEnd && day > endOfDay(scheduleEnd)) return false;

            const dayOfWeek = getDay(day);
            const dayOfMonth = getDate(day);
            const weekOfMonth = getWeekOfMonth(day);

            switch (schedule.type) {
                case 'ONCE':
                    return isSameDay(day, scheduleStart);
                case 'DAILY':
                    return true;
                case 'WEEKLY':
                    return schedule.dayOfWeek.includes(dayOfWeek);
                case 'MONTHLY_DATE':
                    if (schedule.dayOfMonth === -1) {
                        return isSameDay(day, lastDayOfMonth(day));
                    }
                    return schedule.dayOfMonth === dayOfMonth;
                case 'MONTHLY_DAY':
                    return schedule.weekOfMonth === weekOfMonth && schedule.dayOfWeek.includes(dayOfWeek);
                case 'MONTHLY_LAST':
                    return isSameDay(day, lastDayOfMonth(day));
                default:
                    return false;
            }
        });
    };

    // Helper for start/end of day comparison
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const getDayColor = (date: Date) => {
        const dayOfWeek = getDay(date);
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

    const selectedDaySchedules = getSchedulesForDay(selectedDate);

    return (
        <div className="p-4 sm:p-6 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 overflow-hidden relative">

                {/* Mobile Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-lg md:hidden shrink-0">
                    <button
                        onClick={() => setActiveTab('CALENDAR')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'CALENDAR'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        달력
                    </button>
                    <button
                        onClick={() => setActiveTab('LIST')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'LIST'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        일정 목록
                    </button>
                </div>

                {/* Left: Calendar Grid */}
                <GlassCard className={`
                    flex-1 bg-white border-slate-200 shadow-sm h-full flex-col overflow-hidden
                    ${activeTab === 'LIST' ? 'hidden md:flex' : 'flex'}
                `}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100 gap-3 sm:gap-0 flex-shrink-0">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
                                <CalendarIcon className="text-indigo-600" size={20} />
                            </div>
                            <span className="hidden sm:inline">스케줄 관리</span>
                            <span className="sm:hidden">스케줄</span>
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
                                {format(currentMonth, 'yyyy년 M월', { locale: ko })}
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

                    {/* Calendar Grid */}
                    <div className="flex-1 overflow-auto">
                        <div className="min-w-[300px] sm:min-w-0 h-full">
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

                                {calendarDays.map((day, idx) => {
                                    const daySchedules = getSchedulesForDay(day);
                                    const isCurrentMonth = isSameMonth(day, monthStart);
                                    const isTodayDate = isToday(day);
                                    const isSelected = isSameDay(day, selectedDate);
                                    const dayColor = getDayColor(day);
                                    const dayOfWeek = getDay(day);
                                    const holiday = isHoliday(day);
                                    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            onClick={() => handleDateClick(day)}
                                            className={`
                                                p-1 sm:p-1.5 relative group transition-all cursor-pointer rounded-lg border-2 flex flex-col min-h-[50px] sm:min-h-[80px]
                                                ${!isCurrentMonth ? 'opacity-40 bg-slate-50/50' : ''}
                                                ${isSelected
                                                    ? 'bg-blue-50 ring-2 ring-inset ring-blue-400 border-blue-300'
                                                    : isTodayDate
                                                        ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300 shadow-md ring-2 ring-indigo-200'
                                                        : holiday
                                                            ? 'bg-red-50/50 border-red-200 hover:bg-red-50 hover:border-red-300'
                                                            : isWeekendDay
                                                                ? 'bg-slate-50/30 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                                : 'bg-white border-slate-100 hover:bg-indigo-50/30 hover:border-indigo-200'
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-0.5 sm:mb-1 flex-shrink-0">
                                                <div className="flex items-center gap-0.5 sm:gap-1">
                                                    <span className={`text-xs sm:text-sm font-bold ${dayColor}`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {isTodayDate && (
                                                        <span className="text-[7px] sm:text-[8px] text-indigo-600 font-semibold bg-indigo-200 px-1 py-0.5 rounded-full">
                                                            오늘
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-0.5 overflow-y-auto h-full scrollbar-transparent flex-1">
                                                {daySchedules.map((schedule, i) => (
                                                    <div
                                                        key={schedule.id}
                                                        className={`
                                                            text-[7px] sm:text-[8px] p-0.5 px-1 rounded border font-semibold break-words whitespace-normal leading-tight h-auto
                                                            ${schedule.isPopup
                                                                ? 'bg-red-100 border-red-300 text-red-800'
                                                                : 'bg-blue-100 border-blue-300 text-blue-800'
                                                            }
                                                        `}
                                                        title={schedule.title}
                                                    >
                                                        {schedule.isPopup && '🔔 '}{schedule.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Right: Side Panel */}
                <GlassCard className={`
                    bg-white border-slate-200 shadow-sm flex-col overflow-hidden
                    ${activeTab === 'CALENDAR' ? 'hidden md:flex' : 'flex'}
                    w-full md:w-80
                `}>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="font-bold text-lg text-slate-800">
                                {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })}
                            </h2>
                            <p className="text-xs text-slate-500">일정 목록</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 shadow-sm transition-colors"
                            title="일정 추가"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {selectedDaySchedules.length === 0 ? (
                            <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                                <CalendarIcon className="w-10 h-10 mb-2 opacity-20" />
                                <p>등록된 일정이 없습니다.</p>
                                <button onClick={handleAdd} className="text-indigo-600 text-sm mt-2 hover:underline font-medium">
                                    새 일정 추가하기
                                </button>
                            </div>
                        ) : (
                            selectedDaySchedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    className={`
                                        p-3 rounded-xl border transition-all hover:shadow-md group relative
                                        ${schedule.isPopup
                                            ? 'bg-red-50 border-red-100 hover:border-red-200'
                                            : 'bg-white border-slate-200 hover:border-indigo-200'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm ${schedule.isPopup ? 'text-red-700' : 'text-slate-800'}`}>
                                            {schedule.isPopup && '🔔 '}{schedule.title}
                                        </h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(schedule);
                                                }}
                                                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700"
                                                title="수정"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!confirm('정말 삭제하시겠습니까?')) return;
                                                    try {
                                                        const res = await fetch(`/api/schedules/${schedule.id}`, { method: 'DELETE' });
                                                        if (res.ok) fetchSchedules();
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('삭제 실패');
                                                    }
                                                }}
                                                className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-600"
                                                title="삭제"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    {schedule.time && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                            <Clock size={12} />
                                            {schedule.time}
                                        </div>
                                    )}
                                    {schedule.description && (
                                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                            {schedule.description}
                                        </p>
                                    )}
                                    {schedule.imageUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                            <img
                                                src={schedule.imageUrl}
                                                alt={schedule.title}
                                                className="w-full h-auto max-h-32 object-contain mx-auto"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>

            {isFormOpen && (
                <ScheduleForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchSchedules}
                    initialData={editingSchedule}
                    initialDate={format(selectedDate, 'yyyy-MM-dd')}
                />
            )}
        </div>
    );
}
