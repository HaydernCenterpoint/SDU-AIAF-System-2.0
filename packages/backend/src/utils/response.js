export function successResponse(res, { statusCode = 200, message = 'Thành công', data = null, meta } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function errorResponse(res, { statusCode = 500, message = 'Lỗi hệ thống', errors = [] } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
