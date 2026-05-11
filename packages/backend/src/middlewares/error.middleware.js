import { AppError } from '../utils/app-error.js';
import { errorResponse } from '../utils/response.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(`Không tìm thấy ${req.method} ${req.originalUrl}`, 404, [], 'NOT_FOUND'));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return errorResponse(res, {
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
    });
  }

  return errorResponse(res, {
    statusCode: 500,
    message: 'Lỗi hệ thống',
    errors: [],
  });
}
