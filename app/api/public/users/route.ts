import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: {
                isApproved: true
            },
            select: {
                id: true,
                name: true,
                role: true,
                company: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Failed to fetch public users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
