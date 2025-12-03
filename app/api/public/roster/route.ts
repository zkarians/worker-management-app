import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const roster = await prisma.roster.findUnique({
            where: { date: new Date(date) },
            include: {
                assignments: {
                    include: {
                        user: {
                            include: {
                                company: true
                            }
                        }
                    }
                },
                paletteTeam: true,
                cleaningTeam: true
            }
        });

        return NextResponse.json({ roster });
    } catch (error) {
        console.error('Failed to fetch public roster:', error);
        return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 });
    }
}
