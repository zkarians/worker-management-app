'use client';

import { X } from 'lucide-react';
import { AttendanceCalendar } from './AttendanceCalendar';
import { useEffect, useState } from 'react';

interface Attendance {
    userId: string;
    date: string;
    status: string;
    overtimeHours: number;
    workHours: number;
    user: { name: string };
}

interface WorkerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    currentMonth: string;
}

export function WorkerDetailModal({ isOpen, onClose, userId, userName, currentMonth }: WorkerDetailModalProps) {
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchAttendanceData();
        }
    }, [isOpen, userId, currentMonth]);


    const fetchAttendanceData = async () => {
        setLoading(true);
        try {
            // Get first day of month and last day
            const [year, month] = currentMonth.split('-').map(Number);
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);

            const formatDate = (date: Date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };

            const startDate = formatDate(firstDay);
            const endDate = formatDate(lastDay);

            const response = await fetch(
                `/api/attendance?startDate=${startDate}&endDate=${endDate}&userId=${userId}`
            );
            const data = await response.json();
            setAttendanceData(data.attendance || []);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Calculate totals
    const totalWorkHours = attendanceData.reduce((sum, record) => sum + (record.workHours || 0), 0);
    const totalOvertimeHours = attendanceData.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
    const presentDays = attendanceData.filter(r => r.status === 'PRESENT').length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{userName} 근태 내역</h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {currentMonth.split('-')[0]}년 {currentMonth.split('-')[1]}월
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/80 rounded-full transition-colors"
                        aria-label="닫기"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* Summary */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-sm text-slate-600">출근일수</div>
                            <div className="text-2xl font-bold text-indigo-600">{presentDays}일</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-slate-600">총 근무시간</div>
                            <div className="text-2xl font-bold text-green-600">{totalWorkHours}h</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-slate-600">총 잔업시간</div>
                            <div className="text-2xl font-bold text-amber-600">{totalOvertimeHours}h</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">데이터 로딩 중...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Table */}
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto max-h-[500px]">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-slate-700 font-semibold">날짜</th>
                                                <th className="px-4 py-3 text-left text-slate-700 font-semibold">상태</th>
                                                <th className="px-4 py-3 text-left text-slate-700 font-semibold">근무</th>
                                                <th className="px-4 py-3 text-left text-slate-700 font-semibold">잔업</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {attendanceData.map((record, index) => (
                                                <tr key={index} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                            record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                                                                record.status === 'OFF_DAY' ? 'bg-gray-100 text-gray-700' :
                                                                    record.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {record.status === 'PRESENT' ? '출근' :
                                                                record.status === 'ABSENT' ? '결근' :
                                                                    record.status === 'OFF_DAY' ? '휴무' :
                                                                        record.status === 'SCHEDULED' ? '예정' :
                                                                            record.status === 'LATE' ? '지각' :
                                                                                record.status === 'EARLY_LEAVE' ? '조퇴' : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">{record.workHours}h</td>
                                                    <td className="px-4 py-3 text-slate-700">{record.overtimeHours}h</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right: Calendar */}
                            <div className="bg-white border border-slate-200 rounded-lg p-4">
                                <AttendanceCalendar
                                    attendanceData={attendanceData}
                                    currentMonth={currentMonth}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
