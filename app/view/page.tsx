'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { ClipboardList, AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Assignment {
    userId: string;
    position: string;
    team: string;
    user: {
        name: string;
        role: string;
        company?: { name: string };
    };
}

interface Team {
    id: string;
    name: string;
}

interface DailyLog {
    id: string;
    date: string;
    content: string;
    author: { name: string };
}

const POSITIONS = ['검수', '포크', '클램프', '상하역'];
const OP_POSITION = 'OP';
const MANAGEMENT_POSITION = '관리';

// Position header colors
const POSITION_HEADER_COLORS: { [key: string]: string } = {
    '검수': 'text-blue-600',
    '포크': 'text-green-600',
    '클램프': 'text-purple-600',
    '상하역': 'text-pink-600',
};

// Company styles
const COMPANY_STYLES = [
    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', subtext: 'text-indigo-500' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', subtext: 'text-emerald-500' },
    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', subtext: 'text-amber-500' },
    { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', subtext: 'text-rose-500' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', subtext: 'text-cyan-500' },
    { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', subtext: 'text-violet-500' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', subtext: 'text-teal-500' },
    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', subtext: 'text-orange-500' },
];

export default function ViewPage() {
    const [date, setDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    });
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
    const [loading, setLoading] = useState(true);
    const [paletteTeam, setPaletteTeam] = useState<{ id: string; name: string } | null>(null);
    const [cleaningTeam, setCleaningTeam] = useState<{ id: string; name: string } | null>(null);

    // Get today and tomorrow dates
    const today = (() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    })();

    const tomorrow = (() => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    })();

    const isToday = date === today;
    const isTomorrow = date === tomorrow;

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rosterRes, teamsRes, usersRes, logsRes] = await Promise.all([
                fetch(`/api/public/roster?date=${date}`),
                fetch('/api/public/teams'),
                fetch('/api/public/users'),
                fetch(`/api/public/logs`)
            ]);

            const rosterData = await rosterRes.json();
            const teamsData = await teamsRes.json();
            const usersData = await usersRes.ok ? await usersRes.json() : { users: [] };
            const logsData = await logsRes.json();

            if (rosterData.roster?.assignments) {
                setAssignments(rosterData.roster.assignments);
            } else {
                setAssignments([]);
            }

            if (rosterData.roster?.paletteTeam) {
                setPaletteTeam(rosterData.roster.paletteTeam);
            } else {
                setPaletteTeam(null);
            }
            if (rosterData.roster?.cleaningTeam) {
                setCleaningTeam(rosterData.roster.cleaningTeam);
            } else {
                setCleaningTeam(null);
            }

            if (teamsData.teams) setTeams(teamsData.teams);

            if (usersData.users && Array.isArray(usersData.users)) {
                const allWorkers = usersData.users.filter((u: any) => u.role === 'WORKER');
                const allManagers = usersData.users.filter((u: any) => u.role === 'MANAGER');

                const assignedWorkerIds = rosterData.roster?.assignments
                    ? new Set(rosterData.roster.assignments.map((a: any) => a.userId))
                    : new Set();

                const workingCount = assignedWorkerIds.size;
                const totalUsers = allWorkers.length + allManagers.length;

                setStats({
                    total: totalUsers,
                    present: workingCount,
                    absent: Math.max(0, totalUsers - workingCount)
                });
            } else {
                setStats({ total: 0, present: 0, absent: 0 });
            }

            if (logsData.logs) {
                setLogs(logsData.logs);
            } else {
                setLogs([]);
            }

        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const getWorkersFor = (teamName: string, position: string) => {
        const positionMap: { [key: string]: string[] } = {
            '포크': ['포크', '지게차'],
            '검수': ['검수'],
            '클램프': ['클램프'],
            '상하역': ['상하역', '상하차']
        };
        const validPositions = positionMap[position] || [position];
        return assignments.filter(a => a.team === teamName && validPositions.includes(a.position));
    };

    const getOPWorkers = () => {
        return assignments.filter(a => a.position === OP_POSITION);
    };

    const getManagementWorkers = () => {
        return assignments.filter(a => a.position === MANAGEMENT_POSITION);
    };

    const getCompanyStyle = (companyName: string = '') => {
        if (!companyName) return COMPANY_STYLES[0];

        if (companyName === '보람관리') return COMPANY_STYLES[0];
        if (companyName === '디티에스') return COMPANY_STYLES[2];
        if (companyName === '신항만건기') return COMPANY_STYLES[1];

        let hash = 0;
        for (let i = 0; i < companyName.length; i++) {
            hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % COMPANY_STYLES.length;
        return COMPANY_STYLES[index];
    };

    const getPositionHeaderColor = (position: string) => {
        return POSITION_HEADER_COLORS[position] || 'text-slate-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header with App Info */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <ClipboardList className="text-indigo-600 w-7 h-7 sm:w-8 sm:h-8" />
                                웅동야간출하 근무현황
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">실시간 근무 배치 현황 (읽기 전용)</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {/* Date Toggle Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDate(today)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isToday
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    오늘
                                </button>
                                <button
                                    onClick={() => setDate(tomorrow)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isTomorrow
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    내일
                                </button>
                            </div>
                            {/* Date Display */}
                            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                                <CalendarIcon size={16} className="text-indigo-600" />
                                <span className="text-xs sm:text-sm font-semibold text-indigo-900">
                                    {new Date(date).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'long'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                    <GlassCard className="p-4 sm:p-6 flex flex-col items-center justify-center bg-white border-slate-200 shadow-md">
                        <span className="text-slate-500 text-xs sm:text-sm font-medium">총원</span>
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{stats.total}</span>
                    </GlassCard>
                    <GlassCard className="p-4 sm:p-6 flex flex-col items-center justify-center bg-white border-slate-200 shadow-md">
                        <span className="text-slate-500 text-xs sm:text-sm font-medium">결근/휴무</span>
                        <span className="text-2xl sm:text-3xl font-bold text-red-500 mt-2">{stats.absent}</span>
                    </GlassCard>
                    <GlassCard className="p-4 sm:p-6 flex flex-col items-center justify-center bg-white border-slate-200 shadow-md">
                        <span className="text-slate-500 text-xs sm:text-sm font-medium">근무</span>
                        <span className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">{stats.present}</span>
                    </GlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Roster Table */}
                    <div className="lg:col-span-3 space-y-6">
                        <GlassCard className="overflow-hidden p-0 shadow-md">
                            <div className="overflow-x-auto">
                                <table className="w-full text-center border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                            <th className="p-3 border-r border-slate-200 w-20 text-xs sm:text-sm font-semibold">구분</th>
                                            {POSITIONS.map(pos => {
                                                const headerColor = getPositionHeaderColor(pos);
                                                return (
                                                    <th key={pos} className={`p-3 border-r border-slate-200 last:border-r-0 text-xs sm:text-sm font-semibold ${headerColor}`}>{pos}</th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {teams.map(team => {
                                            const teamNumber = parseInt(team.name.replace(/[^0-9]/g, '')) || 0;
                                            const isTeam1 = teamNumber === 1;
                                            const teamNameColor = isTeam1 ? 'text-sky-600' : 'text-orange-600';

                                            return (
                                                <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className={`p-3 font-bold ${teamNameColor} bg-slate-50/50 border-r border-slate-200 text-sm`}>
                                                        {team.name}
                                                    </td>
                                                    {POSITIONS.map(pos => {
                                                        const workers = getWorkersFor(team.name, pos);
                                                        return (
                                                            <td key={pos} className="p-2 border-r border-slate-200 last:border-r-0 align-top">
                                                                <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
                                                                    {workers.length > 0 ? (
                                                                        workers.map((assignment, idx) => {
                                                                            const companyName = assignment.user.company?.name;
                                                                            const companyStyle = getCompanyStyle(companyName);
                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    className={`flex flex-col items-center px-2 py-1 rounded-lg border shadow-sm ${companyStyle.bg} ${companyStyle.border}`}
                                                                                >
                                                                                    <span className={`text-xs font-medium ${companyStyle.text}`}>
                                                                                        {assignment.user.name}
                                                                                    </span>
                                                                                    <span className={`text-[9px] ${companyStyle.subtext} leading-none mt-0.5`}>
                                                                                        {companyName || '소속없음'}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <span className="text-slate-300 text-sm">-</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Side Panel */}
                    <div className="space-y-6">
                        {/* Management Section */}
                        {getManagementWorkers().length > 0 && (
                            <GlassCard className="overflow-hidden p-0 shadow-md">
                                <div className="bg-blue-50 p-3 border-b border-blue-200">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                        {MANAGEMENT_POSITION}
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {getManagementWorkers().map((assignment, idx) => {
                                            const companyName = assignment.user.company?.name;
                                            const style = getCompanyStyle(companyName);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col items-center px-2 py-1 rounded-lg border shadow-sm ${style.bg} ${style.border}`}
                                                >
                                                    <span className={`text-xs font-medium ${style.text}`}>
                                                        {assignment.user.name}
                                                    </span>
                                                    <span className={`text-[9px] ${style.subtext} leading-none mt-0.5`}>
                                                        {companyName || '소속없음'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {/* OP Section */}
                        {getOPWorkers().length > 0 && (
                            <GlassCard className="overflow-hidden p-0 shadow-md">
                                <div className="bg-purple-50 p-3 border-b border-purple-200">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                                        {OP_POSITION}
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {getOPWorkers().map((assignment, idx) => {
                                            const companyName = assignment.user.company?.name;
                                            const style = getCompanyStyle(companyName);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col items-center px-2 py-1 rounded-lg border shadow-sm ${style.bg} ${style.border}`}
                                                >
                                                    <span className={`text-xs font-medium ${style.text}`}>
                                                        {assignment.user.name}
                                                    </span>
                                                    <span className={`text-[9px] ${style.subtext} leading-none mt-0.5`}>
                                                        {companyName || '소속없음'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {/* Special Teams */}
                        {(paletteTeam || cleaningTeam) && (
                            <GlassCard className="bg-slate-50 border-slate-200 shadow-md">
                                <h3 className="text-slate-700 font-bold mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                                    정리담당
                                </h3>
                                <div className="space-y-3">
                                    {paletteTeam && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            <span className="text-sm font-medium text-slate-600">파레트 정리조:</span>
                                            <span className="text-sm font-semibold text-slate-900">{paletteTeam.name}</span>
                                        </div>
                                    )}
                                    {cleaningTeam && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-medium text-slate-600">청소조:</span>
                                            <span className="text-sm font-semibold text-slate-900">{cleaningTeam.name}</span>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        )}
                    </div>
                </div>

                {/* Monthly Calendar & Special Notes Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Monthly Calendar - Left Side */}
                    <div className="lg:col-span-3">
                        <MonthlyCalendarView />
                    </div>

                    {/* Special Notes - Right Side */}
                    <div className="lg:col-span-1">
                        <GlassCard className="flex flex-col shadow-md h-full">
                            <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
                                <h3 className="text-slate-900 font-bold flex items-center gap-2">
                                    <AlertCircle size={18} className="text-rose-500" /> 특이사항
                                </h3>
                            </div>
                            <div className="flex-1 min-h-[150px] space-y-2 overflow-y-auto max-h-[600px]">
                                {logs.length > 0 ? (
                                    logs.slice(0, 20).map(log => (
                                        <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                                            <span className="text-xs text-indigo-600 font-medium block mb-1">
                                                {new Date(log.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                            </span>
                                            <p className="text-slate-700 whitespace-pre-wrap">{log.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400 text-sm">
                                        등록된 특이사항이 없습니다.
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple monthly calendar component for view page
function MonthlyCalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthLogs, setMonthLogs] = useState<DailyLog[]>([]);
    const [monthLeaves, setMonthLeaves] = useState<any[]>([]); // Add leaves state
    const [loading, setLoading] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    useEffect(() => {
        fetchMonthData();
    }, [year, month]);

    const fetchMonthData = async () => {
        setLoading(true);
        try {
            const [logsRes, leavesRes] = await Promise.all([
                fetch(`/api/public/logs?month=${month}&year=${year}`),
                fetch(`/api/public/leaves?month=${month}&year=${year}`)
            ]);

            const logsData = await logsRes.json();
            const leavesData = await leavesRes.json();

            if (logsData.logs) setMonthLogs(logsData.logs);
            if (leavesData.leaves) setMonthLeaves(leavesData.leaves);
        } catch (error) {
            console.error('Failed to fetch month data', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month - 1, 1).getDay();
    };

    const getEventsForDate = (day: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);

        // Filter logs
        const logs = monthLogs.filter(log => log.date.split('T')[0] === dateStr);

        // Filter leaves
        const leaves = monthLeaves.filter(leave => {
            const start = new Date(leave.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(leave.endDate);
            end.setHours(0, 0, 0, 0);
            return targetDate >= start && targetDate <= end;
        });

        return { logs, leaves };
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;
    };

    const getDayColor = (day: number) => {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0) return 'text-red-500';
        if (dayOfWeek === 6) return 'text-blue-500';
        return 'text-slate-700';
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <GlassCard className="w-full bg-white border-slate-200 shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="text-indigo-600" size={24} />
                    월간 특이사항
                </h2>
                <span className="text-slate-900 font-bold text-lg">
                    {year}년 {month}월
                </span>
            </div>

            {/* Calendar */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-1">
                    {/* Weekday headers */}
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                        <div
                            key={day}
                            className={`p-2 text-center text-sm font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'
                                }`}
                        >
                            {day}
                        </div>
                    ))}

                    {/* Blank days */}
                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} className="bg-slate-50/50 rounded-lg min-h-[100px]"></div>
                    ))}

                    {/* Calendar days */}
                    {days.map((day) => {
                        const { logs: dayLogs, leaves: dayLeaves } = getEventsForDate(day);
                        const todayFlag = isToday(day);
                        const dayColor = getDayColor(day);
                        const hasMissingPositionNote = dayLogs.some(log => log.content.includes('근무성립불가'));

                        return (
                            <div
                                key={day}
                                className={`p-2 relative rounded-lg border-2 flex flex-col min-h-[100px] ${hasMissingPositionNote
                                    ? 'bg-red-100 border-red-400 shadow-md'
                                    : todayFlag
                                        ? 'bg-indigo-50 border-indigo-300 shadow-md'
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {/* Day number */}
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-1">
                                        <span className={`text-sm font-bold ${dayColor}`}>{day}</span>
                                        {todayFlag && (
                                            <span className="text-[8px] text-indigo-600 font-semibold bg-indigo-200 px-1 py-0.5 rounded-full">
                                                오늘
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Events List */}
                                <div className="space-y-1 overflow-y-auto max-h-[70px]">
                                    {/* Leaves */}
                                    {dayLeaves.map(leave => (
                                        <div
                                            key={leave.id}
                                            className="text-[9px] p-1 rounded border font-medium bg-blue-50 border-blue-200 text-blue-700"
                                        >
                                            {leave.user.name} 휴무
                                        </div>
                                    ))}

                                    {/* Logs */}
                                    {dayLogs.map(log => {
                                        const isMissingNote = log.content.includes('근무성립불가');
                                        return (
                                            <div
                                                key={log.id}
                                                className={`text-[9px] p-1 rounded border font-medium ${isMissingNote
                                                    ? 'bg-red-100 border-red-300 text-red-800'
                                                    : 'bg-amber-100 border-amber-200 text-amber-800'
                                                    }`}
                                                title={log.content}
                                            >
                                                <div className="line-clamp-2">{log.content}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </GlassCard>
    );
}
