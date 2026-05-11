import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      fullName: 'Admin System',
      role: 'admin',
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash,
      fullName: 'Nguyễn Văn A',
      role: 'student',
      status: 'active',
      studentProfile: {
        create: {
          studentCode: 'SV001',
          phone: '0987654321',
          major: 'Công nghệ thông tin',
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
