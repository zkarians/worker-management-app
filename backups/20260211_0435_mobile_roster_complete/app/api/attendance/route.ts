import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');
        const monthStr = searchParams.get('month');
        const yearStr = searchParams.get('year');
        const userId = searchParams.get('userId');

        let where: any = {};

        if (session.role === 'WORKER') {
            where.userId = session.userId;
        } else if (userId) {
            where.userId = userId;
        }

        if (startDateStr && endDateStr) {
            // Date range query
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date

            where.date = {
                gte: startDate,
                lte: endDate
            };
        } else if (dateStr) {
            where.date = new Date(dateStr);
        } else if (monthStr && yearStr) {
            const month = parseInt(monthStr);
            const year = parseInt(yearStr);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            where.date = {
                gte: startDate,
                lte: endDate
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json({ attendance });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, date: dateStr, status, overtimeHours, workHours } = body;

        if (!userId || !dateStr) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Allow empty status (NULL equivalent)
        const finalStatus = status || '';

        const date = new Date(dateStr);

        const attendance = await prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId,
                    date,
                }
            },
            update: {
                status: finalStatus,
                overtimeHours: overtimeHours || 0,
                workHours: workHours || 8,
            },
            create: {
                userId,
                date,
                status: finalStatus,
                overtimeHours: overtimeHours || 0,
                workHours: workHours || 8,
            },
        });

        // Auto-generate Special Note for specific statuses
        // First, remove user from ANY status logs for this date to ensure consistency
        const statusTypes = ['결근', '지각', '조퇴', '휴무'];
        const { removeStatusLog, addStatusLog } = await import('@/app/lib/log-utils');

        for (const type of statusTypes) {
            await removeStatusLog(userId, date, type);
        }

        if (finalStatus && ['ABSENT', 'LATE', 'EARLY_LEAVE', 'OFF_DAY'].includes(finalStatus)) {
            let statusText = '';
            switch (finalStatus) {
                case 'ABSENT': statusText = '결근'; break;
                case 'LATE': statusText = '지각'; break;
                case 'EARLY_LEAVE': statusText = '조퇴'; break;
                case 'OFF_DAY': statusText = '휴무'; break;
            }

            await addStatusLog(userId, date, statusText, session.userId as string);
        }

        // If status is ABSENT or OFF_DAY, remove from Roster
        if (finalStatus === 'ABSENT' || finalStatus === 'OFF_DAY') {
            const roster = await prisma.roster.findUnique({ where: { date } });
            if (roster) {
                await prisma.rosterAssignment.deleteMany({
                    where: { rosterId: roster.id, userId }
                });
            }
        }

        // Check for consolidation
        const { checkAndConsolidateOffDayLogs } = await import('@/app/lib/log-utils');
        await checkAndConsolidateOffDayLogs(date, session.userId as string);

        return NextResponse.json({ attendance });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
