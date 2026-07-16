import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { checkAndConsolidateOffDayLogs } from '@/app/lib/log-utils';

export const dynamic = 'force-dynamic';

/**
 * Bulk update attendance status for a date range.
 * Expected body: { startDate: string, endDate: string, status?: string, overtimeHours?: number, workHours?: number }
 */
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { startDate, endDate, status = '', overtimeHours = 0, workHours = 8 } = await request.json();
        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required dates' }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const updated: any[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            // Find all users (workers) that have an attendance record for this date or need one created
            const users = await prisma.user.findMany({ where: { role: { in: ['WORKER', 'MANAGER'] }, isApproved: true } });
            const totalUsers = users.length;

            for (const user of users) {
                const att = await prisma.attendance.upsert({
                    where: { userId_date: { userId: user.id, date } },
                    update: { status, overtimeHours, workHours },
                    create: { userId: user.id, date, status, overtimeHours, workHours },
                });
                updated.push(att);
            }

            // After updating all users, handle special OFF_DAY logic
            if (status === 'OFF_DAY') {
                // Consolidate logs and create "웅동 휴무" if all users are off/leave/vacation
                await checkAndConsolidateOffDayLogs(date, session.userId as string);

                // Remove OFF_DAY, ABSENT, LEAVE_OF_ABSENCE, or VACATION users from Roster
                const roster = await prisma.roster.findUnique({ where: { date } });
                if (roster) {
                    for (const user of users) {
                        const userAtt = await prisma.attendance.findUnique({
                            where: { userId_date: { userId: user.id, date } }
                        });

                        if (userAtt && ['OFF_DAY', 'ABSENT', 'LEAVE_OF_ABSENCE', 'VACATION'].includes(userAtt.status)) {
                            await prisma.rosterAssignment.deleteMany({
                                where: { rosterId: roster.id, userId: user.id }
                            });
                        }
                    }
                }
            } else if (status && ['ABSENT', 'LATE', 'EARLY_LEAVE'].includes(status)) {
                // Handle other status types (non-OFF_DAY)
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                for (const user of users) {
                    let statusText = '';
                    switch (status) {
                        case 'ABSENT': statusText = '결근'; break;
                        case 'LATE': statusText = '지각'; break;
                        case 'EARLY_LEAVE': statusText = '조퇴'; break;
                    }

                    const existingLog = await prisma.dailyLog.findFirst({
                        where: {
                            date: { gte: startOfDay, lte: endOfDay },
                            content: `[${statusText}] ${user.name}`
                        }
                    });

                    if (!existingLog) {
                        await prisma.dailyLog.create({
                            data: {
                                date: new Date(date),
                                content: `[${statusText}] ${user.name}`,
                                authorId: session.userId as string,
                            }
                        });
                    }
                }
            } else if (!status || ['PRESENT', 'SCHEDULED', 'LEAVE_OF_ABSENCE', 'VACATION'].includes(status)) {
                // Remove logs if status changed to normal, leave of absence, or vacation
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                for (const user of users) {
                    const logsToDelete = await prisma.dailyLog.findMany({
                        where: {
                            date: { gte: startOfDay, lte: endOfDay },
                            OR: [
                                { content: `[결근] ${user.name}` },
                                { content: `[지각] ${user.name}` },
                                { content: `[조퇴] ${user.name}` },
                                { content: `[휴무] ${user.name}` }
                            ]
                        }
                    });

                    for (const log of logsToDelete) {
                        await prisma.dailyLog.delete({ where: { id: log.id } });
                    }
                }

                // Also recalculate and consolidate logs (e.g. delete "웅동 휴무" or adjust individual logs)
                await checkAndConsolidateOffDayLogs(date, session.userId as string);
            }
        }

        return NextResponse.json({ message: 'Bulk attendance updated', count: updated.length, updated });
    } catch (error: any) {
        console.error('Bulk attendance error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
