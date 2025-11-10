<!--E:\Coding\Private\Bhajan\lyrics-hub\src\routes\lyrics\+page.svelte-->

<script lang="ts">
  import { onMount } from "svelte";
  import { lyrics, initLyrics, saveLyric, deleteLyric as deleteLyricAPI, fetchLyricById } from "$lib/stores/lyricsStore";
  import LyricsCard from "$lib/components/LyricsCard.svelte";
  import LyricsEditor from "$lib/components/LyricsEditor.svelte";
  import ContentViewer from "$lib/components/ContentViewer.svelte";
  import type { Lyric } from "$lib/types";

  let list: Lyric[] = [];
  let filteredList: Lyric[] = [];
  let selected: Lyric | null = null;
  let editing: Lyric | null = null;
  let showEditor = false;
  let searchQuery = "";
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    if (typeof window !== "undefined") {
      initLyrics();
      const unsub = lyrics.subscribe((v: Lyric[]) => {
        list = v;
        filterList();
      });
      return unsub;
    }
  });

  function filterList() {
    if (!searchQuery.trim()) {
      filteredList = list;
    } else {
      const query = searchQuery.toLowerCase();
      filteredList = list.filter(
        (lyric) =>
          lyric.title.toLowerCase().includes(query) ||
          (lyric.artist?.toLowerCase().includes(query) ?? false) ||
          (lyric.content?.toLowerCase().includes(query) ?? false)
      );
    }
  }

  function handleSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    searchQuery = input.value;
    // debounce filtering to avoid expensive work while typing on mobile
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterList();
      searchTimeout = null;
    }, 180);
  }

  async function openLyric(l: Lyric) {
    // fetch full content on demand to avoid loading heavy base64 blobs in list
    const full = await fetchLyricById(l.id);
    if (full) {
      selected = full;
    } else {
      // fallback to metadata-only view
      selected = l;
    }
  }

  function editLyric(l: Lyric) {
    editing = l;
    showEditor = true;
  }

  function deleteLyric(l: Lyric) {
    if (!confirm(`Delete "${l.title}"?`)) return;
    deleteLyricAPI(l.id).catch((err) => {
      console.error("Error deleting lyric:", err);
      alert("Failed to delete lyric");
    });
  }

  function handleSaveLyric(next: Lyric) {
    saveLyric(next)
      .then(() => {
        showEditor = false;
      })
      .catch((err) => {
        console.error("Error saving lyric:", err);
        alert("Failed to save lyric");
      });
  }

  function cancelEdit() {
    showEditor = false;
  }

  function createNew() {
    editing = null;
    showEditor = true;
  }
</script>

<div class="container">
  <header class="header">
    <div class="header-top">
      <h1>📖 Lyrics Library</h1>
      <button class="btn-primary new-lyric-btn" on:click={createNew}>+ New Lyric</button>
    </div>
    <div class="search-container">
      <input
        type="text"
        class="search-bar"
        placeholder="Search by title, artist, or lyrics..."
        value={searchQuery}
        on:input={handleSearch}
      />
      {#if searchQuery}
        <span class="search-result-count">{filteredList.length} result{filteredList.length !== 1 ? 's' : ''}</span>
      {/if}
    </div>
  </header>

  <div class="grid">
    <section class="list" aria-label="Lyrics list">
      {#each filteredList as l (l.id)}
        <LyricsCard lyric={l} onOpen={openLyric} onEdit={editLyric} onDelete={deleteLyric} />
      {/each}
      {#if filteredList.length === 0}
        <p class="empty">
          {searchQuery ? "No lyrics match your search. Try a different query." : "No lyrics yet. Create one to get started!"}
        </p>
      {/if}
    </section>

    <section class="viewer" aria-label="Content viewer">
      {#if selected}
        <div class="viewer-content">
          <h2>{selected.title}</h2>
          <p class="artist">by <em>{selected.artist ?? "Unknown Artist"}</em></p>
          <div class="divider"></div>
          <div class="content">
            <ContentViewer lyric={selected} />
          </div>
          <div class="actions">
            <button class="btn-secondary" on:click={() => selected && editLyric(selected)}>Edit</button>
            <button class="btn-danger" on:click={() => selected && deleteLyric(selected)}>Delete</button>
          </div>
        </div>
      {:else}
        <div class="empty-viewer">
          <p>✨ Select a lyric to view content</p>
        </div>
      {/if}
    </section>
  </div>

  {#if showEditor}
    <div class="modal" role="dialog" aria-modal="true" aria-label="Edit lyric">
      <div class="modal-content">
        <button class="modal-close" on:click={cancelEdit}>×</button>
        <LyricsEditor lyric={editing} onSave={handleSaveLyric} onCancel={cancelEdit} />
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    background: linear-gradient(135deg, #f5e6d3 0%, #ede0d0 100%);
    font-family: "Georgia", "Garamond", serif;
    color: #5d4e37;
  }
/* ✅ Hide New Lyric button on all devices except Laptop/Desktop */
@media (max-width: 1199px) {
  .btn-primary.new-lyric-btn {
    display: none !important;
  }
}


  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #8b6f47;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
    letter-spacing: -0.5px;
  }

.search-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* ✅ Default (desktop/PC first) — WIDE search bar */
.search-bar {
  width: 75%;
  max-width: 820px;
  padding: 0.85rem 1rem 0.85rem 2.5rem;
  border: 2px solid #d4a574;
  border-radius: 8px;
  font-size: 1rem;
  background: #fffbf5;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05),
              0 2px 8px rgba(139,111,71,0.1);
  transition: all 0.3s ease;
}

.search-bar::placeholder {
  color: #b8956a;
}

.search-bar:focus {
  outline: none;
  border-color: #8b6f47;
  background: #fffef9;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05),
              0 0 0 3px rgba(139, 111, 71, 0.1);
}

/* ✅ Search result count aligned for PC width */
.search-result-count {
  position: absolute;
  right: calc(12.5% + 1.5rem);
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: #8b6f47;
  font-style: italic;
}

/* ✅ Medium screens (tablet) */
@media (max-width: 1024px) {
  .search-bar {
    width: 70%;
    max-width: 620px;
  }

  .search-result-count {
    right: calc(15% + 1rem);
  }
}

/* ✅ Tablet */
@media (max-width: 1199px) {
  .search-bar {
    width: 85%;
    max-width: 700px;
  }
  .search-result-count {
    right: calc(7.5% + 1rem);
  }
}

/* ✅ Mobile */
@media (max-width: 768px) {
  .search-bar {
    width: 100%;
    max-width: 100%;
    padding: 0.8rem 1rem;
    font-size: 16px;
  }
  .search-result-count {
    right: 1rem;
  }
}

/* ✅ Small Mobile */
@media (max-width: 480px) {
  .search-bar {
    padding: 0.75rem 0.85rem;
    font-size: 15px;
  }
}
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 600px;
    overflow-y: auto;
    padding-right: 0.5rem;
    /* Custom scrollbar styling */
    scrollbar-color: #d4a574 #f5e6d3;
    scrollbar-width: thin;
  }

  .list::-webkit-scrollbar {
    width: 8px;
  }

  .list::-webkit-scrollbar-track {
    background: #f5e6d3;
    border-radius: 4px;
  }

  .list::-webkit-scrollbar-thumb {
    background: #d4a574;
    border-radius: 4px;
  }

  .list::-webkit-scrollbar-thumb:hover {
    background: #c39464;
  }

  .viewer {
    background: linear-gradient(135deg, #fffef9 0%, #fffbf5 100%);
    border: 3px solid #d4a574;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(139, 111, 71, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5);
    position: relative;
    overflow: hidden;
  }

  .viewer::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.3), transparent);
  }

  .viewer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .viewer h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    color: #8b6f47;
    font-weight: 700;
  }

  .artist {
    margin: 0 0 1rem 0;
    color: #a0825d;
    font-size: 1rem;
    font-style: italic;
  }

  .divider {
    height: 2px;
    background: linear-gradient(90deg, transparent, #d4a574, transparent);
    margin: 0.75rem 0 1.5rem 0;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
    padding-right: 0.5rem;
  }

  .empty-viewer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #a0825d;
    text-align: center;
    font-size: 1.2rem;
    font-style: italic;
  }

  .empty {
    color: #a0825d;
    text-align: center;
    padding: 2rem;
    font-style: italic;
    background: rgba(212, 165, 116, 0.1);
    border-radius: 8px;
    border: 2px dashed #d4a574;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    padding: 0.65rem 1.25rem;
    border-radius: 6px;
    border: 2px solid;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: "Georgia", serif;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #8b6f47 0%, #6d5a3f 100%);
    color: #fffef9;
    border-color: #5d4e37;
    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.25);
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #6d5a3f 0%, #5d4e37 100%);
    box-shadow: 0 6px 16px rgba(139, 111, 71, 0.35);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: linear-gradient(135deg, #d4a574 0%, #c39464 100%);
    border-color: #b8956a;
    color: #5d4e37;
  }

  .btn-secondary:hover {
    background: linear-gradient(135deg, #c39464 0%, #b8956a 100%);
    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.15);
    transform: translateY(-1px);
  }

  .btn-danger {
    background: linear-gradient(135deg, #d9534f 0%, #c9302c 100%);
    border-color: #b92c1f;
    color: #fff;
  }

  .btn-danger:hover {
    background: linear-gradient(135deg, #c9302c 0%, #b92c1f 100%);
    box-shadow: 0 4px 12px rgba(217, 83, 79, 0.2);
    transform: translateY(-1px);
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: linear-gradient(135deg, #fffef9 0%, #fffbf5 100%);
    padding: 2rem;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    border: 3px solid #d4a574;
    box-shadow: 0 20px 60px rgba(139, 111, 71, 0.3);
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #8b6f47;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    color: #5d4e37;
    background: rgba(212, 165, 116, 0.1);
    border-radius: 6px;
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .viewer {
      border-radius: 8px;
      padding: 1.5rem;
    }

    .list {
      max-height: 400px;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.75rem;
    }

    .header-top {
      flex-direction: column;
      align-items: stretch;
    }

    h1 {
      font-size: 1.8rem;
    }

    .grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .list {
      max-height: 300px;
    }

    .btn-primary,
    .btn-secondary,
    .btn-danger {
      width: 100%;
      flex: 1;
    }

    .actions {
      flex-direction: column;
    }

    .modal-content {
      max-width: 100%;
      margin: 1rem;
      padding: 1.5rem;
    }

    .viewer h2 {
      font-size: 1.4rem;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0.75rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    .header-top {
      margin-bottom: 1rem;
    }

    .list {
      max-height: 250px;
    }

    .search-bar {
      padding: 0.75rem 1rem;
      font-size: 16px;
    }

    .modal-content {
      padding: 1rem;
    }

    .viewer {
      padding: 1rem;
    }

    .viewer h2 {
      font-size: 1.2rem;
    }

    .artist {
      font-size: 0.9rem;
    }
  }
</style>