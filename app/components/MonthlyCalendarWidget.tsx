'use client';

import { useState, useEffect } from 'react';
import { SpecialNotesCalendar } from './SpecialNotesCalendar';

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

export function MonthlyCalendarWidget({
    onDateClick,
    lastUpdate,
    onDeleteNote,
    isManager = false,
    selectedDate
}: {
    onDateClick?: (date: string) => void,
    lastUpdate?: number,
    onDeleteNote?: (id: string) => void,
    isManager?: boolean,
    selectedDate?: string
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    useEffect(() => {
        if (selectedDate) {
            setCurrentDate(new Date(selectedDate));
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchData();
    }, [year, month, lastUpdate]);

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

    const handleMonthChange = (newYear: number, newMonth: number) => {
        setCurrentDate(new Date(newYear, newMonth - 1, 1));
    };

    return (
        <SpecialNotesCalendar
            year={year}
            month={month}
            logs={logs}
            attendance={attendance}
            leaves={leaves}
            onMonthChange={handleMonthChange}
            onDateClick={onDateClick}
            onDeleteNote={onDeleteNote}
            isManager={isManager}
        />
    );
}
