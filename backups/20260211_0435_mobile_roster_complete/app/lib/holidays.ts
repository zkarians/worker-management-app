export const HOLIDAYS_2024: Record<string, string> = {
    '2024-01-01': '신정',
    '2024-02-09': '설날 연휴',
    '2024-02-10': '설날',
    '2024-02-11': '설날 연휴',
    '2024-02-12': '대체공휴일',
    '2024-03-01': '삼일절',
    '2024-04-10': '국회의원 선거일',
    '2024-05-05': '어린이날',
    '2024-05-06': '대체공휴일',
    '2024-05-15': '부처님오신날',
    '2024-06-06': '현충일',
    '2024-08-15': '광복절',
    '2024-09-16': '추석 연휴',
    '2024-09-17': '추석',
    '2024-09-18': '추석 연휴',
    '2024-10-03': '개천절',
    '2024-10-09': '한글날',
    '2024-12-25': '성탄절',
};

export const HOLIDAYS_2025: Record<string, string> = {
    '2025-01-01': '신정',
    '2025-01-28': '설날 연휴',
    '2025-01-29': '설날',
    '2025-01-30': '설날 연휴',
    '2025-03-01': '삼일절',
    '2025-03-03': '대체공휴일',
    '2025-05-05': '어린이날, 부처님오신날', // combined holidays
    '2025-05-06': '대체공휴일', //어린이날, 부처님오신날 겹침 예상 대체공휴일 확인 필요하나 일단 추가

    '2025-06-06': '현충일',
    '2025-08-15': '광복절',
    '2025-10-03': '개천절',
    '2025-10-05': '추석 연휴',
    '2025-10-06': '추석',
    '2025-10-07': '추석 연휴',
    '2025-10-08': '대체공휴일', // 추석 연휴 중 개천절 겹침 등 고려
    '2025-10-09': '한글날',
    '2025-12-25': '성탄절',
};

export const isHoliday = (date: Date): string | null => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (year === 2024) return HOLIDAYS_2024[dateString] || null;
    if (year === 2025) return HOLIDAYS_2025[dateString] || null;

    return null;
};

export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0: Sunday, 6: Saturday
};

export const isWeekendOrHoliday = (date: Date): boolean => {
    return isWeekend(date) || !!isHoliday(date);
};
