const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
    try {
        const userId = "dc1d84f1-e264-42ab-84d2-13e671058c0e"; // From previous check
        const date = new Date('2026-04-21');
        
        console.log(`Attempting to update attendance for user ${userId} on ${date.toISOString()}`);
        
        const result = await prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId,
                    date,
                }
            },
            update: {
                status: 'OFF_DAY',
                workHours: 0,
                overtimeHours: 0,
            },
            create: {
                userId,
                date,
                status: 'OFF_DAY',
                workHours: 0,
                overtimeHours: 0,
            },
        });
        
        console.log('Update result:', JSON.stringify(result, null, 2));
        
        // Verify 
        const verified = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date,
                }
            }
        });
        
        console.log('Verified record:', JSON.stringify(verified, null, 2));
        
        if (verified.workHours === 0 && verified.status === 'OFF_DAY') {
            console.log('SUCCESS: Record persisted correctly!');
        } else {
            console.log('FAILURE: Record did not persist as expected.');
        }

    } catch (error) {
        console.error('ERROR during testUpdate:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testUpdate();
