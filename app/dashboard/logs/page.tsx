'use client';

import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';
import { SpecialNoteModal } from '@/app/components/SpecialNoteModal';
import { SpecialNotesCalendar } from '@/app/components/SpecialNotesCalendar';
import { SchedulerList } from '@/app/components/SchedulerList';

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

export default function LogsPage() {
    const user = useUser();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [refreshKey, setRefreshKey] = useState(0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    useEffect(() => {
        fetchData();
    }, [year, month, refreshKey]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, attendanceRes, leavesRes] = await Promise.all([
                fetch(`/api/logs?month=${month}&year=${year}`),
                fetch(`/api/attendance?month=${month}&year=${year}`),
                fetch(`/api/leaves`)
            ]);

            const logsData = await logsRes.json();
            const attendanceData = await attendanceRes.json();
            const leavesData = await leavesRes.json();

            if (logsData.logs) setLogs(logsData.logs);
            if (attendanceData.attendance) setAttendance(attendanceData.attendance);
            if (leavesData.leaves) setLeaves(leavesData.leaves);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const isManager = user?.role === 'MANAGER';

    const handleDeleteNote = async (id: string) => {
        if (!confirm('이 특이사항을 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/logs?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setRefreshKey(prev => prev + 1);
            } else {
                const data = await res.json();
                alert(`삭제 실패: ${data.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Failed to delete note', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleSave = async (content: string, date: string) => {
        try {
            // Check if log exists for this date to decide POST or PUT
            let logId = editingLog?.id;
            if (!logId) {
                const existingLog = logs.find(l => l.date.split('T')[0] === date);
                if (existingLog) logId = existingLog.id;
            }

            // Allow saving empty content (empty string)
            if (logId) {
                // Update (even if content is empty)
                await fetch('/api/logs', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: logId, content: content || '' })
                });
            } else {
                // Create (only if content is not empty)
                if (content.trim()) {
                    await fetch('/api/logs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date, content })
                    });
                }
            }

            setIsModalOpen(false);
            setEditingLog(null);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Failed to save log', error);
        }
    };

    const handleDateClick = (date: string) => {
        setSelectedDate(date);
        const existingLog = logs.find(l => l.date.split('T')[0] === date);
        setEditingLog(existingLog || null);
        setIsModalOpen(true);
    };

    const handleMonthChange = (newYear: number, newMonth: number) => {
        setCurrentDate(new Date(newYear, newMonth - 1, 1));
    };

    return (
        <div className="space-y-4 sm:space-y-6 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex flex-col p-4 sm:p-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">특이사항 관리</span>
                    <span className="sm:hidden">특이사항</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0">
                {/* Calendar - Full width on mobile, 7 cols on desktop */}
                <div className="lg:col-span-7 h-full overflow-hidden">
                    <SpecialNotesCalendar
                        year={year}
                        month={month}
                        logs={logs}
                        attendance={attendance}
                        leaves={leaves}
                        onMonthChange={handleMonthChange}
                        onDateClick={handleDateClick}
                        onDeleteNote={handleDeleteNote}
                        isManager={isManager}
                    />
                </div>

                {/* Scheduler List - Full width on mobile, 5 cols on desktop */}
                <div className="lg:col-span-5 h-full overflow-hidden">
                    <SchedulerList
                        year={year}
                        month={month}
                        logs={logs}
                        leaves={leaves}
                        onDateClick={handleDateClick}
                    />
                </div>
            </div>

            <SpecialNoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                date={selectedDate}
                initialContent={editingLog?.content}
            />
        </div>
    );
}
