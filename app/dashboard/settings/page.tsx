'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { useUser } from '@/app/components/UserContext';
import { Settings, Lock, Building, Trash2, Plus, Users as UsersIcon, Monitor, User } from 'lucide-react';
import { useSettings } from '@/app/components/SettingsContext';

interface UserProfile {
    id: string;
    name: string;
    username: string;
    company?: { id: string; name: string } | null;
    hireDate: string | null;
    carNumber: string | null;
}

export default function SettingsPage() {
    const user = useUser();
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [newCompany, setNewCompany] = useState('');
    const [message, setMessage] = useState('');
    const [profileMessage, setProfileMessage] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileForm, setProfileForm] = useState({
        name: '',
        carNumber: '',
        hireDate: ''
    });
    const {
        sidebarFontSize, setSidebarFontSize,
        mainFontSize, setMainFontSize,
        fontFamily, setFontFamily
    } = useSettings();

    useEffect(() => {
        if (user?.role === 'MANAGER') {
            fetchCompanies();
        }
        fetchUserProfile();
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                setUserProfile(data.user);
                setProfileForm({
                    name: data.user.name || '',
                    carNumber: data.user.carNumber || '',
                    hireDate: data.user.hireDate ? new Date(data.user.hireDate).toISOString().split('T')[0] : ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch user profile', error);
        }
    };

    const fetchCompanies = async () => {
        const res = await fetch('/api/companies');
        const data = await res.json();
        if (data.companies) setCompanies(data.companies);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        if (passwordData.new !== passwordData.confirm) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const res = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.current,
                    newPassword: passwordData.new
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Password update failed');
            }

            setMessage('비밀번호가 성공적으로 변경되었습니다.');
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            setMessage(error.message);
        }
    };

    const handleAddCompany = async () => {
        if (!newCompany) return;
        try {
            await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCompany }),
            });
            setNewCompany('');
            fetchCompanies();
        } catch (error) {
            console.error('Failed to add company', error);
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/companies?id=${id}`, {
                method: 'DELETE',
            });
            fetchCompanies();
        } catch (error) {
            console.error('Failed to delete company', error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage('');

        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileForm.name,
                    carNumber: profileForm.carNumber,
                    hireDate: profileForm.hireDate || null
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Profile update failed');
            }

            setProfileMessage('프로필이 성공적으로 업데이트되었습니다.');
            fetchUserProfile(); // Refresh profile data
        } catch (error: any) {
            setProfileMessage(error.message || '프로필 업데이트에 실패했습니다.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Settings /> 설정
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Update (Worker) */}
                {user?.role === 'WORKER' && (
                    <GlassCard className="bg-white border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <User size={18} /> 내 프로필 수정
                        </h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="w-full glass-input bg-white border-slate-200 text-slate-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">차량번호</label>
                                <input
                                    type="text"
                                    value={profileForm.carNumber}
                                    onChange={(e) => setProfileForm({ ...profileForm, carNumber: e.target.value })}
                                    className="w-full glass-input bg-white border-slate-200 text-slate-900"
                                    placeholder="예: 12가3456"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">입사일</label>
                                <input
                                    type="date"
                                    value={profileForm.hireDate}
                                    onChange={(e) => setProfileForm({ ...profileForm, hireDate: e.target.value })}
                                    className="w-full glass-input bg-white border-slate-200 text-slate-900"
                                />
                            </div>
                            {userProfile?.company && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">소속 회사</label>
                                    <input
                                        type="text"
                                        value={userProfile.company.name}
                                        className="w-full glass-input bg-slate-50 border-slate-200 text-slate-500"
                                        disabled
                                    />
                                    <p className="text-xs text-slate-400 mt-1">소속 회사는 관리자에게 문의하세요.</p>
                                </div>
                            )}
                            {profileMessage && (
                                <p className={`text-sm ${profileMessage.includes('성공') ? 'text-green-600' : 'text-red-500'}`}>
                                    {profileMessage}
                                </p>
                            )}
                            <button type="submit" className="btn-primary glass-button w-full bg-indigo-600 hover:bg-indigo-500">
                                프로필 저장
                            </button>
                        </form>
                    </GlassCard>
                )}

                {/* Password Change */}
                <GlassCard>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Lock size={18} /> 비밀번호 변경
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">현재 비밀번호</label>
                            <input
                                type="password"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">새 비밀번호</label>
                            <input
                                type="password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">새 비밀번호 확인</label>
                            <input
                                type="password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        {message && <p className="text-red-400 text-sm">{message}</p>}
                        <button type="submit" className="btn-primary glass-button w-full">
                            비밀번호 변경
                        </button>
                    </form>
                </GlassCard>

                {/* Display Settings */}
                <GlassCard>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Monitor size={18} /> 화면 설정
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-2">좌측 메뉴 글자 크기</label>
                            <div className="flex gap-2">
                                {['small', 'medium', 'large'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSidebarFontSize(size)}
                                        className={`flex-1 py-2 rounded-lg border transition-all ${sidebarFontSize === size
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-2">메인 화면 글자 크기</label>
                            <div className="flex gap-2">
                                {['small', 'medium', 'large'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setMainFontSize(size)}
                                        className={`flex-1 py-2 rounded-lg border transition-all ${mainFontSize === size
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-2">글꼴 (폰트)</label>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full glass-input bg-white border-slate-200"
                            >
                                <option value="Nanum Gothic">나눔고딕 (기본)</option>
                                <option value="Pretendard">Pretendard</option>
                                <option value="Noto Sans KR">Noto Sans KR</option>
                            </select>
                        </div>
                    </div>
                </GlassCard>

                {/* Company & Team Management (Manager Only) */}
                {user?.role === 'MANAGER' && (
                    <div className="space-y-6">
                        <GlassCard>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Building size={18} /> 회사 관리
                            </h2>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newCompany}
                                    onChange={(e) => setNewCompany(e.target.value)}
                                    placeholder="새 회사 이름"
                                    className="flex-1 glass-input"
                                />
                                <button onClick={handleAddCompany} className="btn-primary glass-button">
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {companies.map(company => (
                                    <div key={company.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-gray-200">{company.name}</span>
                                        <button
                                            onClick={() => handleDeleteCompany(company.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <TeamManagement />
                    </div>
                )}
            </div>
        </div>
    );
}

function TeamManagement() {
    const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
    const [newTeam, setNewTeam] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        const res = await fetch('/api/teams');
        const data = await res.json();
        if (data.teams) setTeams(data.teams);
    };

    const handleAddTeam = async () => {
        if (!newTeam) return;
        try {
            await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeam }),
            });
            setNewTeam('');
            fetchTeams();
        } catch (error) {
            console.error('Failed to add team', error);
        }
    };

    const handleDeleteTeam = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까? 이 팀에 할당된 근무 정보가 사라질 수 있습니다.')) return;
        try {
            await fetch(`/api/teams?id=${id}`, {
                method: 'DELETE',
            });
            fetchTeams();
        } catch (error) {
            console.error('Failed to delete team', error);
        }
    };

    return (
        <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UsersIcon size={18} /> 팀 관리
            </h2>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder="새 팀 이름 (예: 4조)"
                    className="flex-1 glass-input"
                />
                <button onClick={handleAddTeam} className="btn-primary glass-button">
                    <Plus size={18} />
                </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {teams.map(team => (
                    <div key={team.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-200">{team.name}</span>
                        <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-400 hover:text-red-300"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
