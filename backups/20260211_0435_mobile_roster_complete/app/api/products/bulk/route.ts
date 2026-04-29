import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { products } = body;

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'No products provided' }, { status: 400 });
        }

        let successCount = 0;
        let failCount = 0;

        // Process sequentially or in parallel. For safety and to handle categories, let's do it in a transaction or loop.
        // We need to handle categories as well. If a category name is provided, we should find or create it.

        const results = await prisma.$transaction(async (tx) => {
            const processed = [];

            for (const item of products) {
                try {
                    // 1. Handle Category
                    let categoryId = null;
                    if (item.categoryName) {
                        const category = await tx.category.upsert({
                            where: { name: item.categoryName },
                            update: {},
                            create: { name: item.categoryName }
                        });
                        categoryId = category.id;
                    }

                    // 2. Upsert Product
                    // We use 'name' as the unique key for simplicity in this bulk tool, 
                    // although schema doesn't enforce unique name, it's the best user-facing identifier.
                    // First try to find by name
                    const existingProduct = await tx.product.findFirst({
                        where: { name: item.name }
                    });

                    const productData = {
                        name: item.name,
                        width: parseFloat(item.width) || 0,
                        depth: parseFloat(item.depth) || 0,
                        height: parseFloat(item.height) || 0,
                        weight: item.weight ? parseFloat(item.weight) : null,
                        cbm: item.cbm ? parseFloat(item.cbm) : null,
                        division: item.division || null,
                        notes: item.notes || null,
                        categoryId: categoryId,
                        authorId: session.userId as string
                    };

                    if (existingProduct) {
                        await tx.product.update({
                            where: { id: existingProduct.id },
                            data: productData
                        });
                    } else {
                        await tx.product.create({
                            data: productData
                        });
                    }
                    processed.push({ name: item.name, status: 'success' });
                    successCount++;
                } catch (err) {
                    console.error(`Failed to process product ${item.name}:`, err);
                    processed.push({ name: item.name, status: 'failed', error: String(err) });
                    failCount++;
                }
            }
            return processed;
        });

        return NextResponse.json({
            success: true,
            message: `Processed ${products.length} items. Success: ${successCount}, Failed: ${failCount}`,
            results
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
