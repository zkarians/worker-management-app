import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // 1. Auth Check (Manager only)
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let payload;
        try {
            payload = await verifyToken(token);
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (!payload || payload.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Database Status via Prisma health check
        const startTime = Date.now();
        const result = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`;
        const latency = Date.now() - startTime;

        const version = result?.[0]?.version ?? 'Unknown';

        // Extract host info from DATABASE_URL
        const dbUrl = process.env.DATABASE_URL ?? '';
        const hostMatch = dbUrl.match(/@([^:\/]+)/);
        const host = hostMatch?.[1] ?? 'Local/Internal';

        // Count records for quick stats
        const [userCount, attendanceCount] = await Promise.all([
            prisma.user.count(),
            prisma.attendance.count(),
        ]);

        return NextResponse.json({
            status: 'connected',
            version,
            host,
            latencyMs: latency,
            stats: {
                users: userCount,
                attendances: attendanceCount,
            }
        });

    } catch (error: any) {
        console.error('System Monitor Error (Database):', error);
        return NextResponse.json({
            status: 'error',
            error: error.message
        }, { status: 500 });
    }
}
