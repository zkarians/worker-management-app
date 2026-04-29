import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

const CONFIG_KEY = 'roster-config';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const configRecord = await prisma.systemConfig.findUnique({
            where: { key: CONFIG_KEY }
        });

        if (!configRecord) {
            // Return defaults if not found
            return NextResponse.json({
                cleaningSequence: ["강경수", "강성교", "장태윤", "전현준"],
                paletteWorker: "김성현"
            });
        }

        return NextResponse.json(JSON.parse(configRecord.value));
    } catch (error) {
        console.error('Failed to read config from DB:', error);
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
        const { cleaningSequence, paletteWorker } = body;

        if (!Array.isArray(cleaningSequence) || typeof paletteWorker !== 'string') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const valueString = JSON.stringify({ cleaningSequence, paletteWorker });

        await prisma.systemConfig.upsert({
            where: { key: CONFIG_KEY },
            update: { value: valueString },
            create: { key: CONFIG_KEY, value: valueString }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save config to DB:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
