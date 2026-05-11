import dotenv from 'dotenv';

dotenv.config();

function numberFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: numberFromEnv('PORT', 9191),
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || '*',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenTtlDays: numberFromEnv('REFRESH_TOKEN_TTL_DAYS', 7),
  bcryptRounds: numberFromEnv('BCRYPT_ROUNDS', process.env.NODE_ENV === 'test' ? 4 : 10),
  uploadDir: process.env.UPLOAD_DIR || 'src/uploads',
  maxUploadMb: numberFromEnv('MAX_UPLOAD_MB', 10),
};
