'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { Users, Search, Filter, Check, X, Edit2, Trash2 } from 'lucide-react';

interface User {
    id: string;
    name: string;
    username: string;
    company: { name: string } | null;
    role: string;
    isApproved: boolean;
    hireDate: string;
    carNumber: string;
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        companyId: '',
        hireDate: '',
        carNumber: '',
        role: 'WORKER'
    });

    const [isAddingUser, setIsAddingUser] = useState(false);
    const [addForm, setAddForm] = useState({
        username: '',
        password: '',
        name: '',
        companyId: '',
        hireDate: '',
        carNumber: '',
        role: 'WORKER'
    });

    useEffect(() => {
        fetchWorkers();
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/companies');
            const data = await res.json();
            if (data.companies) setCompanies(data.companies);
        } catch (error) {
            console.error('Failed to fetch companies', error);
        }
    };

    const fetchWorkers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.users) {
                // Show all users (both WORKER and MANAGER)
                setWorkers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch workers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, isApproved: boolean) => {
        try {
            await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, isApproved }),
            });
            fetchWorkers();
        } catch (error) {
            console.error('Failed to update user', error);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            companyId: user.company ? (companies.find(c => c.name === user.company?.name)?.id || '') : '',
            hireDate: user.hireDate ? new Date(user.hireDate).toISOString().split('T')[0] : '',
            carNumber: user.carNumber || '',
            role: user.role || 'WORKER'
        });
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addForm),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create user');

            alert(`${addForm.role === 'MANAGER' ? '관리자' : '근무자'}가 추가되었습니다.`);
            setIsAddingUser(false);
            setAddForm({
                username: '',
                password: '',
                name: '',
                companyId: '',
                hireDate: '',
                carNumber: '',
                role: 'WORKER'
            });
            fetchWorkers();
        } catch (error: any) {
            console.error('Create failed', error);
            alert(error.message || '추가에 실패했습니다.');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: editingUser.id,
                    name: editForm.name,
                    role: editForm.role,
                    companyId: editForm.companyId,
                    carNumber: editForm.carNumber,
                    hireDate: editForm.hireDate
                }),
            });

            if (!res.ok) throw new Error('Failed to update');

            alert('수정되었습니다.');
            setEditingUser(null);
            fetchWorkers();
        } catch (error) {
            console.error('Update failed', error);
            alert('수정에 실패했습니다.');
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`정말로 ${user.name} 님을 삭제하시겠습니까?`)) return;

        try {
            const res = await fetch(`/api/users?id=${user.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            alert('삭제되었습니다.');
            fetchWorkers();
        } catch (error: any) {
            console.error('Delete failed', error);
            alert(error.message || '삭제에 실패했습니다.');
        }
    };

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Users /> 사용자 관리
                </h1>
                <button
                    onClick={() => setIsAddingUser(true)}
                    className="btn-primary glass-button bg-indigo-600 hover:bg-indigo-500"
                >
                    + 사용자 추가
                </button>
            </div>

            {/* Search and Filter */}
            <GlassCard className="flex gap-4 bg-white border-slate-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="이름 또는 소속 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full glass-input pl-10 bg-white border-slate-200 text-slate-900"
                    />
                </div>
            </GlassCard>

            {/* Desktop Table View */}
            <GlassCard className="hidden md:block overflow-hidden p-0 bg-white border-slate-200">
                <table className="w-full text-left text-sm text-slate-500">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">이름 / 아이디</th>
                            <th className="px-6 py-4">역할</th>
                            <th className="px-6 py-4">소속</th>
                            <th className="px-6 py-4">입사일</th>
                            <th className="px-6 py-4">차량번호</th>
                            <th className="px-6 py-4">상태</th>
                            <th className="px-6 py-4 text-right">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredWorkers.map((worker) => (
                            <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${worker.role === 'MANAGER'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {worker.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{worker.name}</p>
                                            <p className="text-xs text-slate-500">@{worker.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.role === 'MANAGER'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {worker.role === 'MANAGER' ? '관리자' : '근무자'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-700">{worker.company?.name || '-'}</td>
                                <td className="px-6 py-4 text-slate-700">{worker.hireDate ? new Date(worker.hireDate).toLocaleDateString() : '-'}</td>
                                <td className="px-6 py-4 text-slate-700">{worker.carNumber || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${worker.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {worker.isApproved ? '승인됨' : '대기중'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {!worker.isApproved && (
                                            <button
                                                onClick={() => handleApprove(worker.id, true)}
                                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                title="승인"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        {worker.isApproved && (
                                            <button
                                                onClick={() => handleApprove(worker.id, false)}
                                                className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                                                title="승인 취소"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(worker)}
                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                            title="수정"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(worker)}
                                            className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredWorkers.length === 0 ? (
                    <GlassCard className="bg-white border-slate-200">
                        <p className="text-center text-gray-500 py-8">
                            사용자가 없습니다.
                        </p>
                    </GlassCard>
                ) : (
                    filteredWorkers.map((worker) => (
                        <GlassCard key={worker.id} className="bg-white border-slate-200 p-4">
                            <div className="space-y-3">
                                {/* Header with avatar, name, and role */}
                                <div className="flex items-start gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${worker.role === 'MANAGER'
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {worker.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 text-base">{worker.name}</h3>
                                        <p className="text-sm text-slate-500">@{worker.username}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${worker.role === 'MANAGER'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {worker.role === 'MANAGER' ? '관리자' : '근무자'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${worker.isApproved
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {worker.isApproved ? '승인됨' : '대기중'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium">소속</p>
                                        <p className="text-sm text-slate-700 font-medium">{worker.company?.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium">차량번호</p>
                                        <p className="text-sm text-slate-700 font-medium">{worker.carNumber || '-'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-xs text-slate-500 font-medium">입사일</p>
                                        <p className="text-sm text-slate-700 font-medium">
                                            {worker.hireDate ? new Date(worker.hireDate).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                    {!worker.isApproved && (
                                        <button
                                            onClick={() => handleApprove(worker.id, true)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} />
                                            승인
                                        </button>
                                    )}
                                    {worker.isApproved && (
                                        <button
                                            onClick={() => handleApprove(worker.id, false)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <X size={16} />
                                            승인취소
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(worker)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={16} />
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(worker)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setEditingUser(null)} />
                    <div className="flex min-h-full items-start justify-center p-4 py-20 sm:py-24">
                        <GlassCard className="relative transform overflow-visible rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-md p-6 space-y-4 border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">사용자 정보 수정</h2>

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">이름</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">역할</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    >
                                        <option value="WORKER">근무자</option>
                                        <option value="MANAGER">관리자</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">소속 회사</label>
                                    <select
                                        value={editForm.companyId}
                                        onChange={(e) => setEditForm({ ...editForm, companyId: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    >
                                        <option value="">소속 없음</option>
                                        {companies.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">입사일</label>
                                    <input
                                        type="date"
                                        value={editForm.hireDate}
                                        onChange={(e) => setEditForm({ ...editForm, hireDate: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">차량번호</label>
                                    <input
                                        type="text"
                                        value={editForm.carNumber}
                                        onChange={(e) => setEditForm({ ...editForm, carNumber: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="px-4 py-2 rounded text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary glass-button"
                                    >
                                        저장
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddingUser && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAddingUser(false)} />
                    <div className="flex min-h-full items-start justify-center p-4 py-20 sm:py-24">
                        <GlassCard className="relative transform overflow-visible rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-md p-6 space-y-4 border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">사용자 추가</h2>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">아이디</label>
                                        <input
                                            type="text"
                                            value={addForm.username}
                                            onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                                            className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">비밀번호</label>
                                        <input
                                            type="password"
                                            value={addForm.password}
                                            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                            className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">이름</label>
                                    <input
                                        type="text"
                                        value={addForm.name}
                                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">역할</label>
                                    <select
                                        value={addForm.role}
                                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    >
                                        <option value="WORKER">근무자</option>
                                        <option value="MANAGER">관리자</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">소속 회사</label>
                                    <select
                                        value={addForm.companyId}
                                        onChange={(e) => setAddForm({ ...addForm, companyId: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    >
                                        <option value="">소속 없음</option>
                                        {companies.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">입사일</label>
                                    <input
                                        type="date"
                                        value={addForm.hireDate}
                                        onChange={(e) => setAddForm({ ...addForm, hireDate: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">차량번호</label>
                                    <input
                                        type="text"
                                        value={addForm.carNumber}
                                        onChange={(e) => setAddForm({ ...addForm, carNumber: e.target.value })}
                                        className="glass-input w-full bg-white border-slate-200 text-slate-900"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingUser(false)}
                                        className="px-4 py-2 rounded text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary glass-button"
                                    >
                                        추가
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
}
