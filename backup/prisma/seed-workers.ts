import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const companies = await prisma.company.findMany()
    if (companies.length === 0) {
        console.log('No companies found. Please run the main seed script first.')
        return
    }

    const hashedPassword = await bcrypt.hash('worker123', 10)
    const firstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
    const lastNames = ['민수', '서준', '도윤', '예준', '시우', '하준', '지호', '지후', '준서', '준우', '현우', '도현', '지훈', '건우', '우진', '선우', '서진', '연우', '유준', '승우']

    console.log('Seeding 30 workers...')

    for (let i = 1; i <= 30; i++) {
        const randomCompany = companies[Math.floor(Math.random() * companies.length)]
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const name = `${firstName}${lastName}`
        const username = `worker${i}`

        // Random hire date within last 2 years
        const hireDate = new Date()
        hireDate.setFullYear(hireDate.getFullYear() - Math.floor(Math.random() * 2))
        hireDate.setMonth(Math.floor(Math.random() * 12))
        hireDate.setDate(Math.floor(Math.random() * 28))

        await prisma.user.upsert({
            where: { username },
            update: {},
            create: {
                username,
                password: hashedPassword,
                role: 'WORKER',
                name: `${name} ${i}`, // Append number to ensure uniqueness/clarity
                companyId: randomCompany.id,
                isApproved: true, // Auto approve for testing convenience
                hireDate,
                carNumber: `${Math.floor(Math.random() * 99)}가 ${Math.floor(Math.random() * 9000) + 1000}`,
            },
        })
    }

    console.log('Seeding workers finished.')
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
