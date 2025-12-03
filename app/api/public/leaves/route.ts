import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        let whereClause: any = {
            status: 'APPROVED' // Only show approved leaves
        };

        if (month && year) {
            // Filter by month if provided
            // Note: Leaves can span across months, so we check for overlap
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

            whereClause = {
                ...whereClause,
                OR: [
                    {
                        startDate: {
                            lte: endDate
                        },
                        endDate: {
                            gte: startDate
                        }
                    }
                ]
            };
        }

        const leaves = await prisma.leaveRequest.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        return NextResponse.json({ leaves });
    } catch (error) {
        console.error('Failed to fetch public leaves:', error);
        return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
    }
}
