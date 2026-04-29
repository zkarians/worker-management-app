import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 보안: 백업 비밀 키 (환경변수에서 가져오기)
const BACKUP_SECRET = process.env.BACKUP_SECRET || 'your-secret-backup-key-change-this'

export async function GET(request: Request) {
    try {
        // 인증 확인
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (token !== BACKUP_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid backup token' },
                { status: 401 }
            )
        }

        console.log('🔄 Starting database backup...')

        // 모든 데이터 가져오기
        const [
            companies,
            teams,
            users,
            attendances,
            leaveRequests,
            rosters,
            rosterAssignments,
            dailyLogs,
            announcements,
            categories,
            products,
        ] = await Promise.all([
            prisma.company.findMany(),
            prisma.team.findMany(),
            prisma.user.findMany(),
            prisma.attendance.findMany(),
            prisma.leaveRequest.findMany(),
            prisma.roster.findMany(),
            prisma.rosterAssignment.findMany(),
            prisma.dailyLog.findMany(),
            prisma.announcement.findMany(),
            prisma.category.findMany(),
            prisma.product.findMany(),
        ])

        const backup = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: {
                companies,
                teams,
                users,
                attendances,
                leaveRequests,
                rosters,
                rosterAssignments,
                dailyLogs,
                announcements,
                categories,
                products,
            },
            summary: {
                companies: companies.length,
                teams: teams.length,
                users: users.length,
                attendances: attendances.length,
                leaveRequests: leaveRequests.length,
                rosters: rosters.length,
                rosterAssignments: rosterAssignments.length,
                dailyLogs: dailyLogs.length,
                announcements: announcements.length,
                categories: categories.length,
                products: products.length,
            },
        }

        console.log('✅ Backup completed successfully')
        console.log('📊 Summary:', backup.summary)

        // JSON 응답으로 반환
        return NextResponse.json(backup, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="db-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json"`,
            },
        })

    } catch (error) {
        console.error('❌ Backup failed:', error)
        return NextResponse.json(
            {
                error: 'Backup failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// POST 요청으로도 지원 (더 복잡한 백업 옵션을 위해)
export async function POST(request: Request) {
    try {
        // 인증 확인
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (token !== BACKUP_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid backup token' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { tables } = body

        console.log('🔄 Starting selective database backup...')
        console.log('📋 Tables to backup:', tables || 'all')

        // 선택적 백업 (요청된 테이블만)
        const backup: any = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: {},
            summary: {},
        }

        const allTables = {
            companies: () => prisma.company.findMany(),
            teams: () => prisma.team.findMany(),
            users: () => prisma.user.findMany(),
            attendances: () => prisma.attendance.findMany(),
            leaveRequests: () => prisma.leaveRequest.findMany(),
            rosters: () => prisma.roster.findMany(),
            rosterAssignments: () => prisma.rosterAssignment.findMany(),
            dailyLogs: () => prisma.dailyLog.findMany(),
            announcements: () => prisma.announcement.findMany(),
            categories: () => prisma.category.findMany(),
            products: () => prisma.product.findMany(),
        }

        const tablesToBackup = tables || Object.keys(allTables)

        for (const table of tablesToBackup) {
            if (table in allTables) {
                const data = await (allTables as any)[table]()
                backup.data[table] = data
                backup.summary[table] = data.length
            }
        }

        console.log('✅ Selective backup completed')
        console.log('📊 Summary:', backup.summary)

        return NextResponse.json(backup, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="db-backup-selective-${new Date().toISOString().replace(/[:.]/g, '-')}.json"`,
            },
        })

    } catch (error) {
        console.error('❌ Backup failed:', error)
        return NextResponse.json(
            {
                error: 'Backup failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}
