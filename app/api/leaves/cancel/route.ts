import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

// 휴무 신청 취소 API
export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing leave request ID' }, { status: 400 });
        }

        // 휴무 신청 조회
        const leave = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leave) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        // 본인의 신청인지 확인
        if (leave.userId !== session.userId) {
            return NextResponse.json({ error: 'You can only cancel your own leave requests' }, { status: 403 });
        }

        // 이미 취소되었거나 거절된 신청은 취소 불가
        if (leave.status === 'CANCELLED' || leave.status === 'REJECTED') {
            return NextResponse.json({ error: 'This leave request is already cancelled or rejected' }, { status: 400 });
        }

        // 휴무 시작일과 현재일 비교
        const startDate = new Date(leave.startDate);
        const today = new Date();

        // 시간 제거 (날짜만 비교)
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let newStatus: string;
        let message: string;

        // 2일 이상 전이면 즉시 취소
        if (diffDays >= 2) {
            newStatus = 'CANCELLED';
            message = '휴무 신청이 취소되었습니다.';

            // 출퇴근 기록 복원 (OFF_DAY/ABSENT 제거)
            const user = await prisma.user.findUnique({ where: { id: leave.userId } });
            const userName = user?.name || 'Unknown';

            const current = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            while (current <= end) {
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
        // 1일 이내면 관리자 승인 필요
        else {
            newStatus = 'CANCELLATION_PENDING';
            message = '취소 요청이 제출되었습니다. 관리자 승인이 필요합니다.';
        }

        // 상태 업데이트
        const updatedLeave = await prisma.leaveRequest.update({
            where: { id },
            data: { status: newStatus }
        });

        return NextResponse.json({
            leave: updatedLeave,
            message,
            daysUntilLeave: diffDays
        });
    } catch (error) {
        console.error('Cancel leave request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
