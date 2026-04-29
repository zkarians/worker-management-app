'use client';

import { useState } from 'react';
import { X, Calendar, Trash2, AlertTriangle } from 'lucide-react';

interface ClearRosterModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDate: string;
    onClearCurrent: () => void;
    onClearRange: (startDate: string, endDate: string) => Promise<void>;
}

export function ClearRosterModal({ isOpen, onClose, currentDate, onClearCurrent, onClearRange }: ClearRosterModalProps) {
    const [mode, setMode] = useState<'current' | 'range'>('current');
    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (mode === 'current') {
            onClearCurrent();
            onClose();
        } else {
            if (!startDate || !endDate) return alert('기간을 선택해주세요.');
            if (startDate > endDate) return alert('종료일이 시작일보다 빠를 수 없습니다.');

            if (confirm(`${startDate}부터 ${endDate}까지의 모든 배정 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                setIsSubmitting(true);
                try {
                    await onClearRange(startDate, endDate);
                    onClose();
                } catch (error) {
                    console.error(error);
                    alert('기간 초기화 중 오류가 발생했습니다.');
                } finally {
                    setIsSubmitting(false);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        배정 초기화
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('current')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'current' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            현재 날짜 초기화 ({currentDate})
                        </button>
                        <button
                            onClick={() => setMode('range')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'range' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            기간 지정 초기화
                        </button>
                    </div>

                    {mode === 'current' ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                현재 선택된 날짜 (<strong>{currentDate}</strong>)의 모든 배정 정보와 청소/파레트 담당 설정을 초기화합니다.
                            </p>
                            <p className="text-xs text-slate-500">
                                * '확인'을 누르면 화면에서만 지워지며, <strong>[저장하기]</strong> 버튼을 눌러야 완전히 반영됩니다.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-red-700">주의: 즉시 삭제됩니다</p>
                                    <p className="text-xs text-red-600 leading-relaxed">
                                        기간 초기화는 '저장' 버튼을 누르지 않아도 <strong>즉시 서버에서 삭제</strong>되며, 되돌릴 수 없습니다.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">시작일</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">종료일</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${mode === 'current' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700'}`}
                        >
                            {isSubmitting ? '처리 중...' : (mode === 'current' ? '초기화 (임시)' : '영구 삭제')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
