import { writable } from "svelte/store";
import type { Lyric } from "../types";
import { supabase } from "$lib/supabaseClient";

export const lyrics = writable<Lyric[]>([]);

async function fetchLyrics() {
  try {
    const { data, error } = await supabase
      .from("lyrics")
      .select(
        "id,title,artist,contentType,fileName,thumbnailUrl,createdAt,updatedAt"
      )
      .order("createdAt", { ascending: false });

    if (error) throw error;

    lyrics.set(data || []);
    return data || [];
  } catch (err) {
    console.error("Error fetching lyrics:", err);
    lyrics.set([]);
    return [];
  }
}

export async function fetchLyricById(id: string) {
  try {
    const { data, error } = await supabase
      .from("lyrics")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Lyric;
  } catch (err) {
    console.error("Error fetching lyric by id:", err);
    return null;
  }
}

export async function saveLyric(lyric: Lyric) {
  try {
    const { error } = await supabase.from("lyrics").upsert(lyric);
    if (error) throw error;

    await fetchLyrics();
  } catch (err: any) {
    console.error("Error saving lyric:", err?.message);
    throw new Error(err?.message || "Failed to save lyric");
  }
}

export async function deleteLyric(id: string) {
  try {
    const { error } = await supabase
      .from("lyrics")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await fetchLyrics();
  } catch (err: any) {
    console.error("Error deleting lyric:", err?.message);
    throw new Error(err?.message || "Failed to delete lyric");
  }
}

export async function initLyrics() {
  if (typeof window !== "undefined") {
    await fetchLyrics();
  }
}