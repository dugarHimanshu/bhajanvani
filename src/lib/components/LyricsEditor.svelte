<!--E:\Coding\Private\Bhajan\lyrics-hub\src\lib\components\LyricsEditor.svelte-->
<script lang="ts">
  import type { Lyric } from "../types";
  import { PDFDocument } from "pdf-lib";
  import { supabase } from '$lib/supabaseClient';


  export let lyric: Lyric | null;
  export let onSave: (l: Lyric) => void;
  export let onCancel: () => void;

  let title = lyric?.title ?? "";
  let artist = lyric?.artist ?? "";
  let contentType = lyric?.contentType ?? "text";
  let content = lyric?.content ?? "";
  let fileName = lyric?.fileName ?? "";

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const STORAGE_BUCKET = "lyrics";

  let selectedFile: File | null = null;
  let thumbnailBlob: Blob | null = null;
  let uploading = false;

  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    fileName = file.name;
    selectedFile = file;

    // ✅ Compress PDFs
    if (file.type === "application/pdf") {
      const arrayBuf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuf);

      const compressed = await pdf.save({
        useObjectStreams: false,
        objectsPerTick: 10,
      });

      selectedFile = new File([new Uint8Array(compressed)], file.name, {
        type: "application/pdf",
      });

      thumbnailBlob = null;
    }

    // ✅ Thumbnail for images
    if (file.type.startsWith("image/")) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => (img.src = reader.result as string);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 300;
        const scale = Math.min(1, maxW / img.width);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((b) => (thumbnailBlob = b || null), "image/jpeg", 0.75);
      };

      reader.readAsDataURL(file);
    }
  }

  async function save() {
    const id = lyric?.id ?? `l-${Date.now()}`;

    const base: Lyric = {
      id,
      title,
      artist,
      contentType,
      content,
      fileName,
      createdAt: lyric?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ✅ Upload to supabase
    if ((contentType === "pdf" || contentType === "image") && selectedFile) {
      uploading = true;

      try {
        const filePath = `${id}/${Date.now()}-${selectedFile.name}`;

        // Upload file
        const { error: uploadErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadErr) throw uploadErr;

        // ✅ Signed URL (super fast)
        const { data: pub } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        base.content = pub.publicUrl;
        base.fileName = selectedFile.name;

        // ✅ Thumbnail upload
        if (thumbnailBlob) {
          const thumbPath = `${id}/${Date.now()}-thumb.jpg`;

          const thumbFile = new File([thumbnailBlob], "thumb.jpg", {
            type: "image/jpeg",
          });

          const { error: tErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(thumbPath, thumbFile, { upsert: true });

          if (!tErr) {
            const { data: thumbPub } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(thumbPath);

            base.thumbnailUrl = thumbPub.publicUrl;
          }
        }
      } catch (err) {
        uploading = false;
        console.error("Upload failed", err);
        alert("Upload failed.");
        return;
      }

      uploading = false;
    }

    onSave(base);
  }
</script>

<form class="editor" on:submit|preventDefault={save}>
  <h2 class="form-title">{lyric ? "Edit Lyric" : "Create New Lyric"}</h2>
  <div class="divider"></div>

  <div class="field">
    <label for="title">Title</label>
    <input
      id="title"
      type="text"
      bind:value={title}
      required
      placeholder="Enter the title"
    />
  </div>
  <div class="field">
    <label for="artist">Artist</label>
    <input
      id="artist"
      type="text"
      bind:value={artist}
      placeholder="Enter the artist name"
    />
  </div>
  <div class="field">
    <label for="contentType">Content Type</label>
    <select id="contentType" bind:value={contentType}>
      <option value="text">📝 Text (Lyrics)</option>
      <option value="pdf">📄 PDF Document</option>
      <option value="image">🖼️ Image</option>
    </select>
  </div>

  {#if contentType === "text"}
    <div class="field">
      <label for="content">Content (lyrics)</label>
      <textarea
        id="content"
        rows="10"
        bind:value={content}
        placeholder="Paste or type the lyrics here..."
      ></textarea>
    </div>
  {/if}

  {#if contentType === "pdf" || contentType === "image"}
    <div class="field">
      <label for="file">Upload File ({contentType.toUpperCase()})</label>
      <input
        id="file"
        type="file"
        accept={contentType === "pdf" ? "application/pdf" : "image/*"}
        on:change={handleFile}
      />
    </div>

    {#if fileName}
      <p class="hint">✓ Selected: {fileName}</p>
    {/if}

    {#if uploading}
      <p class="hint">Uploading… please wait</p>
    {/if}
  {/if}

  <div class="actions">
    <button type="submit" class="btn-save">Save Lyric</button>
    <button type="button" class="btn-cancel" on:click={onCancel}>Cancel</button>
  </div>
</form>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 0;
    background: transparent;
    border-radius: 0;
  }

  .form-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    color: #8b6f47;
    font-weight: 700;
    font-family: "Georgia", serif;
  }

  .divider {
    height: 2px;
    background: linear-gradient(90deg, transparent, #d4a574, transparent);
    margin: 0.5rem 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    color: #8b6f47;
    font-size: 0.95rem;
    font-family: "Georgia", serif;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  input,
  textarea,
  select {
    padding: 0.85rem 1rem;
    border: 2px solid #d4a574;
    border-radius: 6px;
    font-family: "Georgia", serif;
    font-size: 0.95rem;
    background: linear-gradient(135deg, #fffef9 0%, #fffbf5 100%);
    color: #5d4e37;
    transition: all 0.3s ease;
  }

  input::placeholder,
  textarea::placeholder {
    color: #b8956a;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #8b6f47;
    background: linear-gradient(135deg, #fffbf5 0%, #fff9f0 100%);
    box-shadow: 0 0 0 4px rgba(139, 111, 71, 0.1);
  }

  textarea {
    resize: vertical;
    min-height: 180px;
    font-weight: 400;
    line-height: 1.6;
  }

  select {
    cursor: pointer;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid rgba(212, 165, 116, 0.3);
  }

  .btn-save,
  .btn-cancel {
    padding: 0.85rem 1.5rem;
    border-radius: 6px;
    border: 2px solid;
    font-size: 0.95rem;
    cursor: pointer;
    font-weight: 700;
    font-family: "Georgia", serif;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex: 1;
  }

  .btn-save {
    background: linear-gradient(135deg, #8b6f47 0%, #6d5a3f 100%);
    color: #fffef9;
    border-color: #5d4e37;
    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.25);
  }

  .btn-save:hover {
    background: linear-gradient(135deg, #6d5a3f 0%, #5d4e37 100%);
    box-shadow: 0 6px 16px rgba(139, 111, 71, 0.35);
    transform: translateY(-2px);
  }

  .btn-cancel {
    background: linear-gradient(135deg, #d4a574 0%, #c39464 100%);
    color: #5d4e37;
    border-color: #b8956a;
  }

  .btn-cancel:hover {
    background: linear-gradient(135deg, #c39464 0%, #b8956a 100%);
    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.15);
    transform: translateY(-2px);
  }

  .hint {
    font-size: 0.85rem;
    color: #8b6f47;
    margin: 0.5rem 0 0 0;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .editor {
      gap: 1rem;
    }

    .form-title {
      font-size: 1.2rem;
    }

    .actions {
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-save,
    .btn-cancel {
      flex: unset;
    }
  }

  @media (max-width: 480px) {
    .editor {
      gap: 0.85rem;
    }

    input,
    textarea,
    select {
      font-size: 16px;
      padding: 0.75rem 0.85rem;
    }

    label {
      font-size: 0.85rem;
    }

    .form-title {
      font-size: 1.1rem;
    }

    textarea {
      min-height: 120px;
    }

    .btn-save,
    .btn-cancel {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }
  }
</style>
