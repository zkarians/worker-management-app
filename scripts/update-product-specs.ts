import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Parse command line arguments
function parseArgs(argv: string[]) {
    const args: Record<string, string | boolean> = {};
    for (let i = 2; i < argv.length; i++) {
        const token = argv[i];
        if (token.startsWith('--')) {
            const [k, v] = token.replace(/^--/, '').split('=');
            if (k) {
                args[k] = v === undefined ? true : (v === 'false' ? false : v);
            }
        }
    }
    return args;
}

interface ParsedProduct {
    name: string;
    width: number;
    depth: number;
    height: number;
    weight: number | null;
    cbm: number | null;
}

async function main() {
    const args = parseArgs(process.argv);
    const fileName = (args['file'] as string) || '제품등록.xlsx';
    const isDryRun = !!args['dry-run'];

    const excelFilePath = path.join(process.cwd(), fileName);
    console.log(`[INFO] Excel 파일 경로: ${excelFilePath}`);
    console.log(`[INFO] 실행 모드: ${isDryRun ? 'DRY-RUN (실제 DB에 반영되지 않음)' : '실제 DB 반영 (COMMIT)'}`);

    if (!fs.existsSync(excelFilePath)) {
        console.error(`[ERROR] Excel 파일을 찾을 수 없습니다: ${excelFilePath}`);
        process.exit(1);
    }

    // 1. Excel 읽기
    console.log('[INFO] Excel 데이터를 읽고 있습니다...');
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];
    console.log(`[INFO] Excel 데이터 로드 완료 (총 ${rawData.length}개 행)`);

    if (rawData.length === 0) {
        console.error('[ERROR] Excel 파일에 데이터가 존재하지 않습니다.');
        process.exit(1);
    }

    // 헤더 구조 파악 및 매핑
    const firstRow = rawData[0];
    const nameKey = ['제품명', '품명(모델명)', 'name', 'Name'].find(k => k in firstRow);
    const widthKey = ['가로', '가로(W)', 'width', 'Width'].find(k => k in firstRow);
    const depthKey = ['세로', '세로(D)', 'depth', 'Depth'].find(k => k in firstRow);
    const heightKey = ['높이', '높이(H)', 'height', 'Height'].find(k => k in firstRow);
    const weightKey = ['무게', '중량(kg)', 'weight', 'Weight'].find(k => k in firstRow);
    const cbmKey = ['CBM', '부피(CBM)', 'cbm'].find(k => k in firstRow);

    if (!nameKey || !widthKey || !depthKey || !heightKey) {
        console.error('[ERROR] 필수 컬럼(제품명, 가로, 세로, 높이)을 찾을 수 없습니다.');
        console.error('감지된 키 목록:', Object.keys(firstRow));
        process.exit(1);
    }

    console.log(`[INFO] 컬럼 매핑 완료:`);
    console.log(` - 제품명 키: "${nameKey}"`);
    console.log(` - 가로 키: "${widthKey}"`);
    console.log(` - 세로 키: "${depthKey}"`);
    console.log(` - 높이 키: "${heightKey}"`);
    console.log(` - 무게 키: "${weightKey || '없음'}"`);
    console.log(` - CBM 키: "${cbmKey || '없음'}"`);

    // 데이터 정제
    const products: ParsedProduct[] = [];
    let skipCount = 0;

    for (const row of rawData) {
        const name = row[nameKey]?.toString().trim();
        if (!name) {
            skipCount++;
            continue;
        }

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

    console.log(`[INFO] 데이터 정제 완료: 업데이트 대상 ${products.length}건 (이름 누락으로 스킵: ${skipCount}건)`);

    // DB 연결 검증 및 기본 MANAGER 사용자 ID 획득
    console.log('[INFO] DB에서 기본 작성자(MANAGER) 정보를 조회하는 중...');
    const manager = await prisma.user.findFirst({ where: { role: 'MANAGER' } });
    if (!manager) {
        console.error('[ERROR] DB에 MANAGER 권한을 가진 사용자가 존재하지 않아 신규 제품의 authorId를 지정할 수 없습니다.');
        process.exit(1);
    }
    const authorId = manager.id;
    console.log(`[INFO] 기본 작성자(MANAGER) ID: ${authorId}`);

    // DB 벌크 업데이트 트랜잭션 수행
    console.log('[INFO] DB 트랜잭션을 시작합니다...');
    
    try {
        await prisma.$transaction(async (tx) => {
            // Prisma에서 직접 트랜잭션을 수행하기 위해 raw 쿼리를 조합합니다.
            // PostgreSQL의 임시 테이블을 생성하고 데이터를 삽입합니다.
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

            console.log('[INFO] 임시 테이블 생성 성공. 데이터를 대량 삽입 중...');

            const CHUNK_SIZE = 5000;
            let insertedToTempCount = 0;

            for (let i = 0; i < products.length; i += CHUNK_SIZE) {
                const chunk = products.slice(i, i + CHUNK_SIZE);
                
                // 다중 Value를 담은 벌크 INSERT 쿼리 동적 생성
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

                // Prisma는 파라미터를 Array 형태로 전달받는 $executeRawUnsafe를 지원함
                await tx.$executeRawUnsafe(insertSql, ...valuesParams);
                insertedToTempCount += chunk.length;
                
                if (insertedToTempCount % 50000 === 0 || insertedToTempCount === products.length) {
                    console.log(` - 임시 테이블에 데이터 로드 중: ${insertedToTempCount} / ${products.length}...`);
                }
            }

            console.log('[INFO] 임시 테이블에 데이터 업로드 완료.');

            // 분석 결과 조회
            const matchResult: any[] = await tx.$queryRawUnsafe(`
                SELECT COUNT(*)::int as count FROM "Product" p
                JOIN temp_product_import t ON p.name = t.name;
            `);
            const newResult: any[] = await tx.$queryRawUnsafe(`
                SELECT COUNT(*)::int as count FROM temp_product_import t
                LEFT JOIN "Product" p ON p.name = t.name
                WHERE p.name IS NULL;
            `);

            const matchedCount = matchResult[0]?.count || 0;
            const newCount = newResult[0]?.count || 0;

            console.log(`\n=== 분석 및 변경 대상 통계 ===`);
            console.log(` - 가로/세로/높이/무게/CBM 업데이트 대상 (기존 존재): ${matchedCount.toLocaleString()} 건 (카테고리/사업부 유지)`);
            console.log(` - 신규 등록 대상 (기존 미존재): ${newCount.toLocaleString()} 건 (카테고리/사업부 비어있음으로 추가)`);
            console.log(`================================\n`);

            if (isDryRun) {
                console.log('[INFO] DRY-RUN 모드이므로 실제로 변경 사항을 DB에 적용하지 않고 종료합니다.');
                throw new Error('DRY_RUN_ROLLBACK');
            }

            // 실제 업데이트 수행
            console.log('[INFO] 기존 제품 정보 치수 업데이트를 시작합니다...');
            const updateCount = await tx.$executeRawUnsafe(`
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
            console.log(`[SUCCESS] 기존 제품 업데이트 성공: ${updateCount.toLocaleString()}건 완료.`);

            console.log('[INFO] 신규 제품 등록을 시작합니다...');
            const insertCount = await tx.$executeRawUnsafe(`
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
            console.log(`[SUCCESS] 신규 제품 추가 성공: ${insertCount.toLocaleString()}건 완료.`);
            console.log('[INFO] 모든 변경 사항이 성공적으로 커밋되었습니다.');
        }, {
            timeout: 90000 // 대용량 배치 처리를 위해 90초로 넉넉하게 세팅
        });

    } catch (error: any) {
        if (error.message === 'DRY_RUN_ROLLBACK') {
            console.log('[INFO] DRY-RUN 롤백 완료. DB 상태는 변경되지 않았습니다.');
            return;
        }
        console.error('[ERROR] 벌크 업데이트 진행 중 오류가 발생하여 작업을 중단합니다.');
        console.error(error);
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

