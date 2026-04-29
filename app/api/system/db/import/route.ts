import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { restoreAllData } from '@/app/lib/db-transfer';
import { getPrismaClient } from '@/app/lib/prisma-dynamic';
import { addLog, clearLogs } from '@/app/lib/ssh-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    let clientString = '';
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const host = searchParams.get('host');
        const user = searchParams.get('user');
        const password = searchParams.get('password');
        const port = searchParams.get('port') || '5432';
        const dbname = searchParams.get('dbname');

        clearLogs();
        addLog('JSON 데이터 복구 작업을 시작합니다...');

        let prisma = (await import('@/app/lib/prisma')).prisma;
        let isCustom = false;

        if (host && user && password && dbname) {
            const encodedPassword = encodeURIComponent(password);
            clientString = `postgresql://${user}:${encodedPassword}@${host}:${port}/${dbname}`;
            prisma = getPrismaClient(clientString);
            isCustom = true;
            addLog(`📡 원격 데이터베이스 연결 중: ${host}/${dbname}...`);
        } else {
            addLog('로컬 데이터베이스에 복구를 진행합니다.');
        }

        const data = await request.json();
        addLog('📦 JSON 파일 파싱 완료. 트랜잭션 수립 및 복구를 시작합니다...');
        const result = await restoreAllData(data, prisma);
        addLog('✅ 모든 데이터 복구가 완료되었습니다.');

        if (isCustom) {
            await (prisma as any).$disconnect();
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Import failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
