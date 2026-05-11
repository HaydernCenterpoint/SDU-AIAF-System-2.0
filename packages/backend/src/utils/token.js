import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

export function createAccessToken(user, config) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn },
  );
}

export function createRefreshToken() {
  return randomBytes(48).toString('hex');
}

export function createResetToken() {
  return randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token, config) {
  return jwt.verify(token, config.jwtAccessSecret);
}
