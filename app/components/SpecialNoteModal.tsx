'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface SpecialNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: string, date: string) => Promise<void>;
    date: string;
    initialContent?: string; // Added optional prop for editing
}

export function SpecialNoteModal({ isOpen, onClose, onSave, date, initialContent = '' }: SpecialNoteModalProps) {
    const [content, setContent] = useState(initialContent);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setContent(initialContent);
        }
    }, [isOpen, initialContent]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow saving empty content


        setSaving(true);
        try {
            await onSave(content, date);
            setContent('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">{initialContent ? '특이사항 수정' : '특이사항 추가'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">
                            날짜: <span className="text-slate-900">{date}</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-32 glass-input resize-none bg-white border-slate-200 text-slate-900"
                            placeholder="특이사항을 입력하세요..."
                            autoFocus
                            required={false}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
