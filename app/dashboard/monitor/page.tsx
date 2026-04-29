'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { Activity, Server, Database, RefreshCw, AlertTriangle, Cpu, Globe, Zap } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';

export default function SystemMonitorPage() {
    const user = useUser();
    const [vercelData, setVercelData] = useState<any>(null);
    const [dbData, setDbData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.role !== 'MANAGER') {
            // Redirect or show access denied handled by layout/middleware usually
        }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const [vercelRes, dbRes] = await Promise.all([
                fetch('/api/system/vercel'),
                fetch('/api/system/database')
            ]);

            const vData = await vercelRes.json();
            const dData = await dbRes.json();

            setVercelData(vercelRes.ok ? vData : null);
            setDbData(dbRes.ok ? dData : null);

            if (!vercelRes.ok || !dbRes.ok) {
                console.warn('Partial error fetching stats', { vData, dData });

                let errMsg = '';
                if (vData?.error) errMsg += `[Vercel: ${vData.error} ${vData.details ? `(${vData.details})` : ''}] `;
                if (dData?.error) errMsg += `[Database: ${dData.error}]`;

                if (errMsg) setError(errMsg);
            }

        } catch (err: any) {
            console.error(err);
            setError('Failed to load system stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading system stats...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity /> 시스템 모니터링
                </h1>
                <button
                    onClick={fetchStats}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                    title="새로고침"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vercel Stats */}
                <GlassCard className="bg-white border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Server className="text-black" /> Vercel Project Info
                    </h2>

                    {vercelData ? (
                        <div className="space-y-4">
                            <StatRow
                                label="Project Name"
                                value={vercelData.project?.name || 'Unknown'}
                                icon={<Globe size={16} />}
                            />
                            <StatRow
                                label="Framework"
                                value={vercelData.project?.framework || 'Next.js'}
                                icon={<Activity size={16} />}
                            />
                            <StatRow
                                label="Latest Deployment"
                                value={vercelData.project?.latestDeployments?.[0]?.readyState || 'READY'}
                                icon={<Cpu size={16} />}
                            />


                            {/* Recent Deployments */}
                            {vercelData.deployments?.deployments && vercelData.deployments.deployments.length > 0 && (
                                <>
                                    <div className="pt-3 mt-3 border-t border-slate-200">
                                        <h3 className="text-sm font-semibold text-slate-700 mb-2">최근 배포</h3>
                                    </div>
                                    {vercelData.deployments.deployments.slice(0, 5).map((deployment: any, idx: number) => (
                                        <div key={deployment.uid} className="py-2 border-b border-slate-50 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${deployment.state === 'READY' ? 'bg-green-500' :
                                                            deployment.state === 'ERROR' ? 'bg-red-500' :
                                                                deployment.state === 'BUILDING' ? 'bg-yellow-500' :
                                                                    'bg-gray-400'
                                                            }`}></span>
                                                        <span className="text-xs text-slate-600 font-mono">
                                                            {deployment.meta?.githubCommitMessage?.substring(0, 40) || deployment.url}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1 ml-4">
                                                        {new Date(deployment.created).toLocaleString('ko-KR')}
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded ${deployment.state === 'READY' ? 'bg-green-100 text-green-700' :
                                                    deployment.state === 'ERROR' ? 'bg-red-100 text-red-700' :
                                                        deployment.state === 'BUILDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {deployment.state}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}


                            <div className="pt-2">
                                <a
                                    href={`https://vercel.com/${vercelData.scopeSlug || vercelData.user?.username || 'dashboard'}/${vercelData.project?.name || ''}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    View on Vercel Dashboard &rarr;
                                </a>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">데이터를 불러올 수 없습니다. (API Key 확인 필요)</p>
                    )}
                </GlassCard>

                {/* Database Stats */}
                <GlassCard className="bg-white border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Database className="text-indigo-600" /> 데이터베이스 상태
                    </h2>

                    {dbData ? (
                        <div className="space-y-4">
                            <StatRow
                                label="연결 상태"
                                value={dbData.status === 'connected' ? '🟢 Connected' : '🔴 Error'}
                                icon={<Activity size={16} />}
                            />
                            <StatRow
                                label="응답 시간"
                                value={`${dbData.latencyMs}ms`}
                                icon={<Zap size={16} />}
                            />
                            <StatRow
                                label="서버 주소"
                                value={dbData.host || 'Local/Internal'}
                                icon={<Globe size={16} />}
                            />
                            <div className="pt-3 mt-3 border-t border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">데이터 현황</h3>
                            </div>
                            <StatRow
                                label="전체 사용자"
                                value={`${dbData.stats?.users ?? 0}명`}
                                icon={<Server size={16} />}
                            />
                            <StatRow
                                label="출퇴근 기록"
                                value={`${dbData.stats?.attendances ?? 0}건`}
                                icon={<Cpu size={16} />}
                            />
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">데이터베이스에 연결할 수 없습니다.</p>
                    )}
                </GlassCard>
            </div>

            <p className="text-center text-xs text-white/60 mt-8">
                * 이 데이터는 Vercel 및 Database를 통해 실시간으로 조회됩니다.
            </p>
        </div>
    );
}

function StatRow({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-slate-500 text-sm flex items-center gap-2">
                {icon} {label}
            </span>
            <span className="text-slate-800 font-semibold">{value}</span>
        </div>
    );
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
