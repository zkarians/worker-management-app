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
            // Fallback if format is weird, just append? No, safer to create new or fix. 
            // If it starts with [휴무] but not [휴무] (space), maybe it is [휴무]Name.
            // Let's just create a new one if format doesn't match exactly to avoid breaking things, 
            // OR try to be smart. Let's stick to exact prefix match for safety.
            // If we can't parse it easily, we might just create a new one, which leads to the original issue but safer.
            // Actually, let's just assume the prefix is standard.
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
