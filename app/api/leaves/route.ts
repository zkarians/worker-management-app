import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let where: any = {};
        if (session.role === 'WORKER') {
            where.userId = session.userId;
        }
        if (status) {
            where.status = status;
        }

        const leaves = await prisma.leaveRequest.findMany({
            where,
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ leaves });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { startDate, endDate, type, reason } = body;

        if (!startDate || !endDate || !type) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        // Check if start date is tomorrow or later for auto-approval logic (if we had it, but here we just save)
        // Requirement: "If application date and leave date are 1 day difference, manager approval needed."
        // Actually, all leaves might need approval or auto-approve if far enough?
        // User said: "automatically removed from roster... except if 1 day difference, manager approval needed."
        // For simplicity, we'll set all to PENDING initially, or APPROVED if far enough.
        // Let's stick to PENDING for all for now to be safe, or implement the logic.

        // Logic: If (Start - Today) > 1 day -> Auto Approve? 
        // "근무자들은 특정날짜에 결근을 미리 신청해서 근무배치표에서 그날에 자동으로 빠지게 되도록 하고싶어. 단 신청일과 결근신청일이 하루차이일 경우 관리자의 승인이 필요하도록 만들어줘."
        // So if diff > 1 day, Auto Approve. Else Pending.

        const diffTime = Math.abs(start.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status = 'APPROVED';
        if (diffDays <= 2) { // "하루차이" roughly means today for tomorrow or today.
            status = 'PENDING';
        }

        const leave = await prisma.leaveRequest.create({
            data: {
                userId: session.userId as string,
                startDate: start,
                endDate: end,
                type,
                reason,
                status,
            },
        });

        // If Approved (Auto-approved), update Attendance and remove from Roster
        if (status === 'APPROVED') {
            const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
            const userName = user?.name || 'Unknown';

            const current = new Date(start);
            while (current <= end) {
                // Check if Weekend (Sat/Sun)
                const day = current.getDay();
                const isWeekend = day === 0 || day === 6;
                const statusType = isWeekend ? 'OFF_DAY' : 'ABSENT';
                const logContent = isWeekend ? `[휴무] ${userName}` : `[결근] ${userName}`;

                // Update Attendance
                await prisma.attendance.upsert({
                    where: {
                        userId_date: {
                            userId: session.userId as string,
                            date: current,
                        }
                    },
                    update: { status: statusType, workHours: 0, overtimeHours: 0 },
                    create: {
                        userId: session.userId as string,
                        date: current,
                        status: statusType,
                        workHours: 0,
                        overtimeHours: 0
                    },
                });

                // Create DailyLog
                const startOfDay = new Date(current);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(current);
                endOfDay.setHours(23, 59, 59, 999);

                const existingLog = await prisma.dailyLog.findFirst({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        content: logContent
                    }
                });

                if (!existingLog) {
                    await prisma.dailyLog.create({
                        data: {
                            date: current,
                            content: logContent,
                            authorId: session.userId as string,
                        }
                    });
                }

                // Remove from Roster
                const roster = await prisma.roster.findUnique({ where: { date: current } });
                if (roster) {
                    await prisma.rosterAssignment.deleteMany({
                        where: { rosterId: roster.id, userId: session.userId as string }
                    });
                }

                current.setDate(current.getDate() + 1);
            }
        }

        return NextResponse.json({ leave });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Get the leave request before update to check previous status
        const previousLeave = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        const leave = await prisma.leaveRequest.update({
            where: { id },
            data: { status },
        });

        // If Approved by Manager, update Attendance and remove from Roster
        if (status === 'APPROVED') {
            const user = await prisma.user.findUnique({ where: { id: leave.userId } });
            const userName = user?.name || 'Unknown';

            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const current = new Date(start);

            while (current <= end) {
                // Check if Weekend (Sat/Sun)
                const day = current.getDay();
                const isWeekend = day === 0 || day === 6;
                const statusType = isWeekend ? 'OFF_DAY' : 'ABSENT';
                const logContent = isWeekend ? `[휴무] ${userName}` : `[결근] ${userName}`;

                // Update Attendance
                await prisma.attendance.upsert({
                    where: {
                        userId_date: {
                            userId: leave.userId,
                            date: current,
                        }
                    },
                    update: { status: statusType, workHours: 0, overtimeHours: 0 },
                    create: {
                        userId: leave.userId,
                        date: current,
                        status: statusType,
                        workHours: 0,
                        overtimeHours: 0
                    },
                });

                // Create DailyLog
                const startOfDay = new Date(current);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(current);
                endOfDay.setHours(23, 59, 59, 999);

                const existingLog = await prisma.dailyLog.findFirst({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        content: logContent
                    }
                });

                if (!existingLog) {
                    await prisma.dailyLog.create({
                        data: {
                            date: current,
                            content: logContent,
                            authorId: session.userId as string,
                        }
                    });
                }

                // Remove from Roster
                const roster = await prisma.roster.findUnique({ where: { date: current } });
                if (roster) {
                    await prisma.rosterAssignment.deleteMany({
                        where: { rosterId: roster.id, userId: leave.userId }
                    });
                }

                current.setDate(current.getDate() + 1);
            }
        }

        // If Cancelled by Manager (from CANCELLATION_PENDING), restore attendance
        if (status === 'CANCELLED' && previousLeave?.status === 'CANCELLATION_PENDING') {
            const user = await prisma.user.findUnique({ where: { id: leave.userId } });
            const userName = user?.name || 'Unknown';

            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const current = new Date(start);

            while (current <= end) {
                // Delete OFF_DAY (and ABSENT for backward compatibility) attendance records
                await prisma.attendance.deleteMany({
                    where: {
                        userId: leave.userId,
                        date: current,
                        status: { in: ['OFF_DAY', 'ABSENT'] }
                    }
                });

                // Delete DailyLog (both types)
                const startOfDay = new Date(current);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(current);
                endOfDay.setHours(23, 59, 59, 999);

                const logsToDelete = await prisma.dailyLog.findMany({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        OR: [
                            { content: `[휴무] ${userName}` },
                            { content: `[결근] ${userName}` }
                        ]
                    }
                });

                for (const log of logsToDelete) {
                    await prisma.dailyLog.delete({ where: { id: log.id } });
                }

                current.setDate(current.getDate() + 1);
            }
        }

        // If Rejected (and was previously approved), allow user to be added back to roster
        // Note: We don't automatically add them back, but remove the OFF_DAY attendance restriction
        if (status === 'REJECTED' && previousLeave?.status === 'APPROVED') {
            const user = await prisma.user.findUnique({ where: { id: leave.userId } });
            const userName = user?.name || 'Unknown';

            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const current = new Date(start);

            while (current <= end) {
                // Delete OFF_DAY (and ABSENT) attendance records created by the approved leave
                await prisma.attendance.deleteMany({
                    where: {
                        userId: leave.userId,
                        date: current,
                        status: { in: ['OFF_DAY', 'ABSENT'] }
                    }
                });

                // Delete DailyLog (both types)
                const startOfDay = new Date(current);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(current);
                endOfDay.setHours(23, 59, 59, 999);

                const logsToDelete = await prisma.dailyLog.findMany({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        OR: [
                            { content: `[휴무] ${userName}` },
                            { content: `[결근] ${userName}` }
                        ]
                    }
                });

                for (const log of logsToDelete) {
                    await prisma.dailyLog.delete({ where: { id: log.id } });
                }

                current.setDate(current.getDate() + 1);
            }
        }

        // If rejecting a cancellation request (CANCELLATION_PENDING -> APPROVED), keep the leave
        if (status === 'APPROVED' && previousLeave?.status === 'CANCELLATION_PENDING') {
            // Leave stays approved, no need to change attendance (already ABSENT)
        }

        return NextResponse.json({ leave });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Get the leave request to check ownership and status
        const leave = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leave) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        // Only allow deletion if:
        // 1. User is the owner of the request OR User is MANAGER
        // 2. Status is not APPROVED (unless MANAGER)
        if (session.role !== 'MANAGER' && leave.userId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized: You can only delete your own leave requests' }, { status: 403 });
        }

        if (session.role !== 'MANAGER' && leave.status === 'APPROVED') {
            return NextResponse.json({ error: 'Approved leave requests cannot be deleted' }, { status: 400 });
        }

        // If deleting an APPROVED leave request, clean up attendance and logs
        if (leave.status === 'APPROVED') {
            const user = await prisma.user.findUnique({ where: { id: leave.userId } });
            const userName = user?.name || 'Unknown';

            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const current = new Date(start);

            while (current <= end) {
                // Delete OFF_DAY (and ABSENT) attendance records created by the approved leave
                await prisma.attendance.deleteMany({
                    where: {
                        userId: leave.userId,
                        date: current,
                        status: { in: ['OFF_DAY', 'ABSENT'] }
                    }
                });

                // Delete DailyLog (both types)
                const startOfDay = new Date(current);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(current);
                endOfDay.setHours(23, 59, 59, 999);

                const logsToDelete = await prisma.dailyLog.findMany({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        OR: [
                            { content: `[휴무] ${userName}` },
                            { content: `[결근] ${userName}` }
                        ]
                    }
                });

                for (const log of logsToDelete) {
                    await prisma.dailyLog.delete({ where: { id: log.id } });
                }

                current.setDate(current.getDate() + 1);
            }
        }

        // Delete the leave request
        await prisma.leaveRequest.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        console.error('Delete leave request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
