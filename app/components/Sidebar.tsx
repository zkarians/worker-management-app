'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Clock, FileText, Settings, LogOut, Truck, ClipboardList, Package, TrendingUp } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useSettings } from './SettingsContext';

const MENU_ITEMS = [
    { name: '대시보드', icon: LayoutDashboard, href: '/dashboard', roles: ['MANAGER', 'WORKER'] },
    { name: '근무표 관리', icon: Calendar, href: '/dashboard/roster', roles: ['MANAGER'] },
    { name: '근무자 관리', icon: Users, href: '/dashboard/workers', roles: ['MANAGER'] },
    { name: '근태 관리', icon: Clock, href: '/dashboard/attendance', roles: ['MANAGER', 'WORKER'] },
    { name: '근태 내역 조회', icon: TrendingUp, href: '/dashboard/attendance/report', roles: ['MANAGER'] },
    { name: '제품 정보', icon: Package, href: '/dashboard/products', roles: ['MANAGER', 'WORKER'] },
    { name: '휴무 관리', icon: FileText, href: '/dashboard/leaves', roles: ['MANAGER', 'WORKER'] },
    { name: '특이사항', href: '/dashboard/logs', icon: ClipboardList, roles: ['MANAGER'] },
    { name: '보고서', icon: FileText, href: '/dashboard/report', roles: ['MANAGER'] },
    { name: '설정', icon: Settings, href: '/dashboard/settings', roles: ['MANAGER', 'WORKER'] },
];

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen, close } = useSidebar();
    const { sidebarFontSize } = useSettings();
    const [urgentLeaveCount, setUrgentLeaveCount] = useState(0);

    useEffect(() => {
        if (userRole === 'MANAGER') {
            fetchLeaves();
        }
    }, [userRole, pathname]); // Re-fetch on path change to keep updated

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leaves?status=PENDING');
            const data = await res.json();
            if (data.leaves) {
                const now = new Date();
                const threeDaysLater = new Date();
                threeDaysLater.setDate(now.getDate() + 3);
                threeDaysLater.setHours(23, 59, 59, 999);
                now.setHours(0, 0, 0, 0); // Start of today

                const urgentCount = data.leaves.filter((leave: any) => {
                    const startDate = new Date(leave.startDate);
                    return startDate >= now && startDate <= threeDaysLater;
                }).length;

                setUrgentLeaveCount(urgentCount);
            }
        } catch (error) {
            console.error('Failed to fetch leaves', error);
        }
    };

    const getFontSizeClass = () => {
        switch (sidebarFontSize) {
            case 'small': return 'text-sm';
            case 'large': return 'text-lg';
            default: return 'text-base';
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={close}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 shadow-sm print:hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                        <Truck className="text-white" size={18} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-lg leading-none">웅동물류센터</h1>
                        <span className="text-[10px] text-slate-500 font-medium tracking-wider">야간출하 시스템</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-semibold text-slate-400 px-4 mb-2 mt-2">MENU</div>
                    {MENU_ITEMS.filter(item => item.roles.includes(userRole)).map((item) => {
                        const isActive = pathname === item.href;
                        const isUrgentLeave = item.name === '휴무 관리' && urgentLeaveCount > 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={close}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                                    : isUrgentLeave
                                        ? 'bg-red-50 text-red-600 font-semibold animate-pulse-subtle'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon size={sidebarFontSize === 'large' ? 24 : 20} className={`transition-colors ${isActive ? 'text-indigo-600' : isUrgentLeave ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-600'
                                    }`} />
                                <span className={`font-medium ${getFontSizeClass()}`}>{item.name}</span>
                                {isUrgentLeave && (
                                    <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {urgentLeaveCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                    >
                        <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
                        <span className="font-medium">로그아웃</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
