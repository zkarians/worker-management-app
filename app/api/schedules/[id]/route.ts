import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, type, startDate, endDate, time, dayOfWeek, dayOfMonth, weekOfMonth, isPopup, isActive } = body;

        const schedule = await prisma.schedule.update({
            where: { id },
            data: {
                title,
                description,
                type,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                time,
                dayOfWeek,
                dayOfMonth,
                weekOfMonth,
                isPopup,
                isActive,
            },
        });

        return NextResponse.json(schedule);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.schedule.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
    }
}
