import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importSchedules(filename: string) {
    console.log('📥 Importing SCHEDULE data to database...')
    console.log(`📁 Reading from: ${filename}`)

    try {
        let fileContent = fs.readFileSync(filename, 'utf-8')
        // Strip BOM if present
        if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.slice(1)
        }

        const parsedData = JSON.parse(fileContent)
        const schedules = parsedData.schedules || []

        if (schedules.length === 0) {
            console.log('⚠️ No schedules found in the file.')
            return
        }

        console.log(`🔄 Found ${schedules.length} schedules. Importing...`)

        // Process dates and IDs
        const processedSchedules = schedules.map((s: any) => ({
            ...s,
            startDate: s.startDate ? new Date(s.startDate) : new Date(),
            endDate: s.endDate ? new Date(s.endDate) : null,
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        }))

        // Import into database
        // Use createMany with skipDuplicates: true
        const result = await prisma.schedule.createMany({
            data: processedSchedules,
            skipDuplicates: true
        })

        console.log(`✅ Successfully imported ${result.count} schedules.`)

    } catch (error) {
        console.error('❌ Error importing schedules:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

const filename = process.argv[2]
if (!filename) {
    console.error('❌ Please provide a filename as an argument')
    process.exit(1)
}

const fullPath = path.isAbsolute(filename) ? filename : path.join(process.cwd(), filename)
if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`)
    process.exit(1)
}

importSchedules(fullPath)
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
