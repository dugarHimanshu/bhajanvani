// src/lib/types.ts
export type ContentType = "text" | "pdf" | "image";

export interface Lyric {
  id: string;
  title: string;
  artist?: string;
  contentType: ContentType;
  content?: string; // for text content or URL/blob reference
  fileName?: string; // for uploads
  thumbnailUrl?: string; // optional small preview URL
  createdAt: string;
  updatedAt: string;
}