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
    update: {
      name: '이승철',
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'MANAGER',
      name: '이승철',
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

  // Seed Daily Logs (특이사항) - 날짜별 특이사항 등록
  console.log('Seeding daily logs...')
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } })
  
  if (adminUser) {
    // 날짜별 특이사항 데이터
    // 형식: { date: 'YYYY-MM-DD', content: '내용' }
    // 아래 배열에 원하는 날짜와 내용을 추가하여 사용할 수 있습니다.
    const dailyLogs = [
      // 2024년 12월 예시
      { date: '2024-12-01', content: '정상 근무' },
      { date: '2024-12-02', content: '오전 근무, 오후 병원 진료' },
      { date: '2024-12-03', content: '외근 - 고객사 방문' },
      { date: '2024-12-04', content: '재택 근무' },
      { date: '2024-12-05', content: '개인 연차' },
      { date: '2024-12-06', content: '정상 근무' },
      { date: '2024-12-07', content: '오후 근무' },
      { date: '2024-12-08', content: '병가' },
      { date: '2024-12-09', content: '정상 근무' },
      { date: '2024-12-10', content: '출장 - 서울 본사' },
      { date: '2024-12-11', content: '교육 - 안전교육 참석' },
      { date: '2024-12-12', content: '정상 근무' },
      { date: '2024-12-13', content: '회의 - 월간 회의 참석' },
      { date: '2024-12-14', content: '건강검진' },
      { date: '2024-12-15', content: '정상 근무' },
      { date: '2024-12-16', content: '반차 - 오전' },
      { date: '2024-12-17', content: '정상 근무' },
      { date: '2024-12-18', content: '가족 행사 참석' },
      { date: '2024-12-19', content: '정상 근무' },
      { date: '2024-12-20', content: '세미나 참석' },
      { date: '2024-12-21', content: '정상 근무' },
      { date: '2024-12-22', content: '오전 근무' },
      { date: '2024-12-23', content: '정상 근무' },
      { date: '2024-12-24', content: '크리스마스 이브 - 조기 퇴근' },
      { date: '2024-12-25', content: '크리스마스 - 휴무' },
      { date: '2024-12-26', content: '정상 근무' },
      { date: '2024-12-27', content: '정상 근무' },
      { date: '2024-12-28', content: '정상 근무' },
      { date: '2024-12-29', content: '정상 근무' },
      { date: '2024-12-30', content: '연말 정산 작업' },
      { date: '2024-12-31', content: '연말 - 조기 퇴근' },
      
      // 2025년 1월 예시
      { date: '2025-01-01', content: '신정 - 휴무' },
      { date: '2025-01-02', content: '정상 근무' },
      { date: '2025-01-03', content: '정상 근무' },
      { date: '2025-01-04', content: '정상 근무' },
      { date: '2025-01-05', content: '정상 근무' },
      { date: '2025-01-06', content: '정상 근무' },
      { date: '2025-01-07', content: '정상 근무' },
      { date: '2025-01-08', content: '정상 근무' },
      { date: '2025-01-09', content: '정상 근무' },
      { date: '2025-01-10', content: '정상 근무' },
    ]

    // 기존 특이사항 삭제 (선택사항 - 주석 처리하면 기존 데이터 유지)
    // for (const log of dailyLogs) {
    //   const logDate = new Date(log.date)
    //   await prisma.dailyLog.deleteMany({
    //     where: {
    //       date: {
    //         gte: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()),
    //         lt: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate() + 1)
    //       }
    //     }
    //   })
    // }

    // 특이사항 생성 (중복 체크 후 생성)
    let createdCount = 0
    for (const log of dailyLogs) {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0) // Set to midnight
      
      // 해당 날짜에 이미 특이사항이 있는지 확인
      const existingLog = await prisma.dailyLog.findFirst({
        where: {
          date: {
            gte: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()),
            lt: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate() + 1)
          },
          content: log.content
        }
      })

      // 중복이 없으면 생성
      if (!existingLog) {
        await prisma.dailyLog.create({
          data: {
            date: logDate,
            content: log.content,
            authorId: adminUser.id,
          }
        })
        createdCount++
      }
    }
    console.log(`Created ${createdCount} daily logs (${dailyLogs.length - createdCount} already existed)`)
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
