const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const TOTAL_TO_ADD = 225147;
    const CHUNK_SIZE = 5000;

    console.log(`Starting bulk insertion of ${TOTAL_TO_ADD} products...`);

    // Get template data
    const template = await prisma.product.findFirst({
        include: { category: true, author: true }
    });

    if (!template) {
        console.error('No products found to use as template.');
        return;
    }

    const baseData = {
        name: template.name,
        width: template.width,
        depth: template.depth,
        height: template.height,
        weight: template.weight,
        cbm: template.cbm,
        division: template.division,
        notes: template.notes,
        categoryId: template.categoryId,
        authorId: template.authorId
    };

    let addedCount = 0;
    while (addedCount < TOTAL_TO_ADD) {
        const currentChunkSize = Math.min(CHUNK_SIZE, TOTAL_TO_ADD - addedCount);
        const dataBatch = Array.from({ length: currentChunkSize }, (_, i) => ({
            ...baseData,
            name: `${baseData.name} (Bulk ${addedCount + i + 1})`
        }));

        await prisma.product.createMany({
            data: dataBatch,
            skipDuplicates: false
        });

        addedCount += currentChunkSize;
        console.log(`Progress: ${addedCount} / ${TOTAL_TO_ADD} (${((addedCount / TOTAL_TO_ADD) * 100).toFixed(2)}%)`);
    }

    console.log('Bulk insertion completed successfully!');
}

main()
    .catch(e => {
        console.error('Error during bulk insertion:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
