import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        // 1. Create Default Companies
        const companies = ['CJ제일제당', '대한통운', '삼영물류'];
        let createdCompanies = 0;

        for (const name of companies) {
            const exists = await prisma.company.findUnique({ where: { name } });
            if (!exists) {
                await prisma.company.create({ data: { name } });
                createdCompanies++;
            }
        }

        // 2. Create Default Admin (Manager)
        const adminUsername = 'administrator';
        const adminExists = await prisma.user.findUnique({ where: { username: adminUsername } });
        let adminCreated = false;

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('1234', 10);
            await prisma.user.create({
                data: {
                    username: adminUsername,
                    password: hashedPassword,
                    name: '관리자',
                    role: 'MANAGER',
                    isApproved: true,
                },
            });
            adminCreated = true;
        }

        return NextResponse.json({
            message: 'Database initialization complete',
            companiesCreated: createdCompanies,
            adminCreated: adminCreated,
            adminAccount: adminCreated ? { username: 'admin', password: 'admin123' } : 'Already exists'
        });

    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 });
    }
}
