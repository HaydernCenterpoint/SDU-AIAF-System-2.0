import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/token.js';
import { env } from '../config/env.js';

export function authenticateJwt(req, _res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Chưa xác thực', 401, [], 'UNAUTHORIZED'));
  }

  try {
    const payload = verifyAccessToken(header.slice(7), env);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch {
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 401, [], 'INVALID_TOKEN'));
  }
}
