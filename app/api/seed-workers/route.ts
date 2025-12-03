import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

const WORKERS = [
    { name: "강경수", company: "(주)보람관리" },
    { name: "강성교", company: "(주)보람관리" },
    { name: "장태윤", company: "(주)보람관리" },
    { name: "전현준", company: "(주)보람관리" },
    { name: "김성현", company: "(주)보람관리" },
    { name: "이용노", company: "(주)보람관리" },
    { name: "고성현", company: "(주)보람관리" },
    { name: "오정환", company: "(주)보람관리" },
    { name: "박상훈", company: "(주)보람관리" },
    { name: "구만주", company: "(주)보람관리" },
    { name: "박민우", company: "(주)보람관리" },
    { name: "허찬", company: "(주)디티에스" },
    { name: "김대성", company: "(주)신항만건기" },
    { name: "문재윤", company: "(주)신항만건기" },
    { name: "이용석", company: "(주)보람관리" },
    { name: "장하영", company: "(주)신항만건기" },
    { name: "양호근", company: "(주)보람관리" },
    { name: "유리성", company: "(주)보람관리" },
    { name: "전지웅", company: "(주)보람관리" },
    { name: "조인래", company: "(주)보람관리" },
    { name: "이병상", company: "(주)보람관리" },
    { name: "박상준", company: "(주)보람관리" },
    { name: "정승주", company: "(주)보람관리" },
    { name: "윤정환", company: "(주)보람관리" },
    { name: "장헌기", company: "(주)보람관리" }
];

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash('1234', 10);
        const hireDate = new Date('2025-11-30');
        const carNumber = '123가1234';

        let createdCount = 0;
        let skippedCount = 0;

        // 1. Ensure Companies Exist
        const companyNames = [...new Set(WORKERS.map(w => w.company))];
        for (const name of companyNames) {
            const exists = await prisma.company.findUnique({ where: { name } });
            if (!exists) {
                await prisma.company.create({ data: { name } });
            }
        }

        // 2. Create Workers
        for (const worker of WORKERS) {
            // Check if user exists (by username/name)
            const exists = await prisma.user.findUnique({ where: { username: worker.name } });

            if (!exists) {
                // Find company ID
                const company = await prisma.company.findUnique({ where: { name: worker.company } });

                if (company) {
                    await prisma.user.create({
                        data: {
                            username: worker.name, // Using name as username
                            name: worker.name,
                            password: hashedPassword,
                            role: 'WORKER',
                            companyId: company.id,
                            hireDate: hireDate,
                            carNumber: carNumber,
                            isApproved: true
                        }
                    });
                    createdCount++;
                }
            } else {
                skippedCount++;
            }
        }

        return NextResponse.json({
            message: 'Worker seeding complete',
            created: createdCount,
            skipped: skippedCount,
            totalProcessed: WORKERS.length
        });

    } catch (error) {
        console.error('Worker seeding error:', error);
        return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 });
    }
}
