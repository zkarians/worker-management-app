import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { removeStatusLog, addStatusLog, checkAndConsolidateOffDayLogs } from '@/app/lib/log-utils';

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
        const affectedDates = new Set<string>();

        // Process records in chunks to improve performance while avoiding DB overwhelm
        const CHUNK_SIZE = 10;
        for (let i = 0; i < records.length; i += CHUNK_SIZE) {
            const chunk = records.slice(i, i + CHUNK_SIZE);

            await Promise.all(chunk.map(async (record: any) => {
                const { userId, date: dateStr, status, overtimeHours, workHours } = record;

                if (!userId || !dateStr) return;

                const finalStatus = status || '';
                const date = new Date(dateStr);
                affectedDates.add(dateStr);

                const attendance = await prisma.attendance.upsert({
                    where: {
                        userId_date: {
                            userId,
                            date,
                        }
                    },
                    update: {
                        status: finalStatus,
                        overtimeHours: isNaN(Number(overtimeHours)) ? 0 : Number(overtimeHours),
                        workHours: (workHours === undefined || workHours === null || workHours === '' || isNaN(Number(workHours))) ? 8 : Number(workHours),
                    },
                    create: {
                        userId,
                        date,
                        status: finalStatus,
                        overtimeHours: isNaN(Number(overtimeHours)) ? 0 : Number(overtimeHours),
                        workHours: (workHours === undefined || workHours === null || workHours === '' || isNaN(Number(workHours))) ? 8 : Number(workHours),
                    },
                });

                updatedRecords.push(attendance);

                // Auto-generate Special Note for specific statuses
                const statusTypes = ['결근', '지각', '조퇴', '휴무'];

                // Run log updates in parallel
                await Promise.all(statusTypes.map(type => removeStatusLog(userId, date, type)));

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
            }));
        }

        // After processing all records, check for consolidation on affected dates
        for (const dateStr of Array.from(affectedDates)) {
            await checkAndConsolidateOffDayLogs(new Date(dateStr), session.userId as string);
        }

        return NextResponse.json({ message: 'Batch update successful', count: updatedRecords.length });
    } catch (error) {
        console.error('Batch update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
