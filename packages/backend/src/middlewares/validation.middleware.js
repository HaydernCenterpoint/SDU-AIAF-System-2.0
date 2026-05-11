import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError(
            'Dữ liệu không hợp lệ',
            422,
            error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
            'VALIDATION_ERROR',
          ),
        );
      }
      return next(error);
    }
  };
}
