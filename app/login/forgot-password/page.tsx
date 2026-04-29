'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/app/components/GlassCard';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        if (!username || !email) {
            setStatus('error');
            setMessage('아이디와 이메일을 모두 입력해주세요.');
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '이메일 전송에 실패했습니다.');
            }

            setStatus('success');
            setMessage(data.message || '비밀번호 재설정 이메일을 전송했습니다. (등록된 이메일이 맞다면 메일이 도착합니다.)');
        } catch (error: any) {
            console.error('Request error:', error);
            setStatus('error');
            setMessage(error.message || '알 수 없는 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

            <GlassCard className="w-full max-w-md animate-fade-in border-slate-200 shadow-2xl shadow-indigo-500/5 bg-white/80">
                <button
                    onClick={() => router.push('/login')}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-indigo-100 text-indigo-600">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                        비밀번호 찾기
                    </h1>
                    <p className="text-slate-500 text-sm">
                        가입시 등록한 아이디와 이메일을 입력하시면<br />비밀번호 재설정 링크를 보내드립니다.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center">
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100">
                            {message}
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            이메일이 도착하지 않았을 경우 스팸함을 확인해주시기 바랍니다.
                        </p>
                        <Link href="/login" className="btn-primary glass-button w-full block text-center">
                            로그인 화면으로 돌아가기
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
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">아이디</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full glass-input bg-white border-slate-200 focus:border-indigo-500"
                                placeholder="아이디 입력"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">이메일 주소</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full glass-input bg-white border-slate-200 focus:border-indigo-500"
                                placeholder="example@domain.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full btn-primary glass-button mt-2 flex justify-center items-center h-12 text-base gap-2"
                        >
                            {status === 'loading' ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} /> 링크 보내기
                                </>
                            )}
                        </button>
                    </form>
                )}
            </GlassCard>
        </div>
    );
}
