import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSchedules() {
    try {
        const count = await prisma.schedule.count();
        console.log(`📊 Current Schedule Count: ${count}`);

        if (count > 0) {
            const schedules = await prisma.schedule.findMany({ take: 5 });
            console.log('Sample data:', JSON.stringify(schedules, null, 2));
        }
    } catch (error) {
        console.error('❌ Error counting schedules:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkSchedules()
