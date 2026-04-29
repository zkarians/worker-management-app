const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding products...');

    // Get a manager user for authorId
    const manager = await prisma.user.findFirst({ where: { role: 'MANAGER' } });
    if (!manager) {
        console.error('No manager found to assign as author');
        return;
    }

    // Create a category
    const category = await prisma.category.upsert({
        where: { name: '일반' },
        update: {},
        create: { name: '일반' }
    });

    // Create 40 products
    for (let i = 1; i <= 40; i++) {
        await prisma.product.create({
            data: {
                name: `테스트 제품 ${i.toString().padStart(2, '0')}`,
                width: 100 + i,
                depth: 50 + i,
                height: 30 + i,
                division: '테스트팀',
                categoryId: category.id,
                authorId: manager.id,
                notes: `이것은 테스트 제품 ${i}의 비고란입니다.`
            }
        });
    }

    console.log('Seeded 40 products.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
