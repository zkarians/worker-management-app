import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

    try {
        const url = process.env.DATABASE_URL;
        const maskedUrl = url ? url.replace(/:[^:@]+@/, ':****@') : 'NOT SET';

        console.log('Testing DB connection to:', maskedUrl);

        const start = Date.now();
        await prisma.$connect();
        const connectionTime = Date.now() - start;

        // Try a query
        const result = await prisma.$queryRaw`SELECT 1 as test`;

        await prisma.$disconnect();

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            connectionTime: `${connectionTime}ms`,
            url: maskedUrl,
            result
        });
    } catch (error: any) {
        console.error('DB Connection Test Failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack,
            env_url_exists: !!process.env.DATABASE_URL
        }, { status: 500 });
    }
}
