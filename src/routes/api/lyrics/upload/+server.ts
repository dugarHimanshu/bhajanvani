//src\routes\api\lyrics\upload\+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'static', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export const POST: RequestHandler = async ({ request }) => {
  // On Netlify functions (serverless) writing to static/uploads is not persistent and may fail.
  if (process.env.NETLIFY === 'true') {
    console.error('Attempt to upload on Netlify - persistent uploads are not supported.');
    return json({ error: 'Uploads are not supported on Netlify functions. Use external storage (Supabase Storage, S3) or host with writable filesystem.' }, { status: 503 });
  }

  try {
    ensureUploadDir();

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const thumb = form.get('thumbnail') as File | null;

    if (!file) {
      return json({ error: 'No file uploaded' }, { status: 400 });
    }

    const originalName = (file as any).name || `upload-${Date.now()}`;
    const ext = path.extname(originalName) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, name);

    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    let thumbnailUrl: string | null = null;
    if (thumb) {
      const thumbName = `${Date.now()}-thumb-${Math.random().toString(36).slice(2, 9)}${path.extname((thumb as any).name || '.jpg')}`;
      const thumbPath = path.join(UPLOAD_DIR, thumbName);
      const tbuf = Buffer.from(await (thumb as Blob).arrayBuffer());
      fs.writeFileSync(thumbPath, tbuf);
      thumbnailUrl = `/uploads/${thumbName}`;
    }

    const url = `/uploads/${name}`;

    return json({ url, thumbnailUrl });
  } catch (err: any) {
    console.error('Upload error:', err?.message ?? err);
    return json({ error: (err && err.message) || 'Upload failed' }, { status: 500 });
  }
};
