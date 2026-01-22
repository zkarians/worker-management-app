'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';
import ScheduleForm from '@/app/components/Scheduler/ScheduleForm';
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

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
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
                default:
                    return false;
            }
        });
    };

    // Helper for start/end of day comparison
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const selectedDaySchedules = getSchedulesForDay(selectedDate);

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6" />
                    스케줄 관리
                </h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white rounded-lg shadow border p-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft /></button>
                        <span className="px-4 font-bold text-lg min-w-[140px] text-center">
                            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                        </span>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight /></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Calendar Grid */}
                <div className="flex-1 bg-white rounded-lg shadow border overflow-hidden flex flex-col">
                    <div className="grid grid-cols-7 border-b bg-gray-50">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                            <div key={day} className={`p-3 text-center font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                        {calendarDays.map((day, idx) => {
                            const daySchedules = getSchedulesForDay(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDate = isToday(day);
                            const isSelected = isSameDay(day, selectedDate);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        border-b border-r min-h-[100px] p-2 cursor-pointer transition-colors
                                        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                                        ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`
                                            text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                                            ${isTodayDate ? 'bg-blue-600 text-white' : ''}
                                            ${!isCurrentMonth ? 'text-gray-400' : getDay(day) === 0 ? 'text-red-500' : getDay(day) === 6 ? 'text-blue-500' : 'text-gray-700'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {daySchedules.length > 0 && (
                                            <div className={`
                                                text-xs px-1.5 py-0.5 rounded truncate border border-transparent
                                                ${daySchedules[0].isPopup ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                                            `}>
                                                {daySchedules[0].isPopup && '🔔 '}{daySchedules[0].title}
                                            </div>
                                        )}
                                        {daySchedules.length > 1 && (
                                            <div className="text-xs text-gray-500 font-medium pl-1">
                                                +{daySchedules.length - 1}개 더보기
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Side Panel */}
                <div className="w-80 bg-white rounded-lg shadow border flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <div>
                            <h2 className="font-bold text-lg text-gray-800">
                                {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })}
                            </h2>
                            <p className="text-xs text-gray-500">일정 목록</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-sm"
                            title="일정 추가"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {selectedDaySchedules.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                <p>등록된 일정이 없습니다.</p>
                                <button onClick={handleAdd} className="text-blue-600 text-sm mt-2 hover:underline">
                                    새 일정 추가하기
                                </button>
                            </div>
                        ) : (
                            selectedDaySchedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    className={`
                                        p-3 rounded-lg border transition-all hover:shadow-md group relative
                                        ${schedule.isPopup ? 'bg-red-50 border-red-100 hover:border-red-300' : 'bg-white border-gray-200 hover:border-blue-300'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm ${schedule.isPopup ? 'text-red-700' : 'text-gray-800'}`}>
                                            {schedule.isPopup && '🔔 '}{schedule.title}
                                        </h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(schedule);
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded text-gray-600"
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
                                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                                title="삭제"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    {schedule.time && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                            <Clock size={12} />
                                            {schedule.time}
                                        </div>
                                    )}
                                    {schedule.description && (
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {schedule.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
