import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateNavigatorProps {
    currentDate: string; // YYYY-MM-DD
    onDateChange: (newDate: string) => void;
    className?: string;
    label?: string;
    fontSizeClass?: string;
}

export const DateNavigator = ({ currentDate, onDateChange, className = '', label, fontSizeClass = 'text-base lg:text-lg' }: DateNavigatorProps) => {

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

    // Format date for display
    const dateObj = new Date(currentDate);
    const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat

    const datePart = dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const dayPart = dateObj.toLocaleDateString('ko-KR', {
        weekday: 'long'
    });

    const getDayColorClass = () => {
        if (dayOfWeek === 0) return 'text-red-500'; // Sunday
        if (dayOfWeek === 6) return 'text-blue-500'; // Saturday
        return 'text-slate-800'; // Weekday
    };

    return (
        <div className={`flex items-center justify-between gap-3 ${className}`}>
            <button
                onClick={() => changeDate(-1)}
                className="p-1.5 rounded-full hover:bg-white/50 text-slate-600 transition-colors"
                aria-label="Previous day"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center">
                {label && <span className="text-[10px] font-bold text-slate-500 mb-0.5">{label}</span>}
                <div className="relative group cursor-pointer">
                    <div className={`flex items-center gap-1.5 font-bold ${fontSizeClass}`}>
                        <CalendarIcon size={16} className="text-slate-500" />
                        <span className="text-slate-900">{datePart}</span>
                        <span className={`${getDayColorClass()}`}>{dayPart}</span>
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
                className="p-1.5 rounded-full hover:bg-white/50 text-slate-600 transition-colors"
                aria-label="Next day"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};
