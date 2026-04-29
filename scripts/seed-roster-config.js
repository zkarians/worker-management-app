const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const config = {
        cleaningSequence: ['강경수', '전현준', '강성교', '장태윤'],
        paletteWorker: '김성현'
    };

    await prisma.systemConfig.upsert({
        where: { key: 'roster-config' },
        update: { value: JSON.stringify(config) },
        create: { key: 'roster-config', value: JSON.stringify(config) }
    });

    console.log('✅ roster-config saved to DB:', JSON.stringify(config, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
