const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEncoding() {
    try {
        console.log('Checking Database Encoding...');

        const serverEncoding = await prisma.$queryRaw`SHOW SERVER_ENCODING`;
        const clientEncoding = await prisma.$queryRaw`SHOW CLIENT_ENCODING`;

        console.log('Server Encoding:', serverEncoding);
        console.log('Client Encoding:', clientEncoding);

        // Check a sample user or roster to see if text is readable
        const users = await prisma.user.findMany({ take: 5 });
        console.log('Sample Users:', JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('Error checking encoding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEncoding();
