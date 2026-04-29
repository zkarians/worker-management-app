import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');
        const monthStr = searchParams.get('month');
        const yearStr = searchParams.get('year');
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        let where: any = {};

        if (startDateStr && endDateStr) {
            // Filter by date range
            const start = new Date(startDateStr);
            const end = new Date(endDateStr);
            end.setHours(23, 59, 59, 999); // Include the entire end date

            where.date = {
                gte: start,
                lte: end
            };
        } else if (dateStr) {
            // Filter by specific date (ignoring time)
            const date = new Date(dateStr);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            where.date = {
                gte: date,
                lt: nextDate
            };
        } else if (monthStr && yearStr) {
            const month = parseInt(monthStr);
            const year = parseInt(yearStr);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of the month
            endDate.setHours(23, 59, 59, 999); // Include the entire last day

            where.date = {
                gte: startDate,
                lte: endDate
            };
        } else {
            // Default: Fetch recent history (e.g., last 50 items)
            const logs = await prisma.dailyLog.findMany({
                take: 50,
                orderBy: { date: 'desc' },
                include: { author: { select: { name: true } } }
            });
            return NextResponse.json({ logs });
        }

        const logs = await prisma.dailyLog.findMany({
            where,
            include: { author: { select: { name: true } } },
            orderBy: { date: 'desc' } // Changed to desc for history view
        });

        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { date: dateStr, content } = body;

        if (!dateStr) return NextResponse.json({ error: 'Date required' }, { status: 400 });
        if (content === undefined) return NextResponse.json({ error: 'Content required' }, { status: 400 });

        // Save as UTC midnight to ensure consistency
        const date = new Date(dateStr);

        // Check if log with same content already exists on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existingLog = await prisma.dailyLog.findFirst({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                content: content
            },
            include: { author: { select: { name: true } } }
        });

        // If log already exists, return the existing one instead of creating duplicate
        if (existingLog) {
            return NextResponse.json({ log: existingLog, duplicate: true });
        }

        const log = await prisma.dailyLog.create({
            data: {
                date,
                content,
                authorId: session.userId as string,
            },
            include: { author: { select: { name: true } } }
        });

        return NextResponse.json({ log });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.dailyLog.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, content } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        if (content === undefined) return NextResponse.json({ error: 'Content required' }, { status: 400 });

        // Allow empty string content
        const log = await prisma.dailyLog.update({
            where: { id },
            data: { content: content || '' },
            include: { author: { select: { name: true } } }
        });

        return NextResponse.json({ log });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
