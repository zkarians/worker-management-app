import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET() {
    try {
        const teams = await prisma.team.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json({ teams });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Get max order
        const lastTeam = await prisma.team.findFirst({
            orderBy: { order: 'desc' },
        });
        const order = lastTeam ? lastTeam.order + 1 : 0;

        const team = await prisma.team.create({
            data: { name, order },
        });

        return NextResponse.json({ team });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, name } = await request.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }

        // 1. Get the old team name
        const oldTeam = await prisma.team.findUnique({
            where: { id },
        });

        if (!oldTeam) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // 2. Transaction: Update Team name AND update all RosterAssignments with the old team name
        const [updatedTeam] = await prisma.$transaction([
            prisma.team.update({
                where: { id },
                data: { name },
            }),
            prisma.rosterAssignment.updateMany({
                where: { team: oldTeam.name },
                data: { team: name },
            }),
        ]);

        return NextResponse.json({ team: updatedTeam });
    } catch (error) {
        console.error('Failed to update team:', error);
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        await prisma.team.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
}
