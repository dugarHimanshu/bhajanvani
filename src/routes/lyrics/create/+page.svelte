<script lang="ts">
  import LyricsEditor from "$lib/components/LyricsEditor.svelte";
  import { saveLyric } from "$lib/stores/lyricsStore";
  import type { Lyric } from "$lib/types";

  let creator: Lyric | null = null;

  function handleSave(newLyric: Lyric) {
    saveLyric(newLyric)
      .then(() => {
        window.location.href = "/lyrics";
      })
      .catch((err) => {
        console.error("Error saving lyric:", err);
        alert("Failed to save lyric");
      });
  }

  function handleCancel() {
    window.location.href = "/lyrics";
  }
</script>

<div class="create-page">
  <h2>New Lyric</h2>
  <div class="editor-wrapper">
    <LyricsEditor lyric={creator} onSave={handleSave} onCancel={handleCancel} />
  </div>
</div>

<style>
  .create-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .editor-wrapper {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .create-page {
      padding: 1rem 0.5rem;
    }

    .editor-wrapper {
      padding: 0.75rem;
    }
  }
</style>