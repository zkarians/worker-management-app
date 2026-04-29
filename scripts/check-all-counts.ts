import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const models = [
        'User', 'Company', 'Team', 'Attendance', 'LeaveRequest', 'Roster',
        'RosterAssignment', 'DailyLog', 'Announcement', 'Category',
        'Product', 'Schedule', 'SystemConfig', 'SafetyEducation'
    ];

    console.log('--- Database Record Counts ---');
    for (const model of models) {
        try {
            // @ts-ignore
            const count = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].count();
            console.log(`${model}: ${count}`);
        } catch (error) {
            console.log(`${model}: Error or not found`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
