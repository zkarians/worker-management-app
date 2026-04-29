import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFeb6() {
    console.log('🔍 Checking Roster for 2026-02-06...');

    // Try to catch the date regardless of timezone logic in DB if we query range
    const startDate = new Date('2026-02-06T00:00:00.000Z');
    const endDate = new Date('2026-02-06T23:59:59.999Z');

    const rosters = await prisma.roster.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            cleaningTeam: true,
            paletteTeam: true
        }
    });

    if (rosters.length === 0) {
        console.log("❌ No roster found for Feb 6.");
    } else {
        for (const roster of rosters) {
            console.log(`\n📅 Date: ${roster.date.toISOString()}`);
            console.log(`   ID: ${roster.id}`);
            console.log(`   [DB Field: cleaningTeamId]: ${roster.cleaningTeamId} (${roster.cleaningTeam?.name})`);
            console.log(`   [DB Field: paletteTeamId]: ${roster.paletteTeamId} (${roster.paletteTeam?.name})`);
        }
    }
}

checkFeb6()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
