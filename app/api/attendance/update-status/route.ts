import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// API endpoint to update SCHEDULED attendance records to PRESENT if conditions are met
// Called on page load
export async function POST(request: Request) {
    try {
        const now = new Date();
        const nowKST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        const nowLocal = new Date(nowKST.toDateString());
        const currentHour = nowKST.getHours();

        // Only update if it's after 7 PM
        if (currentHour < 19) {
            return NextResponse.json({ message: 'No updates needed before 7 PM', updated: 0 });
        }

        // Find all SCHEDULED attendance records for today
        const scheduledRecords = await prisma.attendance.findMany({
            where: {
                status: 'SCHEDULED',
                date: {
                    lte: nowLocal
                }
            }
        });

        if (scheduledRecords.length === 0) {
            return NextResponse.json({ message: 'No scheduled records to update', updated: 0 });
        }

        // Update SCHEDULED -> PRESENT for today's records (after 7 PM)
        const updatePromises = scheduledRecords.map(record => {
            const recordDate = new Date(record.date.toDateString());

            // Only update if record date is today or past
            if (recordDate.getTime() <= nowLocal.getTime()) {
                return prisma.attendance.update({
                    where: { id: record.id },
                    data: { status: 'PRESENT' }
                });
            }
            return null;
        });

        const results = await Promise.all(updatePromises.filter(p => p !== null));

        return NextResponse.json({
            message: 'Attendance statuses updated',
            updated: results.length
        });
    } catch (error) {
        console.error('Error updating attendance statuses:', error);
        return NextResponse.json({ error: 'Failed to update statuses' }, { status: 500 });
    }
}
