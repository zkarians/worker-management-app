import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportData() {
    console.log('📤 Exporting data from local database...')

    try {
        const includeProducts = process.argv.includes('--include-products') || process.env.INCLUDE_PRODUCTS === 'true'
        console.log(`📋 Option: includeProducts = ${includeProducts}`)

        // Export data
        const data: any = {
            companies: await prisma.company.findMany(),
            teams: await prisma.team.findMany(),
            users: await prisma.user.findMany(),
            attendances: await prisma.attendance.findMany(),
            leaveRequests: await prisma.leaveRequest.findMany(),
            rosters: await prisma.roster.findMany(),
            rosterAssignments: await prisma.rosterAssignment.findMany(),
            dailyLogs: await prisma.dailyLog.findMany(),
            announcements: await prisma.announcement.findMany(),
            categories: await prisma.category.findMany(),
            schedules: await prisma.schedule.findMany(),
            safetyEducations: await prisma.safetyEducation.findMany(),
        }

        if (includeProducts) {
            data.products = await prisma.product.findMany()
        }

        // Create backup directory if it doesn't exist
        const backupDir = path.join(process.cwd(), 'backup')
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        // Save to file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = path.join(backupDir, `db-export-${timestamp}.json`)

        fs.writeFileSync(filename, JSON.stringify(data, null, 2))

        console.log('✅ Data exported successfully!')
        console.log(`📁 File saved to: ${filename}`)
        console.log('\n📊 Export summary:')
        console.log(`  - Companies: ${data.companies.length}`)
        console.log(`  - Teams: ${data.teams.length}`)
        console.log(`  - Users: ${data.users.length}`)
        console.log(`  - Attendances: ${data.attendances.length}`)
        console.log(`  - Leave Requests: ${data.leaveRequests.length}`)
        console.log(`  - Rosters: ${data.rosters.length}`)
        console.log(`  - Roster Assignments: ${data.rosterAssignments.length}`)
        console.log(`  - Daily Logs: ${data.dailyLogs.length}`)
        console.log(`  - Announcements: ${data.announcements.length}`)
        console.log(`  - Categories: ${data.categories.length}`)
        if (includeProducts) {
            console.log(`  - Products: ${data.products.length}`)
        } else {
            console.log(`  - Products: EXCLUDED`)
        }
        console.log(`  - Schedules: ${data.schedules.length}`)
        console.log(`  - Safety Educations: ${data.safetyEducations.length}`)

    } catch (error) {
        console.error('❌ Error exporting data:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

exportData()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
