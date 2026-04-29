'use client';

import { useRouter } from 'next/navigation';

export default function DatePicker({ initialDate, className }: { initialDate: string; className?: string }) {
    const router = useRouter();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={`no-print flex items-center gap-4 p-4 mb-4 bg-slate-50 border-b border-slate-200 ${className || ''}`}>
            <label htmlFor="tbm-date" className="text-sm font-medium text-slate-700">
                날짜 선택:
            </label>
            <input
                id="tbm-date"
                type="date"
                defaultValue={initialDate}
                onChange={(e) => {
                    const date = e.target.value;
                    if (date) {
                        router.push(`/dashboard/tbm?date=${date}`);
                    }
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <button
                onClick={handlePrint}
                className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
                인쇄하기
            </button>
        </div>
    );
}
