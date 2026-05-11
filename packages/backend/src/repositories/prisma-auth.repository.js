export function createPrismaAuthRepository(prisma) {
  return {
    async createUser({ email, passwordHash, fullName, studentCode, phone, major, accountType = 'university_student', role = 'student' }) {
      return prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role,
          accountType,
          status: 'active',
          studentProfile: studentCode
            ? {
                create: {
                  studentCode,
                  phone: phone || null,
                  major: major || null,
                },
              }
            : undefined,
        },
        include: { studentProfile: true },
      });
    },

    async findUserByEmail(email) {
      return prisma.user.findUnique({
        where: { email },
        include: { studentProfile: true },
      });
    },

    async findUserById(id) {
      return prisma.user.findUnique({
        where: { id },
        include: { studentProfile: true },
      });
    },

    async updatePassword(userId, passwordHash) {
      return prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
        include: { studentProfile: true },
      });
    },

    async saveRefreshToken({ userId, tokenHash, expiresAt }) {
      await prisma.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
      });
    },

    async findRefreshToken(tokenHash) {
      return prisma.refreshToken.findUnique({ where: { tokenHash } });
    },

    async revokeRefreshToken(tokenHash) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    },

    async savePasswordResetToken({ userId, email, tokenHash, expiresAt }) {
      await prisma.passwordResetToken.create({
        data: { userId, email, tokenHash, expiresAt },
      });
    },

    async findPasswordResetToken(tokenHash) {
      return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    },

    async markPasswordResetTokenUsed(tokenHash) {
      await prisma.passwordResetToken.updateMany({
        where: { tokenHash, usedAt: null },
        data: { usedAt: new Date() },
      });
    },
  };
}
