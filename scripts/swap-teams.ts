import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function swapTeams() {
    console.log('🔄 Swapping Cleaning and Palette teams for period: 2025-12-01 ~ 2026-02-13');

    const startDate = new Date('2025-12-01T00:00:00.000Z');
    const endDate = new Date('2026-02-13T23:59:59.999Z');

    try {
        await prisma.$transaction(async (tx) => {
            // Find all rosters within the date range
            const rosters = await tx.roster.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            console.log(`Found ${rosters.length} rosters to update.`);

            let updatedCount = 0;

            for (const roster of rosters) {
                // Swap cleaningTeamId and paletteTeamId
                const originalCleaningTeamId = roster.cleaningTeamId;
                const originalPaletteTeamId = roster.paletteTeamId;

                // Only update if there's something to swap or if both are null (though if both null, swap does nothing)
                // We update regardless to ensure consistency with the user's request
                await tx.roster.update({
                    where: { id: roster.id },
                    data: {
                        cleaningTeamId: originalPaletteTeamId,
                        paletteTeamId: originalCleaningTeamId
                    }
                });
                updatedCount++;

                // Log progress every 10 records
                if (updatedCount % 10 === 0) {
                    console.log(`  Progress: ${updatedCount}/${rosters.length}`);
                }
            }

            console.log(`✅ Successfully swapped teams for ${updatedCount} rosters.`);
        }, {
            maxWait: 30000,  // Increased from default 2000ms
            timeout: 120000  // Increased from default 5000ms
        });

    } catch (error) {
        console.error('❌ Error swapping teams:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

swapTeams();
