import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { startDate, endDate } = body;

        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find rosters in range
            const rosters = await tx.roster.findMany({
                where: {
                    date: {
                        gte: start,
                        lte: end
                    }
                },
                select: { id: true }
            });

            const rosterIds = rosters.map(r => r.id);

            // 2. Delete assignments
            const deletedAssignments = await tx.rosterAssignment.deleteMany({
                where: {
                    rosterId: { in: rosterIds }
                }
            });

            // 3. Reset roster fields (cleaning/palette teams)
            const updateRosters = await tx.roster.updateMany({
                where: {
                    id: { in: rosterIds }
                },
                data: {
                    cleaningTeamId: null,
                    paletteTeamId: null
                }
            });

            // 4. Reset attendance to UNASSIGNED and 0 hours
            // We need to find all attendance records for these dates
            const updateAttendance = await tx.attendance.updateMany({
                where: {
                    date: {
                        gte: start,
                        lte: end
                    }
                },
                data: {
                    status: '', // Reset to default
                    workHours: 0,
                    overtimeHours: 0
                }
            });

            return {
                assignmentsDeleted: deletedAssignments.count,
                rostersUpdated: updateRosters.count,
                attendanceReset: updateAttendance.count
            };
        });

        return NextResponse.json({
            message: 'Roster cleared successfully',
            result
        });

    } catch (error) {
        console.error('Error clearing roster:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
