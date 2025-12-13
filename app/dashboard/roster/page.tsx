'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { useUser } from '@/app/components/UserContext';
import { BulkCopyModal } from '@/app/components/BulkCopyModal';
import { Calendar, Save, Trash2, Copy, ChevronLeft, ChevronRight, Users, X as XIcon } from 'lucide-react';

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

interface Worker {
    id: string;
    name: string;
    role: string;
    company?: { name: string };
}

interface Team {
    id: string;
    name: string;
}

const POSITIONS = ['검수', '포크', '클램프', '상하역'];
const OP_POSITION = 'OP';
const MANAGEMENT_POSITION = '관리';

// Predefined styles for different companies
const COMPANY_STYLES = [
    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', subtext: 'text-indigo-500' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', subtext: 'text-emerald-500' },
    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', subtext: 'text-amber-500' },
    { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', subtext: 'text-rose-500' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', subtext: 'text-cyan-500' },
    { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', subtext: 'text-violet-500' },
];

export default function RosterManagementPage() {
    const user = useUser();
    const [mounted, setMounted] = useState(false);
    const [date, setDate] = useState('');

    useEffect(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        setDate(new Date(now.getTime() - offset).toISOString().split('T')[0]);
        setMounted(true);
    }, []);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [approvedLeaves, setApprovedLeaves] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [paletteTeamId, setPaletteTeamId] = useState<string>('');
    const [cleaningTeamId, setCleaningTeamId] = useState<string>('');
    const [specialTeamStartDate, setSpecialTeamStartDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    });
    const [specialTeamEndDate, setSpecialTeamEndDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    });

    const isManager = user?.role === 'MANAGER';

    useEffect(() => {
        if (date) fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rosterRes, teamsRes, usersRes, leavesRes] = await Promise.all([
                fetch(`/api/roster?date=${date}`),
                fetch('/api/teams'),
                fetch('/api/users'),
                fetch(`/api/leaves?status=APPROVED`)
            ]);

            const rosterData = await rosterRes.json();
            const teamsData = await teamsRes.json();
            const usersData = await usersRes.json();
            const leavesData = await leavesRes.json();

            if (rosterData.roster?.assignments) {
                setAssignments(rosterData.roster.assignments);
            } else {
                setAssignments([]);
            }

            // Set palette and cleaning teams for current date
            if (rosterData.roster?.paletteTeam) {
                setPaletteTeamId(rosterData.roster.paletteTeam.id);
            } else {
                setPaletteTeamId('');
            }
            if (rosterData.roster?.cleaningTeam) {
                setCleaningTeamId(rosterData.roster.cleaningTeam.id);
            } else {
                setCleaningTeamId('');
            }

            if (teamsData.teams) setTeams(teamsData.teams);
            if (usersData.users) {
                // Include both workers and managers (for OP position)
                setWorkers(usersData.users.filter((u: any) => (u.role === 'WORKER' || u.role === 'MANAGER') && u.isApproved));
            }

            // Get approved leaves for the selected date
            if (leavesData.leaves) {
                const selectedDate = new Date(date);
                const onLeaveUserIds = new Set<string>();

                leavesData.leaves.forEach((leave: any) => {
                    const startDate = new Date(leave.startDate);
                    const endDate = new Date(leave.endDate);

                    // Check if selected date is within leave period
                    if (selectedDate >= startDate && selectedDate <= endDate) {
                        onLeaveUserIds.add(leave.userId);
                    }
                });

                setApprovedLeaves(onLeaveUserIds);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentChange = (teamName: string, position: string, userId: string) => {
        if (!isManager) return;

        const newAssignments = assignments.filter(
            a => !(a.team === teamName && a.position === position && a.userId === userId)
        );

        if (userId) {
            // Find worker to get company info immediately for UI update
            const worker = workers.find(w => w.id === userId);
            const newAssignment = {
                userId,
                team: teamName,
                position,
                user: {
                    name: worker?.name || '',
                    role: 'WORKER',
                    company: worker?.company
                }
            };

            // Remove any existing assignment for this user on this date
            const filtered = newAssignments.filter(a => a.userId !== userId);
            filtered.push(newAssignment);
            setAssignments(filtered);
        } else {
            setAssignments(newAssignments);
        }
    };

    const addWorkerToSlot = (teamName: string, position: string, userId: string) => {
        if (!userId || !isManager) return;

        // Check if user is on approved leave for this date
        if (approvedLeaves.has(userId)) {
            alert('해당 날짜에 휴무가 승인된 근무자입니다. 근무표에 추가할 수 없습니다.');
            return;
        }

        const isAssigned = assignments.some(a => a.userId === userId);
        if (isAssigned) {
            alert('이미 배정된 근무자입니다.');
            return;
        }

        const worker = workers.find(w => w.id === userId);

        // For Management position, only allow managers
        if (position === MANAGEMENT_POSITION && worker?.role !== 'MANAGER') {
            alert('관리 직무에는 관리자만 배정할 수 있습니다.');
            return;
        }

        const newAssignment = {
            userId,
            team: teamName,
            position,
            user: {
                name: worker?.name || '',
                role: worker?.role || 'WORKER',
                company: worker?.company
            }
        };

        setAssignments([...assignments, newAssignment]);
    };



    const handleSave = async () => {
        if (!isManager) return;
        setSaving(true);
        try {
            const res = await fetch('/api/roster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    assignments: assignments.map(a => ({
                        userId: a.userId,
                        team: a.team,
                        position: a.position
                    })),
                    paletteTeamId: paletteTeamId || null,
                    cleaningTeamId: cleaningTeamId || null
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            alert('저장되었습니다.');
            fetchData();
        } catch (error) {
            console.error(error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSpecialTeams = async () => {
        if (!isManager) return;

        const start = new Date(specialTeamStartDate);
        const end = new Date(specialTeamEndDate);

        if (start > end) {
            alert('시작일이 종료일보다 늦을 수 없습니다.');
            return;
        }

        if (!confirm(`${specialTeamStartDate}부터 ${specialTeamEndDate}까지의 모든 날짜에 잔바리 정리조와 파레트 정리조를 지정하시겠습니까?`)) {
            return;
        }

        try {
            // Iterate through all dates in the range
            const dates: string[] = [];
            const current = new Date(start);
            while (current <= end) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }

            // Save for each date
            const promises = dates.map(async (dateStr) => {
                // Get current roster assignments for this date
                const rosterRes = await fetch(`/api/roster?date=${dateStr}`);
                const rosterData = await rosterRes.json();
                const currentAssignments = rosterData.roster?.assignments || [];

                const res = await fetch('/api/roster', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: dateStr,
                        assignments: currentAssignments.map((a: any) => ({
                            userId: a.userId,
                            team: a.team,
                            position: a.position
                        })),
                        paletteTeamId: paletteTeamId || null,
                        cleaningTeamId: cleaningTeamId || null
                    }),
                });

                if (!res.ok) throw new Error(`Failed to save for ${dateStr}`);
                return res.json();
            });

            await Promise.all(promises);
            alert(`${dates.length}일의 잔바리 정리조와 파레트 정리조가 저장되었습니다.`);

            // Refresh current date's data
            fetchData();

            // Auto-increment start date for next save
            const nextDay = new Date(specialTeamStartDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayStr = nextDay.toISOString().split('T')[0];
            setSpecialTeamStartDate(nextDayStr);

            // If end date is now before start date, update end date too
            if (new Date(specialTeamEndDate) < nextDay) {
                setSpecialTeamEndDate(nextDayStr);
            }
        } catch (error) {
            console.error('Failed to save special teams', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const handleClearAll = () => {
        if (!isManager) return;
        if (confirm('현재 날짜의 모든 배정을 초기화하시겠습니까? (저장 버튼을 눌러야 반영됩니다)')) {
            setAssignments([]);
        }
    };

    const changeDate = (days: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        setDate(d.toISOString().split('T')[0]);
    };

    const getWorkersInSlot = (teamName: string, position: string) => {
        // Map position names to handle legacy data (지게차 -> 포크, 상하차 -> 상하역)
        const positionMap: { [key: string]: string[] } = {
            '포크': ['포크', '지게차'],
            '검수': ['검수'],
            '클램프': ['클램프'],
            '상하역': ['상하역', '상하차'],
            'OP': ['OP'],
            '관리': ['관리']
        };
        const validPositions = positionMap[position] || [position];

        return assignments.filter(a => {
            // For OP and Management positions, ignore team field - only check position
            if (position === OP_POSITION || position === MANAGEMENT_POSITION) {
                return validPositions.includes(a.position);
            }

            // For other positions, match both team and position
            const assignmentTeam = a.team || '';
            const targetTeam = teamName || '';
            return assignmentTeam === targetTeam && validPositions.includes(a.position);
        });
    };

    const removeWorkerFromSlot = (teamName: string, position: string, userId: string) => {
        if (!isManager) {
            console.log('Not a manager, cannot remove');
            return;
        }

        console.log('Removing worker:', { teamName, position, userId });

        // Map position names to handle legacy data (지게차 -> 포크, 상하차 -> 상하역)
        const positionMap: { [key: string]: string[] } = {
            '포크': ['포크', '지게차'],
            '검수': ['검수'],
            '클램프': ['클램프'],
            '상하역': ['상하역', '상하차'],
            'OP': ['OP'],
            '관리': ['관리']
        };
        const validPositions = positionMap[position] || [position];

        // Use functional update pattern to ensure we're working with the latest state
        setAssignments(prevAssignments => {
            console.log('Current assignments before remove:', prevAssignments);

            const newAssignments = prevAssignments.filter(a => {
                // For OP and Management positions, only check position and userId
                if (position === OP_POSITION || position === MANAGEMENT_POSITION) {
                    // Check if the assignment's position is one of the valid aliases for the target position
                    const isPositionMatch = validPositions.includes(a.position);
                    const shouldKeep = !(isPositionMatch && a.userId === userId);
                    console.log(`Checking assignment (OP/Management):`, {
                        assignment: a,
                        shouldKeep,
                        positionMatch: isPositionMatch,
                        userIdMatch: a.userId === userId
                    });
                    return shouldKeep;
                }
                const assignmentTeam = a.team || '';
                const targetTeam = teamName || '';

                // Check if the assignment's position is one of the valid aliases for the target position
                const isPositionMatch = validPositions.includes(a.position);
                const shouldKeep = !(assignmentTeam === targetTeam && isPositionMatch && a.userId === userId);
                console.log(`Checking assignment (Team):`, {
                    assignment: a,
                    shouldKeep,
                    teamMatch: assignmentTeam === targetTeam,
                    positionMatch: isPositionMatch,
                    userIdMatch: a.userId === userId
                });
                return shouldKeep;
            });

            console.log('New assignments after filter:', newAssignments);
            console.log('Assignments removed:', prevAssignments.length - newAssignments.length);

            return newAssignments;
        });
    };

    const getUnassignedWorkers = () => {
        const assignedIds = new Set(assignments.map(a => a.userId));
        // Filter out only assigned workers (keep on-leave workers for display but they'll be disabled)
        return workers.filter(w => !assignedIds.has(w.id) && w.role === 'WORKER');
    };

    const getUnassignedManagers = () => {
        const assignedIds = new Set(assignments.map(a => a.userId));
        return workers.filter(w => !assignedIds.has(w.id) && w.role === 'MANAGER');
    };

    const isWorkerOnLeave = (userId: string) => {
        return approvedLeaves.has(userId);
    };

    const getCompanyStyle = (companyName: string = '') => {
        if (!companyName) return COMPANY_STYLES[0];

        // Explicit mapping for known companies to ensure distinction
        if (companyName === '보람관리') return COMPANY_STYLES[0]; // Indigo
        if (companyName === '디티에스') return COMPANY_STYLES[1]; // Emerald
        if (companyName === '신항만건기') return COMPANY_STYLES[2]; // Amber

        let hash = 0;
        for (let i = 0; i < companyName.length; i++) {
            hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % COMPANY_STYLES.length;
        return COMPANY_STYLES[index];
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-30 bg-white/80 backdrop-blur-md p-4 -mx-4 md:-mx-8 md:px-8 border-b border-slate-200">
                <div className="flex items-center justify-between lg:justify-start gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-slate-500" />
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-slate-900">
                                {mounted && date ? new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) : ''}
                            </span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent border-none text-xs text-slate-500 focus:ring-0 p-0 text-center w-24"
                            />
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ChevronRight size={20} className="text-slate-500" />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !isManager}
                        className="lg:hidden p-2 bg-blue-600 rounded-lg text-white disabled:opacity-50"
                    >
                        <Save size={20} />
                    </button>
                </div>

                {isManager && (
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm"
                        >
                            <Copy size={16} />
                            <span className="hidden sm:inline">일괄 복사</span>
                            <span className="sm:hidden">복사</span>
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">전체 초기화</span>
                            <span className="sm:hidden">초기화</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="hidden lg:flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 shadow-lg shadow-blue-500/20"
                        >
                            <Save size={18} />
                            {saving ? '저장 중...' : '저장하기'}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Roster Grid */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Management Section - Displayed before OP */}
                    <GlassCard className="overflow-hidden bg-white border-slate-200">
                        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                {MANAGEMENT_POSITION}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">{MANAGEMENT_POSITION}</div>
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {getWorkersInSlot('', MANAGEMENT_POSITION).map(assignment => {
                                        // Use company name for color, even for managers
                                        const companyName = assignment.user.company?.name;
                                        const style = getCompanyStyle(companyName);
                                        return (
                                            <div
                                                key={assignment.userId}
                                                className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${style.text}`}>
                                                        {assignment.user.name}
                                                    </span>
                                                    <span className={`text-[10px] ${style.subtext} leading-none`}>
                                                        {assignment.user.role === 'MANAGER' ? '관리자' : (companyName || '소속없음')}
                                                    </span>
                                                </div>

                                                {isManager && (
                                                    <button
                                                        onClick={() => removeWorkerFromSlot('', MANAGEMENT_POSITION, assignment.userId)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                                                        title="제거"
                                                    >
                                                        <XIcon size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {isManager && (
                                        <select
                                            className="bg-white border border-slate-200 rounded-lg text-sm text-slate-600 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-auto"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    addWorkerToSlot('', MANAGEMENT_POSITION, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        >
                                            <option value="">+ 추가</option>
                                            {getUnassignedManagers().map(w => {
                                                const onLeave = isWorkerOnLeave(w.id);
                                                return (
                                                    <option
                                                        key={w.id}
                                                        value={w.id}
                                                        disabled={onLeave}
                                                        className={onLeave ? 'text-red-400 bg-red-50' : ''}
                                                    >
                                                        {w.name} (관리자){onLeave ? ' [휴무]' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* OP Section - Displayed before all teams */}
                    <GlassCard className="overflow-hidden bg-white border-slate-200">
                        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                                {OP_POSITION}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">{OP_POSITION}</div>
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {getWorkersInSlot('', OP_POSITION).map(assignment => {
                                        // Use company name for color, even for managers
                                        const companyName = assignment.user.company?.name;
                                        const style = getCompanyStyle(companyName);
                                        return (
                                            <div
                                                key={assignment.userId}
                                                className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${style.text}`}>
                                                        {assignment.user.name}
                                                    </span>
                                                    <span className={`text-[10px] ${style.subtext} leading-none`}>
                                                        {assignment.user.role === 'MANAGER' ? '관리자' : (companyName || '소속없음')}
                                                    </span>
                                                </div>

                                                {isManager && (
                                                    <button
                                                        onClick={() => removeWorkerFromSlot('', OP_POSITION, assignment.userId)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                                                        title="제거"
                                                    >
                                                        <XIcon size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {isManager && (
                                        <select
                                            className="bg-white border border-slate-200 rounded-lg text-sm text-slate-600 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-auto"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    addWorkerToSlot('', OP_POSITION, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        >
                                            <option value="">+ 추가</option>
                                            {getUnassignedWorkers().concat(getUnassignedManagers()).map(w => {
                                                const onLeave = isWorkerOnLeave(w.id);
                                                return (
                                                    <option
                                                        key={w.id}
                                                        value={w.id}
                                                        disabled={onLeave}
                                                        className={onLeave ? 'text-red-400 bg-red-50' : ''}
                                                    >
                                                        {w.name} ({w.role === 'MANAGER' ? '관리자' : (w.company?.name || '소속없음')}){onLeave ? ' [휴무]' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Cleaning Duty Assignment (Compact) */}
                            {isManager && (
                                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                                    <div className="text-xs text-purple-700 mb-2 font-medium flex items-center gap-2">
                                        <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
                                        청소담당 지정
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1 bg-white rounded-lg border border-purple-200 px-2 py-1">
                                            <input
                                                type="date"
                                                value={specialTeamStartDate}
                                                onChange={(e) => setSpecialTeamStartDate(e.target.value)}
                                                className="bg-transparent border-none text-xs text-slate-600 focus:ring-0 p-0 w-24"
                                            />
                                            <span className="text-slate-400 text-xs">~</span>
                                            <input
                                                type="date"
                                                value={specialTeamEndDate}
                                                onChange={(e) => setSpecialTeamEndDate(e.target.value)}
                                                className="bg-transparent border-none text-xs text-slate-600 focus:ring-0 p-0 w-24"
                                            />
                                        </div>

                                        <select
                                            value={paletteTeamId}
                                            onChange={(e) => setPaletteTeamId(e.target.value)}
                                            className="bg-white border border-purple-200 rounded-lg text-xs text-slate-600 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                            <option value="">잔바리 정리</option>
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={cleaningTeamId}
                                            onChange={(e) => setCleaningTeamId(e.target.value)}
                                            className="bg-white border border-purple-200 rounded-lg text-xs text-slate-600 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                            <option value="">파레트 정리</option>
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={handleSaveSpecialTeams}
                                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs transition-colors font-medium ml-auto"
                                        >
                                            저장
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Teams Section */}
                    {teams.map(team => (
                        <GlassCard key={team.id} className="overflow-hidden bg-white border-slate-200">
                            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                    {team.name}
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {POSITIONS.map(pos => (
                                    <div key={pos} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                        <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">{pos}</div>
                                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                                            {getWorkersInSlot(team.name, pos).map(assignment => {
                                                // Use company name for color, even for managers
                                                const companyName = assignment.user.company?.name;
                                                const style = getCompanyStyle(companyName);
                                                return (
                                                    <div
                                                        key={assignment.userId}
                                                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-medium ${style.text}`}>
                                                                {assignment.user.name}
                                                            </span>
                                                            <span className={`text-[10px] ${style.subtext} leading-none`}>
                                                                {assignment.user.role === 'MANAGER' ? '관리자' : (companyName || '소속없음')}
                                                            </span>
                                                        </div>

                                                        {isManager && (
                                                            <button
                                                                onClick={() => removeWorkerFromSlot(team.name, pos, assignment.userId)}
                                                                className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                                                                title="제거"
                                                            >
                                                                <XIcon size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {isManager && (
                                                <select
                                                    className="bg-white border border-slate-200 rounded-lg text-sm text-slate-600 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-auto"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            addWorkerToSlot(team.name, pos, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                >
                                                    <option value="">+ 추가</option>
                                                    {getUnassignedWorkers().map(w => {
                                                        const onLeave = isWorkerOnLeave(w.id);
                                                        return (
                                                            <option
                                                                key={w.id}
                                                                value={w.id}
                                                                disabled={onLeave}
                                                                className={onLeave ? 'text-red-400 bg-red-50' : ''}
                                                            >
                                                                {w.name} ({w.role === 'MANAGER' ? '관리자' : (w.company?.name || '소속없음')}){onLeave ? ' [휴무]' : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Unassigned Workers Panel (Desktop Sticky) */}
                <div className="hidden lg:block space-y-4">
                    <GlassCard className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto bg-white border-slate-200">
                        {/* Unassigned Managers */}
                        <div className="mb-6">
                            <h3 className="text-slate-500 text-sm font-medium mb-3 flex items-center gap-2">
                                <Users size={16} />
                                미배정 관리자 ({getUnassignedManagers().length})
                            </h3>
                            <div className="space-y-2">
                                {getUnassignedManagers().map(worker => {
                                    const style = getCompanyStyle(worker.company?.name);
                                    return (
                                        <div key={worker.id} className="p-2 rounded bg-amber-50 text-slate-700 text-sm flex justify-between items-center hover:bg-amber-100 transition-colors border border-amber-100">
                                            <span className="font-medium text-amber-900">{worker.name}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">
                                                관리자
                                            </span>
                                        </div>
                                    );
                                })}
                                {getUnassignedManagers().length === 0 && (
                                    <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-lg">
                                        모든 관리자가 배정되었습니다.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 my-4"></div>

                        {/* Unassigned Workers */}
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium mb-3 flex items-center gap-2">
                                <Users size={16} />
                                미배정 근무자 ({getUnassignedWorkers().length})
                            </h3>
                            <div className="space-y-2">
                                {getUnassignedWorkers().map(worker => {
                                    const style = getCompanyStyle(worker.company?.name);
                                    return (
                                        <div key={worker.id} className="p-2 rounded bg-slate-50 text-slate-700 text-sm flex justify-between items-center hover:bg-slate-100 transition-colors">
                                            <span>{worker.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                                {worker.company?.name || '소속없음'}
                                            </span>
                                        </div>
                                    );
                                })}
                                {getUnassignedWorkers().length === 0 && (
                                    <div className="text-center py-8 text-slate-400 text-sm">
                                        모든 근무자가 배정되었습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <BulkCopyModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={() => {
                    fetchData();
                    setIsBulkModalOpen(false);
                }}
            />
        </div>
    );
}
