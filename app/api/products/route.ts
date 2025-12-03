import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let where: any = {};
        if (search) {
            where.name = {
                startsWith: search,
                mode: 'insensitive'
            };
        }

        const products = await prisma.product.findMany({
            where,
            include: { category: true, author: { select: { name: true } } },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json({ products });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, width, depth, height, notes, categoryId, division, weight, cbm } = body;

        if (!name || width === undefined || depth === undefined || height === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                width: parseFloat(width),
                depth: parseFloat(depth),
                height: parseFloat(height),
                weight: weight ? parseFloat(weight) : null,
                cbm: cbm ? parseFloat(cbm) : null,
                division: division || null,
                notes: notes || null,
                categoryId: categoryId || null,
                authorId: session.userId as string
            }
        });
        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, name, width, depth, height, notes, categoryId, division, weight, cbm } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                width: parseFloat(width),
                depth: parseFloat(depth),
                height: parseFloat(height),
                weight: weight ? parseFloat(weight) : null,
                cbm: cbm ? parseFloat(cbm) : null,
                division: division || null,
                notes: notes || null,
                categoryId: categoryId || null
            }
        });
        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.product.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
