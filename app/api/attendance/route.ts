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
        const worker = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });

        if (worker) {
            if (finalStatus && ['ABSENT', 'LATE', 'EARLY_LEAVE', 'OFF_DAY'].includes(finalStatus)) {
                let statusText = '';
                switch (finalStatus) {
                    case 'ABSENT': statusText = '결근'; break;
                    case 'LATE': statusText = '지각'; break;
                    case 'EARLY_LEAVE': statusText = '조퇴'; break;
                    case 'OFF_DAY': statusText = '휴무'; break;
                }

                // Check if log already exists to avoid duplicates
                const startOfDay = new Date(dateStr);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(dateStr);
                endOfDay.setHours(23, 59, 59, 999);

                const existingLog = await prisma.dailyLog.findFirst({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        content: `[${statusText}] ${worker.name}`
                    }
                });

                if (!existingLog) {
                    await prisma.dailyLog.create({
                        data: {
                            date: new Date(dateStr), // Use attendance date
                            content: `[${statusText}] ${worker.name}`,
                            authorId: session.userId as string,
                        }
                    });
                }
            } else {
                // If status is changed back to normal (or others), remove the auto-generated log
                const startOfDay = new Date(dateStr);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(dateStr);
                endOfDay.setHours(23, 59, 59, 999);

                const logsToDelete = await prisma.dailyLog.findMany({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        OR: [
                            { content: `[결근] ${worker.name}` },
                            { content: `[지각] ${worker.name}` },
                            { content: `[조퇴] ${worker.name}` },
                            { content: `[휴무] ${worker.name}` }
                        ]
                    }
                });

                for (const log of logsToDelete) {
                    await prisma.dailyLog.delete({ where: { id: log.id } });
                }
            }
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

        return NextResponse.json({ attendance });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
