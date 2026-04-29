const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching admin user...');

    // Find the user with username 'admin' (이승철)
    const adminUser = await prisma.user.findUnique({
        where: { username: 'admin' }
    });

    if (!adminUser) {
        console.error('User "admin" not found in the database.');
        return;
    }

    console.log(`Found admin user: ${adminUser.name} (${adminUser.id})`);
    console.log(`Updating authorId for ALL products...`);

    // Update all products
    const result = await prisma.product.updateMany({
        data: {
            authorId: adminUser.id
        }
    });

    console.log(`Successfully updated ${result.count} products to be authored by ${adminUser.name}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
