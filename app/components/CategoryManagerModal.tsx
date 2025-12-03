'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Category {
    id: string;
    name: string;
}

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onAdd: (name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function CategoryManagerModal({ isOpen, onClose, categories, onAdd, onDelete }: CategoryManagerModalProps) {
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setLoading(true);
        try {
            await onAdd(newCategory);
            setNewCategory('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-md p-6 space-y-4 bg-white shadow-xl border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">카테고리 관리</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="새 카테고리 이름"
                        className="glass-input flex-1"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary glass-button p-3"
                    >
                        <Plus size={20} />
                    </button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-700">{cat.name}</span>
                            <button
                                onClick={() => onDelete(cat.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-center text-slate-400 py-4">등록된 카테고리가 없습니다.</p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
