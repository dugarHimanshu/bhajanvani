<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";

  import { lyrics, initLyrics, saveLyric } from "$lib/stores/lyricsStore";
  import LyricsEditor from "$lib/components/LyricsEditor.svelte";
  import type { Lyric } from "$lib/types";

  let lyricId: string = "";
  let currentLyric: Lyric | null = null;
  let loading = true;
  let editing = true;

  // ✅ Subscribe to params (NOT async)
  let stopPage = page.subscribe(($p) => {
    lyricId = $p.params.id ?? "";
  });

  // ✅ Subscribe to lyrics store
  let stopLyrics = lyrics.subscribe((list) => {
    currentLyric = list.find((l) => l.id === lyricId) ?? null;
    loading = false;
  });

  // ✅ Cleanup
  onDestroy(() => {
    stopPage();
    stopLyrics();
  });

  async function handleSave(updated: Lyric) {
    try {
      await saveLyric(updated);
      window.location.href = `/lyrics/${updated.id}`;
    } catch (err) {
      console.error("Error saving lyric:", err);
      alert("Failed to save lyric");
    }
  }

  function handleCancel() {
    window.location.href = lyricId ? `/lyrics/${lyricId}` : "/lyrics";
  }
</script>

{#if loading}
  <div class="loading">
    <p>Loading lyric…</p>
  </div>
{:else if currentLyric}
  <div class="edit-page">
    <h2>Edit Lyric: {currentLyric.title}</h2>
    <LyricsEditor
      lyric={currentLyric}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  </div>
{:else}
  <p>Lyric not found.</p>
{/if}

<style>
  .edit-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
</style>
