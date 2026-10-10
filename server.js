const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'data', 'db.json');

// Ensure db file exists
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {}
  return { users: [], userData: {}, couples: {}, coupleData: {} };
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving DB:', e);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  for (const name in ifaces) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless') || name.toLowerCase().includes('wlan')) {
          return iface.address;
        }
      }
    }
  }
  for (const name in ifaces) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

function readJsonBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      callback(null, JSON.parse(body || '{}'));
    } catch (e) {
      callback(e, null);
    }
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const reqPath = decodeURI(urlObj.pathname);

  // =========================================================
  // API ROUTING: AUTH, PAIRING & REALTIME DATA SYNC
  // =========================================================
  if (reqPath.startsWith('/api/')) {
    const db = loadDb();

    // 1. Register API
    if (reqPath === '/api/register' && req.method === 'POST') {
      readJsonBody(req, (err, payload) => {
        if (err || !payload.username || !payload.pass || !payload.name) {
          return sendJson(res, 400, { ok: false, error: 'Thiếu thông tin đăng ký!' });
        }
        const exists = db.users.find(u => u.username.toLowerCase() === payload.username.toLowerCase());
        if (exists) {
          return sendJson(res, 400, { ok: false, error: 'Tài khoản/Email này đã tồn tại!' });
        }

        // Tạo mã ghép đôi 6 số ngẫu nhiên
        const randCode = 'KURO-' + Math.floor(100000 + Math.random() * 900000);
        const newUser = {
          id: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          username: payload.username.trim(),
          name: payload.name.trim(),
          pass: payload.pass,
          pairCode: randCode,
          coupleId: null,
          partnerName: null,
          createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        saveDb(db);
        return sendJson(res, 200, { ok: true, user: newUser });
      });
      return;
    }

    // 2. Login API
    if (reqPath === '/api/login' && req.method === 'POST') {
      readJsonBody(req, (err, payload) => {
        if (err || !payload.username || !payload.pass) {
          return sendJson(res, 400, { ok: false, error: 'Nhập thiếu tài khoản hoặc mật khẩu!' });
        }
        const user = db.users.find(u => 
          (u.username.toLowerCase() === payload.username.toLowerCase() || u.name.toLowerCase() === payload.username.toLowerCase()) && 
          u.pass === payload.pass
        );
        if (!user) {
          return sendJson(res, 401, { ok: false, error: 'Sai tài khoản hoặc mật khẩu!' });
        }
        return sendJson(res, 200, { ok: true, user: user });
      });
      return;
    }

    // 3. Pairing API (Ghép đôi thực sự giữa 2 tài khoản)
    if (reqPath === '/api/pair' && req.method === 'POST') {
      readJsonBody(req, (err, payload) => {
        if (err || !payload.userId || !payload.partnerCode) {
          return sendJson(res, 400, { ok: false, error: 'Nhập thiếu mã ghép đôi!' });
        }
        const me = db.users.find(u => u.id === payload.userId);
        if (!me) {
          return sendJson(res, 404, { ok: false, error: 'Tài khoản không tồn tại!' });
        }

        const inputCode = payload.partnerCode.trim().toUpperCase();
        if (inputCode === me.pairCode) {
          return sendJson(res, 400, { ok: false, error: 'Không thể tự ghép đôi với chính mình nha sen! 😾' });
        }

        const partner = db.users.find(u => u.pairCode === inputCode);
        if (!partner) {
          return sendJson(res, 404, { ok: false, error: 'Không tìm thấy tài khoản có mã ghép đôi này! Hãy kiểm tra lại nha!' });
        }

        // Tạo hoặc lấy Couple ID chung
        const coupleId = 'couple_' + [me.id, partner.id].sort().join('_');
        me.coupleId = coupleId;
        me.partnerName = partner.name;
        partner.coupleId = coupleId;
        partner.partnerName = me.name;

        if (!db.couples[coupleId]) {
          db.couples[coupleId] = {
            id: coupleId,
            user1: { id: me.id, name: me.name },
            user2: { id: partner.id, name: partner.name },
            name: `${me.name} & ${partner.name} 💖`,
            createdAt: new Date().toISOString()
          };
        }

        saveDb(db);
        return sendJson(res, 200, {
          ok: true,
          user: me,
          partner: { id: partner.id, name: partner.name },
          couple: db.couples[coupleId]
        });
      });
      return;
    }

    // 4. Unpair API (Hủy ghép đôi)
    if (reqPath === '/api/unpair' && req.method === 'POST') {
      readJsonBody(req, (err, payload) => {
        const me = db.users.find(u => u.id === payload.userId);
        if (me) {
          const oldCoupleId = me.coupleId;
          me.coupleId = null;
          me.partnerName = null;
          if (oldCoupleId) {
            const partner = db.users.find(u => u.coupleId === oldCoupleId && u.id !== me.id);
            if (partner) {
              partner.coupleId = null;
              partner.partnerName = null;
            }
          }
          saveDb(db);
        }
        return sendJson(res, 200, { ok: true, user: me });
      });
      return;
    }

    // 5. Sync GET: Lấy dữ liệu cá nhân & dữ liệu cặp đôi
    if (reqPath === '/api/sync' && req.method === 'GET') {
      const userId = urlObj.searchParams.get('userId');
      if (!userId) return sendJson(res, 400, { ok: false, error: 'Thiếu userId' });

      const me = db.users.find(u => u.id === userId);
      const coupleId = me ? me.coupleId : null;
      const userData = db.userData[userId] || null;
      const coupleData = coupleId ? (db.coupleData[coupleId] || null) : null;

      return sendJson(res, 200, {
        ok: true,
        user: me,
        userData: userData,
        coupleData: coupleData,
        couple: coupleId ? db.couples[coupleId] : null
      });
    }

    // 6. Sync POST: Lưu dữ liệu (Cá nhân hoặc Cặp đôi)
    if (reqPath === '/api/sync' && req.method === 'POST') {
      readJsonBody(req, (err, payload) => {
        if (err || !payload.userId) return sendJson(res, 400, { ok: false, error: 'Lỗi payload' });

        const me = db.users.find(u => u.id === payload.userId);
        if (payload.mode === 'couple' && me && me.coupleId) {
          // Lưu vào sổ quỹ chung
          db.coupleData[me.coupleId] = {
            appData: payload.appData,
            kuroPots: payload.kuroPots,
            updatedBy: me.name,
            updatedAt: Date.now()
          };
        } else {
          // Lưu vào ví cá nhân
          db.userData[payload.userId] = {
            appData: payload.appData,
            kuroPots: payload.kuroPots,
            updatedAt: Date.now()
          };
        }
        saveDb(db);
        return sendJson(res, 200, { ok: true, timestamp: Date.now() });
      });
      return;
    }

    return sendJson(res, 404, { ok: false, error: 'API not found' });
  }

  // =========================================================
  // STATIC FILES & QR CODE
  // =========================================================
  let normalPath = reqPath;
  if (normalPath === '/' || normalPath === '') normalPath = '/index.html';

  // QR Code Viewer route
  if (normalPath === '/qr') {
    const targetUrl = `http://${localIp}:${PORT}/`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Quét Mã Để Mở KuroMoney Trên Điện Thoại</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #FAF5FF; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
    .card { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(124,58,237,0.15); border: 2px solid #E9D5FF; max-width: 360px; }
    h2 { color: #581C87; margin: 0 0 10px; font-size: 20px; }
    p { color: #7E69AB; font-size: 13px; line-height: 1.5; margin: 0 0 20px; }
    .qr-img { border-radius: 16px; border: 4px solid #FDF2F8; box-shadow: 0 4px 12px rgba(236,72,153,0.2); }
    .url { margin-top: 18px; font-weight: 800; color: #BE185D; background: #FDF2F8; padding: 8px 14px; border-radius: 12px; font-size: 14px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🎀 Mở KuroMoney Trên Điện Thoại</h2>
    <p>Mở <b>Camera trên iPhone/Android</b> rồi hướng vào mã QR này để vào test ngay trên máy bạn nhé!</p>
    <img class="qr-img" src="${qrApiUrl}" alt="QR Code" width="260" height="260">
    <div class="url">http://${localIp}:${PORT}</div>
  </div>
</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  const filePath = path.join(ROOT, normalPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = { 'Content-Type': contentType };
    if (normalPath === '/sw.js') {
      headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }
    // Apple Touch Icon caching headers
    if (normalPath.includes('apple-touch-icon') || normalPath.includes('favicon')) {
      headers['Cache-Control'] = 'public, max-age=86400';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`✨ KUROMONEY FULL-STACK SERVER ĐANG CHẠY! ✨`);
  console.log(`======================================================`);
  console.log(`📱 Mở trên điện thoại (Cùng Wi-Fi):`);
  console.log(`   👉 http://${localIp}:${PORT}`);
  console.log(`\n📸 Xem trang quét mã QR cho điện thoại:`);
  console.log(`   👉 http://localhost:${PORT}/qr`);
  console.log(`======================================================\n`);
});
