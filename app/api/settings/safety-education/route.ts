import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
    try {
        const items = await prisma.safetyEducation.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch safety education items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { content, isActive } = data;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const newItem = await prisma.safetyEducation.create({
            data: { content, isActive: isActive ?? true }
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Failed to create safety education item:', error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}

// Bulk import from Excel: PATCH /api/settings/safety-education
// body: { items: string[], replaceAll?: boolean }
export async function PATCH(request: Request) {
    try {
        const data = await request.json();
        const { items, replaceAll } = data as { items: string[]; replaceAll?: boolean };

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'items array is required' }, { status: 400 });
        }

        if (replaceAll) {
            await prisma.safetyEducation.deleteMany({});
        }

        await prisma.safetyEducation.createMany({
            data: items.map((content: string) => ({ content, isActive: true })),
            skipDuplicates: false,
        });

        const total = await prisma.safetyEducation.count();
        return NextResponse.json({ success: true, imported: items.length, total });
    } catch (error) {
        console.error('Failed to bulk import safety education items:', error);
        return NextResponse.json({ error: 'Failed to bulk import' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, content, isActive } = data;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updatedItem = await prisma.safetyEducation.update({
            where: { id },
            data: {
                ...(content !== undefined && { content }),
                ...(isActive !== undefined && { isActive }),
            }
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        console.error('Failed to update safety education item:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.safetyEducation.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        console.error('Failed to delete safety education item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
