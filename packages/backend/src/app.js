import express from 'express';
import { env } from './config/env.js';
import { getPrismaClient } from './config/database.js';
import { createPrismaAuthRepository } from './repositories/prisma-auth.repository.js';
import { createAuthService } from './services/auth.service.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createDocumentRoutes } from './routes/document.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { successResponse } from './utils/response.js';

export function createApp(options = {}) {
  const app = express();
  const authRepository = options.authRepository || createPrismaAuthRepository(getPrismaClient());
  const authService = options.authService || createAuthService({ authRepository, config: env });

  app.use(requestIdMiddleware);
  app.use(express.json({ limit: '1mb' }));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', env.corsAllowOrigin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  app.get('/api/health', (_req, res) =>
    successResponse(res, {
      message: 'Backend đang hoạt động',
      data: {
        service: 'student-ai-assistant-backend',
        mode: 'express',
      },
    }),
  );

  app.use('/api/auth', createAuthRoutes({ authService }));
  app.use('/api/documents', createDocumentRoutes(options.documentOptions));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
