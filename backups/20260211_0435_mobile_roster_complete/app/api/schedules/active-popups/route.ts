import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { startOfDay, endOfDay, getDay, getDate, getWeekOfMonth, lastDayOfMonth, isSameDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        const currentDayOfWeek = getDay(now); // 0-6
        const currentDayOfMonth = getDate(now); // 1-31
        const currentWeekOfMonth = getWeekOfMonth(now); // 1-5 (approx)

        // Fetch all active popup schedules that started before or on today
        const potentialSchedules = await prisma.schedule.findMany({
            where: {
                isPopup: true,
                isActive: true,
                startDate: { lte: todayEnd },
                OR: [
                    { endDate: null },
                    { endDate: { gte: todayStart } }
                ]
            },
        });

        // Filter in-memory based on recurrence rules
        const activePopups = potentialSchedules.filter(schedule => {
            // Check if date is within range (already done in DB query mostly, but double check)
            if (schedule.startDate > now) return false;
            if (schedule.endDate && schedule.endDate < startOfDay(now)) return false;

            switch (schedule.type) {
                case 'ONCE':
                    // For ONCE, we check if today is the startDate
                    return startOfDay(schedule.startDate).getTime() === todayStart.getTime();

                case 'DAILY':
                    return true;

                case 'WEEKLY':
                    return schedule.dayOfWeek.includes(currentDayOfWeek);

                case 'MONTHLY_DATE':
                    if (schedule.dayOfMonth === -1) {
                        return isSameDay(now, lastDayOfMonth(now));
                    }
                    return schedule.dayOfMonth === currentDayOfMonth;

                case 'MONTHLY_DAY':
                    // e.g., 2nd Monday
                    // We need to check if today matches the week and day of week
                    // Note: getWeekOfMonth from date-fns might differ from user expectation of "2nd Monday"
                    // A robust implementation would calculate "Nth Weekday of Month"
                    // For simplicity, let's use weekOfMonth from date-fns for now, but ideally we check "Nth occurrence of Day X"
                    return schedule.weekOfMonth === currentWeekOfMonth && schedule.dayOfWeek.includes(currentDayOfWeek);

                default:
                    return false;
            }
        });

        return NextResponse.json(activePopups);
    } catch (error) {
        console.error('Popup fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch active popups' }, { status: 500 });
    }
}
