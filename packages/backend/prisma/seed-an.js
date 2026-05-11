import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('An123456!', 10);

  await prisma.user.upsert({
    where: { email: 'an.nguyenvanan@saodo.edu.vn' },
    update: {},
    create: {
      email: 'an.nguyenvanan@saodo.edu.vn',
      passwordHash,
      fullName: 'Nguyễn Văn An',
      role: 'student',
      status: 'active',
      studentProfile: {
        create: {
          studentCode: 'SV2024001',
          phone: '0912345678',
          major: 'Công nghệ thông tin',
        },
      },
    },
  });

  console.log('✅ Đã tạo tài khoản Nguyễn Văn An');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Lỗi:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
