import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL is not defined');

        const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
        const match = dbUrl.match(regex);

        if (match) {
            const [_, user, password, host, port, dbname] = match;
            return NextResponse.json({
                host,
                port,
                user,
                password: decodeURIComponent(password),
                dbname: dbname.split('?')[0],
                sshPort: '9022' // Default AidLux SSH port
            });
        }

        return NextResponse.json({ error: 'Failed to parse config' }, { status: 500 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
