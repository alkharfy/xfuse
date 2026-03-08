import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHmac, timingSafeEqual } from 'crypto';

function copyDataPlugin() {
  return {
    name: 'copy-data',
    closeBundle() {
      if (existsSync('data')) {
        cpSync('data', 'dist/data', { recursive: true });
      }
    },
  };
}

/* ─── Dev API middleware ─── */
function devApiPlugin() {
  const JWT_SECRET = 'xfuse-dev-secret';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'xfuse2024';
  const ALLOWED_TYPES = ['testimonials', 'team', 'portfolio'];

  function sign(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
    const sig = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
  }

  function verify(token) {
    try {
      const [header, body, sig] = token.split('.');
      const expected = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
      if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
      if (payload.exp < Date.now() / 1000) return null;
      return payload;
    } catch { return null; }
  }

  function dataPath(type) { return join(process.cwd(), 'data', `${type}.json`); }
  function readData(type) {
    const p = dataPath(type);
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) : null;
  }
  function saveData(type, data) {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(dataPath(type), JSON.stringify(data, null, 2), 'utf-8');
  }
  function listKey(type) { return type === 'team' ? 'members' : type === 'portfolio' ? 'projects' : 'items'; }
  function defaultData(type) { return { [listKey(type)]: [] }; }

  function sanitize(str) { return typeof str !== 'string' ? '' : str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim().slice(0, 2000); }
  function sanitizeItem(item, type) {
    const s = {};
    if (type === 'testimonials') {
      s.id = sanitize(item.id || `t${Date.now()}`); s.nameEn = sanitize(item.nameEn); s.nameAr = sanitize(item.nameAr);
      s.initials = sanitize(item.initials).slice(0, 3); s.positionEn = sanitize(item.positionEn); s.positionAr = sanitize(item.positionAr);
      s.quoteEn = sanitize(item.quoteEn); s.quoteAr = sanitize(item.quoteAr);
      s.rating = Math.min(5, Math.max(1, parseInt(item.rating) || 5)); s.order = parseInt(item.order) || 0;
    } else if (type === 'team') {
      s.id = sanitize(item.id || `m${Date.now()}`); s.initials = sanitize(item.initials).slice(0, 3);
      s.nameEn = sanitize(item.nameEn); s.nameAr = sanitize(item.nameAr);
      s.roleEn = sanitize(item.roleEn); s.roleAr = sanitize(item.roleAr);
      s.quoteEn = sanitize(item.quoteEn); s.quoteAr = sanitize(item.quoteAr);
      s.linkedin = sanitize(item.linkedin).slice(0, 500); s.github = sanitize(item.github).slice(0, 500);
      s.order = parseInt(item.order) || 0;
    } else if (type === 'portfolio') {
      s.id = sanitize(item.id || `p${Date.now()}`); s.titleEn = sanitize(item.titleEn); s.titleAr = sanitize(item.titleAr);
      s.descriptionEn = sanitize(item.descriptionEn); s.descriptionAr = sanitize(item.descriptionAr);
      s.tagEn = sanitize(item.tagEn); s.tagAr = sanitize(item.tagAr);
      s.image = sanitize(item.image).slice(0, 500); s.link = sanitize(item.link).slice(0, 500);
      s.featured = Boolean(item.featured); s.order = parseInt(item.order) || 0;
    }
    return s;
  }

  function json(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
  }

  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // CORS preflight
        if (req.method === 'OPTIONS' && req.url.startsWith('/api/')) {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          });
          return res.end();
        }

        // ── Auth endpoint ──
        if (req.url === '/api/auth' && req.method === 'POST') {
          let body = '';
          req.on('data', c => body += c);
          req.on('end', () => {
            try {
              const { password } = JSON.parse(body);
              if (!password) return json(res, 400, { error: 'Password required' });
              const a = Buffer.from(password);
              const b = Buffer.from(ADMIN_PASSWORD);
              if (a.length !== b.length || !timingSafeEqual(a, b)) return json(res, 401, { error: 'Invalid password' });
              return json(res, 200, { token: sign({ role: 'admin' }) });
            } catch { return json(res, 500, { error: 'Server error' }); }
          });
          return;
        }

        // ── Content endpoint ──
        if (req.url.startsWith('/api/content')) {
          const url = new URL(req.url, 'http://localhost');
          const type = url.searchParams.get('type');
          const id = url.searchParams.get('id');

          if (!type || !ALLOWED_TYPES.includes(type)) return json(res, 400, { error: 'Invalid type' });

          // GET — public
          if (req.method === 'GET') {
            const data = readData(type);
            return data ? json(res, 200, data) : json(res, 404, { error: 'Not found' });
          }

          // Auth check for writes
          const auth = req.headers.authorization;
          if (!auth || !auth.startsWith('Bearer ')) return json(res, 401, { error: 'Auth required' });
          if (!verify(auth.slice(7))) return json(res, 401, { error: 'Invalid token' });

          let body = '';
          req.on('data', c => body += c);
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const data = readData(type) || defaultData(type);
              const key = listKey(type);

              if (req.method === 'POST') {
                const item = sanitizeItem(payload, type);
                if (!item.id || data[key].some(i => i.id === item.id)) item.id = `${type.charAt(0)}${Date.now()}`;
                item.order = data[key].length + 1;
                data[key].push(item);
                saveData(type, data);
                return json(res, 201, { item, message: 'Added' });
              }

              if (req.method === 'PUT') {
                if (payload.order && Array.isArray(payload.order)) {
                  const reordered = [];
                  payload.order.forEach((oid, i) => { const f = data[key].find(x => x.id === oid); if (f) { f.order = i + 1; reordered.push(f); } });
                  data[key] = reordered;
                  saveData(type, data);
                  return json(res, 200, { message: 'Reordered' });
                }
                if (!id) return json(res, 400, { error: 'ID required' });
                const idx = data[key].findIndex(x => x.id === id);
                if (idx === -1) return json(res, 404, { error: 'Not found' });
                const item = sanitizeItem({ ...data[key][idx], ...payload }, type);
                item.id = id;
                data[key][idx] = item;
                saveData(type, data);
                return json(res, 200, { item, message: 'Updated' });
              }

              if (req.method === 'DELETE') {
                if (!id) return json(res, 400, { error: 'ID required' });
                const idx = data[key].findIndex(x => x.id === id);
                if (idx === -1) return json(res, 404, { error: 'Not found' });
                data[key].splice(idx, 1);
                data[key].forEach((x, i) => { x.order = i + 1; });
                saveData(type, data);
                return json(res, 200, { message: 'Deleted' });
              }

              return json(res, 405, { error: 'Method not allowed' });
            } catch { return json(res, 500, { error: 'Server error' }); }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  root: './',
  publicDir: 'public',
  plugins: [devApiPlugin(), copyDataPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (info) => {
          if (/\.css$/.test(info.name)) return 'assets/css/[name].[hash].[ext]';
          if (/\.(woff2?)$/.test(info.name)) return 'assets/fonts/[name].[ext]';
          if (/\.(png|jpe?g|webp|svg|gif)$/.test(info.name)) return 'assets/images/[name].[hash].[ext]';
          return 'assets/[name].[hash].[ext]';
        },
      },
    },
    reportCompressedSize: true,
    sourcemap: false,
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    open: true,
  },
});
