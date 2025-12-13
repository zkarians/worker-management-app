import { prisma } from '@/app/lib/prisma';

export async function addStatusLog(userId: string, date: Date, statusText: string, authorId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find existing log for this status
    const existingLogs = await prisma.dailyLog.findMany({
        where: {
            date: { gte: startOfDay, lte: endOfDay },
            content: { startsWith: `[${statusText}]` }
        }
    });

    // Use the first one found, or create new if none
    const targetLog = existingLogs[0];

    if (targetLog) {
        // Parse existing names
        // Content format: "[휴무] Name1, Name2, Name3"
        const prefix = `[${statusText}] `;
        // Ensure we handle cases where prefix might be slightly different or missing space (though we create it with space)
        if (targetLog.content.startsWith(prefix)) {
            const contentWithoutPrefix = targetLog.content.substring(prefix.length);
            const names = contentWithoutPrefix.split(',').map(s => s.trim());

            if (!names.includes(user.name)) {
                names.push(user.name);
                const newContent = `${prefix}${names.join(', ')}`;
                await prisma.dailyLog.update({
                    where: { id: targetLog.id },
                    data: { content: newContent }
                });
            }
        } else {
            // Fallback if format is weird
        }
    } else {
        // Create new log
        await prisma.dailyLog.create({
            data: {
                date: date,
                content: `[${statusText}] ${user.name}`,
                authorId: authorId
            }
        });
    }
}

export async function removeStatusLog(userId: string, date: Date, statusText: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find logs that might contain this user for this status
    const existingLogs = await prisma.dailyLog.findMany({
        where: {
            date: { gte: startOfDay, lte: endOfDay },
            content: { startsWith: `[${statusText}]` }
        }
    });

    for (const log of existingLogs) {
        const prefix = `[${statusText}] `;
        if (!log.content.startsWith(prefix)) continue;

        const contentWithoutPrefix = log.content.substring(prefix.length);
        let names = contentWithoutPrefix.split(',').map(s => s.trim());

        if (names.includes(user.name)) {
            names = names.filter(n => n !== user.name);

            if (names.length === 0) {
                // No names left, delete the log
                await prisma.dailyLog.delete({ where: { id: log.id } });
            } else {
                // Update with remaining names
                const newContent = `${prefix}${names.join(', ')}`;
                await prisma.dailyLog.update({
                    where: { id: log.id },
                    data: { content: newContent }
                });
            }
        }
    }
}

export async function checkAndConsolidateOffDayLogs(date: Date, authorId: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Get all active workers
    const users = await prisma.user.findMany({
        where: { role: { in: ['WORKER', 'MANAGER'] }, isApproved: true }
    });
    const totalUsers = users.length;

    if (totalUsers === 0) return;

    // 2. Count how many are OFF_DAY
    const offDayCount = await prisma.attendance.count({
        where: {
            date: { gte: startOfDay, lte: endOfDay },
            status: 'OFF_DAY'
        }
    });

    // 3. Check if ALL are OFF_DAY
    const isCompanyWideOffDay = offDayCount === totalUsers;

    if (isCompanyWideOffDay) {
        // Delete all individual [휴무] logs
        await prisma.dailyLog.deleteMany({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                content: { contains: '[휴무]' }
            }
        });

        // Create single "웅동 휴무" log if not exists
        const existingCompanyLog = await prisma.dailyLog.findFirst({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                content: '웅동 휴무'
            }
        });

        if (!existingCompanyLog) {
            await prisma.dailyLog.create({
                data: {
                    date: date,
                    content: '웅동 휴무',
                    authorId: authorId,
                }
            });
        }
    } else {
        // Not company-wide: Delete "웅동 휴무" log if exists
        await prisma.dailyLog.deleteMany({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                content: '웅동 휴무'
            }
        });

        // Ensure individual logs exist for OFF_DAY users
        // This is a bit expensive but ensures consistency. 
        // Since this runs after batch update, we can optimize by only checking if we just deleted "웅동 휴무".
        // But to be safe, let's iterate OFF_DAY users.
        const offDayUsers = await prisma.attendance.findMany({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                status: 'OFF_DAY'
            },
            include: { user: true }
        });

        for (const record of offDayUsers) {
            await addStatusLog(record.userId, date, '휴무', authorId);
        }
    }
}
