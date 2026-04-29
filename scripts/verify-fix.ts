
import { prisma } from '../app/lib/prisma';
import { checkAndConsolidateOffDayLogs } from '../app/lib/log-utils';

async function main() {
    console.log('Starting verification...');

    // 1. Setup: Create Test Users
    const email = `test-${Date.now()}@example.com`;
    const username = `testuser${Date.now()}`;

    const user = await prisma.user.create({
        data: {
            username: username,
            password: 'password',
            name: 'TestWorker',
            role: 'WORKER',
            isApproved: true,
            hireDate: new Date(),
        }
    });

    console.log(`Created test user: ${user.name} (${user.id})`);

    try {
        // 2. Test Resignation Logic (Future Date)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        await prisma.user.update({
            where: { id: user.id },
            data: { resignationDate: tomorrow }
        });

        const activeUsersFuture = await prisma.user.findMany({
            where: {
                role: 'WORKER',
                OR: [
                    { resignationDate: null },
                    { resignationDate: { gt: new Date() } }
                ]
            }
        });

        const isFoundFuture = activeUsersFuture.some(u => u.id === user.id);
        console.log(`[Test 1] User with future resignation date is active: ${isFoundFuture ? 'PASS' : 'FAIL'}`);

        // 3. Test Resignation Logic (Past Date)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await prisma.user.update({
            where: { id: user.id },
            data: { resignationDate: yesterday }
        });

        const activeUsersPast = await prisma.user.findMany({
            where: {
                role: 'WORKER',
                OR: [
                    { resignationDate: null },
                    { resignationDate: { gt: new Date() } }
                ]
            }
        });

        const isFoundPast = activeUsersPast.some(u => u.id === user.id);
        console.log(`[Test 2] User with past resignation date is excluded: ${!isFoundPast ? 'PASS' : 'FAIL'}`);

        // 4. Test "Ungdong Closed" Logic
        // We need at least one active user to test this properly.
        // Let's create another active user.
        const activeUser = await prisma.user.create({
            data: {
                username: `active${Date.now()}`,
                password: 'password',
                name: 'ActiveWorker',
                role: 'WORKER',
                isApproved: true,
                hireDate: new Date(),
            }
        });

        // Mark active user as OFF_DAY for today
        const today = new Date();
        await prisma.attendance.create({
            data: {
                userId: activeUser.id,
                date: today,
                status: 'OFF_DAY'
            }
        });

        // Run consolidation
        // Note: The resigned user (TestWorker) should be ignored.
        // The active user (ActiveWorker) is OFF.
        // So "Ungdong Closed" should be created.

        // First, ensure no existing log
        await prisma.dailyLog.deleteMany({
            where: { content: '웅동 휴무', date: today }
        });

        await checkAndConsolidateOffDayLogs(today, activeUser.id);

        const closedLog = await prisma.dailyLog.findFirst({
            where: { content: '웅동 휴무', date: today }
        });

        console.log(`[Test 3] "Ungdong Closed" log created: ${closedLog ? 'PASS' : 'FAIL'}`);

        // Cleanup
        await prisma.attendance.deleteMany({ where: { userId: activeUser.id } });
        await prisma.dailyLog.deleteMany({ where: { authorId: activeUser.id } });
        await prisma.user.delete({ where: { id: activeUser.id } });

    } catch (e) {
        console.error(e);
    } finally {
        // Cleanup main test user
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.$disconnect();
    }
}

main();
