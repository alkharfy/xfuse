/**
 * Xfuse — Content API Handler
 * Vercel Serverless Function
 * CRUD operations for testimonials, team, and portfolio content
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { verifyToken } from './auth.js';

const DATA_DIR = join(process.cwd(), 'data');
const ALLOWED_TYPES = ['testimonials', 'team', 'portfolio'];

function getDataPath(type) {
  return join(DATA_DIR, `${type}.json`);
}

function readData(type) {
  const filePath = getDataPath(type);
  if (!existsSync(filePath)) {
    return null;
  }
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeData(type, data) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = getDataPath(type);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim()
    .slice(0, 2000);
}

function sanitizeItem(item, type) {
  const sanitized = {};

  if (type === 'testimonials') {
    sanitized.id = sanitizeString(item.id || `t${Date.now()}`);
    sanitized.nameEn = sanitizeString(item.nameEn);
    sanitized.nameAr = sanitizeString(item.nameAr);
    sanitized.initials = sanitizeString(item.initials).slice(0, 3);
    sanitized.positionEn = sanitizeString(item.positionEn);
    sanitized.positionAr = sanitizeString(item.positionAr);
    sanitized.quoteEn = sanitizeString(item.quoteEn);
    sanitized.quoteAr = sanitizeString(item.quoteAr);
    sanitized.rating = Math.min(5, Math.max(1, parseInt(item.rating) || 5));
    sanitized.order = parseInt(item.order) || 0;
  } else if (type === 'team') {
    sanitized.id = sanitizeString(item.id || `m${Date.now()}`);
    sanitized.initials = sanitizeString(item.initials).slice(0, 3);
    sanitized.nameEn = sanitizeString(item.nameEn);
    sanitized.nameAr = sanitizeString(item.nameAr);
    sanitized.roleEn = sanitizeString(item.roleEn);
    sanitized.roleAr = sanitizeString(item.roleAr);
    sanitized.quoteEn = sanitizeString(item.quoteEn);
    sanitized.quoteAr = sanitizeString(item.quoteAr);
    sanitized.linkedin = sanitizeString(item.linkedin).slice(0, 500);
    sanitized.github = sanitizeString(item.github).slice(0, 500);
    sanitized.order = parseInt(item.order) || 0;
  } else if (type === 'portfolio') {
    sanitized.id = sanitizeString(item.id || `p${Date.now()}`);
    sanitized.titleEn = sanitizeString(item.titleEn);
    sanitized.titleAr = sanitizeString(item.titleAr);
    sanitized.descriptionEn = sanitizeString(item.descriptionEn);
    sanitized.descriptionAr = sanitizeString(item.descriptionAr);
    sanitized.tagEn = sanitizeString(item.tagEn);
    sanitized.tagAr = sanitizeString(item.tagAr);
    sanitized.image = sanitizeString(item.image).slice(0, 500);
    sanitized.link = sanitizeString(item.link).slice(0, 500);
    sanitized.featured = Boolean(item.featured);
    sanitized.order = parseInt(item.order) || 0;
  }

  return sanitized;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse URL: /api/content?type=testimonials or /api/content?type=team&id=ak
  const { type, id } = req.query || {};

  if (!type || !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Must be one of: ${ALLOWED_TYPES.join(', ')}` });
  }

  // GET — public, no auth required (the website reads data)
  if (req.method === 'GET') {
    const data = readData(type);
    if (!data) {
      return res.status(404).json({ error: 'Data not found' });
    }
    // Cache for 60 seconds for public reads
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    return res.status(200).json(data);
  }

  // All write operations require authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const data = readData(type) || getDefaultData(type);

  // POST — Add new item
  if (req.method === 'POST') {
    const item = req.body;
    if (!item || typeof item !== 'object') {
      return res.status(400).json({ error: 'Invalid item data' });
    }

    const sanitized = sanitizeItem(item, type);
    const listKey = getListKey(type);

    // Auto-generate ID if not provided
    if (!sanitized.id || data[listKey].some(i => i.id === sanitized.id)) {
      sanitized.id = `${type.charAt(0)}${Date.now()}`;
    }

    // Set order to end
    sanitized.order = data[listKey].length + 1;

    data[listKey].push(sanitized);
    writeData(type, data);

    return res.status(201).json({ item: sanitized, message: 'Item added successfully' });
  }

  // PUT — Update item or reorder
  if (req.method === 'PUT') {
    const listKey = getListKey(type);

    // Bulk reorder: PUT /api/content?type=testimonials with { order: ["t1","t3","t2"] }
    if (req.body.order && Array.isArray(req.body.order)) {
      const orderIds = req.body.order;
      const reordered = [];
      for (let i = 0; i < orderIds.length; i++) {
        const found = data[listKey].find(item => item.id === orderIds[i]);
        if (found) {
          found.order = i + 1;
          reordered.push(found);
        }
      }
      data[listKey] = reordered;
      writeData(type, data);
      return res.status(200).json({ message: 'Order updated successfully' });
    }

    // Single item update
    if (!id) {
      return res.status(400).json({ error: 'Item ID is required for update' });
    }

    const index = data[listKey].findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const sanitized = sanitizeItem({ ...data[listKey][index], ...req.body }, type);
    sanitized.id = id; // Preserve original ID
    data[listKey][index] = sanitized;
    writeData(type, data);

    return res.status(200).json({ item: sanitized, message: 'Item updated successfully' });
  }

  // DELETE — Remove item
  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'Item ID is required for delete' });
    }

    const listKey = getListKey(type);
    const index = data[listKey].findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    data[listKey].splice(index, 1);
    // Re-order remaining items
    data[listKey].forEach((item, i) => { item.order = i + 1; });
    writeData(type, data);

    return res.status(200).json({ message: 'Item deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function getListKey(type) {
  if (type === 'testimonials') return 'items';
  if (type === 'team') return 'members';
  if (type === 'portfolio') return 'projects';
  return 'items';
}

function getDefaultData(type) {
  if (type === 'testimonials') return { items: [] };
  if (type === 'team') return { members: [] };
  if (type === 'portfolio') return { projects: [] };
  return { items: [] };
}
