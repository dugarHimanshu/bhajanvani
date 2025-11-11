//src\routes\api\lyrics\+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { Lyric } from '$lib/types';
import fs from 'fs';
import path from 'path';

// Store data in a JSON file in the server directory
const DATA_FILE = path.join(process.cwd(), 'lyrics-data.json');

// Ensure the data file exists
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = [
      {
        id: "l1",
        title: "Imagine",
        artist: "John Lennon",
        contentType: "text",
        content: "Imagine all the people...\nYou may say I'm a dreamer, but I'm not the only one.",
        fileName: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-text",
        title: "Sample Lyrics",
        artist: "Unknown",
        contentType: "text",
        content: "This is a sample lyric. Edit or add new entries.",
        fileName: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read all lyrics
export const GET: RequestHandler = async ({ url }) => {
  try {
    ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const lyrics: Lyric[] = JSON.parse(data);

    // If ?full=1 present, return full entries (used rarely)
    const full = url.searchParams.get('full');
    if (full === '1') {
      return json(lyrics);
    }

    // Otherwise return summaries (metadata only) to keep responses small for mobile
    const summaries = lyrics.map((l) => ({
      id: l.id,
      title: l.title,
      artist: l.artist,
      contentType: l.contentType,
      fileName: l.fileName,
      thumbnailUrl: (l as any).thumbnailUrl,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));

    return json(summaries);
  } catch (err) {
    console.error('Error reading lyrics:', err);
    return error(500, 'Failed to read lyrics');
  }
};

// Add or update a lyric
export const POST: RequestHandler = async ({ request }) => {
  // On serverless platforms like Netlify, the filesystem is read-only / ephemeral.
  // Detect Netlify and return a clear error so deploy logs show the reason.
  if (process.env.NETLIFY === 'true') {
    console.error('Attempt to write data on Netlify detected - persistent filesystem not available.');
    return json({ error: 'Persistent server-side writes are not supported on Netlify functions. Use an external database or storage (Supabase, S3, etc.) or deploy to a platform with writable disk.' }, { status: 503 });
  }

  try {
    ensureDataFile();
    const lyric: Lyric = await request.json();

    // Validate lyric
    if (!lyric.title || !lyric.id) {
      return json({ error: 'Title and ID are required' }, { status: 400 });
    }

    // Read current data
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const lyrics: Lyric[] = JSON.parse(data);

    // Check if lyric exists
    const existingIndex = lyrics.findIndex((l) => l.id === lyric.id);

    if (existingIndex >= 0) {
      // Update existing lyric
      lyrics[existingIndex] = {
        ...lyrics[existingIndex],
        ...lyric,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new lyric
      lyrics.unshift({
        ...lyric,
        createdAt: lyric?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Write updated data
    fs.writeFileSync(DATA_FILE, JSON.stringify(lyrics, null, 2));

    return json(lyric, { status: 201 });
  } catch (err: any) {
    console.error('Error saving lyric:', err?.message ?? err);
    return json({ error: (err && err.message) || 'Failed to save lyric' }, { status: 500 });
  }
};

// Delete a lyric
export const DELETE: RequestHandler = async ({ request }) => {
  try {
    ensureDataFile();
    const { id } = await request.json();

    if (!id) {
      return error(400, 'ID is required');
    }

    // Read current data
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    let lyrics: Lyric[] = JSON.parse(data);

    // Filter out the lyric to delete
    const initialLength = lyrics.length;
    lyrics = lyrics.filter((l) => l.id !== id);

    // Check if lyric was found
    if (lyrics.length === initialLength) {
      return error(404, 'Lyric not found');
    }

    // Write updated data
    fs.writeFileSync(DATA_FILE, JSON.stringify(lyrics, null, 2));

    return json({ success: true });
  } catch (err) {
    console.error('Error deleting lyric:', err);
    return error(500, 'Failed to delete lyric');
  }
};
