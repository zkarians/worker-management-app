import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateNavigatorProps {
    currentDate: string; // YYYY-MM-DD
    onDateChange: (newDate: string) => void;
    className?: string;
    label?: string;
}

export const DateNavigator = ({ currentDate, onDateChange, className = '', label }: DateNavigatorProps) => {

    const changeDate = (days: number) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + days);
        // Correctly handle timezone offest
        const offset = date.getTimezoneOffset() * 60000;
        const newDateStr = new Date(date.getTime() - offset).toISOString().split('T')[0];
        onDateChange(newDateStr);
    };

    const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(e.target.value);
    };

    // Format date for display: equivalent to standard localized date string
    const displayDate = new Date(currentDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    return (
        <div className={`flex items-center justify-between gap-4 ${className}`}>
            <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-full hover:bg-white/50 text-slate-600 transition-colors"
                aria-label="Previous day"
            >
                <ChevronLeft size={24} />
            </button>

            <div className="flex flex-col items-center">
                {label && <span className="text-xs font-bold text-slate-500 mb-1">{label}</span>}
                <div className="relative group cursor-pointer">
                    <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-slate-800">
                        <CalendarIcon size={20} className="text-slate-500" />
                        <span>{displayDate}</span>
                    </div>
                    {/* Invisible date input covering the text for triggering picker */}
                    <input
                        type="date"
                        value={currentDate}
                        onChange={handleDateInput}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                </div>
            </div>

            <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-full hover:bg-white/50 text-slate-600 transition-colors"
                aria-label="Next day"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};
