'use client';

import { useState, useEffect, useRef } from 'react';
import { Shield, Search, Trash2, ToggleLeft, ToggleRight, Upload, Download, Plus, ArrowLeft, X } from 'lucide-react';
import { GlassCard } from '@/app/components/GlassCard';
import * as XLSX from 'xlsx';
import Link from 'next/link';

interface SafetyItem {
    id: string;
    content: string;
    isActive: boolean;
    createdAt: string;
}

export default function SafetyEducationPage() {
    const [items, setItems] = useState<SafetyItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [newContent, setNewContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/safety-education');
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newContent.trim()) return;
        try {
            await fetch('/api/settings/safety-education', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent.trim() }),
            });
            setNewContent('');
            setIsAdding(false);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggle = async (item: SafetyItem) => {
        try {
            await fetch('/api/settings/safety-education', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
            });
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/settings/safety-education?id=${id}`, { method: 'DELETE' });
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('전체 안전교육 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
        try {
            // Delete all by uploading empty with replaceAll
            await fetch('/api/settings/safety-education', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: ['임시항목'], replaceAll: true }),
            });
            // Delete the temp item
            const res = await fetch('/api/settings/safety-education');
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                await fetch(`/api/settings/safety-education?id=${data[0].id}`, { method: 'DELETE' });
            }
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [{ '안전교육내용': '예시: 작업 전 안전장구 착용 여부를 반드시 확인한다.' }];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '안전교육');
        XLSX.writeFile(wb, '안전교육내용_등록양식.xlsx');
    };

    const handleDownloadAll = () => {
        const exportData = items.map((item, idx) => ({
            '번호': idx + 1,
            '안전교육내용': item.content,
            '활성': item.isActive ? 'Y' : 'N',
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '안전교육');
        XLSX.writeFile(wb, '안전교육내용_전체.xlsx');
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                const contents: string[] = data
                    .map((row: any) => row['안전교육내용']?.toString().trim())
                    .filter(Boolean);

                if (contents.length === 0) {
                    alert('"안전교육내용" 컬럼이 없거나 내용이 없습니다.');
                    return;
                }

                const replaceAll = confirm(
                    `${contents.length}개의 항목을 발견했습니다.\n\n[확인] 기존 전체 삭제 후 새로 등록\n[취소] 기존 항목 유지하며 추가`
                );

                setLoading(true);
                const res = await fetch('/api/settings/safety-education', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: contents, replaceAll }),
                });
                const result = await res.json();
                if (res.ok) {
                    alert(`${result.imported}개 등록 완료! (전체 ${result.total}개)`);
                    fetchItems();
                } else {
                    throw new Error(result.error || '업로드 실패');
                }
            } catch (err: any) {
                alert('업로드 중 오류: ' + err.message);
            } finally {
                setLoading(false);
                e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const filtered = items.filter(item =>
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const activeCount = items.filter(i => i.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/settings" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield size={24} className="text-indigo-600" />
                        안전교육 내용 관리
                    </h1>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        전체 {items.length}개 / 활성 {activeCount}개
                    </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleExcelUpload}
                    />
                    <button
                        onClick={handleDownloadTemplate}
                        className="glass-button bg-white text-slate-600 border-slate-200 flex items-center gap-1.5 text-sm"
                    >
                        <Download size={15} /> 양식 다운
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="glass-button bg-white text-green-600 border-green-200 flex items-center gap-1.5 text-sm"
                    >
                        <Upload size={15} /> 엑셀 업로드
                    </button>
                    <button
                        onClick={handleDownloadAll}
                        className="glass-button bg-white text-indigo-600 border-indigo-200 flex items-center gap-1.5 text-sm"
                    >
                        <Download size={15} /> 전체 다운
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-primary glass-button flex items-center gap-1.5 text-sm"
                    >
                        <Plus size={15} /> 항목 추가
                    </button>
                </div>
            </div>

            {/* Add New Item */}
            {isAdding && (
                <GlassCard className="bg-indigo-50 border-indigo-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            placeholder="새 안전교육 내용 입력 후 Enter..."
                            className="flex-1 glass-input bg-white border-indigo-300 focus:border-indigo-500"
                            autoFocus
                        />
                        <button onClick={handleAdd} className="btn-primary glass-button px-4">추가</button>
                        <button onClick={() => { setIsAdding(false); setNewContent(''); }}
                            className="glass-button bg-white text-slate-500 border-slate-200 px-3">
                            <X size={16} />
                        </button>
                    </div>
                </GlassCard>
            )}

            {/* Search */}
            <GlassCard className="bg-white border-slate-200 py-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="교육 내용 검색..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full glass-input pl-10 bg-slate-50 border-slate-200"
                    />
                </div>
            </GlassCard>

            {/* List */}
            <GlassCard className="bg-white border-slate-200 p-0 overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-slate-400">불러오는 중...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 안전교육 항목이 없습니다.'}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filtered.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group ${!item.isActive ? 'opacity-50' : ''}`}
                            >
                                <span className="text-xs font-mono text-slate-400 w-8 shrink-0 text-right">
                                    {items.indexOf(item) + 1}
                                </span>
                                <p className="flex-1 text-sm text-slate-800 leading-relaxed">{item.content}</p>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                        onClick={() => handleToggle(item)}
                                        className={`p-1.5 rounded-lg transition-colors ${item.isActive ? 'text-indigo-500 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                        title={item.isActive ? '비활성화' : '활성화'}
                                    >
                                        {item.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Danger Zone */}
            {items.length > 0 && (
                <div className="text-right">
                    <button
                        onClick={handleDeleteAll}
                        className="text-xs text-red-400 hover:text-red-600 underline transition-colors"
                    >
                        전체 항목 삭제
                    </button>
                </div>
            )}
        </div>
    );
}
