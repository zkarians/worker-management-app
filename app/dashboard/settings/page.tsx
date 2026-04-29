'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { useUser } from '@/app/components/UserContext';
import { Settings, Lock, Building, Trash2, Plus, Users as UsersIcon, Monitor, Smartphone, User, Edit2, Check, X, Shield, Upload, Download, ExternalLink, Camera, Database, Terminal } from 'lucide-react';
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
    const {
        sidebarFontSize, setSidebarFontSize,
        mainFontSize, setMainFontSize,
        fontFamily, setFontFamily
    } = useSettings();

    useEffect(() => {
        if (user?.role === 'MANAGER') {
            fetchCompanies();
            fetchSystemConfig();
        }
        fetchUserProfile();
    }, [user]);

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
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [config, setConfig] = useState({
        host: 'idlezero.iptime.org',
        port: '5432',
        user: 'postgres',
        password: 'z456qwe12!@',
        dbname: 'work',
        sshPort: '9022'
    });
    const [backupMode, setBackupMode] = useState<'local' | 'remote'>('local');
    const [logs, setLogs] = useState<string[]>([]);
    const [isPolling, setIsPolling] = useState(false);
    const [remoteBackups, setRemoteBackups] = useState<string[]>([]);
    const [isLoadingBackups, setIsLoadingBackups] = useState(false);
    const [saveTo, setSaveTo] = useState<'pc' | 'phone' | 'both'>('both');
    const jsonFileInputRef = useRef<HTMLInputElement>(null);
    const sqlFileInputRef = useRef<HTMLInputElement>(null);

    // Initial load from session/env if possible
    useEffect(() => {
        const fetchCurrentConfig = async () => {
            try {
                const res = await fetch('/api/system/db/config');
                if (res.ok) {
                    const data = await res.json();
                    setConfig(prev => ({ ...prev, ...data }));
                    
                    // Auto-detect local mode if host matches
                    if (data.host === 'localhost' || data.host === '127.0.0.1' || data.host === 'idlezero.iptime.org') {
                        setBackupMode('local');
                    } else {
                        setBackupMode('remote');
                    }
                }
            } catch (e) { console.error('Failed to fetch db config', e); }
        };
        fetchCurrentConfig();
    }, []);

    // Polling logs
    useEffect(() => {
        let interval: any;
        if (isPolling) {
            interval = setInterval(async () => {
                const res = await fetch('/api/system/db/dump/status');
                if (res.ok) {
                    const data = await res.json();
                    if (data.logs) setLogs(data.logs);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPolling]);

    const getQueryString = () => {
        const params = new URLSearchParams(config);
        params.set('localMode', backupMode === 'local' ? 'true' : 'false');
        return params.toString();
    };

    const handleJsonBackup = async () => {
        setIsExporting(true);
        setIsPolling(true);
        setLogs([]);
        setStatus({ type: 'info', message: '데이터를 추출 중입니다 (JSON)...' });
        try {
            const res = await fetch(`/api/system/db/export?${getQueryString()}`);
            if (!res.ok) throw new Error('백업 실패');
            const result = await res.json();
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `worker_db_backup_${config.dbname}_${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setStatus({ type: 'success', message: 'JSON 백업 파일이 생성되었습니다.' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: '백업 중 오류가 발생했습니다.' });
        } finally {
            setIsExporting(false);
            setIsPolling(false);
        }
    };

    const handleSqlBackup = async () => {
        setIsExporting(true);
        setIsPolling(true);
        setLogs([]);
        setStatus({ type: 'info', message: `정식 SQL 백업을 생성 중입니다 (${saveTo})...` });
        try {
            const res = await fetch(`/api/system/db/dump?${getQueryString()}&saveTo=${saveTo}`);
            if (!res.ok) {
                const errData = await res.json();
                const fullError = `${errData.error}${errData.details ? ` (${errData.details})` : ''}`;
                throw new Error(fullError);
            }

            if (saveTo === 'phone') {
                const result = await res.json();
                setStatus({ type: 'success', message: `${backupMode === 'local' ? '서버' : '폰'}에 백업 파일이 생성되었습니다: ${result.path}` });
                fetchRemoteBackups(); // Refresh list
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `worker_db_dump_${config.dbname}_${date}.sql`;
            a.click();
            URL.revokeObjectURL(url);
            setStatus({ type: 'success', message: '정식 SQL 백업 파일(.sql)이 생성되었습니다.' });
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'SQL 백업 중 오류가 발생했습니다.' });
        } finally {
            setIsExporting(false);
            setIsPolling(false);
        }
    };

    const handleJsonRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!confirm(`정말 [${config.host}] 의 [${config.dbname}] DB로 JSON 복구를 진행하시겠습니까?\n\n주의: 기존 데이터가 삭제됩니다.`)) { e.target.value = ''; return; }

        setIsImporting(true);
        setIsPolling(true);
        setLogs([]);
        setStatus({ type: 'info', message: 'JSON 데이터를 복구 중입니다...' });
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const data = JSON.parse(event.target?.result as string);
                const res = await fetch(`/api/system/db/import?${getQueryString()}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error('복구 실패');
                setStatus({ type: 'success', message: '복구가 완료되었습니다.' });
            };
            reader.readAsText(file);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: '복구 오류가 발생했습니다.' });
        } finally {
            setIsImporting(false);
            setIsPolling(false);
        }
    };

    const handleSqlRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!confirm(`정말 [${config.host}] 의 [${config.dbname}] DB로 정식 복구를 진행하시겠습니까?\n\n주의: 모든 내용이 파일 내용으로 교체됩니다.`)) { e.target.value = ''; return; }

        setIsImporting(true);
        setIsPolling(true);
        setLogs([]);
        setStatus({ type: 'info', message: `${backupMode === 'local' ? '로컬 직접' : '원격 SSH'} 복구를 진행 중입니다...` });
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`/api/system/db/restore-sql?${getQueryString()}`, {
                method: 'POST',
                body: formData,
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Non-JSON response:', text);
                throw new Error(`서버 오류 (상태: ${res.status}): ${text.substring(0, 50)}...`);
            }

            if (!res.ok) {
                throw new Error(data.error || 'SQL 복구 실패');
            }
            setStatus({ type: 'success', message: '정식 SQL 복구가 완료되었습니다.' });
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'SQL 복구 중 오류가 발생했습니다.' });
        } finally {
            setIsImporting(false);
            setIsPolling(false);
        }
    };

    const fetchRemoteBackups = async () => {
        setIsLoadingBackups(true);
        try {
            const res = await fetch(`/api/system/db/backups?${getQueryString()}`);
            if (res.ok) {
                const data = await res.json();
                setRemoteBackups(data.files || []);
            } else {
                throw new Error('목록 조회 실패');
            }
        } catch (e) {
            console.error(e);
            setStatus({ type: 'error', message: '백업 목록을 가져오지 못했습니다.' });
        } finally {
            setIsLoadingBackups(false);
        }
    };

    const handleRemoteRestore = async (filename: string) => {
        if (!confirm(`정말 서버에 저장된 [${filename}] 파일로 복구를 진행하시겠습니까?\n\n주의: 모든 내용이 파일 내용으로 교체됩니다.`)) return;

        setIsImporting(true);
        setIsPolling(true);
        setLogs([]);
        setStatus({ type: 'info', message: '서버 파일로 복구를 진행 중입니다...' });
        try {
            const res = await fetch(`/api/system/db/restore-sql?${getQueryString()}&remotePath=${filename}`, {
                method: 'POST'
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Non-JSON response:', text);
                throw new Error(`서버 오류 (상태: ${res.status}): ${text.substring(0, 50)}...`);
            }

            if (!res.ok) {
                throw new Error(data.error || 'SQL 복구 실패');
            }
            setStatus({ type: 'success', message: '정식 SQL 복구가 완료되었습니다.' });
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'SQL 복구 중 오류가 발생했습니다.' });
        } finally {
            setIsImporting(false);
            setIsPolling(false);
        }
    };

    const handleDeleteRemoteBackup = async (filename: string) => {
        if (!confirm(`정말 [${filename}] 파일을 삭제하시겠습니까?`)) return;

        try {
            const res = await fetch(`/api/system/db/backups?${getQueryString()}&filename=${filename}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setStatus({ type: 'success', message: '백업 파일이 삭제되었습니다.' });
                // Refresh list
                setRemoteBackups(prev => prev.filter(f => f !== filename));
            } else {
                const errData = await res.json();
                throw new Error(errData.error || '삭제 실패');
            }
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || '삭제 중 오류가 발생했습니다.' });
        }
    };

    return (
        <GlassCard>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Database size={18} /> 데이터베이스 관리
            </h2>
            <div className="space-y-6">
                {/* Backup Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full">
                    <button
                        onClick={() => setBackupMode('local')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${backupMode === 'local' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Monitor size={18} /> 로컬 PC 백업 (Direct)
                    </button>
                    <button
                        onClick={() => setBackupMode('remote')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${backupMode === 'remote' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Smartphone size={18} /> 원격 폰 백업 (SSH)
                    </button>
                </div>

                {/* Connection Settings */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Settings size={16} /> 백업용 DB 연결 설정
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">호스트 (Host)</label>
                            <input
                                type="text"
                                value={config.host}
                                onChange={e => setConfig({ ...config, host: e.target.value })}
                                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="idlezero.iptime.org"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">포트 (Port)</label>
                            <input
                                type="text"
                                value={config.port}
                                onChange={e => setConfig({ ...config, port: e.target.value })}
                                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="5432"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">사용자 (User)</label>
                            <input
                                type="text"
                                value={config.user}
                                onChange={e => setConfig({ ...config, user: e.target.value })}
                                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="postgres"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">비밀번호 (Password)</label>
                            <input
                                type="password"
                                value={config.password}
                                onChange={e => setConfig({ ...config, password: e.target.value })}
                                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">DB명 (DB Name)</label>
                            <input
                                type="text"
                                value={config.dbname}
                                onChange={e => setConfig({ ...config, dbname: e.target.value })}
                                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="work"
                            />
                        </div>
                        {backupMode === 'remote' && (
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 ml-1">SSH 포트 (SSH Port)</label>
                                <input
                                    type="text"
                                    value={config.sshPort}
                                    onChange={e => setConfig({ ...config, sshPort: e.target.value })}
                                    className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="9022"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-sm text-slate-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <p className="font-medium text-slate-700 mb-1">💡 백업 방식 선택 가이드</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>정식 SQL 백업</strong>: DB 전체 구조와 데이터를 가장 완벽하게 복구합니다. (권장)</li>
                        <li><strong>JSON 백업</strong>: 데이터 위주로 백업하며 호환성이 좋습니다.</li>
                    </ul>
                    {backupMode === 'local' ? (
                        <p className="mt-2 text-[11px] text-blue-600 font-medium">✨ 로컬 모드: SSH 없이 서버 엔진에서 직접 고속 백업을 수행합니다.</p>
                    ) : (
                        <p className="mt-2 text-[11px] text-amber-600 font-medium">⚠️ 원격 모드: 대용량 파일은 '폰에 저장' 후 '원격 파일로 복구'를 이용하세요.</p>
                    )}
                </div>

                {/* SQL Backup/Restore (Native) */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">정식 PostgreSQL 백업 (Native)</p>

                        {/* Destination Selector */}
                        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                            {(['pc', 'phone', 'both'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setSaveTo(t)}
                                    className={`px-3 py-1 text-[10px] md:text-xs rounded-md transition-all whitespace-nowrap ${saveTo === t ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {t === 'pc' ? 'PC 다운로드' : t === 'phone' ? (backupMode === 'local' ? '서버에 저장' : '폰에 저장') : '둘 다 저장'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={handleSqlBackup}
                            disabled={isExporting || isImporting}
                            className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50"
                        >
                            <Download size={18} /> 정식 SQL 백업 (.sql)
                        </button>
                        <button
                            onClick={() => sqlFileInputRef.current?.click()}
                            disabled={isExporting || isImporting}
                            className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium disabled:opacity-50"
                        >
                            <Upload size={18} /> 정식 SQL 복구
                        </button>
                        <input type="file" ref={sqlFileInputRef} onChange={handleSqlRestore} accept=".sql" className="hidden" />
                    </div>
                </div>

                {/* JSON Backup/Restore (Cross-platform) */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">데이터 위주 백업 (JSON)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={handleJsonBackup}
                            disabled={isExporting || isImporting}
                            className="flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium disabled:opacity-50"
                        >
                            <Download size={18} /> JSON 백업
                        </button>
                        <button
                            onClick={() => jsonFileInputRef.current?.click()}
                            disabled={isExporting || isImporting}
                            className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
                        >
                            <Upload size={18} /> JSON 복구
                        </button>
                        <input type="file" ref={jsonFileInputRef} onChange={handleJsonRestore} accept=".json" className="hidden" />
                    </div>
                </div>

                {/* Remote Backup Selection */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{backupMode === 'local' ? '서버 백업 폴더에서 복구 (Local)' : '폰의 백업 폴더에서 복구 (Remote)'}</p>
                    <button
                        onClick={fetchRemoteBackups}
                        disabled={isLoadingBackups || isImporting}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-medium disabled:opacity-50"
                    >
                        <Database size={18} /> {isLoadingBackups ? '목록 불러오는 중...' : (backupMode === 'local' ? '서버에서 백업 목록 불러오기' : '폰에서 백업 목록 불러오기')}
                    </button>

                    {remoteBackups.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                            {remoteBackups.map(file => (
                                <div key={file} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Database size={16} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] md:max-w-xs">{file}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRemoteRestore(file)}
                                            disabled={isImporting}
                                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                        >
                                            복원하기
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRemoteBackup(file)}
                                            disabled={isImporting}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                            title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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

                {/* Real-time Log Viewer */}
                {(isPolling || logs.length > 0) && (
                    <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Terminal size={14} /> 실시간 작업 로그
                        </p>
                        <div className="bg-slate-900 text-slate-300 p-3 rounded-xl font-mono text-[10px] md:text-xs h-48 overflow-y-auto space-y-1 shadow-inner border border-slate-800">
                            {logs.length === 0 ? (
                                <div className="text-slate-500 italic">로그를 기다리는 중...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={log.includes('완료') || log.includes('성공') ? 'text-green-400' : log.includes('실패') || log.includes('에러') ? 'text-red-400' : ''}>
                                        {log}
                                    </div>
                                ))
                            )}
                            {isPolling && <div className="animate-pulse text-blue-400 font-bold mt-1">_ 작업 진행 중...</div>}
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
