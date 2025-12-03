import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        const teams = await prisma.team.findMany({
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({ teams });
    } catch (error) {
        console.error('Failed to fetch public teams:', error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}
