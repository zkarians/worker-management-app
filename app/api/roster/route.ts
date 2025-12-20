import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) return NextResponse.json({ error: 'Date required' }, { status: 400 });

        const date = new Date(dateStr);

        const roster = await prisma.roster.findUnique({
            where: { date },
            include: {
                assignments: {
                    include: { user: { select: { id: true, name: true, role: true, company: true } } }
                },
                paletteTeam: { select: { id: true, name: true } },
                cleaningTeam: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json({ roster });
    } catch (error) {
        console.error(error);
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
        const { date: dateStr, assignments, paletteTeamId, cleaningTeamId } = body; // assignments: { userId, position, team }[]

        if (!dateStr) return NextResponse.json({ error: 'Date required' }, { status: 400 });

        const date = new Date(dateStr);

        // Get approved leaves for this date
        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                status: 'APPROVED',
                startDate: { lte: date },
                endDate: { gte: date }
            },
            select: { userId: true }
        });

        const onLeaveUserIds = new Set(approvedLeaves.map(l => l.userId));

        // Transaction to update roster
        const roster = await prisma.$transaction(async (tx: any) => {
            // Find or create roster
            let r = await tx.roster.findUnique({ where: { date } });
            if (!r) {
                r = await tx.roster.create({
                    data: {
                        date,
                        paletteTeamId: paletteTeamId || null,
                        cleaningTeamId: cleaningTeamId || null
                    }
                });
            } else {
                // Update palette and cleaning team
                r = await tx.roster.update({
                    where: { id: r.id },
                    data: {
                        paletteTeamId: paletteTeamId || null,
                        cleaningTeamId: cleaningTeamId || null
                    }
                });
            }

            // Get previous assignments before deleting
            const previousAssignments = await tx.rosterAssignment.findMany({
                where: { rosterId: r.id },
                select: { userId: true }
            });
            const previousUserIds = new Set<string>(previousAssignments.map((a: any) => a.userId as string));

            // Delete existing assignments for this roster
            await tx.rosterAssignment.deleteMany({ where: { rosterId: r.id } });

            // Filter out users on approved leave and create new assignments
            const validAssignments = assignments && assignments.length > 0
                ? assignments.filter((a: any) => !onLeaveUserIds.has(a.userId))
                : [];
            const newUserIds = new Set<string>(validAssignments.map((a: any) => a.userId as string));

            // Find users who were removed from roster (were in previous but not in new)
            const removedUserIds: string[] = Array.from(previousUserIds).filter((userId) => !newUserIds.has(userId));

            // Update attendance for removed users: workHours = 0, overtimeHours = 0
            for (const userId of removedUserIds) {
                await tx.attendance.upsert({
                    where: {
                        userId_date: {
                            userId: userId,
                            date: date,
                        }
                    },
                    update: {
                        workHours: 0,
                        overtimeHours: 0,
                    },
                    create: {
                        userId: userId,
                        date: date,
                        status: '',
                        workHours: 0,
                        overtimeHours: 0,
                    }
                });
            }

            // Create new assignments and attendance for newly assigned workers
            if (validAssignments.length > 0) {
                await tx.rosterAssignment.createMany({
                    data: validAssignments.map((a: any) => ({
                        rosterId: r.id,
                        userId: a.userId,
                        position: a.position,
                        team: a.team,
                    })),
                });

                // Auto-create attendance records for assigned workers
                // Only create if attendance doesn't already exist
                for (const assignment of validAssignments) {
                    const existingAttendance = await tx.attendance.findUnique({
                        where: {
                            userId_date: {
                                userId: assignment.userId,
                                date: date,
                            }
                        }
                    });

                    // Only create if attendance doesn't exist
                    if (!existingAttendance) {
                        // Check if date is in the future
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isFuture = date > today;
                        const initialStatus = isFuture ? 'SCHEDULED' : 'PRESENT';

                        await tx.attendance.create({
                            data: {
                                userId: assignment.userId,
                                date: date,
                                status: initialStatus,
                                workHours: 8,
                                overtimeHours: 0,
                            }
                        });
                    }
                }
            }

            // Fetch updated roster with relations
            return await tx.roster.findUnique({
                where: { id: r.id },
                include: {
                    paletteTeam: { select: { id: true, name: true } },
                    cleaningTeam: { select: { id: true, name: true } }
                }
            });
        });

        return NextResponse.json({ message: 'Roster updated', roster });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
