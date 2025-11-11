//src\routes\api\lyrics\[id]\+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { Lyric } from '$lib/types';

const DATA_FILE = path.join(process.cwd(), 'lyrics-data.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

export const GET: RequestHandler = async ({ params }) => {
  try {
    ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const lyrics: Lyric[] = JSON.parse(data);
    const id = params.id;
    const found = lyrics.find((l) => l.id === id);
    if (!found) return error(404, 'Lyric not found');
    return json(found);
  } catch (err) {
    console.error('Error reading lyric:', err);
    return error(500, 'Failed to read lyric');
  }
};
