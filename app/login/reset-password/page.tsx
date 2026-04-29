'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/app/components/GlassCard';
import { KeyRound, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('유효하지 않은 접근입니다. 올바른 재설정 링크를 사용해주세요.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) return;

        setStatus('loading');
        setMessage('');

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 4) {
            setStatus('error');
            setMessage('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '비밀번호 재설정에 실패했습니다.');
            }

            setStatus('success');
            setMessage('비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.');
        } catch (error: any) {
            console.error('Reset error:', error);
            setStatus('error');
            setMessage(error.message || '알 수 없는 오류가 발생했습니다.');
        }
    };

    return (
        <GlassCard className="w-full max-w-md animate-fade-in border-slate-200 shadow-2xl shadow-indigo-500/5 bg-white/80">
            <div className="text-center mb-8 mt-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-indigo-100 text-indigo-600">
                    <KeyRound size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                    새 비밀번호 설정
                </h1>
                <p className="text-slate-500 text-sm">
                    사용하실 새로운 비밀번호를 입력해주세요.
                </p>
            </div>

            {status === 'success' ? (
                <div className="text-center">
                    <div className="flex flex-col items-center justify-center bg-green-50 text-green-700 p-6 rounded-xl mb-6 border border-green-100">
                        <CheckCircle size={48} className="text-green-500 mb-4" />
                        <p className="font-medium text-base">{message}</p>
                    </div>
                    <Link href="/login" className="btn-primary glass-button w-full block text-center">
                        로그인 화면으로 이동
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {status === 'error' && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
                            {message}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">새 비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full glass-input bg-white border-slate-200 focus:border-indigo-500"
                            placeholder="새 비밀번호 입력"
                            required
                            disabled={!token}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">새 비밀번호 확인</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full glass-input bg-white border-slate-200 focus:border-indigo-500"
                            placeholder="새 비밀번호 다시 입력"
                            required
                            disabled={!token}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading' || !token}
                        className="w-full btn-primary glass-button mt-4 flex justify-center items-center h-12 text-base"
                    >
                        {status === 'loading' ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            '비밀번호 변경하기'
                        )}
                    </button>
                </form>
            )}
        </GlassCard>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

            <Suspense fallback={<div className="text-indigo-600">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
