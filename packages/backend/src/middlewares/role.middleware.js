import { AppError } from '../utils/app-error.js';

export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Chưa xác thực', 401, [], 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Không có quyền truy cập', 403, [], 'FORBIDDEN'));
    }

    return next();
  };
}
