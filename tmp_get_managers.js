const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function r() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: { id: true, username: true, name: true, role: true }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

r();
