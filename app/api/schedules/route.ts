import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('API: Fetching all schedules');
        const schedules = await prisma.schedule.findMany({
            orderBy: { createdAt: 'desc' },
        });
        console.log(`API: Found ${schedules.length} schedules`);
        return NextResponse.json(schedules);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, imageUrl, type, startDate, endDate, time, dayOfWeek, dayOfMonth, weekOfMonth, isPopup } = body;

        const schedule = await prisma.schedule.create({
            data: {
                title,
                description,
                imageUrl,
                type,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                time,
                dayOfWeek,
                dayOfMonth,
                weekOfMonth,
                isPopup,
            },
        });

        return NextResponse.json(schedule);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }
}
