'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/app/components/GlassCard';
import { AlertCircle, ClipboardList, Plus, Trash2, History, Calendar as CalendarIcon } from 'lucide-react';
import { MonthlyCalendarWidget } from '@/app/components/MonthlyCalendarWidget';
import { DailyNotesManagerModal } from '@/app/components/DailyNotesManagerModal';
import { useUser } from '@/app/components/UserContext';
import { DashboardSkeleton } from '@/app/components/ui/DashboardSkeleton';
import { DateNavigator } from '@/app/components/ui/DateNavigator';

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

    const [hasMounted, setHasMounted] = useState(false);
    const [date, setDate] = useState(() => {
        // Use a deterministic date for SSR and first render
        return new Date().toISOString().split('T')[0];
    });
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, leave: 0 });
    const [loading, setLoading] = useState(true);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(0); // Initialize with 0 for hydration stability
    const [paletteTeam, setPaletteTeam] = useState<{ id: string; name: string } | null>(null);
    const [cleaningTeam, setCleaningTeam] = useState<{ id: string; name: string } | null>(null);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [popups, setPopups] = useState<any[]>([]);

    useEffect(() => {
        setHasMounted(true);
        // Correct date to KST after mount if needed, or just keep the current date
        const now = new Date();
        const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        setDate(kstDate.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (hasMounted) {
            fetchData();
        }
    }, [date, hasMounted]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rosterRes, teamsRes, usersRes, logsRes, leavesRes, attendanceRes, popupsRes] = await Promise.all([
                fetch(`/api/roster?date=${date}`),
                fetch('/api/teams'),
                fetch('/api/users?includeResigned=true'),
                fetch(`/api/logs`), // Fetch recent history
                fetch(`/api/leaves`),
                fetch(`/api/attendance?date=${date}`),
                fetch(`/api/schedules/active-popups?date=${date}`)
            ]);

            const rosterData = await rosterRes.json();
            const teamsData = await teamsRes.json();
            const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
            const logsData = await logsRes.json();
            const leavesData = await leavesRes.json();
            const attendanceDataRes = await attendanceRes.json();

            if (popupsRes.ok) {
                const popupsData = await popupsRes.json();
                setPopups(popupsData);
            } else {
                setPopups([]);
            }

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
                const allWorkers = usersData.users.filter((u: any) => {
                    if (u.role !== 'WORKER' || !u.isApproved) return false;
                    if (u.resignationDate) {
                        try {
                            const resignDate = new Date(u.resignationDate);
                            const viewDate = new Date(date);

                            // Normalize to UTC midnight for date-only comparison
                            resignDate.setUTCHours(0, 0, 0, 0);
                            viewDate.setUTCHours(0, 0, 0, 0);

                            // Keep user only if View Date is STRICTLY BEFORE Resignation Date
                            return viewDate.getTime() < resignDate.getTime();
                        } catch (e) {
                            return true;
                        }
                    }
                    return true;
                });
                const allManagers = usersData.users.filter((u: any) => {
                    if (u.role !== 'MANAGER' || !u.isApproved) return false;
                    if (u.resignationDate) {
                        try {
                            const resignDate = new Date(u.resignationDate);
                            const viewDate = new Date(date);

                            resignDate.setUTCHours(0, 0, 0, 0);
                            viewDate.setUTCHours(0, 0, 0, 0);

                            return viewDate.getTime() < resignDate.getTime();
                        } catch (e) {
                            return true;
                        }
                    }
                    return true;
                });

                const assignments = rosterData.roster?.assignments || [];
                const registeredWorkerIds = new Set(
                    assignments.map((a: any) => a.userId).filter(Boolean)
                );
                const dailyWorkerNames = new Set(
                    assignments.filter((a: any) => !a.userId && a.tempWorkerName).map((a: any) => a.tempWorkerName)
                );
                const workingCount = registeredWorkerIds.size + dailyWorkerNames.size;
                const registeredWorkingCount = registeredWorkerIds.size;

                const vacationOrLeaveCount = attendanceDataRes.attendance
                    ? attendanceDataRes.attendance.filter((a: any) => a.status === 'VACATION' || a.status === 'LEAVE_OF_ABSENCE').length
                    : 0;

                // Total includes both workers and managers
                const totalUsers = allWorkers.length + allManagers.length;

                setStats({
                    total: totalUsers,
                    present: workingCount,
                    leave: vacationOrLeaveCount,
                    absent: Math.max(0, totalUsers - registeredWorkingCount - vacationOrLeaveCount)
                });
            } else {
                // If users data is not available, set default stats
                setStats({ total: 0, present: 0, absent: 0, leave: 0 });
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

        // (주) 등의 접두사를 제외하고 매칭
        const normalized = companyName.replace(/\(주\)|\(유\)|\(재\)|\(사\)/g, '').trim();

        // Explicit mapping for known companies to ensure distinction
        if (normalized === '보람관리') return COMPANY_STYLES[0]; // Indigo
        if (normalized === '디티에스') return COMPANY_STYLES[2]; // Amber
        if (normalized === '신항만건기') return COMPANY_STYLES[1]; // Emerald
        if (normalized === '건우') return COMPANY_STYLES[4]; // Cyan
        if (normalized === '일용직') return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', subtext: 'text-slate-500' };

        // Fallback hash for others
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
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

    if (!hasMounted) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-0">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardList className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="hidden sm:inline">웅동야간출하 근무현황</span>
                        <span className="sm:hidden">근무현황</span>
                    </h1>
                </div>
            </div>

            {/* Date Navigator */}
            <DateNavigator
                currentDate={date}
                onDateChange={setDate}
                className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
                fontSizeClass="text-sm lg:text-base"
            />


            {/* Summary Cards - Mobile First */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                <GlassCard className="p-2 sm:py-2.5 sm:px-4 flex flex-col items-center justify-center theme-border shadow-sm hover:-translate-y-0.5 transition-transform">
                    <span className="text-slate-600 text-xs sm:text-sm font-semibold">총원</span>
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</span>
                </GlassCard>
                <GlassCard className="p-2 sm:py-2.5 sm:px-4 flex flex-col items-center justify-center theme-border shadow-sm hover:-translate-y-0.5 transition-transform">
                    <span className="text-slate-600 text-xs sm:text-sm font-semibold">결근/휴무</span>
                    <span className="text-xl sm:text-2xl font-bold text-red-500 mt-0.5">{stats.absent}</span>
                </GlassCard>
                <GlassCard className="p-2 sm:py-2.5 sm:px-4 flex flex-col items-center justify-center theme-border shadow-sm hover:-translate-y-0.5 transition-transform">
                    <span className="text-slate-600 text-xs sm:text-sm font-semibold">휴가/휴직</span>
                    <span className="text-xl sm:text-2xl font-bold text-purple-600 mt-0.5">{stats.leave}</span>
                </GlassCard>
                <GlassCard className="p-2 sm:py-2.5 sm:px-4 flex flex-col items-center justify-center theme-border shadow-sm hover:-translate-y-0.5 transition-transform">
                    <span className="text-slate-600 text-xs sm:text-sm font-semibold">근무</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">{stats.present}</span>
                </GlassCard>
            </div >

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Main Roster Table */}
                <div className="lg:col-start-1 lg:col-span-3 lg:row-start-1 space-y-4 lg:space-y-6 order-2 lg:order-none">
                    {/* Notice Board Area */}
                    {popups.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {popups.map((popup) => (
                                <GlassCard key={popup.id} className="p-4 sm:p-5 border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50/80 to-white shadow-sm hover:shadow transition-shadow">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="mt-0.5 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                            <span className="text-sm">📢</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-[15px] sm:text-base font-bold text-slate-800 leading-snug tracking-tight">{popup.title}</h3>
                                            {popup.description && (
                                                <p className="text-[13px] sm:text-sm text-slate-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{popup.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}

                    <GlassCard className="hidden md:block overflow-hidden p-0 shadow-md">
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
                                    {teams.filter(t => t.name !== '추첨(랜덤)').map((team, index) => {
                                        const isBNI = team.name.includes('BNI');

                                        // 모던하고 세련된 색상 팔레트
                                        // BNI: 파란색 계열, 그 외(천마 등): 붉은색 계열
                                        const teamNameBg = isBNI
                                            ? 'bg-gradient-to-r from-blue-50 to-sky-50'
                                            : 'bg-gradient-to-r from-rose-50 to-pink-50';
                                        const teamNameText = isBNI ? 'text-blue-700' : 'text-rose-700';
                                        const teamNameBorder = isBNI ? 'border-l-4 border-blue-500' : 'border-l-4 border-rose-500';

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

                    {/* Mobile Roster View */}
                    <div className="md:hidden space-y-4 pt-4">
                        {teams.filter(t => t.name !== '추첨(랜덤)').map((team) => {
                            const isBNI = team.name.includes('BNI');
                            const teamHeaderBg = isBNI ? 'bg-blue-50' : 'bg-rose-50';
                            const teamHeaderText = isBNI ? 'text-blue-700' : 'text-rose-700';
                            const teamBorder = isBNI ? 'border-blue-200' : 'border-rose-200';
                            const teamAccent = isBNI ? 'border-blue-500' : 'border-rose-500';

                            return (
                                <GlassCard key={team.id} className={`overflow-hidden p-0 shadow-md border-l-4 ${teamAccent}`}>
                                    {/* Team Header */}
                                    <div className={`px-4 py-2 border-b ${teamBorder} ${teamHeaderBg} flex justify-between items-center`}>
                                        <h3 className={`font-bold text-lg ${teamHeaderText}`}>{team.name}</h3>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 border border-current opacity-70">
                                            {team.name.includes('A') ? '주간' : '야간'} {/* Placeholder logic */}
                                        </span>
                                    </div>

                                    {/* Team Members Grid - 2x2 Layout */}
                                    <div className="p-2 grid grid-cols-2 gap-2">
                                        {POSITIONS.map((pos) => {
                                            const workers = getWorkersFor(team.name, pos);

                                            return (
                                                <div key={pos} className="flex flex-col h-full bg-slate-50/50 rounded-lg border border-slate-100 p-1.5">
                                                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                                                        <span className="text-[11px] font-bold text-slate-700 tracking-tight">
                                                            {pos}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                                            {workers.length}명
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-1 bg-white/50 p-1.5 rounded-lg flex-1 content-start">
                                                        {workers.length > 0 ? (
                                                            workers.map((assignment, idx) => {
                                                                const companyName = assignment.user.company?.name;
                                                                const style = getCompanyStyle(companyName);
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className={`flex flex-col items-center justify-center px-0.5 py-1.5 rounded-lg border shadow-sm ${style.bg} ${style.border}`}
                                                                    >
                                                                        <span className="text-xs font-bold text-slate-900 leading-none mb-0.5 truncate w-full text-center">
                                                                            {assignment.user.name}
                                                                        </span>
                                                                        <span className={`text-[9px] ${style.subtext} font-medium leading-none truncate w-full text-center opacity-90`}>
                                                                            {companyName || '-'}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="col-span-2 h-10 flex items-center justify-center rounded border border-dashed border-slate-200 bg-white/50">
                                                                <span className="text-xs text-slate-300">-</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                    
                </div>

                {/* Side Panel (Management, OP & Notes) */}
                <div className="space-y-2 lg:col-start-4 lg:row-start-1 lg:row-span-2 order-1 lg:order-none mb-2 lg:mb-0">
                    <div className="flex flex-row lg:flex-col gap-2">
                        {/* Management Section - Displayed above OP (only if management workers are assigned) */}
                        {getManagementWorkers().length > 0 && (
                            <GlassCard className="flex-1 overflow-hidden p-0 shadow-lg border-l-4 border-blue-500">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1.5 border-b-2 border-blue-200">
                                    <h3 className="text-[15px] font-bold text-blue-800 flex items-center gap-2">
                                        <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                                        {MANAGEMENT_POSITION}
                                    </h3>
                                </div>
                                <div className="p-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        {getManagementWorkers().map((assignment, idx) => {
                                            // Use company name for color, even for managers
                                            const companyName = assignment.user.company?.name;
                                            const style = getCompanyStyle(companyName);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col items-center px-2 py-0.5 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 ${style.bg} ${style.border}`}
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
                            <GlassCard className="flex-1 overflow-hidden p-0 shadow-lg border-l-4 border-purple-500">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-2 py-1.5 border-b-2 border-purple-200">
                                    <h3 className="text-[15px] font-bold text-purple-800 flex items-center gap-2">
                                        <div className="w-1.5 h-3.5 bg-purple-600 rounded-full"></div>
                                        {OP_POSITION}
                                    </h3>
                                </div>
                                <div className="p-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        {getOPWorkers().map((assignment, idx) => {
                                            // Use company name for color, even for managers
                                            const companyName = assignment.user.company?.name;
                                            const style = getCompanyStyle(companyName);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col items-center px-2 py-0.5 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 ${style.bg} ${style.border}`}
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
                    </div>

                    {/* Attendance Status Section */}
                    {(() => {
                        const offDayWorkers = attendanceData.filter(a => a.status === 'OFF_DAY');
                        const absentWorkers = attendanceData.filter(a => a.status === 'ABSENT');
                        const lateWorkers = attendanceData.filter(a => a.status === 'LATE');
                        const earlyLeaveWorkers = attendanceData.filter(a => a.status === 'EARLY_LEAVE');
                        const leaveOfAbsenceWorkers = attendanceData.filter(a => a.status === 'LEAVE_OF_ABSENCE');
                        const vacationWorkers = attendanceData.filter(a => a.status === 'VACATION');

                        const hasAnyStatus = offDayWorkers.length > 0 || absentWorkers.length > 0 || lateWorkers.length > 0 || earlyLeaveWorkers.length > 0 || leaveOfAbsenceWorkers.length > 0 || vacationWorkers.length > 0;

                        if (!hasAnyStatus) return null;

                        return (
                            <GlassCard className="overflow-hidden p-0 shadow-lg border-l-4 border-teal-500">
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-2 py-1.5 border-b-2 border-teal-200">
                                    <h3 className="text-[15px] font-bold text-teal-800 flex items-center gap-2">
                                        <div className="w-1.5 h-3.5 bg-teal-600 rounded-full"></div>
                                        근태 현황
                                    </h3>
                                </div>
                                <div className="p-2 space-y-2">
                                    {leaveOfAbsenceWorkers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-xs font-semibold text-purple-800">휴직</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">{leaveOfAbsenceWorkers.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {leaveOfAbsenceWorkers.map((worker, idx) => {
                                                    const companyName = worker.user?.company?.name;
                                                    const style = getCompanyStyle(companyName);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${style.bg} ${style.border}`}
                                                            title={worker.reason || undefined}
                                                        >
                                                            <span className="text-xs font-medium text-slate-900">
                                                                {worker.user?.name}{worker.reason ? ` (${worker.reason})` : ''}
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

                                    {vacationWorkers.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-xs font-semibold text-teal-800">휴가</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">{vacationWorkers.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {vacationWorkers.map((worker, idx) => {
                                                    const companyName = worker.user?.company?.name;
                                                    const style = getCompanyStyle(companyName);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col items-center px-2 py-1 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${style.bg} ${style.border}`}
                                                            title={worker.reason || undefined}
                                                        >
                                                            <span className="text-xs font-medium text-slate-900">
                                                                {worker.user?.name}{worker.reason ? ` (${worker.reason})` : ''}
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
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-1.5 border-b-2 border-amber-200">
                                <h3 className="text-[15px] font-bold text-amber-800 flex items-center gap-2">
                                    <div className="w-1.5 h-3.5 bg-amber-600 rounded-full"></div>
                                    정리담당
                                </h3>
                            </div>
                            <div className="p-2 space-y-1.5">
                                {cleaningTeam && (
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <span className="text-xs font-medium text-slate-600">청소(잔바리):</span>
                                        <span className="text-xs font-bold text-slate-900">{cleaningTeam.name === '추첨(랜덤)' ? '추첨' : cleaningTeam.name}</span>
                                    </div>
                                )}
                                {paletteTeam && (
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-xs font-medium text-slate-600">파레트 정리:</span>
                                        <span className="text-xs font-bold text-slate-900">{paletteTeam.name === '추첨(랜덤)' ? '추첨' : paletteTeam.name}</span>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    )}

                </div>

                {/* Monthly Calendar Widget */}
                <div className="lg:col-start-1 lg:col-span-3 lg:row-start-2 mt-4 lg:mt-6 order-3 lg:order-none">
                    <MonthlyCalendarWidget
                        onDateClick={handleDateClick}
                        lastUpdate={lastUpdate}
                        onDeleteNote={handleDeleteNote}
                        isManager={isManager}
                        selectedDate={date}
                    />
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
        </div >
    );
}
