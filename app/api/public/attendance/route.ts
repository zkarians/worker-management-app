import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        // Fetch attendance records for the given date
        const attendance = await prisma.attendance.findMany({
            where: {
                date: new Date(date)
            },
            include: {
                user: {
                    include: {
                        company: true
                    }
                }
            },
            orderBy: {
                user: {
                    name: 'asc'
                }
            }
        });

        return NextResponse.json({ attendance });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}
