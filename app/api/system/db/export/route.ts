import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { getAllData } from '@/app/lib/db-transfer';
import { getPrismaClient } from '@/app/lib/prisma-dynamic';
import { addLog, clearLogs } from '@/app/lib/ssh-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
        addLog('JSON 데이터 추출 작업을 시작합니다...');

        let prisma = (await import('@/app/lib/prisma')).prisma;
        let isCustom = false;

        if (host && user && password && dbname) {
            const encodedPassword = encodeURIComponent(password);
            clientString = `postgresql://${user}:${encodedPassword}@${host}:${port}/${dbname}`;
            prisma = getPrismaClient(clientString);
            isCustom = true;
            addLog(`📡 원격 데이터베이스 연결 중: ${host}/${dbname}...`);
        } else {
            addLog('로컬 데이터베이스에서 데이터를 추출합니다.');
        }

        const data = await getAllData(prisma);
        addLog(`✅ 데이터 추출 완료 (총 ${Object.keys(data).length}개 테이블).`);

        if (isCustom) {
            await (prisma as any).$disconnect();
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Export failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
