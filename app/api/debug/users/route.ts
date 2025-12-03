import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                isApproved: true,
                // password is hashed, so we don't select it usually, but let's check if it exists
                password: true
            }
        });

        return NextResponse.json({
            count: users.length,
            users: users.map(u => ({
                ...u,
                password: u.password ? '(Hashed)' : '(No Password)'
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
