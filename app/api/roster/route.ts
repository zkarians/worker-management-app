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
                    include: { user: { select: { id: true, name: true, role: true, company: true, resignationDate: true } } },
                    orderBy: { order: 'asc' }
                },
                paletteTeam: { select: { id: true, name: true } },
                cleaningTeam: { select: { id: true, name: true } }
            }
        });

        if (roster && roster.assignments) {
            // Map assignments to synthesize a mock user for daily workers
            roster.assignments = roster.assignments.map((assignment: any) => {
                if (!assignment.userId && assignment.tempWorkerName) {
                    return {
                        ...assignment,
                        user: {
                            id: null,
                            name: assignment.tempWorkerName,
                            role: 'DAILY_WORKER',
                            company: { name: '일용직' },
                            resignationDate: null
                        }
                    };
                }
                return assignment;
            });

            // Filter out users who have resigned before this roster date
            roster.assignments = roster.assignments.filter((assignment: any) => {
                if (!assignment.user) return true; // Daily workers have no original user or are already synthesized
                if (!assignment.user.resignationDate) return true;
                const resignDate = new Date(assignment.user.resignationDate);
                // Set time to start of day for accurate comparison
                resignDate.setHours(0, 0, 0, 0);
                const rosterDate = new Date(date);
                rosterDate.setHours(0, 0, 0, 0);

                // If resignation date is after roster date, they are still working
                return resignDate > rosterDate;
            });
        }

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

        // Get users who are on VACATION or LEAVE_OF_ABSENCE for this date
        const attendanceLeaves = await prisma.attendance.findMany({
            where: {
                date,
                status: { in: ['VACATION', 'LEAVE_OF_ABSENCE'] }
            },
            select: { userId: true }
        });

        const onLeaveUserIds = new Set([
            ...approvedLeaves.map(l => l.userId),
            ...attendanceLeaves.map(a => a.userId)
        ]);

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
            const previousUserIds = new Set<string>(previousAssignments.map((a: any) => a.userId as string).filter(Boolean));

            // Delete existing assignments for this roster
            await tx.rosterAssignment.deleteMany({ where: { rosterId: r.id } });

            // Filter out users on approved leave (only for registered users) and create new assignments
            const validAssignments = assignments && assignments.length > 0
                ? assignments.filter((a: any) => !a.userId || !onLeaveUserIds.has(a.userId))
                : [];
            const newUserIds = new Set<string>(validAssignments.map((a: any) => a.userId).filter(Boolean));

            // Find users who were removed from roster (were in previous but not in new)
            const removedUserIds: string[] = Array.from(previousUserIds).filter((userId) => !newUserIds.has(userId));

            // Update attendance for removed users: workHours = 0, overtimeHours = 0
            for (const userId of removedUserIds) {
                const existingAttendance = await tx.attendance.findUnique({
                    where: {
                        userId_date: {
                            userId: userId,
                            date: date,
                        }
                    }
                });

                const currentStatus = existingAttendance?.status || '';
                const keepStatus = ['ABSENT', 'LEAVE_OF_ABSENCE', 'VACATION', 'OFF_DAY'].includes(currentStatus);
                const targetStatus = keepStatus ? currentStatus : '';

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
                        status: targetStatus,
                    },
                    create: {
                        userId: userId,
                        date: date,
                        status: targetStatus,
                        workHours: 0,
                        overtimeHours: 0,
                    }
                });
            }

            // Create new assignments and attendance for newly assigned workers
            if (validAssignments.length > 0) {
                await tx.rosterAssignment.createMany({
                    data: validAssignments.map((a: any, index: number) => ({
                        rosterId: r.id,
                        userId: a.userId || null,
                        tempWorkerName: a.tempWorkerName || null,
                        position: a.position,
                        team: a.team,
                        order: index
                    })),
                });

                // Auto-create attendance records for assigned workers (only for registered users)
                const assignedUserIds = validAssignments.map((a: any) => a.userId).filter(Boolean);

                if (assignedUserIds.length > 0) {
                    const existingAttendances = await tx.attendance.findMany({
                        where: {
                            userId: { in: assignedUserIds },
                            date: date
                        },
                        select: { userId: true }
                    });

                    const existingAttendanceUserIds = new Set(existingAttendances.map((a: any) => a.userId));
                    const usersNeedingAttendance = validAssignments.filter((a: any) => a.userId && !existingAttendanceUserIds.has(a.userId));

                    if (usersNeedingAttendance.length > 0) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isFuture = date > today;
                        const initialStatus = isFuture ? 'SCHEDULED' : 'PRESENT';

                        await tx.attendance.createMany({
                            data: usersNeedingAttendance.map((a: any) => ({
                                userId: a.userId,
                                date: date,
                                status: initialStatus,
                                workHours: 8,
                                overtimeHours: 0,
                            })),
                            skipDuplicates: true
                        });
                    }

                    // Update existing attendance records that have empty status
                    // This fixes the issue where workers re-added to roster might stick with empty status
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isFuture = date > today;
                    const targetStatus = isFuture ? 'SCHEDULED' : 'PRESENT';

                    await tx.attendance.updateMany({
                        where: {
                            userId: { in: assignedUserIds },
                            date: date,
                            status: '' // Only update if status is empty (reset state)
                        },
                        data: {
                            status: targetStatus, // Set to valid status
                            workHours: 8,
                            overtimeHours: 0
                        }
                    });
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
    } catch (error: any) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: errorMessage || 'Unknown internal server error' }, { status: 500 });
    }
}
