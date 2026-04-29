'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface ScheduleFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
    initialDate?: string; // Pre-fill start date
}

export default function ScheduleForm({ onClose, onSuccess, initialData, initialDate }: ScheduleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'ONCE',
        startDate: initialDate || new Date().toISOString().split('T')[0],
        endDate: '',
        time: '',
        dayOfWeek: [] as number[],
        dayOfMonth: 1,
        weekOfMonth: 1,
        isPopup: false,
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                startDate: initialData.startDate.split('T')[0],
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData ? `/api/schedules/${initialData.id}` : '/api/schedules';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save schedule');

            onSuccess();
            onClose();
            // router.refresh(); // Removed to prevent race condition/flicker
        } catch (error) {
            console.error(error);
            alert('일정 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDayOfWeek = (day: number) => {
        setFormData(prev => {
            const current = prev.dayOfWeek || [];
            if (current.includes(day)) {
                return { ...prev, dayOfWeek: current.filter(d => d !== day) };
            } else {
                return { ...prev, dayOfWeek: [...current, day].sort() };
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{initialData ? '일정 수정' : '새 일정 등록'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">일정의 세부 정보를 입력해주세요.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="schedule-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">제목 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="예: 전체 회의, 프로젝트 마감일"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">내용</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 min-h-[80px]"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="일정에 대한 상세 내용을 입력하세요 (선택)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">반복 유형</label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="ONCE">한번만</option>
                                            <option value="DAILY">매일 반복</option>
                                            <option value="WEEKLY">매주 반복</option>
                                            <option value="MONTHLY_DATE">매월 (날짜 기준)</option>
                                            <option value="MONTHLY_DAY">매월 (요일 기준)</option>
                                            <option value="MONTHLY_LAST">매월 (마지막 날)</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">시간</label>
                                    <input
                                        type="time"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.time || ''}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">시작일 <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">종료일</label>
                                    <input
                                        type="date"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formData.type === 'WEEKLY' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">반복 요일 선택</label>
                                    <div className="flex justify-between gap-1">
                                        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                            <button
                                                key={day}
                                                type="button"
                                                className={`
                                                    w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                                                    ${formData.dayOfWeek?.includes(index)
                                                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200'
                                                        : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                                                    }
                                                `}
                                                onClick={() => toggleDayOfWeek(index)}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.type === 'MONTHLY_DATE' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">날짜 설정</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.dayOfMonth === -1}
                                                onChange={e => setFormData({ ...formData, dayOfMonth: e.target.checked ? -1 : 1 })}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="text-sm text-slate-600 font-medium">매월 말일</span>
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                        value={formData.dayOfMonth === -1 ? '' : formData.dayOfMonth || ''}
                                        onChange={e => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                                        disabled={formData.dayOfMonth === -1}
                                        placeholder={formData.dayOfMonth === -1 ? "매월 말일로 자동 설정됩니다" : "날짜 입력 (1-31)"}
                                    />
                                </div>
                            )}

                            {formData.type === 'MONTHLY_DAY' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">주차</label>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                                value={formData.weekOfMonth || 1}
                                                onChange={e => setFormData({ ...formData, weekOfMonth: parseInt(e.target.value) })}
                                            >
                                                <option value="1">첫째 주</option>
                                                <option value="2">둘째 주</option>
                                                <option value="3">셋째 주</option>
                                                <option value="4">넷째 주</option>
                                                <option value="5">다섯째 주</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">요일</label>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                                value={formData.dayOfWeek?.[0] || 0}
                                                onChange={e => setFormData({ ...formData, dayOfWeek: [parseInt(e.target.value)] })}
                                            >
                                                {['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'].map((day, idx) => (
                                                    <option key={idx} value={idx}>{day}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3 p-3 rounded-xl border border-red-100 bg-red-50/30">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="isPopup"
                                        checked={formData.isPopup}
                                        onChange={e => setFormData({ ...formData, isPopup: e.target.checked })}
                                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-red-300"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="isPopup" className="block text-sm font-bold text-red-800">중요 공지 (팝업)</label>
                                    <p className="text-xs text-red-600 mt-0.5">체크 시 직원들이 로그인할 때 팝업으로 안내됩니다.</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
                    {initialData ? (
                        <button
                            type="button"
                            onClick={async () => {
                                if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;
                                setLoading(true);
                                try {
                                    const res = await fetch(`/api/schedules/${initialData.id}`, { method: 'DELETE' });
                                    if (!res.ok) throw new Error('Failed to delete');
                                    onSuccess();
                                    onClose();
                                } catch (error) {
                                    console.error(error);
                                    alert('일정 삭제에 실패했습니다.');
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            삭제
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            취소
                        </button>
                    )}
                    <button
                        form="schedule-form"
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? '저장 중...' : initialData ? '수정사항 저장' : '일정 등록하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
