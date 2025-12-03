'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, XCircle, Check } from 'lucide-react';

interface DailyLog {
    id: string;
    date: string;
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

interface DailyNotesManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    logs: DailyLog[];
    leaves?: LeaveRequest[];
    onAdd: (content: string, date: string) => Promise<void>;
    onUpdate: (id: string, content: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onDeleteLeave?: (id: string) => Promise<void>;
    onUpdateLeaveStatus?: (id: string, status: string) => Promise<void>;
    isManager?: boolean;
}

export function DailyNotesManagerModal({
    isOpen,
    onClose,
    date,
    logs,
    leaves = [],
    onAdd,
    onUpdate,
    onDelete,
    onDeleteLeave,
    onUpdateLeaveStatus,
    isManager = false
}: DailyNotesManagerModalProps) {
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter logs for the selected date
    const dailyLogs = logs.filter(log => log.date.split('T')[0] === date);

    // Filter leaves for the selected date
    const dailyLeaves = leaves.filter(leave => {
        const start = new Date(leave.startDate).toISOString().split('T')[0];
        const end = new Date(leave.endDate).toISOString().split('T')[0];
        return date >= start && date <= end;
    });

    useEffect(() => {
        if (!isOpen) {
            setNewNote('');
            setEditingId(null);
            setEditContent('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmitting(true);
        try {
            await onAdd(newNote, date);
            setNewNote('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (log: DailyLog) => {
        setEditingId(log.id);
        setEditContent(log.content);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleUpdate = async (id: string) => {
        if (!editContent.trim()) return;

        setIsSubmitting(true);
        try {
            await onUpdate(id, editContent);
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        setIsSubmitting(true);
        try {
            await onDelete(id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">특이사항 관리</h3>
                        <p className="text-sm text-slate-500">{new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {/* Leave Requests Section */}
                    {dailyLeaves.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 px-1">휴무 신청</h4>
                            <div className="space-y-2">
                                {dailyLeaves.map(leave => (
                                    <div key={leave.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-800">{leave.user.name}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {leave.status === 'APPROVED' ? '승인됨' : leave.status === 'PENDING' ? '대기중' : leave.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 mb-1">
                                                {new Date(leave.startDate).toLocaleDateString()} ~ {new Date(leave.endDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-slate-800">{leave.reason}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isManager && onUpdateLeaveStatus && leave.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => onUpdateLeaveStatus(leave.id, 'APPROVED')}
                                                        className="p-1.5 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="승인"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateLeaveStatus(leave.id, 'REJECTED')}
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="거절"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            )}
                                            {isManager && onUpdateLeaveStatus && leave.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => onUpdateLeaveStatus(leave.id, 'REJECTED')}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="반려"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                            {onDeleteLeave && (
                                                <button
                                                    onClick={() => onDeleteLeave(leave.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Daily Logs Section */}
                    {(dailyLeaves.length > 0 && dailyLogs.length > 0) && (
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 px-1 mt-4">특이사항</h4>
                    )}

                    {dailyLogs.length > 0 ? (
                        dailyLogs.map(log => (
                            <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                {editingId === log.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full p-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={cancelEditing}
                                                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                                                disabled={isSubmitting}
                                            >
                                                취소
                                            </button>
                                            <button
                                                onClick={() => handleUpdate(log.id)}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 flex items-center gap-1"
                                                disabled={isSubmitting}
                                            >
                                                <Save size={12} /> 저장
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{log.content}</p>
                                            <p className="text-[10px] text-slate-400 mt-1.5">작성자: {log.author.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => startEditing(log)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="수정"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(log.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        dailyLeaves.length === 0 && (
                            <div className="text-center py-10 text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-300">
                                <p>등록된 특이사항이나 휴무가 없습니다.</p>
                            </div>
                        )
                    )}
                </div>

                {/* Add New Form */}
                <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                    <form onSubmit={handleAdd} className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Plus size={12} className="text-indigo-600" /> 새 특이사항 추가
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="내용을 입력하세요..."
                                className="flex-1 glass-input bg-slate-50 border-slate-200 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={!newNote.trim() || isSubmitting}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                            >
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
