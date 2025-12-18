import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Managers can see all users, workers can only see basic info for stats
        if (session.role === 'MANAGER') {
            const users = await prisma.user.findMany({
                include: { company: true },
                orderBy: { createdAt: 'desc' },
            });

            // Exclude passwords
            const usersSafe = users.map((user: any) => {
                const { password, ...rest } = user;
                return rest;
            });

            return NextResponse.json({ users: usersSafe });
        } else {
            // Workers can only see approved workers for dashboard stats
            const users = await prisma.user.findMany({
                where: {
                    isApproved: true
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    isApproved: true,
                    company: true,
                    companyId: true,
                    hireDate: true,
                    carNumber: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({ users });
        }
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
        const { username, password, name, companyId, carNumber, hireDate, role } = body;

        if (!username || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate role
        const validRole = role === 'MANAGER' ? 'MANAGER' : 'WORKER';

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
                companyId: companyId || null,
                carNumber,
                hireDate: hireDate ? new Date(hireDate) : null,
                role: validRole,
                isApproved: true, // Admin created users are auto-approved
            },
        });

        return NextResponse.json({ message: 'User created', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, isApproved, role, companyId, name, carNumber, hireDate } = body;

        // If userId is provided, check permissions
        if (userId) {
            // Only managers can update other users
            if (session.role !== 'MANAGER') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    isApproved,
                    role,
                    companyId,
                    name,
                    carNumber,
                    hireDate: hireDate ? new Date(hireDate) : undefined,
                    ...(body.password ? { password: await bcrypt.hash(body.password, 10) } : {}),
                },
            });

            return NextResponse.json({ message: 'User updated', user: updatedUser });
        } else {
            // No userId means user is updating their own profile
            // Workers can only update: name, carNumber, hireDate (not role, isApproved, companyId)
            const updateData: any = {};

            if (name !== undefined) updateData.name = name;
            if (carNumber !== undefined) updateData.carNumber = carNumber;
            if (hireDate !== undefined) updateData.hireDate = hireDate ? new Date(hireDate) : null;

            // Only managers can update role, isApproved, and companyId
            if (session.role === 'MANAGER') {
                if (isApproved !== undefined) updateData.isApproved = isApproved;
                if (role !== undefined) updateData.role = role;
                if (companyId !== undefined) updateData.companyId = companyId;
            }

            const updatedUser = await prisma.user.update({
                where: { id: session.userId as string },
                data: updateData,
            });

            // Exclude password
            const { password, ...userWithoutPassword } = updatedUser;

            return NextResponse.json({ message: 'Profile updated', user: userWithoutPassword });
        }
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Prevent deleting self
        if (userId === session.id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        // Delete all related data before deleting the user
        // Use transaction to ensure all deletions succeed or none do
        await prisma.$transaction(async (tx) => {
            // Delete attendance records
            await tx.attendance.deleteMany({
                where: { userId }
            });

            // Delete leave requests
            await tx.leaveRequest.deleteMany({
                where: { userId }
            });

            // Delete roster assignments
            await tx.rosterAssignment.deleteMany({
                where: { userId }
            });

            // Delete daily logs authored by this user
            await tx.dailyLog.deleteMany({
                where: { authorId: userId }
            });

            // Delete announcements authored by this user
            await tx.announcement.deleteMany({
                where: { authorId: userId }
            });

            // Finally, delete the user
            await tx.user.delete({
                where: { id: userId },
            });
        });

        return NextResponse.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
