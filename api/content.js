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
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function writeData(type, data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(getDataPath(type), JSON.stringify(data, null, 2), 'utf-8');
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim().slice(0, 2000);
}

function sanitizeItem(item, type) {
  const s = {};
  if (type === 'testimonials') {
    s.id = sanitizeString(item.id || `t${Date.now()}`);
    s.nameEn = sanitizeString(item.nameEn); s.nameAr = sanitizeString(item.nameAr);
    s.initials = sanitizeString(item.initials).slice(0, 3);
    s.positionEn = sanitizeString(item.positionEn); s.positionAr = sanitizeString(item.positionAr);
    s.quoteEn = sanitizeString(item.quoteEn); s.quoteAr = sanitizeString(item.quoteAr);
    s.rating = Math.min(5, Math.max(1, parseInt(item.rating) || 5));
    s.order = parseInt(item.order) || 0;
  } else if (type === 'team') {
    s.id = sanitizeString(item.id || `m${Date.now()}`);
    s.initials = sanitizeString(item.initials).slice(0, 3);
    s.nameEn = sanitizeString(item.nameEn); s.nameAr = sanitizeString(item.nameAr);
    s.roleEn = sanitizeString(item.roleEn); s.roleAr = sanitizeString(item.roleAr);
    s.quoteEn = sanitizeString(item.quoteEn); s.quoteAr = sanitizeString(item.quoteAr);
    s.linkedin = sanitizeString(item.linkedin).slice(0, 500);
    s.github = sanitizeString(item.github).slice(0, 500);
    s.order = parseInt(item.order) || 0;
  } else if (type === 'portfolio') {
    s.id = sanitizeString(item.id || `p${Date.now()}`);
    s.titleEn = sanitizeString(item.titleEn); s.titleAr = sanitizeString(item.titleAr);
    s.descriptionEn = sanitizeString(item.descriptionEn); s.descriptionAr = sanitizeString(item.descriptionAr);
    s.tagEn = sanitizeString(item.tagEn); s.tagAr = sanitizeString(item.tagAr);
    s.image = sanitizeString(item.image).slice(0, 500);
    s.link = sanitizeString(item.link).slice(0, 500);
    s.featured = Boolean(item.featured);
    s.order = parseInt(item.order) || 0;
  }
  return s;
}

function getListKey(type) {
  if (type === 'team') return 'members';
  if (type === 'portfolio') return 'projects';
  return 'items';
}

function getDefaultData(type) {
  return { [getListKey(type)]: [] };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, id } = req.query || {};

  if (!type || !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Must be one of: ${ALLOWED_TYPES.join(', ')}` });
  }

  if (req.method === 'GET') {
    const data = readData(type);
    if (!data) return res.status(404).json({ error: 'Data not found' });
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    return res.status(200).json(data);
  }

  // Write operations require auth
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const payload = await verifyToken(authHeader.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

  const data = readData(type) || getDefaultData(type);
  const listKey = getListKey(type);

  if (req.method === 'POST') {
    const item = req.body;
    if (!item || typeof item !== 'object') return res.status(400).json({ error: 'Invalid item data' });
    const sanitized = sanitizeItem(item, type);
    if (!sanitized.id || data[listKey].some(i => i.id === sanitized.id)) {
      sanitized.id = `${type.charAt(0)}${Date.now()}`;
    }
    sanitized.order = data[listKey].length + 1;
    data[listKey].push(sanitized);
    writeData(type, data);
    return res.status(201).json({ item: sanitized, message: 'Item added successfully' });
  }

  if (req.method === 'PUT') {
    if (req.body.order && Array.isArray(req.body.order)) {
      const reordered = [];
      for (let i = 0; i < req.body.order.length; i++) {
        const found = data[listKey].find(item => item.id === req.body.order[i]);
        if (found) { found.order = i + 1; reordered.push(found); }
      }
      data[listKey] = reordered;
      writeData(type, data);
      return res.status(200).json({ message: 'Order updated successfully' });
    }
    if (!id) return res.status(400).json({ error: 'Item ID is required for update' });
    const index = data[listKey].findIndex(item => item.id === id);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });
    const sanitized = sanitizeItem({ ...data[listKey][index], ...req.body }, type);
    sanitized.id = id;
    data[listKey][index] = sanitized;
    writeData(type, data);
    return res.status(200).json({ item: sanitized, message: 'Item updated successfully' });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Item ID is required for delete' });
    const index = data[listKey].findIndex(item => item.id === id);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });
    data[listKey].splice(index, 1);
    data[listKey].forEach((item, i) => { item.order = i + 1; });
    writeData(type, data);
    return res.status(200).json({ message: 'Item deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
