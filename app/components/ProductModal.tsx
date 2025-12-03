'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id?: string;
    name: string;
    width: number;
    depth: number;
    height: number;
    weight?: number | null;
    cbm?: number | null;
    division?: string | null;
    notes?: string | null;  // 비고
    categoryId: string | null;
    author?: { name: string };
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => Promise<void>;
    categories: Category[];
    initialData?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSave, categories, initialData }: ProductModalProps) {
    const [formData, setFormData] = useState<Product>({
        name: '',
        width: 0,
        depth: 0,
        height: 0,
        weight: 0,
        cbm: 0,
        division: '',
        notes: '',
        categoryId: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    name: '',
                    width: 0,
                    depth: 0,
                    height: 0,
                    weight: 0,
                    cbm: 0,
                    division: '',
                    notes: '',
                    categoryId: categories.length > 0 ? categories[0].id : ''
                });
            }
        }
    }, [isOpen, initialData, categories]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-md p-6 space-y-4 bg-white shadow-xl border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">
                        {initialData ? '제품 수정' : '제품 추가'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">제품명</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="glass-input w-full"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">카테고리</label>
                        <select
                            value={formData.categoryId || ''}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="glass-input w-full"
                        >
                            <option value="">선택 안함</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">사업부</label>
                        <input
                            type="text"
                            value={formData.division || ''}
                            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                            className="glass-input w-full"
                            placeholder="사업부 입력"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">가로 (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.width}
                                onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                                className="glass-input w-full"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">세로 (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.depth}
                                onChange={(e) => setFormData({ ...formData, depth: parseFloat(e.target.value) })}
                                className="glass-input w-full"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">높이 (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                                className="glass-input w-full"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">무게 (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.weight || ''}
                                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                className="glass-input w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">CBM</label>
                            <input
                                type="number"
                                step="0.001"
                                value={formData.cbm || ''}
                                onChange={(e) => setFormData({ ...formData, cbm: parseFloat(e.target.value) })}
                                className="glass-input w-full"
                            />
                        </div>
                    </div>

                    {/* 비고 필드 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">비고</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="glass-input w-full min-h-[80px] resize-y"
                            placeholder="추가 정보를 입력하세요..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary glass-button flex items-center gap-2"
                        >
                            <Save size={18} />
                            {saving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
