'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { useUser } from '@/app/components/UserContext';
import { Settings, Lock, Building, Trash2, Plus, Users as UsersIcon, Monitor, Server, User, Edit2, Check, X, Shield, Upload, Download, ExternalLink, Camera, Database, Terminal } from 'lucide-react';
import { useSettings } from '@/app/components/SettingsContext';
import * as XLSX from 'xlsx';
import Link from 'next/link';

interface UserProfile {
    id: string;
    name: string;
    username: string;
    company?: { id: string; name: string } | null;
    email: string | null;
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
    const [productLoadMode, setProductLoadMode] = useState<'search' | 'all'>('all');
    const [isSavingSystem, setIsSavingSystem] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        carNumber: '',
        hireDate: ''
    });
    const [mounted, setMounted] = useState(false);


    const fetchSystemConfig = async () => {
        try {
            const res = await fetch(`/api/system/settings?key=productLoadMode&_t=${Date.now()}`);
            const data = await res.json();
            if (data.value) setProductLoadMode(data.value);
        } catch (error) {
            console.error('Failed to fetch system config', error);
        }
    };

    const handleSaveProductLoadMode = async (mode: 'search' | 'all') => {
        setIsSavingSystem(true);
        try {
            await fetch('/api/system/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'productLoadMode', value: mode }),
            });
            setProductLoadMode(mode);
            alert('설정이 저장되었습니다.');
        } catch (error) {
            console.error('Failed to save config', error);
            alert('설정 저장에 실패했습니다.');
        } finally {
            setIsSavingSystem(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                setUserProfile(data.user);
                setProfileForm({
                    name: data.user.name || '',
                    email: data.user.email || '',
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
                    email: profileForm.email,
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

    useEffect(() => {
        setMounted(true);
        if (user?.role === 'MANAGER') {
            fetchCompanies();
            fetchSystemConfig();
        }
        fetchUserProfile();
    }, [user]);

    const {
        sidebarFontSize, setSidebarFontSize,
        mainFontSize, setMainFontSize,
        fontFamily, setFontFamily
    } = useSettings();

    if (!mounted) return null;

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
                                <label className="block text-sm font-medium text-slate-700 mb-1">이메일 (비밀번호 찾기용)</label>
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    className="w-full glass-input bg-white border-slate-200 text-slate-900"
                                    placeholder="예: worker@example.com"
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
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Lock size={18} /> 비밀번호 변경
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">현재 비밀번호</label>
                            <input
                                type="password"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호</label>
                            <input
                                type="password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호 확인</label>
                            <input
                                type="password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        {message && <p className="text-red-500 text-sm">{message}</p>}
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


                {/* Safety Education Management */}
                {user?.role === 'MANAGER' && <SafetyEducationManagement />}

                {/* TBM Page 2 Photo Management */}
                {user?.role === 'MANAGER' && <TbmPhotoManagement />}

                {/* Database Management - Move to own slot for better visibility */}
                {user?.role === 'MANAGER' && <DatabaseManagement />}

                {/* Worker Management (Manager Only) */}
                {user?.role === 'MANAGER' && <WorkerPasswordReset />}

                {/* Company & Team Management (Manager Only) */}
                {user?.role === 'MANAGER' && (
                    <div className="space-y-6">
                        <GlassCard>
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
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
                                <CompanyList companies={companies} onDelete={handleDeleteCompany} onUpdate={fetchCompanies} />
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Monitor size={18} /> 시스템 설정
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        제품 정보 로딩 방식
                                    </label>
                                    <div className="text-xs text-slate-500 mb-3">
                                        등록된 제품이 많아질 경우 화면 로딩 속도나 리소스를 절약하기 위해, 처음에는 제품을 불러오지 않고 검색 시에만 목록이 나타나도록(검색 모드) 설정할 수 있습니다.
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveProductLoadMode('all')}
                                            disabled={isSavingSystem}
                                            className={`flex-1 py-2 rounded-lg border transition-all text-sm flex items-center justify-center gap-2 ${productLoadMode === 'all'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            {productLoadMode === 'all' && <Check size={16} />}
                                            전체 로드 (기본)
                                        </button>
                                        <button
                                            onClick={() => handleSaveProductLoadMode('search')}
                                            disabled={isSavingSystem}
                                            className={`flex-1 py-2 rounded-lg border transition-all text-sm flex items-center justify-center gap-2 ${productLoadMode === 'search'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            {productLoadMode === 'search' && <Check size={16} />}
                                            검색 시에만 로드
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <TeamManagement />
                    </div>
                )}
            </div>
        </div>
    );
}

export function TbmPhotoManagement() {
    const [photos, setPhotos] = useState<{ photo1: string | null; photo2: string | null }>({
        photo1: null,
        photo2: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res1 = await fetch('/api/system/settings?key=tbm_photo_1');
                const data1 = await res1.json();
                const res2 = await fetch('/api/system/settings?key=tbm_photo_2');
                const data2 = await res2.json();
                setPhotos({
                    photo1: data1.value,
                    photo2: data2.value,
                });
            } catch (err) {
                console.error('Failed to fetch TBM photos:', err);
            }
        };
        fetchPhotos();
    }, []);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'photo1' | 'photo2') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 4MB size limit check
        const maxSize = 4 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('사진 용량이 너무 큽니다. 4MB 이하의 이미지를 사용해주세요.');
            return;
        }

        setLoading(true);
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const dbKey = key === 'photo1' ? 'tbm_photo_1' : 'tbm_photo_2';
            const res = await fetch('/api/system/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: dbKey, value: base64 }),
            });

            if (res.ok) {
                setPhotos(prev => ({ ...prev, [key]: base64 }));
                alert('사진이 저장되었습니다.');
            } else {
                const errorData = await res.json().catch(() => ({}));
                if (res.status === 413) {
                    alert('파일 용량이 서버 제한을 초과했습니다. 더 작은 이미지를 선택해주세요.');
                } else {
                    alert(`저장 실패: ${errorData.error || '알 수 없는 오류가 발생했습니다.'}`);
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
            // Reset input so the same file can be selected again if needed
            e.target.value = '';
        }
    };

    return (
        <GlassCard>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Camera size={18} /> TBM 2페이지 사진 설정
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['photo1', 'photo2'].map((key) => (
                    <div key={key} className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 capitalize">
                            사진 {key === 'photo1' ? '1' : '2'}
                        </label>
                        <div className="relative group aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                            {photos[key as keyof typeof photos] ? (
                                <img
                                    src={photos[key as keyof typeof photos]!}
                                    alt={`TBM ${key}`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <Camera className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-xs text-slate-400">사진이 없습니다.</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handlePhotoUpload(e, key as any)}
                                disabled={loading}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="text-white text-xs font-medium">클릭하여 사진 변경</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
                * 여기에 등록된 사진은 TBM 2페이지 하단에 좌우로 표시됩니다. (용량이 큰 이미지는 로딩이 느려질 수 있습니다.)
            </p>
        </GlassCard>
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
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
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
                <TeamList teams={teams} onDelete={handleDeleteTeam} onUpdate={fetchTeams} />
            </div>
        </GlassCard>
    );
}

function CompanyList({ companies, onDelete, onUpdate }: { companies: { id: string; name: string }[], onDelete: (id: string) => void, onUpdate: () => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const startEdit = (company: { id: string; name: string }) => {
        setEditingId(company.id);
        setEditName(company.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = async (id: string) => {
        if (!editName.trim()) return;
        try {
            await fetch('/api/companies', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editName }),
            });
            onUpdate();
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update company', error);
        }
    };

    return (
        <>
            {companies.map(company => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group border border-transparent hover:border-slate-200 transition-colors">
                    {editingId === company.id ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                                autoFocus
                            />
                            <button onClick={() => saveEdit(company.id)} className="text-green-600 hover:text-green-500 p-1">
                                <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="text-red-500 hover:text-red-400 p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <span className="text-slate-700 font-medium">{company.name}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(company)}
                                    className="text-indigo-500 hover:text-indigo-600 p-1"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(company.id)}
                                    className="text-red-500 hover:text-red-600 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </>
    );
}

function TeamList({ teams, onDelete, onUpdate }: { teams: { id: string; name: string }[], onDelete: (id: string) => void, onUpdate: () => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const startEdit = (team: { id: string; name: string }) => {
        setEditingId(team.id);
        setEditName(team.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = async (id: string) => {
        if (!editName.trim()) return;
        try {
            await fetch('/api/teams', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editName }),
            });
            onUpdate();
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update team', error);
        }
    };

    return (
        <>
            {teams.map(team => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group border border-transparent hover:border-slate-200 transition-colors">
                    {editingId === team.id ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                                autoFocus
                            />
                            <button onClick={() => saveEdit(team.id)} className="text-green-600 hover:text-green-500 p-1">
                                <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="text-red-500 hover:text-red-400 p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <span className="text-slate-700 font-medium">{team.name}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(team)}
                                    className="text-indigo-500 hover:text-indigo-600 p-1"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(team.id)}
                                    className="text-red-500 hover:text-red-600 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </>
    );
}

function WorkerPasswordReset() {
    const [workers, setWorkers] = useState<{ id: string; name: string; username: string }[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.users) {
                setWorkers(data.users.filter((u: any) => u.role === 'WORKER'));
            }
        } catch (error) {
            console.error('Failed to fetch workers', error);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!selectedWorkerId || !newPassword) {
            setMessage('근로자와 새 비밀번호를 입력해주세요.');
            return;
        }

        if (!confirm('정말 이 근로자의 비밀번호를 변경하시겠습니까?')) {
            return;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedWorkerId,
                    password: newPassword
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Password update failed');
            }

            setMessage('비밀번호가 성공적으로 변경되었습니다.');
            setNewPassword('');
            setSelectedWorkerId('');
        } catch (error: any) {
            setMessage(error.message || '비밀번호 변경에 실패했습니다.');
        }
    };

    return (
        <GlassCard>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Lock size={18} /> 근로자 비밀번호 관리
            </h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">근로자 선택</label>
                    <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        className="w-full glass-input bg-white border-slate-200 text-slate-900"
                    >
                        <option value="">선택하세요</option>
                        {workers.map(worker => (
                            <option key={worker.id} value={worker.id}>
                                {worker.name} ({worker.username})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호</label>
                    <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full glass-input bg-white border-slate-200 text-slate-900"
                        placeholder="새 비밀번호 입력"
                    />
                </div>
                {message && (
                    <p className={`text-sm ${message.includes('성공') ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
                <button type="submit" className="btn-primary glass-button w-full">
                    비밀번호 변경
                </button>
            </form>
        </GlassCard>
    );
}

export function SafetyEducationManagement() {
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [activeCount, setActiveCount] = useState<number | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const res = await fetch('/api/settings/safety-education');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTotalCount(data.length);
                setActiveCount(data.filter((d: any) => d.isActive).length);
            }
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
                setImporting(true);
                const res = await fetch('/api/settings/safety-education', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: contents, replaceAll }),
                });
                const result = await res.json();
                if (res.ok) {
                    alert(`${result.imported}개 등록 완료! (전체 ${result.total}개)`);
                    fetchCounts();
                } else {
                    throw new Error(result.error || '업로드 실패');
                }
            } catch (err: any) {
                alert('업로드 중 오류: ' + err.message);
            } finally {
                setImporting(false);
                e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <GlassCard>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Shield size={18} /> 일일 안전교육 내용 관리
                </h2>
                <Link
                    href="/dashboard/safety-education"
                    className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                    교육내용 확인 · 관리 <ExternalLink size={14} />
                </Link>
            </div>
            <div className="text-xs text-slate-500 mb-4">
                TBM 일지에 출력될 안전교육 내용을 관리합니다. 날짜에 따라 로테이션으로 3개가 표시됩니다.
            </div>

            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 mb-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{totalCount ?? '-'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">전체 항목</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{activeCount ?? '-'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">활성 항목</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">3</p>
                    <p className="text-xs text-slate-500 mt-0.5">일일 표시</p>
                </div>
            </div>

            <input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                className="hidden"
                onChange={handleExcelUpload}
            />
            <div className="flex gap-2">
                <button
                    onClick={handleDownloadTemplate}
                    className="flex-1 glass-button bg-white text-slate-600 border-slate-200 flex items-center justify-center gap-1.5 text-sm py-2"
                >
                    <Download size={15} /> 양식 다운
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="flex-1 glass-button bg-white text-green-600 border-green-200 hover:bg-green-50 flex items-center justify-center gap-1.5 text-sm py-2"
                >
                    <Upload size={15} /> {importing ? '업로드 중...' : '엑셀 업로드'}
                </button>
            </div>
        </GlassCard>
    );
}

function DatabaseManagement() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [includeProductsInJson, setIncludeProductsInJson] = useState(false);
    const jsonFileInputRef = useRef<HTMLInputElement>(null);

    const handleJsonBackup = async () => {
        if (includeProductsInJson) {
            const proceed = confirm(
                "⚠️ 경고: 제품 정보(22만여 건)를 포함하여 백업하시겠습니까?\n\n이 대용량 데이터 전송 작업은 서버 리소스를 많이 소모하며, Vercel 서버리스 환경에서 메모리 초과 또는 타임아웃(Timeout)으로 인해 백업이 실패할 가능성이 높습니다."
            );
            if (!proceed) return;
        }

        setIsExporting(true);
        setStatus({ type: 'info', message: '데이터를 추출 중입니다 (JSON)...' });
        try {
            const res = await fetch(`/api/system/db/export?includeProducts=${includeProductsInJson}`);
            if (!res.ok) throw new Error('백업 실패');
            const result = await res.json();
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `worker_db_backup_${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setStatus({ type: 'success', message: 'JSON 백업 파일이 생성되었습니다.' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: '백업 중 오류가 발생했습니다.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleJsonRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!confirm("정말 데이터베이스 복구를 진행하시겠습니까?\n\n주의: 기존 데이터가 모두 삭제되고 업로드한 백업 파일의 데이터로 대체됩니다.")) { e.target.value = ''; return; }

        setIsImporting(true);
        setStatus({ type: 'info', message: 'JSON 데이터를 복구 중입니다...' });
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);

                    if (data.products && data.products.length > 0) {
                        const proceed = confirm(
                            "⚠️ 경고: 업로드한 백업 파일에 제품 정보(22만여 건)가 포함되어 있습니다.\n\n이 대용량 데이터를 복구하는 과정에서 트랜잭션 타임아웃이 발생하거나 데이터베이스 부하가 급증할 수 있습니다. 정말 진행하시겠습니까?"
                        );
                        if (!proceed) {
                            setIsImporting(false);
                            e.target.value = '';
                            return;
                        }
                    }

                    const res = await fetch('/api/system/db/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    if (!res.ok) throw new Error('복구 실패');
                    setStatus({ type: 'success', message: '복구가 완료되었습니다.' });
                } catch (err: any) {
                    console.error(err);
                    setStatus({ type: 'error', message: err.message || '복구 처리 중 오류가 발생했습니다.' });
                } finally {
                    setIsImporting(false);
                    e.target.value = '';
                }
            };
            reader.readAsText(file);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: '파일을 읽는 중 오류가 발생했습니다.' });
            setIsImporting(false);
        }
    };

    const handleSyncExcel = async () => {
        if (!confirm('정말 Excel DB(제품등록.xlsx)의 치수 정보(가로/세로/높이/무게/CBM)로 DB 제품 데이터를 동기화하시겠습니까?\n\n- 기존에 등록된 모델은 치수만 엑셀 값으로 업데이트되며 카테고리와 사업부는 그대로 보존됩니다.\n- 기존에 없던 새로운 모델은 치수 값만 적용되어 신규 추가되고 카테고리와 사업부는 비어있게(NULL) 등록됩니다.')) return;

        setIsSyncing(true);
        setStatus({ type: 'info', message: 'Excel DB 규격 동기화를 진행 중입니다. 잠시만 기다려 주세요 (약 5~10초)...' });
        try {
            const res = await fetch('/api/products/sync-excel', {
                method: 'POST'
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || '동기화 실패');
            }
            setStatus({ 
                type: 'success', 
                message: `Excel DB 치수 동기화가 완료되었습니다. (업데이트: ${data.updatedCount.toLocaleString()}건, 신규 등록: ${data.insertedCount.toLocaleString()}건)` 
            });
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || '동기화 진행 중 오류가 발생했습니다.' });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <GlassCard>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Database size={18} /> 데이터베이스 관리
            </h2>
            <div className="space-y-6">
                {/* Description Guidance */}
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        💡 원클릭 백업 및 복구 안내
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        원격 CockroachDB 데이터베이스를 접속 중인 로컬 PC로 원클릭 백업하거나 복구합니다.
                        백업 파일은 브라우저 다운로드를 통해 파일(JSON)로 저장됩니다.
                    </p>
                </div>

                {/* JSON Backup/Restore (Custom) */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-slate-800">백업/복구 옵션</p>
                            <p className="text-[11px] text-slate-400">제품 정보 테이블 포함 여부를 설정합니다.</p>
                        </div>

                        {/* Include Products Toggle */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl px-4">
                            <label className="text-xs text-slate-700 font-semibold cursor-pointer flex items-center gap-2 select-none">
                                <input
                                    type="checkbox"
                                    checked={includeProductsInJson}
                                    onChange={(e) => setIncludeProductsInJson(e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                                제품 정보(대용량) 포함
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={handleJsonBackup}
                            disabled={isExporting || isImporting}
                            className="flex items-center justify-center gap-2 p-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50 shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                            <Download size={18} /> 백업 파일 다운로드
                        </button>
                        <button
                            onClick={() => jsonFileInputRef.current?.click()}
                            disabled={isExporting || isImporting}
                            className="flex items-center justify-center gap-2 p-3.5 bg-white border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-semibold disabled:opacity-50 cursor-pointer"
                        >
                            <Upload size={18} /> 백업 파일 복구하기
                        </button>
                        <input type="file" ref={jsonFileInputRef} onChange={handleJsonRestore} accept=".json" className="hidden" />
                    </div>
                </div>

                {/* Excel DB Specification Sync */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Excel DB 규격 치수 동기화</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <p className="text-xs text-slate-500">
                            로컬 서버의 <strong>제품등록.xlsx</strong>에 기록된 최신 규격(가로, 세로, 높이, 무게, CBM)을 제품 DB에 동기화합니다. 기존 제품의 카테고리/사업부는 변경되지 않고 보존됩니다.
                        </p>
                        <button
                            onClick={handleSyncExcel}
                            disabled={isExporting || isImporting || isSyncing}
                            className="w-full flex items-center justify-center gap-2 p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold disabled:opacity-50 cursor-pointer"
                        >
                            <ExternalLink size={18} /> {isSyncing ? '동기화 진행 중...' : 'Excel 규격 DB 동기화 실행'}
                        </button>
                    </div>
                </div>

                {status && (
                    <div className={`p-3 rounded-lg text-sm break-all ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                        status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                        {status.type === 'info' && <span className="animate-spin text-blue-500 mr-2">⏳</span>}
                        {status.message}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
