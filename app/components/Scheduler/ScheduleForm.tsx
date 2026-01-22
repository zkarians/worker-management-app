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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{initialData ? '일정 수정' : '새 일정 등록'}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">제목</label>
                        <input
                            type="text"
                            required
                            className="w-full border rounded p-2"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="일정 제목을 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">설명</label>
                        <textarea
                            className="w-full border rounded p-2"
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="상세 내용을 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">반복 유형</label>
                        <select
                            className="w-full border rounded p-2"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="ONCE">한번만</option>
                            <option value="DAILY">매일</option>
                            <option value="WEEKLY">매주</option>
                            <option value="MONTHLY_DATE">매월 (날짜 기준)</option>
                            <option value="MONTHLY_DAY">매월 (요일 기준)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">시작일</label>
                            <input
                                type="date"
                                required
                                className="w-full border rounded p-2"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">종료일 (선택)</label>
                            <input
                                type="date"
                                className="w-full border rounded p-2"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">시간 (선택)</label>
                        <input
                            type="time"
                            className="w-full border rounded p-2"
                            value={formData.time || ''}
                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>

                    {formData.type === 'WEEKLY' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">요일 선택</label>
                            <div className="flex gap-2 flex-wrap">
                                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`px-3 py-1 rounded text-sm ${formData.dayOfWeek?.includes(index)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200'
                                            }`}
                                        onClick={() => toggleDayOfWeek(index)}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.type === 'MONTHLY_DATE' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">날짜 (1-31)</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                className="w-full border rounded p-2"
                                value={formData.dayOfMonth || ''}
                                onChange={e => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                            />
                        </div>
                    )}

                    {formData.type === 'MONTHLY_DAY' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">주차</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={formData.weekOfMonth || 1}
                                    onChange={e => setFormData({ ...formData, weekOfMonth: parseInt(e.target.value) })}
                                >
                                    <option value="1">첫째 주</option>
                                    <option value="2">둘째 주</option>
                                    <option value="3">셋째 주</option>
                                    <option value="4">넷째 주</option>
                                    <option value="5">다섯째 주</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">요일</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={formData.dayOfWeek?.[0] || 0}
                                    onChange={e => setFormData({ ...formData, dayOfWeek: [parseInt(e.target.value)] })}
                                >
                                    {['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'].map((day, idx) => (
                                        <option key={idx} value={idx}>{day}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPopup"
                            checked={formData.isPopup}
                            onChange={e => setFormData({ ...formData, isPopup: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isPopup" className="text-sm font-medium">로그인 시 팝업으로 띄우기</label>
                    </div>

                    <div className="flex gap-2">
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
                                        // router.refresh(); // Removed
                                    } catch (error) {
                                        console.error(error);
                                        alert('일정 삭제에 실패했습니다.');
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 disabled:opacity-50"
                            >
                                삭제
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="w-full bg-gray-100 text-gray-600 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
                            >
                                취소
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? '저장 중...' : '일정 저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
