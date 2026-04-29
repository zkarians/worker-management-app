'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

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

interface AttendanceRecord {
    status: string;
    user: {
        name: string;
        company?: { name: string };
    };
}

interface LeaveRecord {
    userId: string;
    startDate: string;
    endDate: string;
    user: {
        name: string;
        company?: { name: string };
    };
}

interface DayData {
    date: string;
    assignments: Assignment[];
    attendance: AttendanceRecord[];
    leaves: LeaveRecord[];
    paletteTeam: { id: string; name: string } | null;
    cleaningTeam: { id: string; name: string } | null;
}

interface Team {
    id: string;
    name: string;
}

const POSITIONS = ['검수', '포크', '클램프', '상하역'];
const OP_POSITION = 'OP';
const MANAGEMENT_POSITION = '관리';

// Company color styles - with text colors
const COMPANY_COLORS: { [key: string]: { bg: string; border: string; text: string } } = {
    '보람관리': { bg: '#e0e7ff', border: '#818cf8', text: '#4338ca' },      // indigo
    '디티에스': { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' },      // amber
    '신항만건기': { bg: '#d1fae5', border: '#34d399', text: '#047857' },    // emerald
};

const getCompanyColors = (companyName: string = '') => {
    return COMPANY_COLORS[companyName] || { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' };
};

// Team colors
const getTeamColors = (teamNumber: number) => {
    if (teamNumber === 1) {
        return { bg: '#dbeafe', text: '#1d4ed8', border: '#60a5fa' }; // blue
    }
    return { bg: '#ffe4e6', text: '#be123c', border: '#fb7185' }; // rose
};

export default function WeeklySchedulePage() {
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    });
    const [scheduleData, setScheduleData] = useState<DayData[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const scheduleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchScheduleData();
    }, [startDate]);

    const fetchScheduleData = async () => {
        setLoading(true);
        try {
            // Fetch teams first
            const teamsRes = await fetch('/api/teams');
            const teamsData = await teamsRes.json();
            if (teamsData.teams) setTeams(teamsData.teams);

            // Fetch approved leaves
            const leavesRes = await fetch('/api/leaves?status=APPROVED');
            const leavesData = await leavesRes.json();
            const allLeaves: LeaveRecord[] = leavesData.leaves || [];

            // Fetch data for 5 consecutive days
            const promises = [];
            for (let i = 0; i < 5; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + i);
                const dateStr = currentDate.toISOString().split('T')[0];

                promises.push(
                    Promise.all([
                        fetch(`/api/roster?date=${dateStr}`),
                        fetch(`/api/attendance?date=${dateStr}`)
                    ]).then(async ([rosterRes, attendanceRes]) => {
                        const rosterData = await rosterRes.json();
                        const attendanceData = await attendanceRes.json();

                        // Filter leaves for this date
                        const dayLeaves = allLeaves.filter(leave => {
                            const leaveStart = new Date(leave.startDate).toISOString().split('T')[0];
                            const leaveEnd = new Date(leave.endDate).toISOString().split('T')[0];
                            return dateStr >= leaveStart && dateStr <= leaveEnd;
                        });

                        return {
                            date: dateStr,
                            assignments: rosterData.roster?.assignments || [],
                            attendance: attendanceData.attendance || [],
                            leaves: dayLeaves,
                            paletteTeam: rosterData.roster?.paletteTeam || null,
                            cleaningTeam: rosterData.roster?.cleaningTeam || null,
                        };
                    })
                );
            }

            const results = await Promise.all(promises);
            setScheduleData(results);
        } catch (error) {
            console.error('Failed to fetch schedule data', error);
        } finally {
            setLoading(false);
        }
    };

    const changeStartDate = (days: number) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + days);
        const offset = currentDate.getTimezoneOffset() * 60000;
        setStartDate(new Date(currentDate.getTime() - offset).toISOString().split('T')[0]);
    };

    const getWorkersFor = (assignments: Assignment[], teamName: string, position: string) => {
        const positionMap: { [key: string]: string[] } = {
            '포크': ['포크', '지게차'],
            '검수': ['검수'],
            '클램프': ['클램프'],
            '상하역': ['상하역', '상하차']
        };
        const validPositions = positionMap[position] || [position];
        return assignments.filter(a => a.team === teamName && validPositions.includes(a.position));
    };

    const getOPWorkers = (assignments: Assignment[]) => {
        return assignments.filter(a => a.position === OP_POSITION);
    };

    const getManagementWorkers = (assignments: Assignment[]) => {
        return assignments.filter(a => a.position === MANAGEMENT_POSITION);
    };

    const getAbsentWorkers = (attendance: AttendanceRecord[], leaves: LeaveRecord[]) => {
        const absentFromAttendance = attendance
            .filter(a => a.status === 'OFF_DAY' || a.status === 'ABSENT')
            .map(a => ({ name: a.user?.name || '', company: a.user?.company?.name }));

        const absentFromLeaves = leaves.map(l => ({
            name: l.user?.name || '',
            company: l.user?.company?.name
        }));

        // Combine and dedupe
        const combined = [...absentFromAttendance, ...absentFromLeaves];
        const uniqueMap = new Map<string, { name: string; company?: string }>();
        combined.forEach(w => {
            if (!uniqueMap.has(w.name)) {
                uniqueMap.set(w.name, w);
            }
        });
        return Array.from(uniqueMap.values());
    };

    const getTeamNumber = (teamName: string) => {
        const match = teamName.match(/^(\d+)조/);
        return match ? parseInt(match[1]) : 0;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[date.getDay()];
        return { full: `${month}/${day}(${weekday})`, weekday };
    };

    const handleScreenshot = async () => {
        if (!scheduleRef.current) return;

        try {
            const canvas = await html2canvas(scheduleRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
            });

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    alert('스크린샷이 클립보드에 복사되었습니다!');
                }
            });
        } catch (error) {
            console.error('Screenshot failed', error);
            alert('스크린샷 복사에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-2">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarIcon size={22} className="text-indigo-600" />
                    5일 근무편성표
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleScreenshot}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Camera size={16} />
                        스크린샷
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => changeStartDate(-5)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                >
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-700">
                    {formatDate(startDate).full} ~ {formatDate(scheduleData[4]?.date || startDate).full}
                </span>
                <button
                    onClick={() => changeStartDate(5)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Schedule Container - Fill Screen */}
            <div className="overflow-x-auto pb-4">
                <div ref={scheduleRef} className="grid grid-cols-5 gap-3 min-w-[1100px] bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl shadow-sm">
                    {scheduleData.map((dayData) => {
                        const { full: dateLabel, weekday } = formatDate(dayData.date);
                        const isWeekend = weekday === '토' || weekday === '일';
                        const opWorkers = getOPWorkers(dayData.assignments);
                        const mgmtWorkers = getManagementWorkers(dayData.assignments);
                        const absentWorkers = getAbsentWorkers(dayData.attendance, dayData.leaves);

                        return (
                            <div key={dayData.date} className="w-[220px] flex-shrink-0 space-y-2">
                                {/* Date Header */}
                                <div
                                    className={`text-center py-1.5 rounded-lg font-bold text-sm ${isWeekend ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                                        }`}
                                >
                                    {dateLabel}
                                </div>

                                {/* Main Schedule Table */}
                                <table className="w-full text-center border-collapse border border-slate-300">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="p-1 text-[10px] font-bold text-slate-600 border border-slate-300 w-[36px]">조</th>
                                            {POSITIONS.map(pos => (
                                                <th key={pos} className="p-1.5 text-[10px] font-bold text-slate-700 border border-slate-300">{pos}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map(team => {
                                            const teamNum = getTeamNumber(team.name);
                                            const teamColors = getTeamColors(teamNum);

                                            return (
                                                <tr key={team.id}>
                                                    <td
                                                        className="p-1 text-[10px] font-bold border border-slate-300"
                                                        style={{ backgroundColor: teamColors.bg, color: teamColors.text }}
                                                    >
                                                        {teamNum}조
                                                    </td>
                                                    {POSITIONS.map(pos => {
                                                        const workers = getWorkersFor(dayData.assignments, team.name, pos);
                                                        return (
                                                            <td key={pos} className="p-0.5 border border-slate-300 align-top bg-white">
                                                                <div className="flex flex-col gap-0.5">
                                                                    {workers.length > 0 ? workers.map((w, idx) => {
                                                                        const colors = getCompanyColors(w.user.company?.name);
                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                className="px-1 py-0.5 rounded text-[9px] font-medium truncate"
                                                                                style={{
                                                                                    backgroundColor: colors.bg,
                                                                                    border: `1px solid ${colors.border}`
                                                                                }}
                                                                                title={`${w.user.name} (${w.user.company?.name || '소속없음'})`}
                                                                            >
                                                                                {w.user.name}
                                                                            </div>
                                                                        );
                                                                    }) : (
                                                                        <span className="text-slate-300 text-[9px]">-</span>
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

                                {/* 관리 Section */}
                                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-2 shadow-sm">
                                    <div className="text-[10px] font-bold text-purple-700 mb-1">관리</div>
                                    <div className="flex flex-wrap gap-1">
                                        {mgmtWorkers.length > 0 ? mgmtWorkers.map((w, idx) => {
                                            const colors = getCompanyColors(w.user.company?.name);
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold shadow-sm"
                                                    style={{ backgroundColor: colors.bg, border: `1.5px solid ${colors.border}`, color: colors.text }}
                                                >
                                                    {w.user.name}
                                                </span>
                                            );
                                        }) : <span className="text-slate-300 text-[9px]">-</span>}
                                    </div>
                                </div>

                                {/* OP Section */}
                                <div className="bg-gradient-to-r from-cyan-50 to-sky-50 border-2 border-cyan-200 rounded-xl p-2 shadow-sm">
                                    <div className="text-[10px] font-bold text-cyan-700 mb-1">OP</div>
                                    <div className="flex flex-wrap gap-1">
                                        {opWorkers.length > 0 ? opWorkers.map((w, idx) => {
                                            const colors = getCompanyColors(w.user.company?.name);
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold shadow-sm"
                                                    style={{ backgroundColor: colors.bg, border: `1.5px solid ${colors.border}`, color: colors.text }}
                                                >
                                                    {w.user.name}
                                                </span>
                                            );
                                        }) : <span className="text-slate-300 text-[9px]">-</span>}
                                    </div>
                                </div>

                                {/* 근태 현황 (휴무자) */}
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-1.5">
                                    <div className="text-[10px] font-bold text-rose-700 mb-1">휴무 {absentWorkers.length > 0 ? absentWorkers.length : ''}</div>
                                    <div className="flex flex-wrap gap-0.5">
                                        {absentWorkers.length > 0 ? absentWorkers.map((w, idx) => (
                                            <span key={idx} className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-medium border border-rose-300">
                                                {w.name}
                                            </span>
                                        )) : <span className="text-slate-300 text-[9px]">-</span>}
                                    </div>
                                </div>

                                {/* 정리담당 (파레트/청소) */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5">
                                    <div className="text-[10px] font-bold text-amber-700 mb-1">정리담당</div>
                                    <div className="space-y-0.5 text-[9px]">
                                        <div className="flex items-center gap-1">
                                            <span className="text-amber-600 font-medium">잔반:</span>
                                            <span className="text-amber-800 font-bold">
                                                {dayData.cleaningTeam ? `${getTeamNumber(dayData.cleaningTeam.name)}조` : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-amber-600 font-medium">파레트:</span>
                                            <span className="text-amber-800 font-bold">
                                                {dayData.paletteTeam ? `${getTeamNumber(dayData.paletteTeam.name)}조` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
