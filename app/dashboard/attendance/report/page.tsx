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
                                    // Today: Mark as PRESENT with 8 work hours
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
            case 'PRESENT': return { text: '출근', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' };
            case 'ABSENT': return { text: '결근', color: 'bg-red-100 border-red-300 text-red-700' };
            case 'LATE': return { text: '지각', color: 'bg-orange-100 border-orange-300 text-orange-700' };
            case 'EARLY_LEAVE': return { text: '조퇴', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' };
            case 'SCHEDULED': return { text: '예정', color: 'bg-blue-100 border-blue-300 text-blue-700' };
            case 'OFF_DAY': return { text: '휴무', color: 'bg-slate-100 border-slate-300 text-slate-700' };
            default: return { text: status || '-', color: 'bg-slate-100 border-slate-300 text-slate-600' };
        }
    };

    if (!isManager) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-500">관리자만 접근할 수 있습니다.</p>
            </div>
        );
    }

    // Detail View State
    const [detailDate, setDetailDate] = useState(new Date().toISOString().split('T')[0]);
    const [detailData, setDetailData] = useState<AttendanceRecord[]>([]);
    const [isDetailSearched, setIsDetailSearched] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchDetailData = async () => {
        setDetailLoading(true);
        try {
            const [usersRes, attRes, rosterRes] = await Promise.all([
                fetch('/api/users'),
                fetch(`/api/attendance?startDate=${detailDate}&endDate=${detailDate}`),
                fetch(`/api/roster?date=${detailDate}`)
            ]);

            const usersData = await usersRes.json();
            const attData = await attRes.json();
            const rosterData = await rosterRes.json();

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

            // Merge with roster data
            if (rosterData.roster?.assignments) {
                const now = new Date();
                const currentHour = now.getHours();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const [year, month, day] = detailDate.split('-').map(Number);
                const targetDate = new Date(year, month - 1, day);
                targetDate.setHours(0, 0, 0, 0);

                rosterData.roster.assignments.forEach((assignment: any) => {
                    const hasRecord = processedData.some(r => r.userId === assignment.userId);
                    if (!hasRecord) {
                        // Logic to determine status based on roster
                        if (targetDate < today) {
                            processedData.push({
                                userId: assignment.userId,
                                date: detailDate,
                                status: 'PRESENT',
                                workHours: 8,
                                overtimeHours: 0,
                                user: assignment.user
                            });
                        } else if (targetDate.getTime() === today.getTime()) {
                            processedData.push({
                                userId: assignment.userId,
                                date: detailDate,
                                status: 'PRESENT',
                                workHours: 8,
                                overtimeHours: 0,
                                user: assignment.user
                            });
                        } else {
                            processedData.push({
                                userId: assignment.userId,
                                date: detailDate,
                                status: 'SCHEDULED',
                                workHours: 0,
                                overtimeHours: 0,
                                user: assignment.user
                            });
                        }
                    }
                });
            }

            setDetailData(processedData);
            setIsDetailSearched(true);
        } catch (error) {
            console.error('Failed to fetch detail data', error);
        } finally {
            setDetailLoading(false);
        }
    };

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
            <GlassCard className="overflow-hidden p-0 bg-white border-slate-200 shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                            <tr>
                                <th className="px-4 py-3 text-sm font-bold text-slate-700">이름</th>
                                <th className="px-4 py-3 text-sm font-bold text-slate-700">소속</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">출근</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">결근</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">휴무</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">지각</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">조퇴</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">예정</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">근무시간</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">잔업시간</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-6 text-center text-slate-500 text-sm">
                                        조회 중...
                                    </td>
                                </tr>
                            ) : userStats.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-6 text-center text-slate-500 text-sm">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                userStats.map((stat) => (
                                    <tr key={stat.userId} className="hover:bg-slate-50/80 transition-all duration-200">
                                        <td className="px-4 py-3 font-bold text-slate-900 text-sm">{stat.userName}</td>
                                        <td className={`px-4 py-3 font-bold text-sm ${stat.companyName?.includes('디티에스') ? 'text-purple-600' :
                                            stat.companyName?.includes('신항만') ? 'text-emerald-600' :
                                                stat.companyName?.includes('보람') ? 'text-blue-600' :
                                                    'text-slate-700'
                                            }`}>
                                            {stat.companyName || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-100 border border-emerald-300 text-emerald-700">
                                                {stat.presentDays}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-red-100 border border-red-300 text-red-700">
                                                {stat.absentDays}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-100 border border-slate-300 text-slate-700">
                                                {stat.offDays}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-orange-100 border border-orange-300 text-orange-700">
                                                {stat.lateDays}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-yellow-100 border border-yellow-400 text-yellow-700">
                                                {stat.earlyLeaveDays}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-100 border border-blue-300 text-blue-700">
                                                {stat.scheduledDays}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-900 text-sm">{stat.totalWorkHours.toFixed(1)}h</td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-900 text-sm">{stat.totalOvertimeHours.toFixed(1)}h</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Detailed Attendance Records */}
            <GlassCard className="overflow-hidden p-0 bg-white border-slate-200 shadow-md">
                <div className="p-4 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-600" /> 상세 근태 내역
                    </h2>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={detailDate}
                            onChange={(e) => setDetailDate(e.target.value)}
                            className="glass-input bg-white border-slate-200 text-slate-900 px-2 py-1 text-sm"
                        />
                        <button
                            onClick={fetchDetailData}
                            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                            title="조회"
                        >
                            <Search size={16} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                            <tr>
                                <th className="px-4 py-3 text-sm font-bold text-slate-700">이름</th>
                                <th className="px-4 py-3 text-sm font-bold text-slate-700">날짜</th>
                                <th className="px-4 py-3 text-sm font-bold text-slate-700">상태</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">근무시간</th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">잔업시간</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {!isDetailSearched ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">
                                        날짜를 선택하고 조회 버튼을 눌러주세요.
                                    </td>
                                </tr>
                            ) : detailLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 text-sm">
                                        조회 중...
                                    </td>
                                </tr>
                            ) : detailData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 text-sm">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                detailData.map((record, index) => {
                                    const statusDisplay = getStatusDisplay(record.status);
                                    return (
                                        <tr key={`${record.userId}-${record.date}-${index}`} className="hover:bg-slate-50/80 transition-all duration-200">
                                            <td className="px-4 py-3 font-bold text-slate-900 text-sm">{record.user.name}</td>
                                            <td className="px-4 py-3 text-slate-700 text-sm font-medium">
                                                {new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${statusDisplay.color}`}>
                                                    {statusDisplay.text}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-900 text-sm">{record.workHours.toFixed(1)}h</td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-900 text-sm">{record.overtimeHours.toFixed(1)}h</td>
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



