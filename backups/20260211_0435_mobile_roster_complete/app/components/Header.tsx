
'use client';

import { Bell, Menu, Search, LogOut, ChevronDown } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Header({ userName }: { userName: string }) {
    const { toggle } = useSidebar();
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="fixed top-0 right-0 left-0 md:left-64 h-16 z-40 flex items-center justify-between px-4 md:px-8 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggle}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="메뉴 열기"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden md:block">
                    <h2 className="text-lg font-bold text-slate-800">
                        환영합니다, <span className="text-indigo-600">{userName}님</span>
                    </h2>
                    <p className="text-xs text-slate-500">오늘도 안전한 하루 되세요.</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="검색..."
                        className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 w-64 transition-all"
                    />
                </div>
                <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
                <div className="text-xs text-slate-500 font-medium hidden md:block">
                    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* User Menu */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md ring-2 ring-white flex items-center justify-center text-white text-sm font-bold">
                            {userName.charAt(0)}
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 animate-fade-in">
                            <div className="px-4 py-2 border-b border-slate-100">
                                <p className="text-sm font-medium text-slate-900">{userName}</p>
                                <p className="text-xs text-slate-500">관리자</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} />
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
