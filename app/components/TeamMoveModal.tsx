'use client';

import { useState } from 'react';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';

interface Team {
    id: string;
    name: string;
}

interface TeamMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceTeam: Team | null;
    teams: Team[];
    onMove: (targetTeamId: string) => Promise<void>;
}

export function TeamMoveModal({ isOpen, onClose, sourceTeam, teams, onMove }: TeamMoveModalProps) {
    const [targetTeamId, setTargetTeamId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !sourceTeam) return null;

    const handleSubmit = async () => {
        if (!targetTeamId) {
            alert('이동할 대상을 선택해주세요.');
            return;
        }
        if (sourceTeam.id === targetTeamId) {
            alert('동일한 조로는 이동할 수 없습니다.');
            return;
        }

        if (confirm(`${sourceTeam.name}의 모든 인원을 선택한 조로 이동하시겠습니까?\n대상 조의 기존 인원은 근무표에서 제외됩니다.`)) {
            setIsSubmitting(true);
            try {
                await onMove(targetTeamId);
                onClose();
            } catch (error) {
                console.error(error);
                alert('팀 이동 중 오류가 발생했습니다.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Filter out source team from options
    const targetOptions = teams.filter(t => t.id !== sourceTeam.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ArrowRight className="w-5 h-5" />
                        팀 단위 이동
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-center flex-1">
                            <div className="text-xs text-slate-500 mb-1">현재 (Source)</div>
                            <div className="font-bold text-indigo-600 text-lg">{sourceTeam.name}</div>
                        </div>
                        <ArrowRight className="text-slate-400" />
                        <div className="text-center flex-1">
                            <div className="text-xs text-slate-500 mb-1">이동 (Target)</div>
                            {targetTeamId ? (
                                <div className="font-bold text-purple-600 text-lg">
                                    {teams.find(t => t.id === targetTeamId)?.name}
                                </div>
                            ) : (
                                <div className="text-slate-400 text-sm italic">선택 대기</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">이동할 대상 조 선택</label>
                        <select
                            value={targetTeamId}
                            onChange={(e) => setTargetTeamId(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        >
                            <option value="">조 선택...</option>
                            {targetOptions.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            <strong>주의:</strong> 이동 시 대상 조({teams.find(t => t.id === targetTeamId)?.name || '선택된 조'})에 이미 배정된 인원이 있다면,
                            해당 인원은 <u>근무표에서 제외(미배정)</u> 처리됩니다.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !targetTeamId}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? '처리 중...' : '이동 확인'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
