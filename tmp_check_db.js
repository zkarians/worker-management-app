const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('Fetching last 5 attendance records...');
    const records = await prisma.attendance.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { user: { select: { name: true } } }
    });
    
    console.log(JSON.stringify(records, null, 2));
    
    // Check specific date
    const targetDate = new Date('2026-04-21');
    console.log('\nChecking records for 2026-04-21 (native Date object):');
    const specificRecords = await prisma.attendance.findMany({
      where: { date: targetDate }
    });
    console.log(`Found ${specificRecords.length} records matching exact Date object`);

    const specificRecordsDateOnly = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date('2026-04-21T00:00:00Z'),
          lt: new Date('2026-04-22T00:00:00Z')
        }
      }
    });
    console.log(`Found ${specificRecordsDateOnly.length} records matching date range (UTC 00:00:00)`);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
