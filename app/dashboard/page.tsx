'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/app/components/GlassCard';
import { Calendar as CalendarIcon, AlertCircle, ClipboardList, Plus, Trash2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { MonthlyCalendarWidget } from '@/app/components/MonthlyCalendarWidget';
import { DailyNotesManagerModal } from '@/app/components/DailyNotesManagerModal';
import { useUser } from '@/app/components/UserContext';

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
    date: string; // Added date field
    content: string;
    author: { name: string };
}

interface LeaveRequest {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    status: string;
    user: { name: string };
    type: string;
    reason: string;
}

const POSITIONS = ['검수', '포크', '클램프', '상하역'];
const OP_POSITION = 'OP';
const MANAGEMENT_POSITION = '관리';

// Position header colors - 직무 헤더 글자색
const POSITION_HEADER_COLORS: { [key: string]: string } = {
    '검수': 'text-blue-600',
    '포크': 'text-green-600',
    '클램프': 'text-purple-600',
    '상하역': 'text-pink-600',
};

// Predefined styles for different companies to ensure visual distinction
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

export default function DashboardPage() {
    const user = useUser();
    const isManager = user?.role === 'MANAGER';

    const [date, setDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    });
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
    const [loading, setLoading] = useState(true);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now()); // Added for refreshing calendar
    const [paletteTeam, setPaletteTeam] = useState<{ id: string; name: string } | null>(null);
    const [cleaningTeam, setCleaningTeam] = useState<{ id: string; name: string } | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [date]);

    const changeDate = (days: number) => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + days);
        const offset = currentDate.getTimezoneOffset() * 60000;
        setDate(new Date(currentDate.getTime() - offset).toISOString().split('T')[0]);
    };

    const handleDatePickerClick = () => {
        setIsDatePickerOpen(true);
    };

    const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        setIsDatePickerOpen(false);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rosterRes, teamsRes, usersRes, logsRes, leavesRes, attendanceRes] = await Promise.all([
                fetch(`/api/roster?date=${date}`),
                fetch('/api/teams'),
                fetch('/api/users'),
                fetch(`/api/logs`), // Fetch recent history
                fetch(`/api/leaves`),
                fetch(`/api/attendance?date=${date}`)
            ]);

            const rosterData = await rosterRes.json();
            const teamsData = await teamsRes.json();
            const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
            const logsData = await logsRes.json();
            const leavesData = await leavesRes.json();
            const attendanceDataRes = await attendanceRes.json();

            if (leavesData.leaves) {
                setLeaves(leavesData.leaves);
            } else {
                setLeaves([]);
            }

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

            // Set palette and cleaning teams
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

            // Calculate stats - handle both manager and worker access
            if (usersData.users && Array.isArray(usersData.users)) {
                const allWorkers = usersData.users.filter((u: any) => u.role === 'WORKER' && u.isApproved);
                const allManagers = usersData.users.filter((u: any) => u.role === 'MANAGER' && u.isApproved);

                const assignedWorkerIds = rosterData.roster?.assignments
                    ? new Set(rosterData.roster.assignments.map((a: any) => a.userId))
                    : new Set();

                const workingCount = assignedWorkerIds.size;

                // Total includes both workers and managers
                const totalUsers = allWorkers.length + allManagers.length;

                setStats({
                    total: totalUsers,
                    present: workingCount,
                    absent: Math.max(0, totalUsers - workingCount)
                });
            } else {
                // If users data is not available, set default stats
                setStats({ total: 0, present: 0, absent: 0 });
            }

            if (logsData.logs) {
                setLogs(logsData.logs);
            } else {
                setLogs([]);
            }

            // Check for missing positions in teams and auto-add special note
            if (rosterData.roster?.assignments && teamsData.teams && isManager) {
                await checkAndAddMissingPositionNote(rosterData.roster.assignments, teamsData.teams, date);
            }

        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAndAddMissingPositionNote = async (assignments: Assignment[], teams: Team[], targetDate: string) => {
        try {
            // Check if note already exists for this date
            const existingLogsRes = await fetch(`/api/logs?date=${targetDate}`);
            const existingLogsData = await existingLogsRes.json();
            const existingLogs = existingLogsData.logs || [];
            const hasMissingPositionNote = existingLogs.some((log: DailyLog) =>
                log.content.includes('근무성립불가')
            );

            if (hasMissingPositionNote) {
                return; // Note already exists
            }

            // Check each team
            const teamsWithMissingPositions: string[] = [];

            for (const team of teams) {
                // Get all workers for this team (excluding OP)
                const teamAssignments = assignments.filter(a => a.team === team.name && a.position !== OP_POSITION);
                const totalWorkers = teamAssignments.length;

                // Only check if team has 4 or more workers
                if (totalWorkers >= 4) {
                    // Map legacy positions to current standard positions
                    const positionMap: { [key: string]: string } = {
                        '지게차': '포크',
                        '상하차': '상하역'
                    };

                    const positionsFilled = new Set(teamAssignments.map(a => positionMap[a.position] || a.position));

                    // Check if any required position is missing
                    const missingPositions = POSITIONS.filter(pos => !positionsFilled.has(pos));

                    if (missingPositions.length > 0) {
                        teamsWithMissingPositions.push(team.name);
                    }
                }
            }

            // If any team has missing positions, add special note
            if (teamsWithMissingPositions.length > 0) {
                const noteContent = `${teamsWithMissingPositions.join(', ')} 근무성립불가`;
                await fetch('/api/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: targetDate, content: noteContent })
                });
                // Refresh logs
                const logsRes = await fetch(`/api/logs`);
                const logsData = await logsRes.json();
                if (logsData.logs) {
                    setLogs(logsData.logs);
                }
                setLastUpdate(Date.now());
            }
        } catch (error) {
            console.error('Failed to check missing positions', error);
        }
    };

    const getWorkersFor = (teamName: string, position: string) => {
        // Map position names to handle legacy data (지게차 -> 포크)
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

    const handleAddNote = async (content: string, targetDate?: string) => {
        try {
            const res = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: targetDate || date, content })
            });

            if (res.ok) {
                fetchData(); // Refresh list
                setLastUpdate(Date.now()); // Refresh calendar
            }
        } catch (error) {
            console.error('Failed to add note', error);
        }
    };

    const handleUpdateNote = async (id: string, content: string) => {
        try {
            const res = await fetch('/api/logs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, content })
            });

            if (res.ok) {
                await fetchData(); // Refresh list
                setLastUpdate(Date.now()); // Refresh calendar
            }
        } catch (error) {
            console.error('Failed to update note', error);
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm('이 특이사항을 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/logs?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchData(); // Refresh list
                setLastUpdate(Date.now()); // Refresh calendar
            } else {
                const data = await res.json();
                alert(`삭제 실패: ${data.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Failed to delete note', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteLeave = async (id: string) => {
        if (!confirm('이 휴무 신청을 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/leaves?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchData(); // Refresh list
                setLastUpdate(Date.now()); // Refresh calendar
            } else {
                const data = await res.json();
                alert(`삭제 실패: ${data.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Failed to delete leave', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleUpdateLeaveStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/leaves', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });

            if (res.ok) {
                await fetchData();
                setLastUpdate(Date.now());
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getCompanyStyle = (companyName: string = '') => {
        if (!companyName) return COMPANY_STYLES[0];

        // Explicit mapping for known companies to ensure distinction
        if (companyName === '보람관리') return COMPANY_STYLES[0]; // Indigo
        if (companyName === '디티에스') return COMPANY_STYLES[2]; // Amber (changed from Emerald to ensure distinction)
        if (companyName === '신항만건기') return COMPANY_STYLES[1]; // Emerald

        // Fallback hash for others
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

    const handleDateClick = (selectedDate: string) => {
        setDate(selectedDate);
        setIsNoteModalOpen(true);
    };

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardList className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="hidden sm:inline">웅동야간출하 근무현황</span>
                        <span className="sm:hidden">근무현황</span>
                    </h1>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                        <button
                            onClick={() => changeDate(-1)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                            title="이전 날짜"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="relative">
                            {isDatePickerOpen ? (
                                <input
                                    type="date"
                                    value={date}
                                    onChange={handleDatePickerChange}
                                    onBlur={() => setIsDatePickerOpen(false)}
                                    autoFocus
                                    className="glass-input bg-white text-slate-900 border-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <button
                                    onClick={handleDatePickerClick}
                                    className="text-slate-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 hover:border-slate-300 flex items-center gap-1.5 sm:gap-2"
                                >
                                    <CalendarIcon size={14} className="text-indigo-500" />
                                    <span className="hidden sm:inline">
                                        {new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                                    </span>
                                    <span className="sm:hidden">
                                        {new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                    </span>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => changeDate(1)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                            title="다음 날짜"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards - Mobile First */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Main Roster Table */}
                <div className="lg:col-span-3">
                    <GlassCard className="overflow-hidden p-0 shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                                        <th className="p-2 md:p-2 lg:p-2.5 border-r-2 border-white w-14 md:w-20 lg:w-20 text-xs md:text-sm lg:text-sm font-bold text-slate-700 shadow-sm">구분</th>
                                        {POSITIONS.map(pos => {
                                            const headerColor = getPositionHeaderColor(pos);
                                            return (
                                                <th key={pos} className={`p-2 md:p-2 lg:p-2.5 border-r-2 border-white last:border-r-0 w-[21%] text-xs md:text-sm lg:text-sm font-bold shadow-sm ${headerColor}`}>{pos}</th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-300">
                                    {teams.map((team, index) => {
                                        const isTeam1 = index === 0;

                                        // 모던하고 세련된 색상 팔레트
                                        // 1조: 파란색 계열, 2-5조: 붉은색 계열
                                        const teamNameBg = isTeam1
                                            ? 'bg-gradient-to-r from-blue-50 to-sky-50'
                                            : 'bg-gradient-to-r from-rose-50 to-pink-50';
                                        const teamNameText = isTeam1 ? 'text-blue-700' : 'text-rose-700';
                                        const teamNameBorder = isTeam1 ? 'border-l-4 border-blue-500' : 'border-l-4 border-rose-500';

                                        return (
                                            <tr key={team.id} className="hover:bg-slate-50/80 transition-all duration-200">
                                                <td className={`p-2.5 lg:p-3 font-bold ${teamNameBg} ${teamNameText} ${teamNameBorder} border-r-2 border-slate-200 text-xs md:text-sm lg:text-sm shadow-sm`}>
                                                    {team.name}
                                                </td>
                                                {POSITIONS.map(pos => {
                                                    const workers = getWorkersFor(team.name, pos);
                                                    return (
                                                        <td key={pos} className="p-1.5 lg:p-2 border-r-2 border-slate-300 last:border-r-0 align-top lg:h-auto bg-white">
                                                            <div className="flex flex-wrap gap-1.5 lg:gap-2 justify-center">
                                                                {workers.length > 0 ? (
                                                                    workers.map((assignment, idx) => {
                                                                        // Use company name for color
                                                                        const companyName = assignment.user.company?.name;
                                                                        const companyStyle = getCompanyStyle(companyName);
                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                className={`group relative flex flex-col items-center px-2 lg:px-2.5 py-1 lg:py-1.5 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 ${companyStyle.bg} ${companyStyle.border}`}
                                                                            >
                                                                                <span className={`text-xs lg:text-sm font-medium text-slate-900`}>
                                                                                    {assignment.user.name}
                                                                                </span>
                                                                                <span className={`text-[9px] lg:text-[10px] font-medium ${companyStyle.subtext} leading-none mt-1 opacity-80 group-hover:opacity-100 transition-opacity`}>
                                                                                    {companyName || '소속없음'}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span className="text-slate-300 text-sm font-medium">-</span>
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

                {/* Side Panel (Management, OP & Notes) */}
                <div className="space-y-3">
                    {/* Management Section - Displayed above OP (only if management workers are assigned) */}
                    {getManagementWorkers().length > 0 && (
                        <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-blue-500">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 border-b-2 border-blue-200">
                                <h3 className="text-base font-bold text-blue-800 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                                    {MANAGEMENT_POSITION}
                                </h3>
                            </div>
                            <div className="p-2.5">
                                <div className="flex flex-wrap gap-1.5">
                                    {getManagementWorkers().map((assignment, idx) => {
                                        // Use company name for color, even for managers
                                        const companyName = assignment.user.company?.name;
                                        const style = getCompanyStyle(companyName);
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex flex-col items-center px-2.5 py-1 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 ${style.bg} ${style.border}`}
                                            >
                                                <span className={`text-xs font-medium text-slate-900`}>
                                                    {assignment.user.name}
                                                </span>
                                                <span className={`text-[9px] font-medium ${style.subtext} leading-none mt-0.5`}>
                                                    {companyName || '소속없음'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* OP Section - Displayed above special notes (only if OP workers are assigned) */}
                    {getOPWorkers().length > 0 && (
                        <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-purple-500">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-2.5 border-b-2 border-purple-200">
                                <h3 className="text-base font-bold text-purple-800 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-purple-600 rounded-full"></div>
                                    {OP_POSITION}
                                </h3>
                            </div>
                            <div className="p-2.5">
                                <div className="flex flex-wrap gap-1.5">
                                    {getOPWorkers().map((assignment, idx) => {
                                        // Use company name for color, even for managers
                                        const companyName = assignment.user.company?.name;
                                        const style = getCompanyStyle(companyName);
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex flex-col items-center px-2.5 py-1 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 ${style.bg} ${style.border}`}
                                            >
                                                <span className={`text-xs font-medium text-slate-900`}>
                                                    {assignment.user.name}
                                                </span>
                                                <span className={`text-[9px] font-medium ${style.subtext} leading-none mt-0.5`}>
                                                    {companyName || '소속없음'}
                                                </span>
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
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-2.5 border-b-2 border-teal-200">
                                    <h3 className="text-base font-bold text-teal-800 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-teal-600 rounded-full"></div>
                                        근태 현황
                                    </h3>
                                </div>
                                <div className="p-2.5 space-y-2.5">
                                    {offDayWorkers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-xs font-semibold text-purple-800">휴무</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">{offDayWorkers.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {offDayWorkers.map((worker, idx) => {
                                                    const companyName = worker.user?.company?.name;
                                                    const style = getCompanyStyle(companyName);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${style.bg} ${style.border}`}
                                                        >
                                                            <span className="text-xs font-medium text-slate-900">
                                                                {worker.user?.name}
                                                            </span>
                                                            <span className={`text-[9px] font-medium ${style.subtext} leading-none mt-0.5`}>
                                                                {companyName || '소속없음'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {absentWorkers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-xs font-semibold text-red-800">결근</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">{absentWorkers.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {absentWorkers.map((worker, idx) => {
                                                    const companyName = worker.user?.company?.name;
                                                    const style = getCompanyStyle(companyName);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${style.bg} ${style.border}`}
                                                        >
                                                            <span className="text-xs font-medium text-slate-900">
                                                                {worker.user?.name}
                                                            </span>
                                                            <span className={`text-[9px] font-medium ${style.subtext} leading-none mt-0.5`}>
                                                                {companyName || '소속없음'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {lateWorkers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-xs font-semibold text-orange-800">지각</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">{lateWorkers.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {lateWorkers.map((worker, idx) => {
                                                    const companyName = worker.user?.company?.name;
                                                    const style = getCompanyStyle(companyName);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${style.bg} ${style.border}`}
                                                        >
                                                            <span className="text-xs font-medium text-slate-900">
                                                                {worker.user?.name}
                                                            </span>
                                                            <span className={`text-[9px] font-medium ${style.subtext} leading-none mt-0.5`}>
                                                                {companyName || '소속없음'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {earlyLeaveWorkers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-xs font-semibold text-yellow-800">조퇴</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">{earlyLeaveWorkers.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {earlyLeaveWorkers.map((worker, idx) => {
                                                    const companyName = worker.user?.company?.name;
                                                    const style = getCompanyStyle(companyName);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${style.bg} ${style.border}`}
                                                        >
                                                            <span className="text-xs font-medium text-slate-900">
                                                                {worker.user?.name}
                                                            </span>
                                                            <span className={`text-[9px] font-medium ${style.subtext} leading-none mt-0.5`}>
                                                                {companyName || '소속없음'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        );
                    })()}

                    {/* 정리 팀 섹션 */}
                    {(paletteTeam || cleaningTeam) && (
                        <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-amber-500">
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-2.5 border-b-2 border-amber-200">
                                <h3 className="text-base font-bold text-amber-800 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-amber-600 rounded-full"></div>
                                    정리담당
                                </h3>
                            </div>
                            <div className="p-2.5 space-y-2">
                                {paletteTeam && (
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <span className="text-xs font-medium text-slate-600">잔바리:</span>
                                        <span className="text-xs font-bold text-slate-900">{paletteTeam.name}</span>
                                    </div>
                                )}
                                {cleaningTeam && (
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-xs font-medium text-slate-600">파레트:</span>
                                        <span className="text-xs font-bold text-slate-900">{cleaningTeam.name}</span>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    )}


                </div>
            </div>

            {/* Bottom Section: Calendar & Notes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="lg:col-span-3">
                    <MonthlyCalendarWidget
                        onDateClick={handleDateClick}
                        lastUpdate={lastUpdate}
                        onDeleteNote={handleDeleteNote}
                        isManager={isManager}
                        selectedDate={date}
                    />
                </div>
                <div className="flex flex-col">
                    <GlassCard className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
                            <h3 className="text-slate-900 font-bold flex items-center gap-2">
                                <AlertCircle size={18} className="text-rose-500" /> 특이사항
                            </h3>
                            {isManager && (
                                <div className="flex gap-2">
                                    <Link
                                        href="/dashboard/logs"
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-colors"
                                        title="히스토리"
                                    >
                                        <History size={18} />
                                    </Link>
                                    <button
                                        onClick={() => setIsNoteModalOpen(true)}
                                        className="p-1 hover:bg-slate-100 rounded text-indigo-600 hover:text-indigo-700 transition-colors"
                                        title="추가"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-h-[150px] space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                            {logs.length > 0 ? (
                                logs.map(log => (
                                    <div
                                        key={log.id}
                                        onClick={() => handleDateClick(log.date.split('T')[0])}
                                        className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                                    >
                                        {/* Hover effect overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-100/0 group-hover:from-indigo-50/50 group-hover:to-indigo-100/20 transition-all duration-200 pointer-events-none"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-indigo-100 rounded-full">
                                                        <CalendarIcon size={12} className="text-indigo-600 flex-shrink-0" />
                                                        <span className="text-[10px] sm:text-xs text-indigo-700 font-semibold whitespace-nowrap">
                                                            {new Date(log.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {isManager && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteNote(log.id);
                                                            }}
                                                            className="p-1 sm:p-1.5 text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium break-words">
                                                {log.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 sm:py-12 text-slate-400 text-sm">
                                    <AlertCircle size={28} className="mx-auto mb-2 opacity-20 sm:w-8 sm:h-8" />
                                    <p className="text-xs sm:text-sm">등록된 특이사항이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            <DailyNotesManagerModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                date={date}
                logs={logs}
                leaves={leaves}
                onAdd={handleAddNote}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onDeleteLeave={handleDeleteLeave}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                isManager={isManager}
            />
        </div>
    );
}
