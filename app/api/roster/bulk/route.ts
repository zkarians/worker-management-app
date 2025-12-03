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

        // Iterate through dates
        const results = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);

            // Skip weekends and holidays if requested
            if (excludeHolidays && isWeekendOrHoliday(currentDate)) {
                continue;
            }

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
                await tx.rosterAssignment.createMany({
                    data: assignmentsToCopy.map((a: any) => ({
                        rosterId: r.id,
                        userId: a.userId,
                        position: a.position,
                        team: a.team,
                    })),
                });

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
