'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { Clock, Calendar, Download, Search, TrendingUp } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';

interface AttendanceRecord {
    userId: string;
    date: string;
    status: string;
    overtimeHours: number;
    workHours: number;
    user: { name: string; company?: { name: string } };
}

interface UserStats {
    userId: string;
    userName: string;
    companyName?: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    earlyLeaveDays: number;
    scheduledDays: number;
    offDays: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
}

export default function AttendanceReportPage() {
    const user = useUser();
    const isManager = user?.role === 'MANAGER';

    // Set default to today only
    const getDefaultDateRange = () => {
        const today = new Date();
        return {
            startDate: today.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            month: today.getMonth() + 1,
            year: today.getFullYear()
        };
    };

    const defaultRange = getDefaultDateRange();
    const [viewMode, setViewMode] = useState<'month' | 'range'>('month');
    const [selectedMonth, setSelectedMonth] = useState(defaultRange.month);
    const [selectedYear, setSelectedYear] = useState(defaultRange.year);
    const [startDate, setStartDate] = useState(defaultRange.startDate);
    const [endDate, setEndDate] = useState(defaultRange.endDate);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [userStats, setUserStats] = useState<UserStats[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isManager) {
            fetchData();
        }
    }, [viewMode, selectedMonth, selectedYear, startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let queryParams = '';

            if (viewMode === 'month') {
                queryParams = `month=${selectedMonth}&year=${selectedYear}`;
            } else {
                queryParams = `startDate=${startDate}&endDate=${endDate}`;
            }

            const [usersRes, attRes] = await Promise.all([
                fetch('/api/users'),
                fetch(`/api/attendance?${queryParams}`)
            ]);

            const usersData = await usersRes.json();
            const attData = await attRes.json();

            const workerUsers = usersData.users ? usersData.users.filter((u: any) => u.role === 'WORKER' && u.isApproved) : [];
            const attendanceRecords = attData.attendance || [];

            // Process attendance data
            const processedData: AttendanceRecord[] = attendanceRecords.map((record: any) => ({
                userId: record.userId,
                date: record.date.split('T')[0],
                status: record.status,
                overtimeHours: record.overtimeHours || 0,
                workHours: record.workHours || 0,
                user: record.user
            }));

            setAttendanceData(processedData);

            // Calculate statistics per user
            const statsMap = new Map<string, UserStats>();

            // Initialize stats for all workers
            workerUsers.forEach((u: any) => {
                statsMap.set(u.id, {
                    userId: u.id,
                    userName: u.name,
                    companyName: u.company?.name,
                    totalDays: 0,
                    presentDays: 0,
                    absentDays: 0,
                    lateDays: 0,
                    earlyLeaveDays: 0,
                    scheduledDays: 0,
                    offDays: 0,
                    totalWorkHours: 0,
                    totalOvertimeHours: 0
                });
            });

            // Calculate date range
            let dateRange: string[] = [];
            if (viewMode === 'month') {
                const start = new Date(selectedYear, selectedMonth - 1, 1);
                const end = new Date(selectedYear, selectedMonth, 0);
                const current = new Date(start);
                while (current <= end) {
                    dateRange.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            } else {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const current = new Date(start);
                while (current <= end) {
                    dateRange.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            }

            // Process attendance records
            processedData.forEach(record => {
                const stats = statsMap.get(record.userId);
                if (stats) {
                    stats.totalDays++;
                    stats.totalWorkHours += record.workHours;
                    stats.totalOvertimeHours += record.overtimeHours;

                    switch (record.status) {
                        case 'PRESENT':
                            stats.presentDays++;
                            break;
                        case 'ABSENT':
                            stats.absentDays++;
                            break;
                        case 'LATE':
                            stats.lateDays++;
                            break;
                        case 'EARLY_LEAVE':
                            stats.earlyLeaveDays++;
                            break;
                        case 'SCHEDULED':
                            stats.scheduledDays++;
                            break;
                        case 'OFF_DAY':
                            stats.offDays++;
                            break;
                    }
                }
            });

            // Fetch roster data to check scheduled assignments
            const rosterPromises = dateRange.map(date => fetch(`/api/roster?date=${date}`));
            const rosterResponses = await Promise.all(rosterPromises);
            const rosterDataArray = await Promise.all(rosterResponses.map(res => res.json()));

            // Get current time for comparison
            const now = new Date();
            const currentHour = now.getHours();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Update stats with roster information
            rosterDataArray.forEach((rosterData, index) => {
                if (rosterData.roster?.assignments) {
                    rosterData.roster.assignments.forEach((assignment: any) => {
                        const stats = statsMap.get(assignment.userId);
                        if (stats) {
                            // Check if there's no attendance record for this date
                            const hasRecord = processedData.some(
                                r => r.userId === assignment.userId && r.date === dateRange[index]
                            );
                            if (!hasRecord) {
                                const [year, month, day] = dateRange[index].split('-').map(Number);
                                const targetDate = new Date(year, month - 1, day);
                                targetDate.setHours(0, 0, 0, 0);

                                // Compare dates
                                // Compare dates
                                if (targetDate < today) {
                                    // Past date: Mark as PRESENT with 8 work hours
                                    stats.presentDays++;
                                    stats.totalDays++;
                                    stats.totalWorkHours += 8;

                                    // Add to processedData for detailed records
                                    processedData.push({
                                        userId: assignment.userId,
                                        date: dateRange[index],
                                        status: 'PRESENT',
                                        workHours: 8,
                                        overtimeHours: 0,
                                        user: assignment.user
                                    });
                                } else if (targetDate.getTime() === today.getTime()) {
                                    // Today: Check if after 19:00
                                    if (currentHour >= 19) {
                                        // After 19:00: Mark as PRESENT with 8 work hours
                                        stats.presentDays++;
                                        stats.totalDays++;
                                        stats.totalWorkHours += 8;

                                        processedData.push({
                                            userId: assignment.userId,
                                            date: dateRange[index],
                                            status: 'PRESENT',
                                            workHours: 8,
                                            overtimeHours: 0,
                                            user: assignment.user
                                        });
                                    } else {
                                        // Before 19:00: Mark as SCHEDULED
                                        stats.scheduledDays++;
                                        stats.totalDays++;
                                    }
                                } else {
                                    // Future date: Mark as SCHEDULED
                                    stats.scheduledDays++;
                                    stats.totalDays++;
                                }
                            }
                        }
                    });
                }
            });

            setUserStats(Array.from(statsMap.values()));
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (month: number, year: number) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'PRESENT': return { text: '출근', color: 'bg-green-500/20 text-green-400' };
            case 'ABSENT': return { text: '결근', color: 'bg-red-500/20 text-red-400' };
            case 'LATE': return { text: '지각', color: 'bg-yellow-500/20 text-yellow-400' };
            case 'EARLY_LEAVE': return { text: '조퇴', color: 'bg-yellow-500/20 text-yellow-400' };
            case 'SCHEDULED': return { text: '예정', color: 'bg-blue-500/20 text-blue-400' };
            case 'OFF_DAY': return { text: '휴무', color: 'bg-slate-500/20 text-slate-500' };
            default: return { text: status || '-', color: 'bg-slate-500/20 text-slate-400' };
        }
    };

    if (!isManager) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-500">관리자만 접근할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" /> 근태 내역 조회
                </h1>
            </div>

            {/* Filter Controls */}
            <GlassCard className="bg-white border-slate-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">조회 방식:</span>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'month'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            월별 조회
                        </button>
                        <button
                            onClick={() => setViewMode('range')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'range'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            기간 조회
                        </button>
                    </div>

                    {/* Month Selector */}
                    {viewMode === 'month' && (
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-slate-500" />
                            <select
                                value={selectedYear}
                                onChange={(e) => handleMonthChange(selectedMonth, parseInt(e.target.value))}
                                className="glass-input bg-white border-slate-200 text-slate-900 px-3 py-2"
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value), selectedYear)}
                                className="glass-input bg-white border-slate-200 text-slate-900 px-3 py-2"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{month}월</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date Range Selector */}
                    {viewMode === 'range' && (
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                            <Calendar size={18} className="text-slate-500" />
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
                    )}
                </div>
            </GlassCard>

            {/* Statistics Summary */}
            {userStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard className="bg-white border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">총 근무자</span>
                            <span className="text-2xl font-bold text-slate-900">{userStats.length}</span>
                        </div>
                    </GlassCard>
                    <GlassCard className="bg-white border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">총 근무일</span>
                            <span className="text-2xl font-bold text-emerald-600">
                                {userStats.reduce((sum, stat) => sum + stat.presentDays, 0)}
                            </span>
                        </div>
                    </GlassCard>
                    <GlassCard className="bg-white border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">총 근무시간</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {userStats.reduce((sum, stat) => sum + stat.totalWorkHours, 0).toFixed(1)}h
                            </span>
                        </div>
                    </GlassCard>
                    <GlassCard className="bg-white border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">총 잔업시간</span>
                            <span className="text-2xl font-bold text-amber-600">
                                {userStats.reduce((sum, stat) => sum + stat.totalOvertimeHours, 0).toFixed(1)}h
                            </span>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* User Statistics Table */}
            <GlassCard className="overflow-hidden p-0 bg-white border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">이름</th>
                                <th className="px-6 py-4">소속</th>
                                <th className="px-6 py-4 text-center">출근</th>
                                <th className="px-6 py-4 text-center">결근</th>
                                <th className="px-6 py-4 text-center">휴무</th>
                                <th className="px-6 py-4 text-center">지각</th>
                                <th className="px-6 py-4 text-center">조퇴</th>
                                <th className="px-6 py-4 text-center">예정</th>
                                <th className="px-6 py-4 text-center">근무시간</th>
                                <th className="px-6 py-4 text-center">잔업시간</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
                                        조회 중...
                                    </td>
                                </tr>
                            ) : userStats.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                userStats.map((stat) => (
                                    <tr key={stat.userId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{stat.userName}</td>
                                        <td className={`px-6 py-4 font-medium ${stat.companyName?.includes('디티에스') ? 'text-purple-600' :
                                            stat.companyName?.includes('신항만') ? 'text-emerald-600' :
                                                stat.companyName?.includes('보람') ? 'text-blue-600' :
                                                    'text-slate-700'
                                            }`}>
                                            {stat.companyName || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                                {stat.presentDays}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                                                {stat.absentDays}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-slate-500/20 text-slate-500">
                                                {stat.offDays}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                                                {stat.lateDays}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                                                {stat.earlyLeaveDays}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                                {stat.scheduledDays}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-700">{stat.totalWorkHours.toFixed(1)}h</td>
                                        <td className="px-6 py-4 text-center text-slate-700">{stat.totalOvertimeHours.toFixed(1)}h</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Detailed Attendance Records */}
            <GlassCard className="overflow-hidden p-0 bg-white border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Clock size={18} /> 상세 근태 내역
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">이름</th>
                                <th className="px-6 py-4">날짜</th>
                                <th className="px-6 py-4">상태</th>
                                <th className="px-6 py-4 text-center">근무시간</th>
                                <th className="px-6 py-4 text-center">잔업시간</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        조회 중...
                                    </td>
                                </tr>
                            ) : attendanceData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                attendanceData.map((record, index) => {
                                    const statusDisplay = getStatusDisplay(record.status);
                                    return (
                                        <tr key={`${record.userId}-${record.date}-${index}`} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{record.user.name}</td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${statusDisplay.color}`}>
                                                    {statusDisplay.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-700">{record.workHours.toFixed(1)}h</td>
                                            <td className="px-6 py-4 text-center text-slate-700">{record.overtimeHours.toFixed(1)}h</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}



