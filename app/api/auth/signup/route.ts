import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { login } from '@/app/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password, name, companyId, hireDate, carNumber } = body;

        if (!username || !password || !name || !companyId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                companyId,
                hireDate: hireDate ? new Date(hireDate) : null,
                carNumber,
                role: 'WORKER',
                isApproved: false, // Workers need approval
            },
        });

        return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
