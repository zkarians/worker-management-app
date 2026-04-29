import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportSchedules() {
    console.log('📤 Exporting SCHEDULE data from database...')

    try {
        const data = {
            schedules: await prisma.schedule.findMany(),
        }

        const backupDir = path.join(process.cwd(), 'backup')
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = path.join(backupDir, `schedules-export-${timestamp}.json`)

        fs.writeFileSync(filename, JSON.stringify(data, null, 2))

        console.log('✅ Schedules exported successfully!')
        console.log(`📁 File saved to: ${filename}`)
        console.log(`📊 Count: ${data.schedules.length}`)

    } catch (error) {
        console.error('❌ Error exporting schedules:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

exportSchedules()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
