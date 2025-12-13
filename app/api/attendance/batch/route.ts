import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { removeStatusLog, addStatusLog } from '@/app/lib/log-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { records } = body;

        if (!Array.isArray(records)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const updatedRecords = [];

        // Process records sequentially to avoid race conditions in logging
        for (const record of records) {
            const { userId, date: dateStr, status, overtimeHours, workHours } = record;

            if (!userId || !dateStr) continue;

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

            updatedRecords.push(attendance);

            // Auto-generate Special Note for specific statuses
            const statusTypes = ['결근', '지각', '조퇴', '휴무'];

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
        }

        return NextResponse.json({ message: 'Batch update successful', count: updatedRecords.length });
    } catch (error) {
        console.error('Batch update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
