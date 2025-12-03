'use client';

import { useState } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { X, Copy, Calendar } from 'lucide-react';

interface BulkCopyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BulkCopyModal({ isOpen, onClose, onSuccess }: BulkCopyModalProps) {
    const [sourceDate, setSourceDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [excludeHolidays, setExcludeHolidays] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/roster/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceDate,
                    startDate,
                    endDate,
                    excludeHolidays
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to copy roster');
            }

            alert(`성공적으로 복사되었습니다. (${data.count}일)`);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <GlassCard className="w-full max-w-md relative animate-fade-in bg-white border-slate-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Copy className="text-blue-600" size={24} />
                    근무표 일괄 복사
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">복사할 원본 날짜</label>
                        <input
                            type="date"
                            required
                            value={sourceDate}
                            onChange={(e) => setSourceDate(e.target.value)}
                            className="glass-input w-full bg-white border-slate-200"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">시작일</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="glass-input w-full bg-white border-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">종료일</label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="glass-input w-full bg-white border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="excludeHolidays"
                            checked={excludeHolidays}
                            onChange={(e) => setExcludeHolidays(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="excludeHolidays" className="text-sm text-slate-600">
                            주말 및 공휴일 제외
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? '처리중...' : '복사하기'}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
