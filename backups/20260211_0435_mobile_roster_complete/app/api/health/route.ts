import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    const jsonResponse = (data: any, status: number = 200) => {
        return NextResponse.json(data, {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    };

    try {
        // Test database connection with timeout
        const connectionPromise = prisma.$queryRaw`SELECT 1`;
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        await Promise.race([connectionPromise, timeoutPromise]);
        
        return jsonResponse({ 
            status: 'ok',
            database: 'connected',
            env_url_exists: !!process.env.DATABASE_URL
        });
    } catch (error: any) {
        console.error('Health check error:', error);
        
        const errorInfo: any = {
            status: 'error',
            database: 'disconnected',
            error: error.message || 'Unknown error',
            env_url_exists: !!process.env.DATABASE_URL,
        };

        if (error.code) {
            errorInfo.error_code = error.code;
        }

        if (error.code === 'P1001') {
            errorInfo.message = 'Cannot reach database server. Please check:';
            errorInfo.checks = [
                'Database service is running',
                'DATABASE_URL is correct',
                'Network connectivity',
                'Firewall/security group settings'
            ];
        }

        return jsonResponse(errorInfo, 503);
    }
}

