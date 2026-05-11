const fs = require('fs');
let lines = fs.readFileSync('packages/backend/src/app.mjs', 'utf8').split('\n');

// Find and remove lines 426-427 (0-indexed 425-426) if they contain the stray return
if (lines[425] && lines[425].includes("return sendJson(res, 404, { error: 'Admin route not found' });")) {
  lines.splice(425, 2);
}

// Find where admin block is now (around 612)
const adminStartIndex = lines.findIndex(l => l.includes("if (url.pathname.startsWith('/api/admin')) {"));
if (adminStartIndex > -1) {
  lines.splice(adminStartIndex, 39); // Remove the whole block
}

// Insert admin block at the right place (after statistics block)
const statEndIndex = lines.findIndex(l => l.includes("return sendJson(res, 404, { error: 'Statistics section not found' });"));
if (statEndIndex > -1) {
  const adminBlock = `
      if (url.pathname.startsWith('/api/admin')) {
        const adminError = requireAdminUser(user);
        if (adminError) return sendJson(res, adminError.status, adminError.payload);

        if (req.method === 'GET' && url.pathname === '/api/admin/users') {
          return sendJson(res, 200, { users: listAdminUsers(user.schoolId, url.searchParams.get('search') || '') });
        }

        const userDetailMatch = /^\\/api\\/admin\\/users\\/([^/]+)$/.exec(url.pathname);
        if (req.method === 'GET' && userDetailMatch) {
          const detail = getAdminUserDetail(user.schoolId, userDetailMatch[1]);
          return detail ? sendJson(res, 200, { user: detail }) : sendJson(res, 404, { error: 'User not found' });
        }

        const statusMatch = /^\\/api\\/admin\\/users\\/([^/]+)\\/status$/.exec(url.pathname);
        if (req.method === 'PUT' && statusMatch) {
          const body = await readJson(req);
          const updated = updateUserStatus({ admin: user, userId: statusMatch[1], status: body.status, schoolId: user.schoolId });
          return updated ? sendJson(res, 200, { user: updated }) : sendJson(res, 404, { error: 'User not found' });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/statistics') {
          return sendJson(res, 200, { statistics: getAdminStatistics(user.schoolId) });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/ai-logs') {
          return sendJson(res, 200, { logs: readAiLogs() });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/logs') {
          return sendJson(res, 200, { logs: readAdminLogs(user.schoolId) });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/catalog') {
          return sendJson(res, 200, getAdminCatalog());
        }

        return sendJson(res, 404, { error: 'Admin route not found' });
      }`;
  
  lines.splice(statEndIndex + 2, 0, adminBlock);
}

fs.writeFileSync('packages/backend/src/app.mjs', lines.join('\n'));
console.log('Fixed app.mjs');
