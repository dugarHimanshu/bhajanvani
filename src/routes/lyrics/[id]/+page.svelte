<!--src\routes\lyrics\[id]\+page.svelte-->
<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  import {
    fetchLyricById,
    saveLyric,
    deleteLyric
  } from "$lib/stores/lyricsStore";

  import LyricsEditor from "$lib/components/LyricsEditor.svelte";
  import ContentViewer from "$lib/components/ContentViewer.svelte";

  import type { Lyric } from "$lib/types";

  let id: string = "";
  let lyric: Lyric | null = null;

  let loading = true;
  let editing = false;

  // ✅ Get ID from route
  $: id = $page.params.id ?? "";

  // ✅ Load lyric when ID changes
  $: if (id) {
    loadLyric();
  }

  async function loadLyric() {
    loading = true;
    try {
      const data = await fetchLyricById(id ?? "");
      lyric = data ?? null;
    } catch (err) {
      console.error("Failed to load lyric:", err);
    }
    loading = false;
  }

  function toggleEdit() {
    editing = !editing;
  }

  async function handleSave(updated: Lyric) {
    try {
      await saveLyric(updated);
      editing = false;
      await loadLyric(); // refresh
    } catch (err) {
      console.error("Error saving lyric:", err);
      alert("Failed to save lyric");
    }
  }

  async function handleDelete() {
    if (!lyric) return;

    if (!confirm(`Delete "${lyric.title}"?`)) return;

    try {
      await deleteLyric(lyric.id);
      window.location.href = "/lyrics";
    } catch (err) {
      console.error("Error deleting lyric:", err);
      alert("Failed to delete lyric");
    }
  }
</script>

<div class="view-page">
  {#if loading}
    <div class="loading">
      <p>Loading…</p>
    </div>
  {:else if lyric}
    <button class="btn-back" on:click={() => (window.location.href = "/lyrics")}>
      ← Back to Library
    </button>

    <div class="lyric-container">
      <div class="lyric-header">
        <div>
          <h2>{lyric.title}</h2>
          <p class="artist">by {lyric.artist || "Unknown"}</p>
        </div>

        <div class="header-actions">
          <button class="btn-edit" on:click={toggleEdit}>Edit</button>
          <button class="btn-delete-action" on:click={handleDelete}>Delete</button>
        </div>
      </div>

      {#if editing}
        <div class="editor-section">
          <LyricsEditor
            lyric={lyric}
            onSave={handleSave}
            onCancel={() => (editing = false)}
          />
        </div>
      {:else}
        <div class="content-section">
          <ContentViewer lyric={lyric} />
        </div>
      {/if}
    </div>
  {:else}
    <div class="not-found">
      <p>Lyric not found.</p>
      <a href="/lyrics" class="btn-back">Back to Library</a>
    </div>
  {/if}
</div>

<style>
  .view-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
  }

  .btn-back {
    background: #8b6f47;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  .btn-back:hover {
    opacity: 0.9;
  }

  .loading,
  .not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    flex-direction: column;
    gap: 1rem;
    color: #6b7280;
  }

  .lyric-container {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 2rem;
  }

  .lyric-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: #8b6f47;
    font-family: "Georgia", serif;
  }

  .artist {
    margin: 0;
    color: #a0825d;
    font-size: 1rem;
    font-style: italic;
    font-family: "Georgia", serif;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-edit,
  .btn-delete-action {
    padding: 0.5rem 1rem;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-edit {
    background: linear-gradient(135deg, #8b6f47 0%, #6d5a3f 100%);
  }

  .btn-edit:hover {
    background: linear-gradient(135deg, #6d5a3f 0%, #5d4e37 100%);
  }

  .btn-delete-action {
    background: linear-gradient(135deg, #d9534f 0%, #c9302c 100%);
  }

  .btn-delete-action:hover {
    background: linear-gradient(135deg, #c9302c 0%, #b92c1f 100%);
  }

  .editor-section,
  .content-section {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 1.5rem;
  }
</style>
