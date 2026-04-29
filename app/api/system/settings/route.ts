import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const configRecord = await prisma.systemConfig.findUnique({
            where: { key }
        });

        if (!configRecord) {
            return NextResponse.json({ value: null });
        }

        return NextResponse.json({ value: JSON.parse(configRecord.value) });
    } catch (error) {
        console.error('Failed to read setting from DB:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
        }

        const valueString = JSON.stringify(value);

        await prisma.systemConfig.upsert({
            where: { key },
            update: { value: valueString },
            create: { key, value: valueString }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save setting to DB:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
