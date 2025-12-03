import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed Companies
  const companies = ['보람관리', '디티에스', '신항만건기']
  for (const name of companies) {
    await prisma.company.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Seed Teams
  const teams = ['1조', '2조', '3조']
  for (let i = 0; i < teams.length; i++) {
    await prisma.team.upsert({
      where: { name: teams[i] },
      update: { order: i },
      create: { name: teams[i], order: i },
    })
  }

  // Seed Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'MANAGER',
      name: '관리자',
      isApproved: true,
    },
  })

  // Delete existing workers (but keep admin)
  console.log('Deleting existing workers...')
  await prisma.user.deleteMany({
    where: {
      role: 'WORKER'
    }
  })

  // Seed New Workers
  const workers = [
    { company: '보람관리', name: '강경수' },
    { company: '보람관리', name: '강성교' },
    { company: '보람관리', name: '장태윤' },
    { company: '보람관리', name: '전현준' },
    { company: '보람관리', name: '김성현' },
    { company: '보람관리', name: '이용노' },
    { company: '보람관리', name: '고성현' },
    { company: '보람관리', name: '오정환' },
    { company: '보람관리', name: '박상훈' },
    { company: '보람관리', name: '구만주' },
    { company: '보람관리', name: '박민우' },
    { company: '디티에스', name: '허찬' },
    { company: '신항만건기', name: '김대성' },
    { company: '신항만건기', name: '문재윤' },
    { company: '보람관리', name: '이용석' },
    { company: '신항만건기', name: '장하영' },
    { company: '보람관리', name: '양호근' },
    { company: '보람관리', name: '유리성' },
    { company: '보람관리', name: '양석현' },
    { company: '보람관리', name: '조인래' },
    { company: '보람관리', name: '이병상' },
    { company: '보람관리', name: '박상준' },
    { company: '보람관리', name: '정승주' },
    { company: '보람관리', name: '윤정환' },
    { company: '보람관리', name: '장헌기' },
  ]

  const defaultPassword = await bcrypt.hash('1234', 10)

  console.log('Seeding new workers...')
  for (const worker of workers) {
    // Generate a simple username based on name (or random if duplicate)
    // For simplicity, we'll use name + random number for username to ensure uniqueness
    // But for better UX, maybe just name if unique?
    // Let's try name first, if exists, append number. 
    // Actually, for bulk seed, let's just use name + 4 digit random
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${worker.name}${randomSuffix}`;

    await prisma.user.create({
      data: {
        username: username,
        password: defaultPassword,
        name: worker.name,
        role: 'WORKER',
        companyId: (await prisma.company.findUnique({ where: { name: worker.company } }))?.id,
        isApproved: true,
        hireDate: new Date(),
      }
    })
  }

  console.log('Seeding finished.')
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
