import crypto from 'node:crypto';
import path from 'node:path';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { AppError } from '../utils/app-error.js';
import { successResponse } from '../utils/response.js';

const DANGEROUS_EXTENSIONS = new Set([
  '.bat',
  '.cmd',
  '.com',
  '.exe',
  '.js',
  '.mjs',
  '.msi',
  '.ps1',
  '.scr',
  '.sh',
  '.vbs',
]);

export function createDocumentRoutes(options = {}) {
  const router = express.Router();
  const uploadDir = path.resolve(options.uploadDir || env.uploadDir, 'documents');
  const maxUploadMb = options.maxUploadMb || 25;
  const storagePath = options.storagePath || (options.uploadDir ? null : path.resolve('data', 'documents.json'));
  const store = createDocumentStore(storagePath);
  const upload = multer({ dest: uploadDir, limits: { fileSize: maxUploadMb * 1024 * 1024 } });

  router.use(authenticateJwt);

  router.get('/', asyncHandler(async (req, res) => {
    const documents = await store.list();
    const filtered = documents
      .filter((document) => matchesFilters(document, req.query))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((document) => toPublicDocument(document, req.user));

    return successResponse(res, { data: filtered });
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const document = await getDocumentOrThrow(store, req.params.id);
    return successResponse(res, { data: toPublicDocument(document, req.user) });
  }));

  router.post('/', runUpload(upload.single('file')), asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('Vui lòng chọn file tài liệu', 422, [], 'DOCUMENT_FILE_REQUIRED');
    const unsafeReason = getUnsafeFileReason(req.file.originalname);
    if (unsafeReason) {
      await rm(req.file.path, { force: true });
      throw new AppError(unsafeReason, 422, [], 'DOCUMENT_FILE_UNSAFE');
    }

    const title = stringField(req.body.title);
    if (!title) {
      await rm(req.file.path, { force: true });
      throw new AppError('Vui lòng nhập tên tài liệu', 422, [{ field: 'title', message: 'Tên tài liệu là bắt buộc' }], 'DOCUMENT_TITLE_REQUIRED');
    }

    await mkdir(uploadDir, { recursive: true });
    const now = new Date().toISOString();
    const extension = path.extname(req.file.originalname).toLowerCase();
    const storedName = `${crypto.randomUUID()}${extension}`;
    const storedPath = path.join(uploadDir, storedName);
    await rename(req.file.path, storedPath);

    const document = {
      id: `doc-${crypto.randomUUID()}`,
      title,
      description: stringField(req.body.description),
      tags: parseTags(req.body.tags),
      owner: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      file: {
        originalName: req.file.originalname,
        storedName,
        path: storedPath,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      createdAt: now,
      updatedAt: now,
    };

    await store.create(document);
    return successResponse(res, { statusCode: 201, message: 'Đăng tài liệu thành công', data: toPublicDocument(document, req.user) });
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    const document = await getDocumentOrThrow(store, req.params.id);
    assertCanManage(document, req.user);

    const title = stringField(req.body.title);
    const updated = {
      ...document,
      title: title || document.title,
      description: stringField(req.body.description),
      tags: parseTags(req.body.tags),
      updatedAt: new Date().toISOString(),
    };

    await store.update(updated);
    return successResponse(res, { message: 'Cập nhật tài liệu thành công', data: toPublicDocument(updated, req.user) });
  }));

  router.delete('/:id', asyncHandler(async (req, res) => {
    const document = await getDocumentOrThrow(store, req.params.id);
    assertCanManage(document, req.user);
    await store.remove(document.id);
    await rm(document.file.path, { force: true });
    return successResponse(res, { message: 'Đã xóa tài liệu', data: { id: document.id } });
  }));

  router.get('/:id/download', asyncHandler(async (req, res) => {
    const document = await getDocumentOrThrow(store, req.params.id);
    res.download(document.file.path, document.file.originalName);
  }));

  return router;
}

function createDocumentStore(storagePath) {
  let documents = null;

  async function load() {
    if (documents) return documents;
    if (!storagePath) {
      documents = [];
      return documents;
    }
    try {
      documents = JSON.parse(await readFile(storagePath, 'utf8'));
      return documents;
    } catch {
      documents = [];
      return documents;
    }
  }

  async function save(nextDocuments) {
    documents = nextDocuments;
    if (!storagePath) return;
    await mkdir(path.dirname(storagePath), { recursive: true });
    await writeFile(storagePath, `${JSON.stringify(documents, null, 2)}\n`);
  }

  return {
    list: () => load(),
    async create(document) {
      const current = await load();
      await save([...current, document]);
    },
    async update(document) {
      const current = await load();
      await save(current.map((item) => (item.id === document.id ? document : item)));
    },
    async remove(id) {
      const current = await load();
      await save(current.filter((item) => item.id !== id));
    },
  };
}

async function getDocumentOrThrow(store, id) {
  const document = (await store.list()).find((item) => item.id === id);
  if (!document) throw new AppError('Không tìm thấy tài liệu', 404, [], 'DOCUMENT_NOT_FOUND');
  return document;
}

function assertCanManage(document, user) {
  if (document.owner.id === user.id || user.role === 'admin') return;
  throw new AppError('Bạn không có quyền quản lý tài liệu này', 403, [], 'DOCUMENT_FORBIDDEN');
}

function toPublicDocument(document, user) {
  return {
    ...document,
    file: {
      originalName: document.file.originalName,
      mimeType: document.file.mimeType,
      size: document.file.size,
    },
    canManage: document.owner.id === user.id || user.role === 'admin',
  };
}

function matchesFilters(document, query) {
  const search = normalizeForSearch(query.search || '');
  if (search) {
    const haystack = normalizeForSearch([document.title, document.description, ...document.tags].join(' '));
    if (!haystack.includes(search)) return false;
  }

  const tag = normalizeForSearch(query.tag || '');
  if (tag && !document.tags.some((item) => normalizeForSearch(item) === tag)) return false;

  if (query.createdFrom && document.createdAt.slice(0, 10) < query.createdFrom) return false;
  if (query.createdTo && document.createdAt.slice(0, 10) > query.createdTo) return false;
  if (query.updatedFrom && document.updatedAt.slice(0, 10) < query.updatedFrom) return false;
  if (query.updatedTo && document.updatedAt.slice(0, 10) > query.updatedTo) return false;

  return true;
}

function parseTags(value) {
  if (Array.isArray(value)) return value.flatMap(parseTags);
  return stringField(value)
    .split(/[;,\n]/u)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, all) => all.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index);
}

function getUnsafeFileReason(fileName) {
  const extension = path.extname(fileName || '').toLowerCase();
  return DANGEROUS_EXTENSIONS.has(extension) ? 'Định dạng file nguy hiểm hoặc không được hỗ trợ' : '';
}

function normalizeForSearch(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .trim();
}

function stringField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function runUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (!error) return next();
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File vượt quá giới hạn dung lượng cho phép', 413, [], 'DOCUMENT_FILE_TOO_LARGE'));
      }
      return next(error);
    });
  };
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
