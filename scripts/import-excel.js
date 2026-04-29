const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    const path = require('path');
    const excelFilePath = path.join(process.cwd(), '제품등록.xlsx');
    console.log(`Reading Excel file: ${excelFilePath}`);

    if (!fs.existsSync(excelFilePath)) {
        console.error('File not found!');
        return;
    }

    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} rows in the Excel file.`);

    const manager = await prisma.user.findFirst({ where: { role: 'MANAGER' } });
    if (!manager) {
        console.error('No MANAGER user found in DB.');
        return;
    }
    const authorId = manager.id;

    const categories = await prisma.category.findMany();
    const categoryMap = new Map();
    for (const c of categories) {
        categoryMap.set(c.name, c.id);
    }

    const existingProducts = await prisma.product.findMany({ select: { id: true, name: true } });
    const productMap = new Map();
    for (const p of existingProducts) {
        productMap.set(p.name, p.id);
    }

    console.log('Finished loading existing DB context into memory.');

    // Pre-process categories
    const uniqueCategoryNames = new Set();
    for (const row of data) {
        const catName = row['카테고리'] || row['categoryName'] || row['Category'];
        if (catName) uniqueCategoryNames.add(catName.toString().trim());
    }

    for (const catName of uniqueCategoryNames) {
        if (!categoryMap.has(catName)) {
            console.log(`Creating new category: ${catName}`);
            const newCat = await prisma.category.create({ data: { name: catName } });
            categoryMap.set(catName, newCat.id);
        }
    }

    console.log('Categories synced. Starting product upsert in batches...');

    const CHUNK_SIZE = 500;
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);

        // Using Promise.all limits memory spikes but speeds up network ops to Database
        const promises = chunk.map(async (row) => {
            const name = (row['제품명'] || row['name'] || row['Name'])?.toString().trim();
            if (!name) { skipCount++; return; }

            const catName = (row['카테고리'] || row['categoryName'] || row['Category'])?.toString().trim();
            const categoryId = catName ? categoryMap.get(catName) : null;

            const width = parseFloat(row['가로'] || row['width'] || row['Width']) || 0;
            const depth = parseFloat(row['세로'] || row['depth'] || row['Depth']) || 0;
            const height = parseFloat(row['높이'] || row['height'] || row['Height']) || 0;
            const weight = parseFloat(row['무게'] || row['weight'] || row['Weight']) || null;
            const cbm = parseFloat(row['CBM'] || row['cbm']) || null;
            const division = (row['사업부'] || row['division'] || row['Division'])?.toString().trim() || null;
            const notes = (row['비고'] || row['notes'] || row['Notes'])?.toString().trim() || null;

            const productData = {
                name, width, depth, height, weight, cbm, division, notes, categoryId, authorId
            };

            const existingId = productMap.get(name);

            try {
                if (existingId) {
                    await prisma.product.update({
                        where: { id: existingId },
                        data: productData
                    });
                    updatedCount++;
                } else {
                    const newProduct = await prisma.product.create({
                        data: productData
                    });
                    // Mutating shared map inside promise map is not thread-safe strictly in other langs
                    // but JS is single threaded so this works correctly for subsequent chunks
                    productMap.set(name, newProduct.id);
                    addedCount++;
                }
            } catch (err) {
                errorCount++;
            }
        });

        await Promise.all(promises);

        console.log(`Processed ${Math.min(i + CHUNK_SIZE, data.length)} / ${data.length} rows... (Added: ${addedCount}, Updated: ${updatedCount}, Skipped: ${skipCount}, Errors: ${errorCount})`);
    }

    console.log(`\nImport completed successfully!`);
    console.log(`- Inserted new products: ${addedCount}`);
    console.log(`- Updated existing products: ${updatedCount}`);
    console.log(`- Skipped invalid rows: ${skipCount}`);
    console.log(`- Errors encountered: ${errorCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
