// src/lib/stores/lyricsStore.ts
import { writable } from "svelte/store";
import type { Lyric } from "../types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  // Do not call createClient with empty values (it throws during SSR). Use null and guard calls.
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Falling back to no-op store.');
}

export const lyrics = writable<Lyric[]>([]);

async function fetchLyrics() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('lyrics')
        .select('id,title,artist,contentType,fileName,thumbnailUrl,createdAt,updatedAt')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      lyrics.set((data as Lyric[]) || []);
      return data as Lyric[];
    }

    // Fallback: use server endpoints that read lyrics-data.json (works locally or on writable hosts)
    const resp = await fetch('/api/lyrics');
    if (!resp.ok) throw new Error('Failed to fetch lyrics from server');
    const list = (await resp.json()) as Lyric[];
    lyrics.set(list || []);
    return list || [];
  } catch (err) {
    console.error('Error fetching lyrics from Supabase:', err);
    lyrics.set([]);
    return [];
  }
}

export async function fetchLyricById(id: string) {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('lyrics').select('*').eq('id', id).single();
      if (error) {
        console.warn('Failed to fetch lyric by id', id, error);
        return null;
      }
      return data as Lyric;
    }

    // Fallback to server endpoint
    const resp = await fetch(`/api/lyrics/${encodeURIComponent(id)}`);
    if (!resp.ok) return null;
    return (await resp.json()) as Lyric;
  } catch (err) {
    console.error('Error fetching full lyric:', err);
    return null;
  }
}

export async function saveLyric(lyric: Lyric): Promise<void> {
  try {
    if (supabase) {
      const { error } = await supabase.from('lyrics').upsert(lyric as any);
      if (error) throw error;
      await fetchLyrics();
      return;
    }

    // Fallback: POST to server endpoint which will write to lyrics-data.json
    const resp = await fetch('/api/lyrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lyric),
    });
    if (!resp.ok) {
      let msg = 'Failed to save lyric';
      try {
        const body = await resp.json();
        if (body?.error) msg = body.error;
      } catch {}
      throw new Error(msg);
    }
    await fetchLyrics();
  } catch (err: any) {
    console.error('Error saving lyric to Supabase:', err?.message ?? err);
    throw new Error(err?.message || 'Failed to save lyric');
  }
}

export async function deleteLyric(id: string): Promise<void> {
  try {
    if (supabase) {
      const { error } = await supabase.from('lyrics').delete().eq('id', id);
      if (error) throw error;
      await fetchLyrics();
      return;
    }

    // Fallback: DELETE via server endpoint
    const resp = await fetch('/api/lyrics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!resp.ok) {
      let msg = 'Failed to delete lyric';
      try {
        const body = await resp.json();
        if (body?.error) msg = body.error;
      } catch {}
      throw new Error(msg);
    }
    await fetchLyrics();
  } catch (err: any) {
    console.error('Error deleting lyric from Supabase:', err?.message ?? err);
    throw new Error(err?.message || 'Failed to delete lyric');
  }
}

export const initLyrics = async () => {
  if (typeof window !== 'undefined') {
    await fetchLyrics();
  }
};