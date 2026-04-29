import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { isWeekendOrHoliday } from '@/app/lib/holidays';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { sourceDate, startDate, endDate, excludeHolidays = true } = body;

        if (!sourceDate || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const source = new Date(sourceDate);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Fetch source assignments
        const sourceRoster = await prisma.roster.findUnique({
            where: { date: source },
            include: { assignments: true }
        });

        if (!sourceRoster || sourceRoster.assignments.length === 0) {
            return NextResponse.json({ error: 'No roster found for source date' }, { status: 404 });
        }

        const assignmentsToCopy = sourceRoster.assignments;

        // Fetch users to check resignation dates
        const userIds = assignmentsToCopy.map((a: any) => a.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, resignationDate: true }
        });
        const userMap = new Map(users.map((u: any) => [u.id, u]));

        // Iterate through dates
        const results = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);

            // Skip weekends and holidays if requested
            if (excludeHolidays && isWeekendOrHoliday(currentDate)) {
                continue;
            }

            // Filter assignments for this specific date
            const validAssignments = assignmentsToCopy.filter((a: any) => {
                const user = userMap.get(a.userId);
                if (!user) return false;

                // Check resignation date
                if (user.resignationDate) {
                    // Compare dates: if currentDate is on or after resignationDate, exclude
                    // Ensure we compare just the date parts
                    const resignDate = new Date(user.resignationDate);
                    const current = new Date(currentDate);

                    // Reset times to 00:00:00 for accurate date comparison
                    resignDate.setHours(0, 0, 0, 0);
                    current.setHours(0, 0, 0, 0);

                    if (current >= resignDate) return false;
                }
                return true;
            });

            // Transaction for each date
            const result = await prisma.$transaction(async (tx: any) => {
                // Find or create roster
                let r = await tx.roster.findUnique({ where: { date: currentDate } });
                if (!r) {
                    r = await tx.roster.create({ data: { date: currentDate } });
                }

                // Delete existing assignments
                await tx.rosterAssignment.deleteMany({ where: { rosterId: r.id } });

                // Create new assignments
                if (validAssignments.length > 0) {
                    await tx.rosterAssignment.createMany({
                        data: validAssignments.map((a: any) => ({
                            rosterId: r.id,
                            userId: a.userId,
                            position: a.position,
                            team: a.team,
                        })),
                    });
                }

                return r;
            });
            results.push(result);
        }

        return NextResponse.json({ message: 'Bulk copy successful', count: results.length });
    } catch (error) {
        console.error('Bulk copy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
