'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { ClipboardList } from 'lucide-react';

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

interface DashboardDayViewProps {
    date: string;
    isManager: boolean;
    compact?: boolean;
    className?: string;
}

const POSITIONS = ['검수', '포크', '클램프', '상하역'];
const OP_POSITION = 'OP';
const MANAGEMENT_POSITION = '관리';

const POSITION_HEADER_COLORS: { [key: string]: string } = {
    '검수': 'text-blue-600',
    '포크': 'text-green-600',
    '클램프': 'text-purple-600',
    '상하역': 'text-pink-600',
};

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

export function DashboardDayView({ date, isManager, compact = false, className = '' }: DashboardDayViewProps) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
    const [loading, setLoading] = useState(true);
    const [paletteTeam, setPaletteTeam] = useState<{ id: string; name: string } | null>(null);
    const [cleaningTeam, setCleaningTeam] = useState<{ id: string; name: string } | null>(null);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rosterRes, teamsRes, usersRes, attendanceRes] = await Promise.all([
                fetch(`/api/roster?date=${date}`),
                fetch('/api/teams'),
                fetch('/api/users'),
                fetch(`/api/attendance?date=${date}`)
            ]);

            const rosterData = await rosterRes.json();
            const teamsData = await teamsRes.json();
            const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
            const attendanceDataRes = await attendanceRes.json();

            if (attendanceDataRes.attendance) {
                setAttendanceData(attendanceDataRes.attendance);
            } else {
                setAttendanceData([]);
            }

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
                const allWorkers = usersData.users.filter((u: any) => u.role === 'WORKER' && u.isApproved);
                const allManagers = usersData.users.filter((u: any) => u.role === 'MANAGER' && u.isApproved);
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

            // Missing position check logic is kept in the main page or can be added here if needed.
            // For view-only purposes, we might not need to auto-create logs here.

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

    const getOPWorkers = () => assignments.filter(a => a.position === OP_POSITION);
    const getManagementWorkers = () => assignments.filter(a => a.position === MANAGEMENT_POSITION);

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

    const getPositionHeaderColor = (position: string) => POSITION_HEADER_COLORS[position] || 'text-slate-600';

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-[300px] ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header for Compact View */}
            {compact && (
                <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900">
                        {new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </span>
                    <div className="flex gap-2 text-xs">
                        <span className="text-slate-600">총원 {stats.total}</span>
                        <span className="text-emerald-600">근무 {stats.present}</span>
                        <span className="text-red-500">결근 {stats.absent}</span>
                    </div>
                </div>
            )}

            {/* Summary Cards - Only show if not compact or if requested */}
            {!compact && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                    <GlassCard className="p-3 sm:p-4 flex flex-col items-center justify-center bg-white border-slate-200 shadow-sm">
                        <span className="text-slate-600 text-xs sm:text-sm font-semibold">총원</span>
                        <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats.total}</span>
                    </GlassCard>
                    <GlassCard className="p-3 sm:p-4 flex flex-col items-center justify-center bg-white border-slate-200 shadow-sm">
                        <span className="text-slate-600 text-xs sm:text-sm font-semibold">결근/휴무</span>
                        <span className="text-xl sm:text-2xl font-bold text-red-500 mt-1">{stats.absent}</span>
                    </GlassCard>
                    <GlassCard className="p-3 sm:p-4 flex flex-col items-center justify-center bg-white border-slate-200 shadow-sm">
                        <span className="text-slate-600 text-xs sm:text-sm font-semibold">근무</span>
                        <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{stats.present}</span>
                    </GlassCard>
                </div>
            )}

            <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'}`}>
                {/* Main Roster Table */}
                <div className={`${compact ? 'w-full' : 'lg:col-span-3'}`}>
                    <GlassCard className="overflow-hidden p-0 shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                                        <th className="p-2 border-r-2 border-white w-14 text-xs font-bold text-slate-700 shadow-sm">구분</th>
                                        {POSITIONS.map(pos => {
                                            const headerColor = getPositionHeaderColor(pos);
                                            return (
                                                <th key={pos} className={`p-2 border-r-2 border-white last:border-r-0 w-[21%] text-xs font-bold shadow-sm ${headerColor}`}>{pos}</th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-300">
                                    {teams.map(team => {
                                        const teamNumber = parseInt(team.name.replace(/[^0-9]/g, '')) || 0;
                                        const isTeam1 = teamNumber === 1;
                                        const teamNameBg = isTeam1 ? 'bg-gradient-to-r from-blue-50 to-sky-50' : 'bg-gradient-to-r from-rose-50 to-pink-50';
                                        const teamNameText = isTeam1 ? 'text-blue-700' : 'text-rose-700';
                                        const teamNameBorder = isTeam1 ? 'border-l-4 border-blue-500' : 'border-l-4 border-rose-500';

                                        return (
                                            <tr key={team.id} className="hover:bg-slate-50/80 transition-all duration-200">
                                                <td className={`p-2 font-bold ${teamNameBg} ${teamNameText} ${teamNameBorder} border-r-2 border-slate-200 text-xs shadow-sm`}>
                                                    {team.name}
                                                </td>
                                                {POSITIONS.map(pos => {
                                                    const workers = getWorkersFor(team.name, pos);
                                                    return (
                                                        <td key={pos} className="p-1.5 border-r-2 border-slate-300 last:border-r-0 align-top bg-white">
                                                            <div className="flex flex-wrap gap-1.5 justify-center">
                                                                {workers.length > 0 ? (
                                                                    workers.map((assignment, idx) => {
                                                                        const companyName = assignment.user.company?.name;
                                                                        const companyStyle = getCompanyStyle(companyName);
                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                className={`group relative flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${companyStyle.bg} ${companyStyle.border}`}
                                                                            >
                                                                                <span className={`text-xs font-medium text-slate-900`}>
                                                                                    {assignment.user.name}
                                                                                </span>
                                                                                {!compact && (
                                                                                    <span className={`text-[9px] font-medium ${companyStyle.subtext} leading-none mt-1 opacity-80 group-hover:opacity-100 transition-opacity`}>
                                                                                        {companyName || '소속없음'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span className="text-slate-300 text-xs font-medium">-</span>
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
                <div className="space-y-3">
                    {/* Management Section */}
                    {getManagementWorkers().length > 0 && (
                        <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-blue-500">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 border-b-2 border-blue-200">
                                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                                    {MANAGEMENT_POSITION}
                                </h3>
                            </div>
                            <div className="p-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {getManagementWorkers().map((assignment, idx) => {
                                        const companyName = assignment.user.company?.name;
                                        const style = getCompanyStyle(companyName);
                                        return (
                                            <div key={idx} className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-md ${style.bg} ${style.border}`}>
                                                <span className={`text-xs font-medium text-slate-900`}>{assignment.user.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* OP Section */}
                    {getOPWorkers().length > 0 && (
                        <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-purple-500">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-2 border-b-2 border-purple-200">
                                <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-purple-600 rounded-full"></div>
                                    {OP_POSITION}
                                </h3>
                            </div>
                            <div className="p-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {getOPWorkers().map((assignment, idx) => {
                                        const companyName = assignment.user.company?.name;
                                        const style = getCompanyStyle(companyName);
                                        return (
                                            <div key={idx} className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-md ${style.bg} ${style.border}`}>
                                                <span className={`text-xs font-medium text-slate-900`}>{assignment.user.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Attendance Status Section */}
                    {(() => {
                        const offDayWorkers = attendanceData.filter(a => a.status === 'OFF_DAY');
                        const absentWorkers = attendanceData.filter(a => a.status === 'ABSENT');
                        const lateWorkers = attendanceData.filter(a => a.status === 'LATE');
                        const earlyLeaveWorkers = attendanceData.filter(a => a.status === 'EARLY_LEAVE');
                        const hasAnyStatus = offDayWorkers.length > 0 || absentWorkers.length > 0 || lateWorkers.length > 0 || earlyLeaveWorkers.length > 0;

                        if (!hasAnyStatus) return null;

                        return (
                            <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-teal-500">
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-2 border-b-2 border-teal-200">
                                    <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-teal-600 rounded-full"></div>
                                        근태 현황
                                    </h3>
                                </div>
                                <div className="p-2 space-y-2">
                                    {offDayWorkers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-xs font-semibold text-purple-800">휴무</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">{offDayWorkers.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {offDayWorkers.map((worker, idx) => (
                                                    <div key={idx} className="px-2 py-1 rounded-lg border-2 shadow-sm bg-white border-slate-200 text-xs font-medium text-slate-900">
                                                        {worker.user?.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Add other statuses similarly if needed, keeping it compact */}
                                </div>
                            </GlassCard>
                        );
                    })()}

                    {/* Cleaning Team */}
                    {(paletteTeam || cleaningTeam) && (
                        <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-amber-500">
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-2 border-b-2 border-amber-200">
                                <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-amber-600 rounded-full"></div>
                                    정리담당
                                </h3>
                            </div>
                            <div className="p-2 space-y-1">
                                {paletteTeam && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-slate-600">잔바리:</span>
                                        <span className="text-xs font-bold text-slate-900">{paletteTeam.name}</span>
                                    </div>
                                )}
                                {cleaningTeam && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-slate-600">파레트:</span>
                                        <span className="text-xs font-bold text-slate-900">{cleaningTeam.name}</span>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
}
