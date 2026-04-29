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
        const { date: dateStr, sourceTeamId, targetTeamId } = body;

        if (!dateStr || !sourceTeamId || !targetTeamId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const date = new Date(dateStr);

        // Get team names for robust assignment
        const sourceTeam = await prisma.team.findUnique({ where: { id: sourceTeamId } });
        const targetTeam = await prisma.team.findUnique({ where: { id: targetTeamId } });

        if (!sourceTeam || !targetTeam) {
            return NextResponse.json({ error: 'Teams not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Find roster
            const roster = await tx.roster.findUnique({
                where: { date }
            });

            if (!roster) {
                throw new Error('Roster not found for this date');
            }

            // 1. Unassign existing workers in target team
            // Find existing assignments for target team to handle attendance
            const targetAssignments = await tx.rosterAssignment.findMany({
                where: {
                    rosterId: roster.id,
                    team: targetTeam.name
                },
                select: { userId: true }
            });

            const targetUserIds = targetAssignments.map(a => a.userId);

            // Delete existing assignments for target team
            await tx.rosterAssignment.deleteMany({
                where: {
                    rosterId: roster.id,
                    team: targetTeam.name
                }
            });

            // Update attendance for unassigned target users (set workHours to 0)
            for (const userId of targetUserIds) {
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
                        status: '' // Reset to default 
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

            // 2. Move source team assignments to target team
            // Find source assignments
            const sourceAssignments = await tx.rosterAssignment.findMany({
                where: {
                    rosterId: roster.id,
                    team: sourceTeam.name
                }
            });

            // Update them to be in target team
            // We can't update 'team' field directly if it violates unique constraints? 
            // RosterAssignment constraint is [rosterId, userId]. Changing team is fine.
            // But we need to update multiple rows.

            // It's safer to use updateMany
            await tx.rosterAssignment.updateMany({
                where: {
                    rosterId: roster.id,
                    team: sourceTeam.name
                },
                data: {
                    team: targetTeam.name
                }
            });

            // Note: Source user attendance doesn't need to change as they are still working, just different team.

            return { success: true };
        });

        return NextResponse.json({ message: 'Team moved successfully', result });
    } catch (error) {
        console.error('Error moving team:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
