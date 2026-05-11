export function createMemoryAuthRepository() {
  const users = new Map();
  const usersByEmail = new Map();
  const refreshTokens = new Map();
  const resetTokens = new Map();

  return {
    async createUser({ email, passwordHash, fullName, studentCode, phone, major, accountType = 'university_student', role = 'student' }) {
      const id = `user-${users.size + 1}`;
      const now = new Date().toISOString();
      const user = {
        id,
        email,
        passwordHash,
        fullName,
        avatarUrl: null,
        role,
        accountType,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        profile: {
          studentCode,
          phone: phone || null,
          major: major || null,
        },
      };

      users.set(id, user);
      usersByEmail.set(email, user);
      return user;
    },

    async findUserByEmail(email) {
      return usersByEmail.get(email) || null;
    },

    async findUserById(id) {
      return users.get(id) || null;
    },

    async updatePassword(userId, passwordHash) {
      const user = users.get(userId);
      if (!user) return null;
      user.passwordHash = passwordHash;
      user.updatedAt = new Date().toISOString();
      return user;
    },

    async saveRefreshToken({ userId, tokenHash, expiresAt }) {
      refreshTokens.set(tokenHash, {
        userId,
        tokenHash,
        expiresAt,
        revokedAt: null,
      });
    },

    async findRefreshToken(tokenHash) {
      return refreshTokens.get(tokenHash) || null;
    },

    async revokeRefreshToken(tokenHash) {
      const token = refreshTokens.get(tokenHash);
      if (token) token.revokedAt = new Date().toISOString();
    },

    async savePasswordResetToken({ email, tokenHash, expiresAt }) {
      resetTokens.set(tokenHash, {
        email,
        tokenHash,
        expiresAt,
        usedAt: null,
      });
    },

    async findPasswordResetToken(tokenHash) {
      return resetTokens.get(tokenHash) || null;
    },

    async markPasswordResetTokenUsed(tokenHash) {
      const token = resetTokens.get(tokenHash);
      if (token) token.usedAt = new Date().toISOString();
    },
  };
}
