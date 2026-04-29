import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return NextResponse.json({ announcements });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content } = body;

        if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                authorId: session.userId as string,
            },
        });

        return NextResponse.json({ announcement });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
