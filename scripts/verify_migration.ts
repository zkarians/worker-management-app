import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMigration() {
    console.log('📊 Verifying data in Neon database...')

    const counts = {
        companies: await prisma.company.count(),
        teams: await prisma.team.count(),
        users: await prisma.user.count(),
        attendances: await prisma.attendance.count(),
        leaveRequests: await prisma.leaveRequest.count(),
        rosters: await prisma.roster.count(),
        rosterAssignments: await prisma.rosterAssignment.count(),
        dailyLogs: await prisma.dailyLog.count(),
        announcements: await prisma.announcement.count(),
        categories: await prisma.category.count(),
        products: await prisma.product.count(),
    }

    console.log(JSON.stringify(counts, null, 2))
}

verifyMigration()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
