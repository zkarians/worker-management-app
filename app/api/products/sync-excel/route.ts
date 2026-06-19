import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized. MANAGER role required.' }, { status: 401 });
        }

        const excelFilePath = path.join(process.cwd(), '제품등록.xlsx');
        if (!fs.existsSync(excelFilePath)) {
            return NextResponse.json({ error: 'Excel file "제품등록.xlsx" not found in project root.' }, { status: 404 });
        }

        // 1. Excel 읽기
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rawData.length === 0) {
            return NextResponse.json({ error: 'Excel file is empty.' }, { status: 400 });
        }

        // 헤더 매핑
        const firstRow = rawData[0];
        const nameKey = ['제품명', '품명(모델명)', 'name', 'Name'].find(k => k in firstRow);
        const widthKey = ['가로', '가로(W)', 'width', 'Width'].find(k => k in firstRow);
        const depthKey = ['세로', '세로(D)', 'depth', 'Depth'].find(k => k in firstRow);
        const heightKey = ['높이', '높이(H)', 'height', 'Height'].find(k => k in firstRow);
        const weightKey = ['무게', '중량(kg)', 'weight', 'Weight'].find(k => k in firstRow);
        const cbmKey = ['CBM', '부피(CBM)', 'cbm'].find(k => k in firstRow);

        if (!nameKey || !widthKey || !depthKey || !heightKey) {
            return NextResponse.json({ error: 'Required columns (name, width, depth, height) not found in Excel.' }, { status: 400 });
        }

        const products: any[] = [];
        for (const row of rawData) {
            const name = row[nameKey]?.toString().trim();
            if (!name) continue;

            const width = parseFloat(row[widthKey]) || 0;
            const depth = parseFloat(row[depthKey]) || 0;
            const height = parseFloat(row[heightKey]) || 0;
            
            let weight: number | null = null;
            if (weightKey && row[weightKey] !== undefined && row[weightKey] !== '') {
                weight = parseFloat(row[weightKey]);
                if (isNaN(weight)) weight = null;
            }

            let cbm: number | null = null;
            if (cbmKey && row[cbmKey] !== undefined && row[cbmKey] !== '') {
                cbm = parseFloat(row[cbmKey]);
                if (isNaN(cbm)) cbm = null;
            }

            products.push({ name, width, depth, height, weight, cbm });
        }

        const authorId = session.userId as string;
        let updatedCount = 0;
        let insertedCount = 0;

        // DB 트랜잭션 수행
        await prisma.$transaction(async (tx) => {
            // 임시 테이블 생성
            await tx.$executeRawUnsafe(`
                CREATE TEMP TABLE temp_product_import (
                    name TEXT,
                    width FLOAT,
                    depth FLOAT,
                    height FLOAT,
                    weight FLOAT,
                    cbm FLOAT
                ) ON COMMIT DROP;
            `);

            // 데이터 벌크 삽입
            const CHUNK_SIZE = 5000;
            for (let i = 0; i < products.length; i += CHUNK_SIZE) {
                const chunk = products.slice(i, i + CHUNK_SIZE);
                const valuesSql: string[] = [];
                const valuesParams: any[] = [];
                
                chunk.forEach((p, index) => {
                    const baseIdx = index * 6;
                    valuesSql.push(`($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6})`);
                    valuesParams.push(p.name, p.width, p.depth, p.height, p.weight, p.cbm);
                });

                const insertSql = `
                    INSERT INTO temp_product_import (name, width, depth, height, weight, cbm)
                    VALUES ${valuesSql.join(', ')};
                `;
                await tx.$executeRawUnsafe(insertSql, ...valuesParams);
            }

            // 기존 제품 업데이트
            updatedCount = await tx.$executeRawUnsafe(`
                UPDATE "Product" p
                SET 
                    width = t.width,
                    depth = t.depth,
                    height = t.height,
                    weight = t.weight,
                    cbm = t.cbm,
                    "updatedAt" = NOW()
                FROM temp_product_import t
                WHERE p.name = t.name;
            `);

            // 신규 제품 등록
            insertedCount = await tx.$executeRawUnsafe(`
                INSERT INTO "Product" (id, name, width, depth, height, weight, cbm, "categoryId", division, "authorId", "createdAt", "updatedAt")
                SELECT 
                    gen_random_uuid(),
                    t.name,
                    t.width,
                    t.depth,
                    t.height,
                    t.weight,
                    t.cbm,
                    NULL,
                    NULL,
                    $1::uuid,
                    NOW(),
                    NOW()
                FROM temp_product_import t
                LEFT JOIN "Product" p ON p.name = t.name
                WHERE p.name IS NULL;
            `, authorId);
        }, {
            timeout: 90000 // 대용량 배치용 90초 설정
        });

        return NextResponse.json({
            success: true,
            updatedCount,
            insertedCount
        });

    } catch (error: any) {
        console.error('[SYNC_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error during sync' }, { status: 500 });
    }
}
