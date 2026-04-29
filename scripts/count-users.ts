
import { prisma } from '../app/lib/prisma';

async function main() {
    const count = await prisma.user.count();
    console.log(`Total users: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
