import dotenv from 'dotenv';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

import Category from '../src/models/Category.js';

dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workbook = XLSX.readFile(path.join(__dirname, 'myntra_categories.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

// ✅ Place this early
const cache = new Map();

const slugify = (text) => text?.toLowerCase().replace(/\s+/g, '-');

async function findOrCreate(name, parent = null) {
  const key = `${name}-${parent || 'root'}`;
  if (cache.has(key)) return cache.get(key);

  let category = await Category.findOne({ name, parent });
  if (!category) {
    category = await Category.create({
      name,
      slug: slugify(name),
      parent,
      status: 'published',
      categoryId: Math.floor(Math.random() * 10000),
    });
  }

  cache.set(key, category._id);
  return category._id;
}

async function importCategories() {
  for (const row of rows) {
    const level1 = row['Level 1'];
    const level2 = row['Level 2'];
    const level3 = row['Level 3'];

    const id1 = await findOrCreate(level1);
    const id2 = level2 ? await findOrCreate(level2, id1) : null;
    if (level3) await findOrCreate(level3, id2);
  }

  console.log('✅ Import complete');
  mongoose.disconnect();
}

// ✅ Updated connection (no deprecated options)
mongoose.connect(process.env.MONGO_URI).then(importCategories);
