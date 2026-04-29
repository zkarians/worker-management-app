import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const testDate = new Date('2026-12-31');
    testDate.setUTCHours(0, 0, 0, 0);

    console.log('--- Phase 1: Cleaning up test data ---');
    const existingRoster = await prisma.roster.findUnique({ where: { date: testDate } });
    if (existingRoster) {
        await prisma.rosterAssignment.deleteMany({ where: { rosterId: existingRoster.id } });
        await prisma.roster.delete({ where: { id: existingRoster.id } });
    }

    console.log('--- Phase 2: Finding test users ---');
    const users = await prisma.user.findMany({
        where: { role: 'WORKER' },
        take: 2
    });

    if (users.length < 2) {
        console.error('Not enough users for testing');
        return;
    }

    console.log(`Using users: ${users[0].name} (ID: ${users[0].id}) and ${users[1].name} (ID: ${users[1].id})`);

    console.log('--- Phase 3: Creating roster with specific order ---');
    const roster = await prisma.roster.create({
        data: {
            date: testDate,
            assignments: {
                create: [
                    { userId: users[0].id, position: '상하역', team: '1조', order: 0 },
                    { userId: users[1].id, position: '상하역', team: '1조', order: 1 }
                ]
            }
        }
    });

    console.log('--- Phase 4: Verifying order in fetch ---');
    const fetchedRoster = await prisma.roster.findUnique({
        where: { id: roster.id },
        include: {
            assignments: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (fetchedRoster && fetchedRoster.assignments[0].userId === users[0].id && fetchedRoster.assignments[1].userId === users[1].id) {
        console.log('✅ Fetch order verified (0 -> 1)');
    } else {
        console.error('❌ Fetch order verification failed');
        console.log('Actual order:', fetchedRoster?.assignments.map(a => a.userId));
    }

    console.log('--- Phase 5: Re-saving with reversed order ---');
    await prisma.rosterAssignment.deleteMany({ where: { rosterId: roster.id } });
    await prisma.rosterAssignment.createMany({
        data: [
            { rosterId: roster.id, userId: users[1].id, position: '상하역', team: '1조', order: 0 },
            { rosterId: roster.id, userId: users[0].id, position: '상하역', team: '1조', order: 1 }
        ]
    });

    const reversedRoster = await prisma.roster.findUnique({
        where: { id: roster.id },
        include: {
            assignments: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (reversedRoster && reversedRoster.assignments[0].userId === users[1].id && reversedRoster.assignments[1].userId === users[0].id) {
        console.log('✅ Reversed order verified (1 -> 0)');
    } else {
        console.error('❌ Reversed order verification failed');
    }

    console.log('--- Phase 6: Verifying bulk copy preservation ---');
    const bulkDate = new Date('2027-01-01');
    bulkDate.setUTCHours(0, 0, 0, 0);

    // Clean up bulk date
    const existingBulk = await prisma.roster.findUnique({ where: { date: bulkDate } });
    if (existingBulk) {
        await prisma.rosterAssignment.deleteMany({ where: { rosterId: existingBulk.id } });
        await prisma.roster.delete({ where: { id: existingBulk.id } });
    }

    // Simulate bulk copy logic from API
    const bulkRoster = await prisma.roster.create({
        data: {
            date: bulkDate,
            assignments: {
                create: reversedRoster!.assignments.map(a => ({
                    userId: a.userId,
                    position: a.position,
                    team: a.team,
                    order: a.order
                }))
            }
        }
    });

    const fetchedBulk = await prisma.roster.findUnique({
        where: { id: bulkRoster.id },
        include: {
            assignments: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (fetchedBulk && fetchedBulk.assignments[0].userId === users[1].id && fetchedBulk.assignments[1].userId === users[0].id) {
        console.log('✅ Bulk copy preservation verified');
    } else {
        console.error('❌ Bulk copy preservation failed');
    }

    console.log('--- Final Cleanup ---');
    await prisma.rosterAssignment.deleteMany({ where: { rosterId: roster.id } });
    await prisma.roster.delete({ where: { id: roster.id } });
    await prisma.rosterAssignment.deleteMany({ where: { rosterId: bulkRoster.id } });
    await prisma.roster.delete({ where: { id: bulkRoster.id } });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
