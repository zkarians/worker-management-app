import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating "상하차" to "상하역"...')

    const result = await prisma.rosterAssignment.updateMany({
        where: {
            position: '상하차'
        },
        data: {
            position: '상하역'
        }
    })

    console.log(`Updated ${result.count} assignments.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
