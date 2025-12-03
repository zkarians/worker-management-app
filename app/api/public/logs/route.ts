import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        let whereClause = {};

        if (date) {
            // Get logs for a specific date
            whereClause = { date: new Date(date) };
        } else if (month && year) {
            // Get logs for a specific month
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            whereClause = {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            };
        } else {
            // Get recent logs (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            whereClause = {
                date: {
                    gte: thirtyDaysAgo
                }
            };
        }

        const logs = await prisma.dailyLog.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: 100
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Failed to fetch public logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
