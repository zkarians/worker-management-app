import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { isWeekendOrHoliday } from '@/app/lib/holidays';

const CONFIG_KEY = 'roster-config';
type BulkConfig = { cleaningSequence: string[]; paletteWorker: string };

async function loadConfig(): Promise<BulkConfig> {
    const defaults: BulkConfig = { cleaningSequence: ["강경수", "전현준", "강성교", "장태윤"], paletteWorker: "김성현" };
    try {
        const record = await prisma.systemConfig.findUnique({ where: { key: CONFIG_KEY } });
        if (record) return JSON.parse(record.value) as BulkConfig;
    } catch { }
    return defaults;
}

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

        // Fetch source assignments and special teams (palette/cleaning)
        const sourceRoster = await prisma.roster.findUnique({
            where: { date: source },
            include: { assignments: true }
        });

        if (!sourceRoster || sourceRoster.assignments.length === 0) {
            return NextResponse.json({ error: 'No roster found for source date' }, { status: 404 });
        }

        const assignmentsToCopy = sourceRoster.assignments;

        const userIds = assignmentsToCopy.map((a: any) => a.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, resignationDate: true }
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

            const approvedLeaves = await prisma.leaveRequest.findMany({
                where: {
                    status: 'APPROVED',
                    startDate: { lte: currentDate },
                    endDate: { gte: currentDate },
                    userId: { in: userIds }
                },
                select: { userId: true }
            });
            const onLeaveUserIds = new Set(approvedLeaves.map((l: any) => l.userId as string));

            const offOrAbsent = await prisma.attendance.findMany({
                where: {
                    date: currentDate,
                    status: { in: ['OFF_DAY', 'ABSENT', 'VACATION', 'LEAVE_OF_ABSENCE'] },
                    userId: { in: userIds }
                },
                select: { userId: true }
            });
            const offOrAbsentUserIds = new Set(offOrAbsent.map((a: any) => a.userId as string));

            const validAssignments = assignmentsToCopy.filter((a: any) => {
                // If it is a daily worker (no userId but has tempWorkerName), it is always valid to copy!
                if (!a.userId && a.tempWorkerName) return true;

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
                if (onLeaveUserIds.has(a.userId)) return false;
                if (offOrAbsentUserIds.has(a.userId)) return false;
                return true;
            });

            // Transaction for each date
            const result = await prisma.$transaction(async (tx: any) => {
                // Find or create roster
                let r = await tx.roster.findUnique({ where: { date: currentDate } });
                if (!r) {
                    r = await tx.roster.create({
                        data: {
                            date: currentDate,
                            paletteTeamId: sourceRoster.paletteTeamId || null,
                            cleaningTeamId: sourceRoster.cleaningTeamId || null
                        }
                    });
                } else {
                    r = await tx.roster.update({
                        where: { id: r.id },
                        data: {
                            paletteTeamId: sourceRoster.paletteTeamId || null,
                            cleaningTeamId: sourceRoster.cleaningTeamId || null
                        }
                    });
                }

                // Get previous assignments before deleting
                const previousAssignments = await tx.rosterAssignment.findMany({
                    where: { rosterId: r.id },
                    select: { userId: true }
                });
                const previousUserIds = new Set<string>(previousAssignments.map((a: any) => a.userId as string).filter(Boolean));

                // Delete existing assignments
                await tx.rosterAssignment.deleteMany({ where: { rosterId: r.id } });

                // Create new assignments
                if (validAssignments.length > 0) {
                    await tx.rosterAssignment.createMany({
                        data: validAssignments.map((a: any) => ({
                            rosterId: r.id,
                            userId: a.userId || null,
                            tempWorkerName: a.tempWorkerName || null,
                            position: a.position,
                            team: a.team,
                            order: a.order ?? 0
                        })),
                    });
                }

                // Attendance adjustments:
                // 1) For users removed from roster, set workHours/overtimeHours to 0
                const newUserIds = new Set<string>(validAssignments.map((a: any) => a.userId).filter(Boolean));
                const removedUserIds: string[] = Array.from(previousUserIds).filter((userId) => !newUserIds.has(userId));

                if (removedUserIds.length > 0) {
                    // Fetch existing attendance records for the removed users
                    const existingAttendances = await tx.attendance.findMany({
                        where: {
                            userId: { in: removedUserIds },
                            date: currentDate
                        }
                    });

                    const attMap = new Map<string, string>();
                    existingAttendances.forEach((att: any) => {
                        attMap.set(att.userId, att.status);
                    });

                    for (const userId of removedUserIds) {
                        const currentStatus = attMap.get(userId) || '';
                        const keepStatus = ['ABSENT', 'LEAVE_OF_ABSENCE', 'VACATION', 'OFF_DAY'].includes(currentStatus);
                        const targetStatus = keepStatus ? currentStatus : '';

                        await tx.attendance.upsert({
                            where: {
                                userId_date: {
                                    userId: userId,
                                    date: currentDate
                                }
                            },
                            update: {
                                workHours: 0,
                                overtimeHours: 0,
                                status: targetStatus
                            },
                            create: {
                                userId: userId,
                                date: currentDate,
                                status: targetStatus,
                                workHours: 0,
                                overtimeHours: 0
                            }
                        });
                    }
                }

                // 2) Auto-create attendance for newly assigned workers (only for registered users)
                const assignedUserIds = validAssignments.map((a: any) => a.userId).filter(Boolean);

                if (assignedUserIds.length > 0) {
                    const existingAttendances = await tx.attendance.findMany({
                        where: {
                            userId: { in: assignedUserIds },
                            date: currentDate
                        },
                        select: { userId: true }
                    });

                    const existingAttendanceUserIds = new Set(existingAttendances.map((a: any) => a.userId));
                    const usersNeedingAttendance = validAssignments.filter((a: any) => a.userId && !existingAttendanceUserIds.has(a.userId));

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isFuture = currentDate > today;
                    const initialStatus = isFuture ? 'SCHEDULED' : 'PRESENT';

                    if (usersNeedingAttendance.length > 0) {
                        await tx.attendance.createMany({
                            data: usersNeedingAttendance.map((a: any) => ({
                                userId: a.userId,
                                date: currentDate,
                                status: initialStatus,
                                workHours: 8,
                                overtimeHours: 0,
                            })),
                            skipDuplicates: true
                        });
                    }

                    // Update existing attendance records that have empty status
                    await tx.attendance.updateMany({
                        where: {
                            userId: { in: assignedUserIds },
                            date: currentDate,
                            status: ''
                        },
                        data: {
                            status: initialStatus,
                            workHours: 8,
                            overtimeHours: 0
                        }
                    });
                }

                return r;
            });
            results.push(result);
        }



        // --- Auto-Assign Logic Start ---
        // If auto-assignment is enabled (future feature, currently enabled by default for next steps or via flag)
        // For now, let's assume we want to do it if `autoAssignCleaning` is true in body
        if (body.autoAssignCleaning) {
            const config = await loadConfig();

            const allTeams = await prisma.team.findMany({ select: { id: true, name: true } });
            const teamById = new Map(allTeams.map(t => [t.id, t.name]));
            const teamIdByName = new Map(allTeams.map(t => [t.name, t.id]));

            // 1. Determine starting index based on source date's cleaning team
            let currentIndex = -1;

            // Find who was the inspector in the source cleaning team
            // We need to fetch source roster again or use what we have? We have `sourceRoster`.
            if (sourceRoster.cleaningTeamId) {
                const cleaningTeamName = teamById.get(sourceRoster.cleaningTeamId) || null;
                if (cleaningTeamName) {
                    const teamAssignments = sourceRoster.assignments.filter((a: any) => a.team === cleaningTeamName && a.position === '검수');
                    const getUserName = (userId: string) => userMap.get(userId)?.name;
                    for (let i = 0; i < config.cleaningSequence.length; i++) {
                        const name = config.cleaningSequence[i];
                        const found = teamAssignments.find((a: any) => getUserName(a.userId) === name);
                        if (found) { currentIndex = i; break; }
                    }
                }
            }

            // 2. Iterate through results (which are created rosters) and update them
            // We need to re-fetch the created rosters or just update them?
            // The `results` array contains the roster objects returned from transaction.
            // We need to process date-by-date to maintain sequence state.

            // Re-fetch created rosters sorted by date
            // IMPORTANT: Only include dates that were actually processed in this run
            // to avoid pre-existing weekend/holiday rosters advancing the rotation index
            const processedIds = new Set(results.map((r: any) => r.id));
            const allRostersInRange = await prisma.roster.findMany({
                where: {
                    date: {
                        gte: start,
                        lte: end
                    }
                },
                orderBy: { date: 'asc' },
                include: { assignments: { include: { user: true } } }
            });
            const createdRosters = allRostersInRange.filter((r: any) => processedIds.has(r.id));

            for (const roster of createdRosters) {
                // Determine Cleaning Team
                let nextCleaningTeamId = null;

                // Try finding next available worker in sequence
                let attempts = 0;
                let foundWorker = false;
                let tempIndex = currentIndex;

                while (attempts < config.cleaningSequence.length) {
                    tempIndex = (tempIndex + 1) % config.cleaningSequence.length;
                    const targetName = config.cleaningSequence[tempIndex];

                    // Check if this worker is present in THIS roster (on this date)
                    const assignment = roster.assignments.find((a: any) => a.user.name === targetName);

                    if (assignment) {
                        const teamId = teamIdByName.get(assignment.team) || null;
                        if (teamId) {
                            nextCleaningTeamId = teamId;
                            currentIndex = tempIndex;
                            foundWorker = true;
                        }
                        break;
                    }
                    attempts++;
                }

                // Determine Palette Team
                let nextPaletteTeamId = null;
                const paletteWorkerName = config.paletteWorker;
                if (paletteWorkerName) {
                    const assignment = roster.assignments.find((a: any) => a.user.name === paletteWorkerName);
                    if (assignment) {
                        const teamId = teamIdByName.get(assignment.team) || null;
                        if (teamId) {
                            nextPaletteTeamId = teamId;
                        }
                    }
                }

                // Update roster if needed
                if (nextCleaningTeamId || nextPaletteTeamId) {
                    await prisma.roster.update({
                        where: { id: roster.id },
                        data: {
                            cleaningTeamId: nextCleaningTeamId,
                            paletteTeamId: nextPaletteTeamId
                        }
                    });
                }
            }
        }

        return NextResponse.json({ message: 'Bulk copy successful', count: results.length });
    } catch (error: any) {
        console.error('Bulk copy error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
