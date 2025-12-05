'use client';

import { useState, useEffect, useRef } from 'react';
import { Printer, FileText, Users, CheckCircle, XCircle, TrendingUp, Building2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { MonthlyCalendarWidget } from '@/app/components/MonthlyCalendarWidget';
import { toBlob } from 'html-to-image';

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

const POSITIONS = ['검수', '포크', '클램프', '상하역'];

// Predefined styles for different companies (Print friendly versions)
const COMPANY_STYLES = [
    { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-200' }, // Default/Boram
    { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-200' }, // DTS (Purple)
    { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-200' }, // Shinhangman (Green)
    { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-cyan-200' },
    { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-200' },
];

export default function ReportPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [logs, setLogs] = useState<any[]>([]); // Added logs state
    const [attendanceData, setAttendanceData] = useState<any[]>([]); // Attendance data
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
    const [companyStats, setCompanyStats] = useState<{ [key: string]: { total: number; present: number; absent: number } }>({});
    const [loading, setLoading] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rosterRes, teamsRes, usersRes, logsRes, attRes] = await Promise.all([
                fetch(`/api/roster?date=${date}`),
                fetch('/api/teams'),
                fetch('/api/users'),
                fetch(`/api/logs?date=${date}`), // Fetch logs for specific date
                fetch(`/api/attendance?date=${date}`) // Fetch attendance for specific date
            ]);

            const rosterData = await rosterRes.json();
            const teamsData = await teamsRes.json();
            const usersData = await usersRes.json();
            const logsData = await logsRes.json();
            const attData = await attRes.json();

            if (rosterData.roster?.assignments) {
                setAssignments(rosterData.roster.assignments);
            } else {
                setAssignments([]);
            }

            if (logsData.logs) {
                setLogs(logsData.logs);
            } else {
                setLogs([]);
            }

            if (attData.attendance) {
                setAttendanceData(attData.attendance);
            } else {
                setAttendanceData([]);
            }

            if (teamsData.teams) setTeams(teamsData.teams);

            if (usersData.users) {
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

                // Calculate company statistics
                const companyStatsMap: { [key: string]: { total: number; present: number; absent: number } } = {};

                // Get all users with company info
                const allUsers = [...allWorkers, ...allManagers];

                allUsers.forEach((u: any) => {
                    const companyName = u.company?.name || '소속없음';
                    if (!companyStatsMap[companyName]) {
                        companyStatsMap[companyName] = { total: 0, present: 0, absent: 0 };
                    }
                    companyStatsMap[companyName].total++;

                    if (assignedWorkerIds.has(u.id)) {
                        companyStatsMap[companyName].present++;
                    } else {
                        companyStatsMap[companyName].absent++;
                    }
                });

                setCompanyStats(companyStatsMap);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const getWorkersFor = (teamName: string, position: string) => {
        // Map position names to handle legacy data (지게차 -> 포크, 상하차 -> 상하역)
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
        return assignments.filter(a => a.position === 'OP');
    };

    const getManagementWorkers = () => {
        return assignments.filter(a => a.position === '관리');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleScreenshot = async () => {
        if (!reportRef.current) return;

        try {
            // 스크린샷 캡처 시작 알림
            const originalCursor = document.body.style.cursor;
            document.body.style.cursor = 'wait';
            document.body.classList.add('screenshot-mode'); // Add class for screenshot specific styles

            // 약간의 지연 후 캡처 (DOM이 안정화되도록)
            await new Promise(resolve => setTimeout(resolve, 100));

            const blob = await toBlob(reportRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                filter: (node) => {
                    // Hide elements that should not be in the screenshot (matching print view)
                    if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
                        return false;
                    }
                    return true;
                }
            });

            if (!blob) {
                throw new Error('이미지 생성에 실패했습니다.');
            }

            // 클립보드에 복사
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
            } catch (err) {
                console.error('Clipboard write failed:', err);
            }

            // 커서 및 클래스 복원
            document.body.style.cursor = originalCursor;
            document.body.classList.remove('screenshot-mode');

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const dateStr = new Date(date).toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '');
            link.download = `일일근무보고서_${dateStr}.png`;
            link.href = url;

            // 링크를 문서에 추가해야 다운로드가 작동하는 브라우저가 있음
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // 성공 알림
            alert('스크린샷이 저장되고 클립보드에 복사되었습니다!');
        } catch (error: any) {
            console.error('Screenshot failed:', error);
            document.body.style.cursor = 'default';
            document.body.classList.remove('screenshot-mode'); // Ensure class is removed on error
            alert(`스크린샷 캡처에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        }
    };

    const getCompanyStyle = (companyName: string = '') => {
        if (!companyName) return COMPANY_STYLES[0];

        // Explicit mapping for known companies (using includes to handle (주) prefix)
        if (companyName.includes('디티에스')) return COMPANY_STYLES[1]; // Purple
        if (companyName.includes('신항만')) return COMPANY_STYLES[2]; // Emerald
        if (companyName.includes('보람')) return COMPANY_STYLES[0]; // Indigo (Blue-ish)

        let hash = 0;
        for (let i = 0; i < companyName.length; i++) {
            hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % COMPANY_STYLES.length;
        return COMPANY_STYLES[index];
    };

    return (
        <div className="pb-20 print:pb-0 print:bg-white print:text-black min-h-screen bg-slate-50 relative z-0">
            {/* Controls - Hidden on Print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="text-blue-600" /> 보고서
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        웅동야간출하 근무현황을 보고서 형식으로 출력합니다.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass-input bg-white border-slate-200"
                    />
                    <button
                        onClick={handleScreenshot}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
                    >
                        <Camera size={18} />
                        스크린샷
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                    >
                        <Printer size={18} />
                        인쇄하기
                    </button>
                </div>
            </div>


            {/* A4 Paper Layout Container */}
            <div className="w-full overflow-x-auto pb-10 px-4 md:px-0">
                <div ref={reportRef} className="min-w-[210mm] mx-auto bg-white text-black p-[15mm] shadow-2xl min-h-[297mm] print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-[5mm] print:m-0 print:max-h-[285mm] print:overflow-hidden flex flex-col box-border">

                    {/* Document Header with Approval Boxes */}
                    <div className="flex justify-between items-start mb-2 pb-2 border-b-2 border-slate-300 print:mb-1 print:pb-1 flex-shrink-0">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 print:mb-0.5">
                                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full print:h-5"></div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-slate-800 print:text-lg">일일 근무 보고서</h1>
                                    <div className="flex items-center gap-1 print:hidden">
                                        <button
                                            onClick={() => {
                                                const currentDate = new Date(date);
                                                currentDate.setDate(currentDate.getDate() - 1);
                                                setDate(currentDate.toISOString().split('T')[0]);
                                            }}
                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                            title="이전 날짜"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const currentDate = new Date(date);
                                                currentDate.setDate(currentDate.getDate() + 1);
                                                setDate(currentDate.toISOString().split('T')[0]);
                                            }}
                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                            title="다음 날짜"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium print:hidden">Daily Work Report</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 ml-4 print:ml-2 print:gap-0.5">
                                <div className="flex items-center gap-2 text-xs text-slate-700 print:text-[9px]">
                                    <span className="font-semibold text-slate-600">일자:</span>
                                    <span className="text-slate-800">{new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-700 print:text-[9px]">
                                    <span className="font-semibold text-slate-600">소속:</span>
                                    <span className="text-slate-800">웅동물류센터 야간출하</span>
                                </div>
                            </div>
                        </div>

                        {/* Approval Boxes */}
                        <div className="flex gap-1.5 print:gap-1">
                            <div className="flex flex-col w-16 border border-slate-300 rounded-lg overflow-hidden shadow-sm print:w-12 print:rounded">
                                <div className="bg-gradient-to-b from-slate-100 to-slate-200 text-center text-[10px] py-1 border-b border-slate-300 font-semibold text-slate-700 print:py-0.5 print:text-[8px]">담당</div>
                                <div className="h-14 bg-white print:h-10"></div>
                            </div>
                            <div className="flex flex-col w-16 border border-slate-300 rounded-lg overflow-hidden shadow-sm print:w-12 print:rounded">
                                <div className="bg-gradient-to-b from-slate-100 to-slate-200 text-center text-[10px] py-1 border-b border-slate-300 font-semibold text-slate-700 print:py-0.5 print:text-[8px]">팀장</div>
                                <div className="h-14 bg-white print:h-10"></div>
                            </div>
                            <div className="flex flex-col w-16 border border-slate-300 rounded-lg overflow-hidden shadow-sm print:w-12 print:rounded">
                                <div className="bg-gradient-to-b from-slate-100 to-slate-200 text-center text-[10px] py-1 border-b border-slate-300 font-semibold text-slate-700 print:py-0.5 print:text-[8px]">센터장</div>
                                <div className="h-14 bg-white print:h-10"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2 print:gap-1 min-h-0">
                        {/* Summary Stats Table */}
                        <div className="flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1.5 print:mb-0.5 print:gap-1">
                                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full print:h-2.5"></div>
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 print:text-[10px]">
                                    <Users size={14} className="text-indigo-600 print:hidden" />
                                    근무 현황 요약
                                </h2>
                            </div>
                            <div className="grid grid-cols-4 gap-2 print:gap-1">
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-2 shadow-sm print:p-1 print:rounded">
                                    <div className="flex items-center justify-between mb-1 print:mb-0">
                                        <span className="text-[10px] font-medium text-slate-600 print:text-[8px]">총원</span>
                                        <Users size={12} className="text-slate-400 print:hidden" />
                                    </div>
                                    <div className="text-lg font-bold text-slate-800 print:text-sm">{stats.total}명</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-2 shadow-sm print:p-1 print:rounded">
                                    <div className="flex items-center justify-between mb-1 print:mb-0">
                                        <span className="text-[10px] font-medium text-blue-700 print:text-[8px]">출근</span>
                                        <CheckCircle size={12} className="text-blue-500 print:hidden" />
                                    </div>
                                    <div className="text-lg font-bold text-blue-700 print:text-sm">{stats.present}명</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-2 shadow-sm print:p-1 print:rounded">
                                    <div className="flex items-center justify-between mb-1 print:mb-0">
                                        <span className="text-[10px] font-medium text-red-700 print:text-[8px]">결근/휴무</span>
                                        <XCircle size={12} className="text-red-500 print:hidden" />
                                    </div>
                                    <div className="text-lg font-bold text-red-700 print:text-sm">{stats.absent}명</div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 p-2 shadow-sm print:p-1 print:rounded">
                                    <div className="flex items-center justify-between mb-1 print:mb-0">
                                        <span className="text-[10px] font-medium text-emerald-700 print:text-[8px]">출근율</span>
                                        <TrendingUp size={12} className="text-emerald-500 print:hidden" />
                                    </div>
                                    <div className="text-lg font-bold text-emerald-700 print:text-sm">
                                        {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Statistics Table */}
                        {Object.keys(companyStats).length > 0 && (
                            <div className="flex-shrink-0">
                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                    <table className="w-full border-collapse text-center text-xs print:text-[8px]">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                                <th className="p-1.5 font-semibold text-slate-700 text-left print:p-0.5">회사명</th>
                                                <th className="p-1.5 font-semibold text-slate-700 print:p-0.5">총원</th>
                                                <th className="p-1.5 font-semibold text-slate-700 print:p-0.5">출근</th>
                                                <th className="p-1.5 font-semibold text-slate-700 print:p-0.5">결근/휴무</th>
                                                <th className="p-1.5 font-semibold text-slate-700 print:p-0.5">출근율</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(companyStats).map(([companyName, stats], index) => (
                                                <tr key={companyName} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                                    <td className="p-1.5 font-medium text-slate-800 text-left print:p-0.5">{companyName}</td>
                                                    <td className="p-1.5 text-slate-700 print:p-0.5">{stats.total}명</td>
                                                    <td className="p-1.5 font-semibold text-blue-600 print:p-0.5">{stats.present}명</td>
                                                    <td className="p-1.5 font-semibold text-red-600 print:p-0.5">{stats.absent}명</td>
                                                    <td className="p-1.5 print:p-0.5">
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 print:text-[8px] print:px-1 print:py-0">
                                                            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Main Roster Table with OP/Management - Grid Layout */}
                        <div className="flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1.5 print:mb-0.5 print:gap-1">
                                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full print:h-2.5"></div>
                                <h2 className="text-sm font-bold text-slate-800 print:text-[10px]">팀별 상세 근무 편성</h2>
                            </div>

                            {/* Grid: Roster Table (left) + OP/Management (right) */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 print:gap-1">
                                {/* Roster Table - Left (3 columns) */}
                                <div className="lg:col-span-3">
                                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                        <table className="w-full border-collapse text-[10px] print:text-[8px]">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                                    <th className="p-1.5 w-16 font-semibold text-slate-700 text-center print:p-0.5 print:w-12">구분</th>
                                                    {POSITIONS.map(pos => (
                                                        <th key={pos} className="p-1.5 font-semibold text-slate-700 text-center print:p-0.5">{pos}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teams.map((team, teamIndex) => {
                                                    const teamNumber = parseInt(team.name.replace(/[^0-9]/g, '')) || 0;
                                                    const isTeam1 = teamNumber === 1;
                                                    const teamNameColor = isTeam1 ? 'text-blue-700' : 'text-red-700';

                                                    return (
                                                        <tr key={team.id} className={`border-b border-slate-100 ${teamIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                            <td className={`p-1.5 font-bold ${teamNameColor} bg-slate-100 text-center align-middle border-r border-slate-200 print:p-0.5`}>
                                                                {team.name}
                                                            </td>
                                                            {POSITIONS.map(pos => {
                                                                const workers = getWorkersFor(team.name, pos);
                                                                return (
                                                                    <td key={pos} className="p-1 align-top h-14 border-r border-slate-100 last:border-r-0 print:p-0.5 print:h-10">
                                                                        <div className="flex flex-wrap gap-1 print:gap-0.5 justify-center">
                                                                            {workers.length > 0 ? (
                                                                                workers.map((assignment, idx) => {
                                                                                    const style = getCompanyStyle(assignment.user.company?.name);
                                                                                    return (
                                                                                        <div
                                                                                            key={idx}
                                                                                            className={`flex flex-col items-center px-1.5 py-0.5 rounded-md border shadow-sm ${style.bg} ${style.border} min-w-[50px] print:px-1 print:py-0 print:min-w-[40px] print:rounded-sm`}
                                                                                        >
                                                                                            <span className={`font-bold text-[10px] ${style.text} print:text-[8px]`}>
                                                                                                {assignment.user.name}
                                                                                            </span>
                                                                                            <span className="text-[8px] text-slate-600 leading-none mt-0.5 print:text-[6px]">
                                                                                                {assignment.user.company?.name || '-'}
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <span className="text-slate-300 text-[9px] w-full text-center py-1 print:text-[8px] print:py-0">-</span>
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
                                </div>

                                {/* OP & Management - Right (1 column) */}
                                <div className="lg:col-span-1 space-y-2 print:space-y-1">
                                    {/* Management Section */}
                                    {getManagementWorkers().length > 0 && (
                                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-1.5 border-b border-blue-200 print:p-1">
                                                <h3 className="text-[10px] font-bold text-slate-800 flex items-center gap-1 print:text-[8px]">
                                                    <div className="w-0.5 h-3 bg-blue-500 rounded-full print:h-2"></div>
                                                    관리
                                                </h3>
                                            </div>
                                            <div className="p-1.5 print:p-1">
                                                <div className="flex flex-wrap gap-1 print:gap-0.5">
                                                    {getManagementWorkers().map((assignment, idx) => {
                                                        const style = getCompanyStyle(assignment.user.company?.name);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex flex-col items-center px-1.5 py-0.5 rounded-md border shadow-sm ${style.bg} ${style.border} print:px-1 print:py-0 print:rounded-sm`}
                                                            >
                                                                <span className={`font-bold text-[10px] ${style.text} print:text-[8px]`}>
                                                                    {assignment.user.name}
                                                                </span>
                                                                <span className="text-[8px] text-slate-600 leading-none mt-0.5 print:text-[6px]">
                                                                    {assignment.user.company?.name || '-'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* OP Section */}
                                    {getOPWorkers().length > 0 && (
                                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-1.5 border-b border-purple-200 print:p-1">
                                                <h3 className="text-[10px] font-bold text-slate-800 flex items-center gap-1 print:text-[8px]">
                                                    <div className="w-0.5 h-3 bg-purple-500 rounded-full print:h-2"></div>
                                                    OP
                                                </h3>
                                            </div>
                                            <div className="p-1.5 print:p-1">
                                                <div className="flex flex-wrap gap-1 print:gap-0.5">
                                                    {getOPWorkers().map((assignment, idx) => {
                                                        const style = getCompanyStyle(assignment.user.company?.name);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex flex-col items-center px-1.5 py-0.5 rounded-md border shadow-sm ${style.bg} ${style.border} print:px-1 print:py-0 print:rounded-sm`}
                                                            >
                                                                <span className={`font-bold text-[10px] ${style.text} print:text-[8px]`}>
                                                                    {assignment.user.name}
                                                                </span>
                                                                <span className="text-[8px] text-slate-600 leading-none mt-0.5 print:text-[6px]">
                                                                    {assignment.user.company?.name || '-'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Attendance Status Sections */}
                                    {(() => {
                                        const offDayWorkers = attendanceData.filter((a: any) => a.status === 'OFF_DAY');
                                        const absentWorkers = attendanceData.filter((a: any) => a.status === 'ABSENT');
                                        const lateWorkers = attendanceData.filter((a: any) => a.status === 'LATE');
                                        const earlyLeaveWorkers = attendanceData.filter((a: any) => a.status === 'EARLY_LEAVE');

                                        return (
                                            <>
                                                {/* 휴무 */}
                                                {offDayWorkers.length > 0 && (
                                                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                                        <div className="bg-gradient-to-r from-teal-50 to-cyan-100 p-1.5 border-b border-teal-200 print:p-1">
                                                            <h3 className="text-[10px] font-bold text-slate-800 flex items-center gap-1 print:text-[8px]">
                                                                <div className="w-0.5 h-3 bg-teal-500 rounded-full print:h-2"></div>
                                                                휴무 ({offDayWorkers.length}명)
                                                            </h3>
                                                        </div>
                                                        <div className="p-1.5 print:p-1">
                                                            <div className="flex flex-wrap gap-1 print:gap-0.5">
                                                                {offDayWorkers.map((worker: any, idx: number) => {
                                                                    const style = getCompanyStyle(worker.user?.company?.name);
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`flex flex-col items-center px-1.5 py-0.5 rounded-md border shadow-sm ${style.bg} ${style.border} print:px-1 print:py-0 print:rounded-sm`}
                                                                        >
                                                                            <span className={`font-bold text-[10px] ${style.text} print:text-[8px]`}>
                                                                                {worker.user?.name}
                                                                            </span>
                                                                            <span className="text-[8px] text-slate-600 leading-none mt-0.5 print:text-[6px]">
                                                                                {worker.user?.company?.name || '-'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 결근 */}
                                                {absentWorkers.length > 0 && (
                                                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-1.5 border-b border-red-200 print:p-1">
                                                            <h3 className="text-[10px] font-bold text-slate-800 flex items-center gap-1 print:text-[8px]">
                                                                <div className="w-0.5 h-3 bg-red-500 rounded-full print:h-2"></div>
                                                                결근 ({absentWorkers.length}명)
                                                            </h3>
                                                        </div>
                                                        <div className="p-1.5 print:p-1">
                                                            <div className="flex flex-wrap gap-1 print:gap-0.5">
                                                                {absentWorkers.map((worker: any, idx: number) => {
                                                                    const style = getCompanyStyle(worker.user?.company?.name);
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`flex flex-col items-center px-1.5 py-0.5 rounded-md border shadow-sm ${style.bg} ${style.border} print:px-1 print:py-0 print:rounded-sm`}
                                                                        >
                                                                            <span className={`font-bold text-[10px] ${style.text} print:text-[8px]`}>
                                                                                {worker.user?.name}
                                                                            </span>
                                                                            <span className="text-[8px] text-slate-600 leading-none mt-0.5 print:text-[6px]">
                                                                                {worker.user?.company?.name || '-'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 지각 */}
                                                {lateWorkers.length > 0 && (
                                                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-1.5 border-b border-orange-200 print:p-1">
                                                            <h3 className="text-[10px] font-bold text-slate-800 flex items-center gap-1 print:text-[8px]">
                                                                <div className="w-0.5 h-3 bg-orange-500 rounded-full print:h-2"></div>
                                                                지각 ({lateWorkers.length}명)
                                                            </h3>
                                                        </div>
                                                        <div className="p-1.5 print:p-1">
                                                            <div className="flex flex-wrap gap-1 print:gap-0.5">
                                                                {lateWorkers.map((worker: any, idx: number) => {
                                                                    const style = getCompanyStyle(worker.user?.company?.name);
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`flex flex-col items-center px-1.5 py-0.5 rounded-md border shadow-sm ${style.bg} ${style.border} print:px-1 print:py-0 print:rounded-sm`}
                                                                        >
                                                                            <span className={`font-bold text-[10px] ${style.text} print:text-[8px]`}>
                                                                                {worker.user?.name}
                                                                            </span>
                                                                            <span className="text-[8px] text-slate-600 leading-none mt-0.5 print:text-[6px]">
                                                                                {worker.user?.company?.name || '-'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 조퇴 */}
                                                {earlyLeaveWorkers.length > 0 && (
                                                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:rounded print:border-slate-300">
                                                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-1.5 border-b border-yellow-400 print:p-1">
                                                            <h3 className="text-[10px] font-bold text-slate-800 flex items-center gap-1 print:text-[8px]">
                                                                <div className="w-0.5 h-3 bg-yellow-500 rounded-full print:h-2"></div>
                                                                조퇴 ({earlyLeaveWorkers.length}명)
                                                            </h3>
                                                        </div>
                                                        <div className="p-1.5 print:p-1">
                                                            <div className="flex flex-wrap gap-1 print:gap-0.5">
                                                                {earlyLeaveWorkers.map((worker: any, idx: number) => {
                                                                    const style = getCompanyStyle(worker.user?.company?.name);
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`flex flex-col items-center px-1.5 py-0.5 rounded-md border shadow-sm ${style.bg} ${style.border} print:px-1 print:py-0 print:rounded-sm`}
                                                                        >
                                                                            <span className={`font-bold text-[10px] ${style.text} print:text-[8px]`}>
                                                                                {worker.user?.name}
                                                                            </span>
                                                                            <span className="text-[8px] text-slate-600 leading-none mt-0.5 print:text-[6px]">
                                                                                {worker.user?.company?.name || '-'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Special Notes Section */}
                        {logs.length > 0 && (
                            <div className="flex-shrink-0">
                                <div className="flex items-center gap-1.5 mb-1.5 print:mb-0.5 print:gap-1">
                                    <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full print:h-2.5"></div>
                                    <h2 className="text-sm font-bold text-slate-800 print:text-[10px]">특이사항</h2>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-2 shadow-sm print:p-1 print:rounded">
                                    <ul className="space-y-1 print:space-y-0.5">
                                        {logs.map(log => (
                                            <li key={log.id} className="flex items-start gap-1.5 text-xs text-slate-800 print:text-[9px] print:gap-1">
                                                <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 print:mt-1 print:w-0.5 print:h-0.5"></span>
                                                <div>
                                                    <span className="text-slate-700 print:text-[9px]">{log.content}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Monthly Calendar Widget - Added for Print */}
                        <div className="flex-1 min-h-0 flex flex-col mt-2 print:mt-1">
                            <div className="flex items-center gap-1.5 mb-1.5 print:mb-0.5 print:gap-1">
                                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full print:h-2.5"></div>
                                <h2 className="text-sm font-bold text-slate-800 print:text-[10px]">월간 일정</h2>
                            </div>
                            <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden print:border-slate-300 print:rounded">
                                <div className="h-full transform scale-100 origin-top-left print:scale-[0.85] print:w-[117%] print:h-[117%]">
                                    <MonthlyCalendarWidget />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Notes */}
                    <div className="mt-auto pt-2 print:pt-1 flex-shrink-0">
                        <div className="border-t border-slate-300 pt-1.5 print:pt-1">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 print:text-[8px]">
                                <div className="flex items-center gap-1 print:gap-0.5">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 print:w-0.5 print:h-0.5"></span>
                                    <span>본 보고서는 전산 시스템(웅동물류센터 야간출하)에서 출력되었습니다.</span>
                                </div>
                                <div className="text-slate-600 font-medium print:text-[8px]">
                                    출력일시: {mounted ? new Date().toLocaleString('ko-KR') : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 5mm;
                        size: A4;
                    }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Prevent page breaks */
                    * {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    /* Custom scrollbar hiding for print */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                }

                /* Screenshot specific styles */
                .screenshot-mode ::-webkit-scrollbar {
                    display: none !important;
                }
                
                .screenshot-mode * {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }

                /* Force full height and visible overflow for calendar during screenshot */
                .screenshot-mode .overflow-auto,
                .screenshot-mode .overflow-hidden,
                .screenshot-mode .overflow-y-auto,
                .screenshot-mode .overflow-x-auto {
                    overflow: visible !important;
                    height: auto !important;
                    max-height: none !important;
                }
            `}</style>
        </div>
    );
}
