'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { Save, Clock, Users, CheckSquare, Search } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';

interface Attendance {
    userId: string;
    date: string;
    status: string;
    overtimeHours: number;
    workHours: number;
    user: { name: string };
}

export default function AttendancePage() {
    const user = useUser();

    // Set default date range from first day of current month to today
    const getDefaultDateRange = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;

        // Get today in local timezone
        const today = new Date(now.getTime() - offset);

        // Get first day of current month in local timezone
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLocal = new Date(firstDayOfMonth.getTime() - offset);

        return {
            startDate: firstDayLocal.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        };
    };

    const defaultRange = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultRange.startDate);
    const [endDate, setEndDate] = useState(defaultRange.endDate);
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string>(''); // '' means '전체'
    const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);

    // Bulk Edit State
    const [bulkWorkHours, setBulkWorkHours] = useState(8);
    const [bulkOvertime, setBulkOvertime] = useState(0);
    const [bulkStatus, setBulkStatus] = useState('PRESENT'); // 상태 일괄 적용 추가

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, selectedUserId]);

    const getStatusFromRoster = (dateStr: string, hasActualAttendance: boolean, actualStatus: string): string => {
        // If there's actual attendance data, use it
        if (hasActualAttendance && actualStatus) {
            return actualStatus;
        }

        const now = new Date();
        const currentHour = now.getHours();

        // Parse dateStr (YYYY-MM-DD) as local date
        const [year, month, day] = dateStr.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day);
        targetDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Past date: PRESENT
        if (targetDate < today) {
            return 'PRESENT';
        }

        // Today: Check if after 19:00
        if (targetDate.getTime() === today.getTime()) {
            return currentHour >= 19 ? 'PRESENT' : 'SCHEDULED';
        }

        // Future date: SCHEDULED
        return 'SCHEDULED';
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const isManager = user?.role === 'MANAGER';

            let data: Attendance[] = [];

            if (isManager) {
                const [usersRes, attRes] = await Promise.all([
                    fetch('/api/users'),
                    fetch(`/api/attendance?startDate=${startDate}&endDate=${endDate}${selectedUserId ? `&userId=${selectedUserId}` : ''}`)
                ]);
                const usersData = await usersRes.json();
                const attData = await attRes.json();

                const workerUsers = usersData.users ? usersData.users.filter((u: any) => u.role === 'WORKER' || u.role === 'MANAGER') : [];

                // Store workers list for dropdown
                setWorkers(workerUsers.map((u: any) => ({ id: u.id, name: u.name })));

                // Filter by selected user if not '전체'
                const filteredWorkerUsers = selectedUserId
                    ? workerUsers.filter((u: any) => u.id === selectedUserId)
                    : workerUsers;
                const attendanceRecords = attData.attendance || [];

                // Create a map of attendance records by userId and date
                const attendanceMap = new Map<string, Map<string, Attendance>>();
                attendanceRecords.forEach((record: any) => {
                    const dateStr = record.date.split('T')[0];
                    if (!attendanceMap.has(record.userId)) {
                        attendanceMap.set(record.userId, new Map());
                    }
                    attendanceMap.get(record.userId)!.set(dateStr, {
                        userId: record.userId,
                        date: dateStr,
                        status: record.status,
                        overtimeHours: record.overtimeHours || 0,
                        workHours: record.workHours || 0,
                        user: record.user
                    });
                });

                // Generate date range
                const start = new Date(startDate);
                const end = new Date(endDate);
                const dates: string[] = [];
                const current = new Date(start);
                while (current <= end) {
                    dates.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }

                // Fetch roster data for all dates
                const rosterPromises = dates.map(date => fetch(`/api/roster?date=${date}`));
                const rosterResponses = await Promise.all(rosterPromises);
                const rosterDataArray = await Promise.all(rosterResponses.map(res => res.json()));

                // Create a map of roster assignments by userId and date
                const rosterMap = new Map<string, Set<string>>();
                rosterDataArray.forEach((rosterData, index) => {
                    if (rosterData.roster?.assignments) {
                        rosterData.roster.assignments.forEach((assignment: any) => {
                            const dateStr = dates[index];
                            const key = `${assignment.userId}-${dateStr}`;
                            if (!rosterMap.has(assignment.userId)) {
                                rosterMap.set(assignment.userId, new Set());
                            }
                            rosterMap.get(assignment.userId)!.add(dateStr);
                        });
                    }
                });

                // Create data for all users and dates
                data = filteredWorkerUsers.flatMap((u: any) => {
                    return dates.map(dateStr => {
                        const userAttendanceMap = attendanceMap.get(u.id);
                        const actualRecord = userAttendanceMap?.get(dateStr);
                        const isInRoster = rosterMap.get(u.id)?.has(dateStr) || false;

                        if (actualRecord) {
                            // Has actual attendance record
                            // If SCHEDULED and after 19:00 today, show as PRESENT (but don't save to DB)
                            if (actualRecord.status === 'SCHEDULED') {
                                const [year, month, day] = dateStr.split('-').map(Number);
                                const targetDate = new Date(year, month - 1, day);
                                targetDate.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const now = new Date();

                                if (targetDate.getTime() === today.getTime() && now.getHours() >= 19) {
                                    return {
                                        ...actualRecord,
                                        status: 'PRESENT',
                                        workHours: actualRecord.workHours || 8
                                    };
                                }
                            }
                            return actualRecord;
                        } else if (isInRoster) {
                            // In roster but no attendance record yet
                            const status = getStatusFromRoster(dateStr, false, '');
                            // For past dates in roster, always use 8 work hours
                            const [year, month, day] = dateStr.split('-').map(Number);
                            const targetDate = new Date(year, month - 1, day);
                            targetDate.setHours(0, 0, 0, 0);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const now = new Date();

                            const isPastDate = targetDate < today;
                            const isTodayAfter19 = targetDate.getTime() === today.getTime() && now.getHours() >= 19;

                            return {
                                userId: u.id,
                                date: dateStr,
                                status: status || 'SCHEDULED',
                                overtimeHours: 0,
                                workHours: (isPastDate || isTodayAfter19) ? 8 : 8,
                                user: { name: u.name }
                            };
                        } else {
                            // Not in roster and no attendance record - default to null/empty
                            return {
                                userId: u.id,
                                date: dateStr,
                                status: '', // NULL equivalent (empty string)
                                overtimeHours: 0,
                                workHours: 0,
                                user: { name: u.name }
                            };
                        }
                    });
                });
            } else {
                // Worker view
                const attRes = await fetch(`/api/attendance?startDate=${startDate}&endDate=${endDate}&userId=${user?.id}`);
                const attData = await attRes.json();

                // Generate date range
                const start = new Date(startDate);
                const end = new Date(endDate);
                const dates: string[] = [];
                const current = new Date(start);
                while (current <= end) {
                    dates.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }

                // Create attendance map
                const attendanceMap = new Map<string, Attendance>();
                if (attData.attendance && attData.attendance.length > 0) {
                    attData.attendance.forEach((record: any) => {
                        const dateStr = record.date.split('T')[0];
                        attendanceMap.set(dateStr, {
                            userId: record.userId,
                            date: dateStr,
                            status: record.status,
                            overtimeHours: record.overtimeHours || 0,
                            workHours: record.workHours || 0,
                            user: record.user
                        });
                    });
                }

                // Fetch roster data for all dates
                const rosterPromises = dates.map(date => fetch(`/api/roster?date=${date}`));
                const rosterResponses = await Promise.all(rosterPromises);
                const rosterDataArray = await Promise.all(rosterResponses.map(res => res.json()));

                // Check if user is in roster for each date
                const rosterDates = new Set<string>();
                rosterDataArray.forEach((rosterData, index) => {
                    if (rosterData.roster?.assignments) {
                        const isAssigned = rosterData.roster.assignments.some(
                            (assignment: any) => assignment.userId === user?.id
                        );
                        if (isAssigned) {
                            rosterDates.add(dates[index]);
                        }
                    }
                });

                // Create data for all dates
                data = dates.map(dateStr => {
                    const actualRecord = attendanceMap.get(dateStr);
                    const isInRoster = rosterDates.has(dateStr);

                    if (actualRecord) {
                        // If SCHEDULED and after 19:00 today, show as PRESENT (but don't save to DB)
                        if (actualRecord.status === 'SCHEDULED') {
                            const [year, month, day] = dateStr.split('-').map(Number);
                            const targetDate = new Date(year, month - 1, day);
                            targetDate.setHours(0, 0, 0, 0);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const now = new Date();

                            if (targetDate.getTime() === today.getTime() && now.getHours() >= 19) {
                                return {
                                    ...actualRecord,
                                    status: 'PRESENT',
                                    workHours: actualRecord.workHours || 8
                                };
                            }
                        }
                        return actualRecord;
                    } else if (isInRoster) {
                        const status = getStatusFromRoster(dateStr, false, '');
                        // For past dates in roster, always use 8 work hours
                        const [year, month, day] = dateStr.split('-').map(Number);
                        const targetDate = new Date(year, month - 1, day);
                        targetDate.setHours(0, 0, 0, 0);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const now = new Date();

                        const isPastDate = targetDate < today;
                        const isTodayAfter19 = targetDate.getTime() === today.getTime() && now.getHours() >= 19;

                        return {
                            userId: user?.id || '',
                            date: dateStr,
                            status: status || 'SCHEDULED',
                            overtimeHours: 0,
                            workHours: (isPastDate || isTodayAfter19) ? 8 : 8,
                            user: { name: user?.name || '' }
                        };
                    } else {
                        return {
                            userId: user?.id || '',
                            date: dateStr,
                            status: '', // NULL equivalent (empty string)
                            overtimeHours: 0,
                            workHours: 0,
                            user: { name: user?.name || '' }
                        };
                    }
                });
            }

            setAttendanceData(data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (userId: string, date: string, field: string, value: any) => {
        setAttendanceData(prev => prev.map(item => {
            if (item.userId === userId && item.date === date) {
                const updates: any = { [field]: value };

                // If status changes to OFF_DAY or ABSENT, set hours to 0
                if (field === 'status' && (value === 'OFF_DAY' || value === 'ABSENT')) {
                    updates.workHours = 0;
                    updates.overtimeHours = 0;
                }

                return { ...item, ...updates };
            }
            return item;
        }));
    };

    const handleSave = async (userId: string, date: string) => {
        const record = attendanceData.find(a => a.userId === userId && a.date === date);
        if (!record) return;
        await saveRecord(record);
        alert('저장되었습니다!');
    };

    const saveRecord = async (record: Attendance) => {
        try {
            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: record.userId,
                    date: record.date,
                    status: record.status,
                    overtimeHours: Number(record.overtimeHours),
                    workHours: Number(record.workHours),
                }),
            });
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    const handleBulkApply = () => {
        if (!bulkStatus) {
            alert('상태를 선택해주세요.');
            return;
        }

        const isOffOrAbsent = bulkStatus === 'OFF_DAY' || bulkStatus === 'ABSENT';
        const workHoursToApply = isOffOrAbsent ? 0 : bulkWorkHours;
        const overtimeToApply = isOffOrAbsent ? 0 : bulkOvertime;

        setAttendanceData(prev => prev.map(item => ({
            ...item,
            status: bulkStatus,
            workHours: workHoursToApply,
            overtimeHours: overtimeToApply
        })));
    };

    const handleSaveAll = async () => {
        if (!confirm('모든 변경사항을 저장하시겠습니까?')) return;
        try {
            // Use batch API for better performance and consistency
            const response = await fetch('/api/attendance/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ records: attendanceData }),
            });

            if (!response.ok) {
                throw new Error('Batch save failed');
            }

            const result = await response.json();
            alert(`총 ${result.count}건의 데이터가 저장되었습니다.`);

            // Refresh data to ensure consistency
            fetchData();
        } catch (error) {
            console.error('Failed to save all', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };


    const isManager = user?.role === 'MANAGER';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock /> 근태 관리
                </h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    {isManager && (
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg text-slate-900 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto"
                        >
                            <option value="">전체</option>
                            {workers.map(worker => (
                                <option key={worker.id} value={worker.id}>{worker.name}</option>
                            ))}
                        </select>
                    )}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-slate-900 text-sm px-2 py-1 outline-none"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-slate-900 text-sm px-2 py-1 outline-none"
                        />
                        <button
                            onClick={fetchData}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                            title="조회"
                        >
                            <Search size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {isManager && (
                <GlassCard className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-blue-50 border-blue-200">
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-blue-700">일괄 적용:</span>

                        {/* 상태 선택 */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500">상태</label>
                            <select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                className="glass-input py-1 px-2 text-xs bg-white border-slate-200"
                            >
                                <option value="PRESENT">출근</option>
                                <option value="ABSENT">결근</option>
                                <option value="OFF_DAY">휴무</option>
                                <option value="LATE">지각</option>
                                <option value="EARLY_LEAVE">조퇴</option>
                                <option value="SCHEDULED">예정</option>
                                <option value="">-</option>
                            </select>
                        </div>

                        {/* 근무 시간 */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500">기본</label>
                            <input
                                type="number"
                                value={bulkWorkHours}
                                onChange={(e) => setBulkWorkHours(Number(e.target.value))}
                                className="glass-input w-16 py-1 px-2 text-sm bg-white"
                            />
                            <span className="text-xs text-slate-500">시간</span>
                        </div>

                        {/* 잔업 시간 */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500">잔업</label>
                            <input
                                type="number"
                                value={bulkOvertime}
                                onChange={(e) => setBulkOvertime(Number(e.target.value))}
                                className="glass-input w-16 py-1 px-2 text-sm bg-white"
                            />
                            <span className="text-xs text-slate-500">시간</span>
                        </div>

                        <button
                            onClick={handleBulkApply}
                            className="btn-primary glass-button text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                            <CheckSquare size={14} /> 적용
                        </button>
                    </div>
                    <div className="ml-auto w-full md:w-auto flex justify-end">
                        <button
                            onClick={handleSaveAll}
                            className="btn-primary glass-button flex items-center gap-2 bg-green-600 hover:bg-green-500"
                        >
                            <Save size={16} /> 전체 저장
                        </button>
                    </div>
                </GlassCard>
            )}

            {/* Desktop Table View */}
            <GlassCard className="hidden md:block overflow-hidden p-0 bg-white border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">이름</th>
                                <th className="px-6 py-4">날짜</th>
                                <th className="px-6 py-4">상태</th>
                                <th className="px-6 py-4">근무 시간</th>
                                <th className="px-6 py-4">잔업 시간</th>
                                {isManager && <th className="px-6 py-4">작업</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {attendanceData.map((record, index) => (
                                <tr key={`${record.userId}-${record.date}-${index}`} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{record.user.name}</td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isManager ? (
                                            <select
                                                value={record.status}
                                                onChange={(e) => handleChange(record.userId, record.date, 'status', e.target.value)}
                                                className="glass-input py-1 px-2 bg-white border-slate-200 text-xs"
                                            >
                                                <option value="">-</option>
                                                <option value="PRESENT">출근</option>
                                                <option value="ABSENT">결근</option>
                                                <option value="OFF_DAY">휴무</option>
                                                <option value="LATE">지각</option>
                                                <option value="EARLY_LEAVE">조퇴</option>
                                                <option value="SCHEDULED">예정</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' :
                                                record.status === 'ABSENT' ? 'bg-red-500/20 text-red-400' :
                                                    record.status === 'OFF_DAY' ? 'bg-slate-500/20 text-slate-500' :
                                                        record.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                                                            record.status === 'LATE' || record.status === 'EARLY_LEAVE' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {record.status === 'PRESENT' ? '출근' :
                                                    record.status === 'ABSENT' ? '결근' :
                                                        record.status === 'OFF_DAY' ? '휴무' :
                                                            record.status === 'SCHEDULED' ? '예정' :
                                                                record.status === 'LATE' ? '지각' :
                                                                    record.status === 'EARLY_LEAVE' ? '조퇴' :
                                                                        record.status || '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isManager ? (
                                            <input
                                                type="number"
                                                value={record.workHours}
                                                onChange={(e) => handleChange(record.userId, record.date, 'workHours', e.target.value)}
                                                className="glass-input py-1 px-2 w-20 bg-white border-slate-200 text-xs"
                                            />
                                        ) : (
                                            <span>{record.workHours}시간</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isManager ? (
                                            <input
                                                type="number"
                                                value={record.overtimeHours}
                                                onChange={(e) => handleChange(record.userId, record.date, 'overtimeHours', e.target.value)}
                                                className="glass-input py-1 px-2 w-20 bg-white border-slate-200 text-xs"
                                            />
                                        ) : (
                                            <span>{record.overtimeHours}시간</span>
                                        )}
                                    </td>
                                    {isManager && (
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleSave(record.userId, record.date)}
                                                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                            >
                                                <Save size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {attendanceData.length === 0 ? (
                    <GlassCard className="bg-white border-slate-200">
                        <p className="text-center text-gray-500 py-8">
                            근태 데이터가 없습니다.
                        </p>
                    </GlassCard>
                ) : (
                    attendanceData.map((record, index) => (
                        <GlassCard key={`${record.userId}-${record.date}-${index}`} className="bg-white border-slate-200 p-4">
                            <div className="space-y-3">
                                {/* Header with name and date */}
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-base">{record.user.name}</h3>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    {!isManager && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${record.status === 'PRESENT' ? 'bg-green-500/20 text-green-700' :
                                            record.status === 'ABSENT' ? 'bg-red-500/20 text-red-700' :
                                                record.status === 'OFF_DAY' ? 'bg-slate-500/20 text-slate-700' :
                                                    record.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-700' :
                                                        record.status === 'LATE' || record.status === 'EARLY_LEAVE' ? 'bg-yellow-500/20 text-yellow-700' :
                                                            'bg-slate-500/20 text-slate-600'
                                            }`}>
                                            {record.status === 'PRESENT' ? '출근' :
                                                record.status === 'ABSENT' ? '결근' :
                                                    record.status === 'OFF_DAY' ? '휴무' :
                                                        record.status === 'SCHEDULED' ? '예정' :
                                                            record.status === 'LATE' ? '지각' :
                                                                record.status === 'EARLY_LEAVE' ? '조퇴' :
                                                                    record.status || '-'}
                                        </span>
                                    )}
                                </div>

                                {/* Status, Work Hours, Overtime */}
                                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium">상태</p>
                                        {isManager ? (
                                            <select
                                                value={record.status}
                                                onChange={(e) => handleChange(record.userId, record.date, 'status', e.target.value)}
                                                className="glass-input py-1.5 px-2 bg-white border-slate-200 text-xs w-full"
                                            >
                                                <option value="">-</option>
                                                <option value="PRESENT">출근</option>
                                                <option value="ABSENT">결근</option>
                                                <option value="OFF_DAY">휴무</option>
                                                <option value="LATE">지각</option>
                                                <option value="EARLY_LEAVE">조퇴</option>
                                                <option value="SCHEDULED">예정</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm text-slate-700 font-medium">
                                                {record.status === 'PRESENT' ? '출근' :
                                                    record.status === 'ABSENT' ? '결근' :
                                                        record.status === 'OFF_DAY' ? '휴무' :
                                                            record.status === 'SCHEDULED' ? '예정' :
                                                                record.status === 'LATE' ? '지각' :
                                                                    record.status === 'EARLY_LEAVE' ? '조퇴' :
                                                                        record.status || '-'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium">근무</p>
                                        {isManager ? (
                                            <input
                                                type="number"
                                                value={record.workHours}
                                                onChange={(e) => handleChange(record.userId, record.date, 'workHours', e.target.value)}
                                                className="glass-input py-1.5 px-2 bg-white border-slate-200 text-xs w-full"
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-700 font-medium">{record.workHours}h</p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium">잔업</p>
                                        {isManager ? (
                                            <input
                                                type="number"
                                                value={record.overtimeHours}
                                                onChange={(e) => handleChange(record.userId, record.date, 'overtimeHours', e.target.value)}
                                                className="glass-input py-1.5 px-2 bg-white border-slate-200 text-xs w-full"
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-700 font-medium">{record.overtimeHours}h</p>
                                        )}
                                    </div>
                                </div>

                                {/* Save Button for Manager */}
                                {isManager && (
                                    <button
                                        onClick={() => handleSave(record.userId, record.date)}
                                        className="w-full px-3 py-2 rounded-lg bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2 mt-2"
                                    >
                                        <Save size={16} />
                                        저장
                                    </button>
                                )}
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
