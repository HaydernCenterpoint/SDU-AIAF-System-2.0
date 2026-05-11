import bcrypt from 'bcrypt';
import { ACCOUNT_TYPES, DEFAULT_ACCOUNT_TYPE, roleForAccountType } from '../account-types.js';
import { toPublicUser } from '../models/user.model.js';
import { AppError } from '../utils/app-error.js';
import { createAccessToken, createRefreshToken, createResetToken, hashToken } from '../utils/token.js';

export function createAuthService({ authRepository, config }) {
  async function issueTokens(user) {
    const accessToken = createAccessToken(user, config);
    const refreshToken = createRefreshToken();
    const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    await authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  return {
    async register(input) {
      const email = input.email.toLowerCase().trim();
      const existing = await authRepository.findUserByEmail(email);
      if (existing) {
        throw new AppError('Email đã tồn tại', 409, [{ field: 'email', message: 'Email đã tồn tại' }], 'EMAIL_ALREADY_EXISTS');
      }

      const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);
      const accountType = input.accountType || DEFAULT_ACCOUNT_TYPE;
      const normalizedStudentCode = accountType === ACCOUNT_TYPES.GUEST_PUBLIC ? undefined : input.studentCode?.trim();
      const user = await authRepository.createUser({
        email,
        passwordHash,
        fullName: input.fullName,
        studentCode: normalizedStudentCode,
        phone: input.phone,
        major: input.major,
        accountType,
        role: roleForAccountType(accountType),
      });
      const tokens = await issueTokens(user);

      return { user: toPublicUser(user), ...tokens };
    },

    async login(input) {
      const email = input.email.toLowerCase().trim();
      const user = await authRepository.findUserByEmail(email);
      if (!user) {
        throw new AppError('Email hoặc mật khẩu không đúng', 401, [], 'INVALID_CREDENTIALS');
      }
      if (user.status !== 'active') {
        throw new AppError('Tài khoản không hoạt động', 403, [], 'ACCOUNT_INACTIVE');
      }

      const ok = await bcrypt.compare(input.password, user.passwordHash);
      if (!ok) {
        throw new AppError('Email hoặc mật khẩu không đúng', 401, [], 'INVALID_CREDENTIALS');
      }

      const tokens = await issueTokens(user);
      return { user: toPublicUser(user), ...tokens };
    },

    async logout(input) {
      if (input.refreshToken) {
        await authRepository.revokeRefreshToken(hashToken(input.refreshToken));
      }
      return true;
    },

    async refreshToken(input) {
      const oldTokenHash = hashToken(input.refreshToken);
      const token = await authRepository.findRefreshToken(oldTokenHash);
      if (!token || token.revokedAt || new Date(token.expiresAt) <= new Date()) {
        throw new AppError('Refresh token không hợp lệ', 401, [], 'INVALID_REFRESH_TOKEN');
      }

      const user = await authRepository.findUserById(token.userId);
      if (!user || user.status !== 'active') {
        throw new AppError('Tài khoản không hợp lệ', 401, [], 'INVALID_ACCOUNT');
      }

      await authRepository.revokeRefreshToken(oldTokenHash);
      const tokens = await issueTokens(user);
      return { user: toPublicUser(user), ...tokens };
    },

    async forgotPassword(input) {
      const email = input.email.toLowerCase().trim();
      const user = await authRepository.findUserByEmail(email);
      if (!user) {
        return { resetToken: null };
      }

      const resetToken = createResetToken();
      await authRepository.savePasswordResetToken({
        userId: user.id,
        email,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      return { resetToken: config.nodeEnv === 'production' ? null : resetToken };
    },

    async resetPassword(input) {
      const tokenHash = hashToken(input.token);
      const resetToken = await authRepository.findPasswordResetToken(tokenHash);
      if (!resetToken || resetToken.usedAt || new Date(resetToken.expiresAt) <= new Date()) {
        throw new AppError('Token đặt lại mật khẩu không hợp lệ', 401, [], 'INVALID_RESET_TOKEN');
      }

      const user = await authRepository.findUserById(resetToken.userId);
      if (!user) {
        throw new AppError('Không tìm thấy người dùng', 404, [], 'USER_NOT_FOUND');
      }

      const passwordHash = await bcrypt.hash(input.newPassword, config.bcryptRounds);
      await authRepository.updatePassword(user.id, passwordHash);
      await authRepository.markPasswordResetTokenUsed(tokenHash);
      return true;
    },

    async changePassword(userId, input) {
      const user = await authRepository.findUserById(userId);
      if (!user) {
        throw new AppError('Không tìm thấy người dùng', 404, [], 'USER_NOT_FOUND');
      }

      const ok = await bcrypt.compare(input.oldPassword, user.passwordHash);
      if (!ok) {
        throw new AppError('Mật khẩu cũ không đúng', 401, [], 'INVALID_OLD_PASSWORD');
      }

      const passwordHash = await bcrypt.hash(input.newPassword, config.bcryptRounds);
      await authRepository.updatePassword(user.id, passwordHash);
      return true;
    },
  };
}
