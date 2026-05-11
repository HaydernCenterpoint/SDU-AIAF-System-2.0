export class AppError extends Error {
  constructor(message, statusCode = 500, errors = [], code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
  }
}
