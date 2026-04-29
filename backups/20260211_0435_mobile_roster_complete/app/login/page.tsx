'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/app/components/GlassCard';
import { Truck } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoLoggingIn, setAutoLoggingIn] = useState(false);

    // 자동 로그인 체크 (Force Update)
    useEffect(() => {
        const savedCredentials = localStorage.getItem('savedCredentials');
        const savedLastUsername = localStorage.getItem('savedUsername');

        if (savedCredentials) {
            try {
                const { username: savedUsername, password: savedPassword } = JSON.parse(savedCredentials);
                setUsername(savedUsername);
                setPassword(savedPassword);
                setRememberMe(true);

                // 자동 로그인 시도
                setAutoLoggingIn(true);
                attemptLogin(savedUsername, savedPassword, true);
            } catch (err) {
                console.error('저장된 자격 증명 불러오기 실패:', err);
                localStorage.removeItem('savedCredentials');
            }
        } else if (savedLastUsername) {
            // 자동 로그인이 아닐 경우 마지막 아이디만 불러오기
            setUsername(savedLastUsername);
        }
    }, []);

    const attemptLogin = async (user: string, pass: string, isAutoLogin: boolean = false) => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass, rememberMe: isAutoLogin || rememberMe }),
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                throw new Error('서버 응답 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }

            const data = await res.json();

            if (!res.ok) {
                // 401 Unauthorized일 경우에만 에러를 던져서 catch 블록에서 자격 증명 삭제 처리
                if (res.status === 401) {
                    const error = new Error(data.error || '아이디 또는 비밀번호가 올바르지 않습니다.');
                    (error as any).status = 401;
                    throw error;
                }
                throw new Error(data.error || '로그인에 실패했습니다.');
            }

            // 로그인 성공 시 처리
            // 1. 마지막 아이디 저장 (항상)
            localStorage.setItem('savedUsername', user);

            // 2. 자동 로그인 설정에 따른 자격 증명 저장/삭제
            if (rememberMe || isAutoLogin) {
                localStorage.setItem('savedCredentials', JSON.stringify({
                    username: user,
                    password: pass
                }));
            } else {
                localStorage.removeItem('savedCredentials');
            }

            router.push('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);

            // 자동 로그인 실패 시 처리
            if (isAutoLogin) {
                // 401 에러(비밀번호 틀림 등)일 때만 저장된 자격 증명 삭제
                // 서버 오류(500, 503)나 네트워크 오류일 때는 삭제하지 않음 (재시도 가능하게)
                if (err.status === 401) {
                    localStorage.removeItem('savedCredentials');
                    setError('저장된 로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
                } else {
                    // 서버 오류 등의 경우
                    setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
                }
            } else {
                if (err.message.includes('JSON') || err.message.includes('Unexpected token')) {
                    setError('서버 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                } else {
                    setError(err.message || '로그인에 실패했습니다.');
                }
            }
        } finally {
            setLoading(false);
            setAutoLoggingIn(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await attemptLogin(username, password, false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

            <GlassCard className="w-full max-w-md animate-fade-in border-slate-200 shadow-2xl shadow-indigo-500/5 bg-white/80">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                        <Truck size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                        웅동물류센터 야간출하
                    </h1>
                    <p className="text-slate-500 text-sm">
                        시스템 접속을 위해 로그인해주세요.
                    </p>
                </div>

                {autoLoggingIn && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                        자동 로그인 중...
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">아이디</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full glass-input bg-white border-slate-200 focus:border-indigo-500"
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full glass-input bg-white border-slate-200 focus:border-indigo-500"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-600 select-none cursor-pointer">
                            자동 로그인
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || autoLoggingIn}
                        className="w-full btn-primary glass-button mt-2 flex justify-center items-center h-12 text-base"
                    >
                        {loading || autoLoggingIn ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            '로그인'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    계정이 없으신가요?{' '}
                    <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                        회원가입
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
