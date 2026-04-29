import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTeamAssignment() {
    console.log('🔍 Checking Roster for 2026-02-12...');

    const targetDate = new Date('2026-02-12T00:00:00.000Z');
    // Also check 13th just in case
    const targetDate2 = new Date('2026-02-13T00:00:00.000Z');

    const rosters = await prisma.roster.findMany({
        where: {
            date: {
                in: [targetDate, targetDate2]
            }
        },
        include: {
            cleaningTeam: true,
            paletteTeam: true
        }
    });

    for (const roster of rosters) {
        console.log(`\n📅 Date: ${roster.date.toISOString().split('T')[0]}`);
        console.log(`   ID: ${roster.id}`);
        console.log(`   [DB Field: cleaningTeamId]: ${roster.cleaningTeamId}`);
        console.log(`   -> [Team Name]: ${roster.cleaningTeam?.name || 'NULL'}`);
        console.log(`   [DB Field: paletteTeamId]: ${roster.paletteTeamId}`);
        console.log(`   -> [Team Name]: ${roster.paletteTeam?.name || 'NULL'}`);
    }
}

checkTeamAssignment()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
