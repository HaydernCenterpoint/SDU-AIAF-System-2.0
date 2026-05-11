import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SCHOOL_ID, getSchoolScopedPath } from './schools.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getBaseDbPath() {
  return process.env.SAODO_GROUPS_DB_PATH || join(__dirname, '..', 'data', 'groups-db.json');
}

function getDbPath(schoolId = DEFAULT_SCHOOL_ID) {
  return getSchoolScopedPath(getBaseDbPath(), schoolId, 'groups-db.json');
}

function ensureDir(schoolId = DEFAULT_SCHOOL_ID) {
  const dir = dirname(getDbPath(schoolId));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function loadDb(schoolId = DEFAULT_SCHOOL_ID) {
  const dbPath = getDbPath(schoolId);
  if (!existsSync(dbPath)) {
    const initial = { groups: [] };
    // Create some default groups
    if (schoolId === 'nguyen-thi-due') {
      initial.groups.push(
        { id: 'g1', name: 'Trao đổi Khối 12', members: [], messages: [], creator: 'Admin', createdAt: new Date().toISOString() },
        { id: 'g2', name: 'Đội văn nghệ trường', members: [], messages: [], creator: 'Admin', createdAt: new Date().toISOString() }
      );
    } else {
      initial.groups.push(
        { id: 'g1', name: 'CNTT K15 - Trao đổi', members: [], messages: [], creator: 'Admin', createdAt: new Date().toISOString() },
        { id: 'g2', name: 'CLB Lập trình SMC', members: [], messages: [], creator: 'Admin', createdAt: new Date().toISOString() },
        { id: 'g3', name: 'Ôn thi cuối kỳ HK2', members: [], messages: [], creator: 'Admin', createdAt: new Date().toISOString() },
        { id: 'g4', name: 'Tìm việc part-time', members: [], messages: [], creator: 'Admin', createdAt: new Date().toISOString() }
      );
    }
    ensureDir(schoolId);
    writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(dbPath, 'utf8'));
}

export function saveDb(db, schoolId = DEFAULT_SCHOOL_ID) {
  ensureDir(schoolId);
  writeFileSync(getDbPath(schoolId), JSON.stringify(db, null, 2));
}

export async function handleGroupRoutes(req, res, url, user) {
  const schoolId = user.schoolId;

  const readJson = async () => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  };

  const sendJson = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
    return true;
  };

  if (req.method === 'GET' && url.pathname === '/api/groups') {
    const db = loadDb(schoolId);
    // return summaries
    const groups = db.groups.map(g => ({
      id: g.id,
      name: g.name,
      membersCount: g.members.length + 1, // just a fake number for demo, or g.members.length
      lastMsg: g.messages.length ? g.messages[g.messages.length - 1].content : 'Nhóm vừa được tạo',
      creator: g.creator,
      createdAt: g.createdAt
    }));
    return sendJson(200, { groups });
  }

  if (req.method === 'POST' && url.pathname === '/api/groups') {
    const body = await readJson();
    if (!body.name) return sendJson(400, { error: 'Missing name' });
    const db = loadDb(schoolId);
    const newGroup = {
      id: `g${Date.now()}`,
      name: body.name,
      members: [],
      messages: [],
      creator: user.fullName,
      createdAt: new Date().toISOString()
    };
    db.groups.unshift(newGroup);
    saveDb(db, schoolId);
    return sendJson(200, { group: newGroup });
  }

  const groupMsgMatch = /^\/api\/groups\/([^/]+)\/messages$/.exec(url.pathname);
  if (groupMsgMatch) {
    const groupId = groupMsgMatch[1];
    const db = loadDb(schoolId);
    const group = db.groups.find(g => g.id === groupId);
    if (!group) return sendJson(404, { error: 'Group not found' });

    if (req.method === 'GET') {
      return sendJson(200, { messages: group.messages, group: { id: group.id, name: group.name, creator: group.creator } });
    }

    if (req.method === 'POST') {
      const body = await readJson();
      if (!body.content) return sendJson(400, { error: 'Missing content' });
      const msg = {
        id: `msg-${Date.now()}`,
        authorId: user.id,
        authorName: user.fullName,
        authorAvatar: user.avatarUrl || null,
        authorRole: user.role || 'sinh viên',
        content: body.content,
        createdAt: new Date().toISOString()
      };
      group.messages.push(msg);
      saveDb(db, schoolId);
      return sendJson(200, { message: msg });
    }
  }

  return false;
}
