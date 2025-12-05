'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { FileText, Check, X, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';

interface LeaveRequest {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    type: string;
    reason: string;
    status: string;
    user: { name: string };
}

export default function LeavesPage() {
    const user = useUser();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // New Request Form
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'FAMILY_EVENT',
        reason: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/leaves');
            const data = await res.json();
            // API returns 'leaves' but we use 'requests' in state
            const rawRequests = data.leaves || data.requests || [];
            // Filter out CANCELLED requests so they don't show up in the list
            const filteredRequests = rawRequests.filter((req: LeaveRequest) => req.status !== 'CANCELLED');
            setRequests(filteredRequests);
        } catch (error) {
            console.error('Failed to fetch leaves', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await fetch('/api/leaves', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            fetchRequests();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이 휴무 신청을 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/leaves?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || '삭제에 실패했습니다.');
                return;
            }

            fetchRequests();
            alert('휴무 신청이 삭제되었습니다.');
        } catch (error) {
            console.error('Failed to delete leave request', error);
            alert('삭제에 실패했습니다.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setShowForm(false);
            setFormData({ startDate: '', endDate: '', type: 'FAMILY_EVENT', reason: '' });
            fetchRequests();
            alert('휴무 신청이 완료되었습니다.');
        } catch (error) {
            console.error('Failed to submit request', error);
            alert('신청에 실패했습니다.');
        }
    };

    const handleCancelRequest = async (id: string) => {
        if (!confirm('휴무 신청을 취소하시겠습니까?')) return;

        try {
            const res = await fetch('/api/leaves/cancel', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || '취소에 실패했습니다.');
                return;
            }

            fetchRequests();
            alert(data.message || '휴무 신청이 취소되었습니다.');
        } catch (error) {
            console.error('Failed to cancel leave request', error);
            alert('취소에 실패했습니다.');
        }
    };

    const isManager = user?.role === 'MANAGER';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText /> 휴무 관리
                </h1>
                {!isManager && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary glass-button flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 w-full sm:w-auto"
                    >
                        <Plus size={18} /> 휴무 신청
                    </button>
                )}
            </div>

            {showForm && (
                <GlassCard className="bg-white border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">새 휴무 신청</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">시작일</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full glass-input bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">종료일</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full glass-input bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">사유</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full glass-input bg-white border-slate-200 text-slate-900"
                            >
                                <option value="FAMILY_EVENT">경조사</option>
                                <option value="SICK">병가</option>
                                <option value="OTHER">기타</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">사유</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full glass-input bg-white border-slate-200 text-slate-900 h-24"
                                placeholder="휴무 사유를 입력하세요..."
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors w-full sm:w-auto"
                            >
                                취소
                            </button>
                            <button type="submit" className="btn-primary glass-button bg-indigo-600 hover:bg-indigo-500 w-full sm:w-auto">
                                신청하기
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            {/* Desktop Table View */}
            <GlassCard className="hidden md:block overflow-hidden p-0 bg-white border-slate-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">신청자</th>
                            <th className="px-6 py-4">기간</th>
                            <th className="px-6 py-4">사유</th>
                            <th className="px-6 py-4">내용</th>
                            <th className="px-6 py-4">상태</th>
                            <th className="px-6 py-4 text-right">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {requests.map((req) => {
                            const isOwnRequest = !isManager && req.userId === user?.id;
                            const canDelete = isOwnRequest && req.status !== 'APPROVED' && req.status !== 'CANCELLATION_PENDING';
                            const canCancel = isOwnRequest && req.status === 'APPROVED';

                            return (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{req.user.name}</td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {new Date(req.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ~ {new Date(req.endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {req.type === 'FAMILY_EVENT' ? '경조사' : req.type === 'SICK' ? '병가' : req.type === 'OTHER' ? '기타' : req.type === 'VACATION' ? '연차' : req.type === 'PERSONAL' ? '개인사유' : req.type}
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-xs text-slate-700">{req.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                            req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                req.status === 'CANCELLED' ? 'bg-gray-500/20 text-gray-400' :
                                                    req.status === 'CANCELLATION_PENDING' ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {req.status === 'APPROVED' ? '승인됨' :
                                                req.status === 'REJECTED' ? '거절됨' :
                                                    req.status === 'CANCELLED' ? '취소됨' :
                                                        req.status === 'CANCELLATION_PENDING' ? '취소 대기중' :
                                                            '대기중'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {canCancel && (
                                                <button
                                                    onClick={() => handleCancelRequest(req.id)}
                                                    className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                                                    title="휴무 취소"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {isManager && (
                                                <>
                                                    {req.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                                title="승인"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                                title="거절"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {req.status === 'CANCELLATION_PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'CANCELLED')}
                                                                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                                title="취소 승인"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                                title="취소 거절 (휴무 유지)"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {req.status === 'APPROVED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                            title="반려"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                    {req.status === 'REJECTED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                            title="승인"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    휴무 신청 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </GlassCard>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {requests.length === 0 ? (
                    <GlassCard className="bg-white border-slate-200">
                        <p className="text-center text-gray-500 py-8">
                            휴무 신청 내역이 없습니다.
                        </p>
                    </GlassCard>
                ) : (
                    requests.map((req) => {
                        const isOwnRequest = !isManager && req.userId === user?.id;
                        const canDelete = isOwnRequest && req.status !== 'APPROVED' && req.status !== 'CANCELLATION_PENDING';
                        const canCancel = isOwnRequest && req.status === 'APPROVED';

                        return (
                            <GlassCard key={req.id} className="bg-white border-slate-200 p-4">
                                <div className="space-y-3">
                                    {/* Header with name and status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-slate-900 text-base">{req.user.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${req.status === 'APPROVED' ? 'bg-green-500/20 text-green-700' :
                                            req.status === 'REJECTED' ? 'bg-red-500/20 text-red-700' :
                                                req.status === 'CANCELLED' ? 'bg-gray-500/20 text-gray-700' :
                                                    req.status === 'CANCELLATION_PENDING' ? 'bg-orange-500/20 text-orange-700' :
                                                        'bg-yellow-500/20 text-yellow-700'
                                            }`}>
                                            {req.status === 'APPROVED' ? '승인됨' :
                                                req.status === 'REJECTED' ? '거절됨' :
                                                    req.status === 'CANCELLED' ? '취소됨' :
                                                        req.status === 'CANCELLATION_PENDING' ? '취소 대기중' :
                                                            '대기중'}
                                        </span>
                                    </div>

                                    {/* Period */}
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium">기간</p>
                                        <p className="text-sm text-slate-700">
                                            {new Date(req.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            {' ~ '}
                                            {new Date(req.endDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>

                                    {/* Type */}
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium">사유</p>
                                        <p className="text-sm text-slate-700">
                                            {req.type === 'FAMILY_EVENT' ? '경조사' :
                                                req.type === 'SICK' ? '병가' :
                                                    req.type === 'OTHER' ? '기타' :
                                                        req.type === 'VACATION' ? '연차' :
                                                            req.type === 'PERSONAL' ? '개인사유' : req.type}
                                        </p>
                                    </div>

                                    {/* Reason */}
                                    {req.reason && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 font-medium">내용</p>
                                            <p className="text-sm text-slate-700">{req.reason}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancelRequest(req.id)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-700 hover:bg-orange-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <RotateCcw size={16} />
                                                휴무 취소
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-700 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                삭제
                                            </button>
                                        )}
                                        {isManager && (
                                            <>
                                                {req.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                            className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-700 hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <Check size={16} />
                                                            승인
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                            className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-700 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <X size={16} />
                                                            거절
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'CANCELLATION_PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'CANCELLED')}
                                                            className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-700 hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <Check size={16} />
                                                            취소 승인
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                            className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-700 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <X size={16} />
                                                            거절
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-700 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <X size={16} />
                                                        반려
                                                    </button>
                                                )}
                                                {req.status === 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-700 hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <Check size={16} />
                                                        승인
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })
                )}
            </div>
        </div>
    );
}
