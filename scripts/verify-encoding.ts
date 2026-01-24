
import { prisma } from '../app/lib/prisma';

async function main() {
    console.log('Verifying text encoding...');

    const teams = await prisma.team.findMany({ take: 5 });
    console.log('--- Teams ---');
    teams.forEach(t => console.log(`Team: ${t.name}`));

    const users = await prisma.user.findMany({ take: 5, where: { role: 'WORKER' } });
    console.log('--- Users ---');
    users.forEach(u => console.log(`User: ${u.name}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
