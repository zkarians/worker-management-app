import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { getLatestLogs } from '@/app/lib/ssh-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const logs = getLatestLogs();
        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
