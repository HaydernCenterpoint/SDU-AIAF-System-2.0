import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DEFAULT_SCHOOL_ID, getSchoolScopedPath, normalizeSchoolId } from './schools.mjs';
import { getUserFromToken } from './auth.mjs';

const DOCS_FILENAME = 'documents-db.json';
const DANGEROUS_EXTENSIONS = new Set(['.bat', '.cmd', '.com', '.exe', '.js', '.mjs', '.msi', '.ps1', '.scr', '.sh', '.vbs']);

const SDU_DOCUMENTS = [
  { id: 'demo-ai-1', title: 'GiÃ¡o trÃ¬nh TrÃ­ tuá»‡ nhÃ¢n táº¡o - ChÆ°Æ¡ng 1-4', description: 'Tá»•ng quan AI, tÃ¬m kiáº¿m heuristic, biá»ƒu diá»…n tri thá»©c vÃ  suy diá»…n cho mÃ´n TrÃ­ tuá»‡ nhÃ¢n táº¡o.', tags: ['AI', 'CS405', 'giÃ¡o trÃ¬nh', 'Ã´n thi'], file: { originalName: 'AI_chuong_1_4.pdf', mimeType: 'application/pdf', size: 9332326 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-29T08:00:00.000Z', updatedAt: '2026-04-29T15:30:00.000Z' },
  { id: 'demo-flutter-1', title: 'Slide Láº­p trÃ¬nh Flutter: State management', description: 'Provider, Riverpod, Bloc vÃ  cÃ¡ch tá»• chá»©c tráº¡ng thÃ¡i cho bÃ i thá»±c hÃ nh Flutter giá»¯a ká»³.', tags: ['Flutter', 'mobile', 'state', 'thá»±c hÃ nh'], file: { originalName: 'flutter_state.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 5662310 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-28T08:00:00.000Z', updatedAt: '2026-04-28T15:30:00.000Z' },
  { id: 'demo-csdl-1', title: 'NgÃ¢n hÃ ng Ä‘á» CÆ¡ sá»Ÿ dá»¯ liá»‡u', description: 'Tá»•ng há»£p cÃ¢u há»i SQL, chuáº©n hÃ³a dá»¯ liá»‡u, ERD vÃ  transaction Ä‘á»ƒ luyá»‡n thi cuá»‘i ká»³.', tags: ['CSDL', 'SQL', 'Ã´n thi', 'Ä‘á» cÆ°Æ¡ng'], file: { originalName: 'ngan_hang_de_csdl.pdf', mimeType: 'application/pdf', size: 3879731 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-27T08:00:00.000Z', updatedAt: '2026-04-27T15:30:00.000Z' },
  { id: 'demo-pttk-1', title: 'BÃ i táº­p lá»›n PhÃ¢n tÃ­ch thiáº¿t káº¿ há»‡ thá»‘ng', description: 'Máº«u Ä‘áº·c táº£ yÃªu cáº§u, use case, activity diagram vÃ  checklist ná»™p bÃ i theo nhÃ³m.', tags: ['PTTK', 'UML', 'bÃ i táº­p lá»›n', 'nhÃ³m'], file: { originalName: 'bai_tap_lon_pttk.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 2726297 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-26T08:00:00.000Z', updatedAt: '2026-04-26T15:30:00.000Z' },
  { id: 'demo-web-1', title: 'TÃ i liá»‡u thá»±c hÃ nh Web API Node.js', description: 'REST API, middleware xÃ¡c thá»±c, upload file vÃ  kiá»ƒm thá»­ endpoint báº±ng Postman.', tags: ['Web', 'Node.js', 'API', 'backend'], file: { originalName: 'web_api_nodejs.pdf', mimeType: 'application/pdf', size: 6396313 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-25T08:00:00.000Z', updatedAt: '2026-04-25T15:30:00.000Z' },
  { id: 'demo-mang-1', title: 'Lab Máº¡ng mÃ¡y tÃ­nh: VLAN vÃ  Ä‘á»‹nh tuyáº¿n tÄ©nh', description: 'Cáº¥u hÃ¬nh VLAN, static route vÃ  kiá»ƒm tra ping trÃªn Cisco Packet Tracer.', tags: ['Máº¡ng', 'VLAN', 'Packet Tracer', 'lab'], file: { originalName: 'lab_vlan.pdf', mimeType: 'application/pdf', size: 4508876 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-24T08:00:00.000Z', updatedAt: '2026-04-24T15:30:00.000Z' },
  { id: 'demo-hdh-1', title: 'TÃ³m táº¯t Há»‡ Ä‘iá»u hÃ nh: Process, Thread, Deadlock', description: 'SÆ¡ Ä‘á»“ Ã´n táº­p tiáº¿n trÃ¬nh, luá»“ng, Ä‘á»“ng bá»™ vÃ  cÃ¡c dáº¡ng bÃ i deadlock.', tags: ['Há»‡ Ä‘iá»u hÃ nh', 'deadlock', 'Ã´n táº­p'], file: { originalName: 'he_dieu_hanh.pdf', mimeType: 'application/pdf', size: 3040870 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-23T08:00:00.000Z', updatedAt: '2026-04-23T15:30:00.000Z' },
  { id: 'demo-oop-1', title: 'BÃ i táº­p OOP Java cÃ³ lá»i giáº£i', description: 'Class, interface, káº¿ thá»«a, Ä‘a hÃ¬nh vÃ  bÃ i táº­p quáº£n lÃ½ sinh viÃªn.', tags: ['Java', 'OOP', 'bÃ i táº­p', 'lá»i giáº£i'], file: { originalName: 'oop_java.zip', mimeType: 'application/zip', size: 11744051 }, owner: { id: 'demo-library', email: 'thu-vien@saodo.edu.vn', role: 'teacher' }, createdAt: '2026-04-22T08:00:00.000Z', updatedAt: '2026-04-22T15:30:00.000Z' },
];

const NTD_DOCUMENTS = [
  { id: 'demo-toan-1', title: 'Äá» cÆ°Æ¡ng Ã´n táº­p ToÃ¡n 12 - Há»c ká»³ 2', description: 'Tá»•ng há»£p cÃ¡c chuyÃªn Ä‘á»: Sá»‘ phá»©c, TÃ­ch phÃ¢n, HÃ¬nh há»c khÃ´ng gian Oxyz.', tags: ['ToÃ¡n', 'Khá»‘i 12', 'Ã´n thi', 'Ä‘á» cÆ°Æ¡ng'], file: { originalName: 'de_cuong_toan_12_hk2.pdf', mimeType: 'application/pdf', size: 3145728 }, owner: { id: 'demo-library', email: 'thu-vien@ntd.edu.vn', role: 'teacher' }, createdAt: '2026-04-29T08:00:00.000Z', updatedAt: '2026-04-29T15:30:00.000Z' },
  { id: 'demo-van-1', title: 'PhÃ¢n tÃ­ch tÃ¡c pháº©m Vá»£ Nháº·t - Kim LÃ¢n', description: 'TÃ i liá»‡u hÆ°á»›ng dáº«n phÃ¢n tÃ­ch nhÃ¢n váº­t TrÃ ng, ngÆ°á»i vá»£ nháº·t vÃ  bÃ  cá»¥ Tá»©.', tags: ['Ngá»¯ VÄƒn', 'Vá»£ Nháº·t', 'phÃ¢n tÃ­ch', 'tÃ i liá»‡u'], file: { originalName: 'phan_tich_vo_nhat.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1048576 }, owner: { id: 'demo-library', email: 'thu-vien@ntd.edu.vn', role: 'teacher' }, createdAt: '2026-04-28T08:00:00.000Z', updatedAt: '2026-04-28T15:30:00.000Z' },
  { id: 'demo-anh-1', title: 'Tá»•ng há»£p tá»« vá»±ng Tiáº¿ng Anh 12 (Units 1-10)', description: 'Danh sÃ¡ch tá»« vá»±ng trá»ng tÃ¢m kÃ¨m vÃ­ dá»¥ vÃ  bÃ i táº­p tráº¯c nghiá»‡m Ã¡p dá»¥ng.', tags: ['Tiáº¿ng Anh', 'tá»« vá»±ng', 'bÃ i táº­p'], file: { originalName: 'vocab_english_12.pdf', mimeType: 'application/pdf', size: 2621440 }, owner: { id: 'demo-library', email: 'thu-vien@ntd.edu.vn', role: 'teacher' }, createdAt: '2026-04-27T08:00:00.000Z', updatedAt: '2026-04-27T15:30:00.000Z' },
  { id: 'demo-ly-1', title: 'CÃ´ng thá»©c Váº­t lÃ½ 12 thi THPT Quá»‘c gia', description: 'TÃ³m táº¯t cÃ´ng thá»©c toÃ n bá»™ chÆ°Æ¡ng trÃ¬nh Váº­t lÃ½ 12 Ä‘á»ƒ luyá»‡n thi THPT QG.', tags: ['Váº­t lÃ½', 'cÃ´ng thá»©c', 'luyá»‡n thi'], file: { originalName: 'cong_thuc_vat_ly_12.pdf', mimeType: 'application/pdf', size: 1572864 }, owner: { id: 'demo-library', email: 'thu-vien@ntd.edu.vn', role: 'teacher' }, createdAt: '2026-04-26T08:00:00.000Z', updatedAt: '2026-04-26T15:30:00.000Z' },
  { id: 'demo-hoa-1', title: 'ChuyÃªn Ä‘á» Há»¯u cÆ¡: Este - Lipit', description: 'LÃ½ thuyáº¿t trá»ng tÃ¢m vÃ  cÃ¡c dáº¡ng bÃ i táº­p giáº£i chi tiáº¿t vá» Este vÃ  Lipit.', tags: ['HÃ³a há»c', 'chuyÃªn Ä‘á»', 'bÃ i táº­p'], file: { originalName: 'chuyen_de_este_lipit.pdf', mimeType: 'application/pdf', size: 2097152 }, owner: { id: 'demo-library', email: 'thu-vien@ntd.edu.vn', role: 'teacher' }, createdAt: '2026-04-25T08:00:00.000Z', updatedAt: '2026-04-25T15:30:00.000Z' },
];

function getDocumentsPath(schoolId) {
  return getSchoolScopedPath('', schoolId, DOCS_FILENAME);
}

function getDocumentUploadPath(schoolId, storedName) {
  return getSchoolScopedPath('', schoolId, join('uploads', 'documents', storedName));
}

function loadDocumentsDb(schoolId) {
  const path = getDocumentsPath(schoolId);
  if (!existsSync(path)) {
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const defaults = schoolId === 'nguyen-thi-due' ? NTD_DOCUMENTS : SDU_DOCUMENTS;
    writeFileSync(path, JSON.stringify({ documents: defaults }, null, 2));
    return { documents: defaults };
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function saveDocumentsDb(schoolId, data) {
  const path = getDocumentsPath(schoolId);
  writeFileSync(path, JSON.stringify(data, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(payload));
}

export async function handleDocumentRoutes(req, res, url) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-School-ID',
    });
    res.end();
    return true;
  }

  const schoolIdHeader = normalizeSchoolId(req.headers['x-school-id']);
  const user = getUserFromRequest(req);

  if (req.method === 'GET' && url.pathname === '/api/documents') {
    const schoolId = user?.schoolId || schoolIdHeader || DEFAULT_SCHOOL_ID;
    const db = loadDocumentsDb(schoolId);
    const documents = db.documents
      .filter((document) => matchesFilters(document, url.searchParams))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map((document) => toPublicDocument(document, user));

    sendJson(res, 200, { success: true, data: documents });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/documents') {
    if (!user) {
      sendJson(res, 401, { success: false, message: 'ChÆ°a xÃ¡c thá»±c', error: 'Unauthorized' });
      return true;
    }

    const form = await readMultipartForm(req);
    const title = stringField(form.get('title'));
    const description = stringField(form.get('description'));
    const tags = parseTags(form.get('tags'));
    const file = form.get('file');

    if (!(file instanceof File)) {
      sendJson(res, 422, { success: false, message: 'Vui lÃ²ng chá»n file tÃ i liá»‡u' });
      return true;
    }

    if (!title) {
      sendJson(res, 422, { success: false, message: 'Vui lÃ²ng nháº­p tÃªn tÃ i liá»‡u' });
      return true;
    }

    const unsafeReason = getUnsafeFileReason(file.name);
    if (unsafeReason) {
      sendJson(res, 422, { success: false, message: unsafeReason });
      return true;
    }

    const schoolId = normalizeSchoolId(user.schoolId);
    const db = loadDocumentsDb(schoolId);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extension = extname(file.name || '').toLowerCase();
    const storedName = `${randomUUID()}${extension}`;
    const storedPath = getDocumentUploadPath(schoolId, storedName);
    const uploadDir = dirname(storedPath);

    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    writeFileSync(storedPath, fileBuffer);

    const now = new Date().toISOString();
    const newDoc = {
      id: `doc_${randomUUID()}`,
      title,
      description,
      tags,
      file: {
        originalName: file.name || title,
        mimeType: file.type || 'application/octet-stream',
        size: fileBuffer.length,
        storedName,
        path: storedPath,
      },
      owner: {
        id: user.id,
        email: user.email || user.studentId,
        role: user.role || 'student',
      },
      createdAt: now,
      updatedAt: now,
    };

    db.documents = [newDoc, ...db.documents];
    saveDocumentsDb(schoolId, db);

    sendJson(res, 201, { success: true, message: 'ÄÄƒng tÃ i liá»‡u thÃ nh cÃ´ng', data: toPublicDocument(newDoc, user) });
    return true;
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/documents/')) {
    if (!user) {
      sendJson(res, 401, { success: false, message: 'ChÆ°a xÃ¡c thá»±c', error: 'Unauthorized' });
      return true;
    }

    const schoolId = normalizeSchoolId(user.schoolId);
    const db = loadDocumentsDb(schoolId);
    const documentId = url.pathname.slice('/api/documents/'.length);
    const document = db.documents.find((item) => item.id === documentId);

    if (!document) {
      sendJson(res, 404, { success: false, message: 'KhÃ´ng tÃ¬m tháº¥y tÃ i liá»‡u' });
      return true;
    }

    if (!canManageDocument(document, user)) {
      sendJson(res, 403, { success: false, message: 'Báº¡n khÃ´ng cÃ³ quyá»n chá»‰nh sá»­a tÃ i liá»‡u nÃ y' });
      return true;
    }

    const body = await readJsonBody(req);
    const updated = {
      ...document,
      title: stringField(body.title) || document.title,
      description: stringField(body.description),
      tags: parseTags(body.tags),
      updatedAt: new Date().toISOString(),
    };

    db.documents = db.documents.map((item) => (item.id === document.id ? updated : item));
    saveDocumentsDb(schoolId, db);

    sendJson(res, 200, { success: true, message: 'Cáº­p nháº­t tÃ i liá»‡u thÃ nh cÃ´ng', data: toPublicDocument(updated, user) });
    return true;
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/documents/')) {
    if (!user) {
      sendJson(res, 401, { success: false, message: 'ChÆ°a xÃ¡c thá»±c', error: 'Unauthorized' });
      return true;
    }

    const schoolId = normalizeSchoolId(user.schoolId);
    const db = loadDocumentsDb(schoolId);
    const documentId = url.pathname.slice('/api/documents/'.length);
    const document = db.documents.find((item) => item.id === documentId);

    if (!document) {
      sendJson(res, 404, { success: false, message: 'KhÃ´ng tÃ¬m tháº¥y tÃ i liá»‡u' });
      return true;
    }

    if (!canManageDocument(document, user)) {
      sendJson(res, 403, { success: false, message: 'Báº¡n khÃ´ng cÃ³ quyá»n xÃ³a tÃ i liá»‡u nÃ y' });
      return true;
    }

    if (document.file?.path && existsSync(document.file.path)) {
      rmSync(document.file.path, { force: true });
    }

    db.documents = db.documents.filter((item) => item.id !== document.id);
    saveDocumentsDb(schoolId, db);

    sendJson(res, 200, { success: true, message: 'ÄÃ£ xÃ³a tÃ i liá»‡u', data: { id: document.id } });
    return true;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/documents/') && url.pathname.endsWith('/download')) {
    if (!user) {
      sendJson(res, 401, { success: false, message: 'ChÆ°a xÃ¡c thá»±c', error: 'Unauthorized' });
      return true;
    }

    const schoolId = normalizeSchoolId(user.schoolId);
    const db = loadDocumentsDb(schoolId);
    const documentId = url.pathname.slice('/api/documents/'.length, -'/download'.length);
    const document = db.documents.find((item) => item.id === documentId);

    if (!document) {
      sendJson(res, 404, { success: false, message: 'KhÃ´ng tÃ¬m tháº¥y tÃ i liá»‡u' });
      return true;
    }

    if (!document.file?.path || !existsSync(document.file.path)) {
      sendJson(res, 404, { success: false, message: 'KhÃ´ng tÃ¬m tháº¥y file táº£i xuá»‘ng' });
      return true;
    }

    const payload = readFileSync(document.file.path);
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': document.file.mimeType || 'application/octet-stream',
      'Content-Length': String(payload.length),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(document.file.originalName)}`,
    });
    res.end(payload);
    return true;
  }

  return false;
}

function getUserFromRequest(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return getUserFromToken(header.slice(7));
}

function toPublicDocument(document, user) {
  return {
    ...document,
    file: {
      originalName: document.file.originalName,
      mimeType: document.file.mimeType,
      size: document.file.size,
    },
    canManage: canManageDocument(document, user),
  };
}

function canManageDocument(document, user) {
  return Boolean(user && (document.owner?.id === user.id || user.role === 'admin'));
}

function matchesFilters(document, query) {
  const search = normalizeForSearch(query.get?.('search') || query.search || '');
  if (search) {
    const haystack = normalizeForSearch([document.title, document.description, ...(document.tags || []), document.file?.originalName || ''].join(' '));
    if (!haystack.includes(search)) return false;
  }

  const tag = normalizeForSearch(query.get?.('tag') || query.tag || '');
  if (tag && !(document.tags || []).some((item) => normalizeForSearch(item) === tag || normalizeForSearch(item).includes(tag))) return false;

  const createdFrom = query.get?.('createdFrom') || query.createdFrom;
  const createdTo = query.get?.('createdTo') || query.createdTo;
  const updatedFrom = query.get?.('updatedFrom') || query.updatedFrom;
  const updatedTo = query.get?.('updatedTo') || query.updatedTo;

  if (createdFrom && document.createdAt.slice(0, 10) < createdFrom) return false;
  if (createdTo && document.createdAt.slice(0, 10) > createdTo) return false;
  if (updatedFrom && document.updatedAt.slice(0, 10) < updatedFrom) return false;
  if (updatedTo && document.updatedAt.slice(0, 10) > updatedTo) return false;

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

function stringField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeForSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .trim();
}

function getUnsafeFileReason(fileName) {
  const extension = extname(fileName || '').toLowerCase();
  return DANGEROUS_EXTENSIONS.has(extension) ? 'Äá»‹nh dáº¡ng file nguy hiá»ƒm hoáº·c khÃ´ng Ä‘Æ°á»£c há»— trá»£' : '';
}

async function readJsonBody(req) {
  const raw = await readRequestBody(req);
  if (!raw.length) return {};
  try {
    return JSON.parse(raw.toString('utf8'));
  } catch {
    return {};
  }
}

async function readMultipartForm(req) {
  const body = await readRequestBody(req);
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers[key] = value.join(', ');
    else if (typeof value === 'string') headers[key] = value;
  }

  // Use the built-in WHATWG Request parser so the runtime server can accept browser FormData without extra deps.
  const request = new Request('http://localhost/api/documents', {
    method: 'POST',
    headers,
    body,
  });
  return request.formData();
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
