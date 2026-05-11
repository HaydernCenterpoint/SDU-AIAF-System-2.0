import multer from 'multer';
import { env } from '../config/env.js';

export const upload = multer({
  dest: env.uploadDir,
  limits: {
    fileSize: env.maxUploadMb * 1024 * 1024,
  },
});
