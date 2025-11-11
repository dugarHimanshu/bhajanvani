<script lang="ts">
  import type { Lyric } from "../types";

  export let lyric: Lyric;
  export let onOpen: (l: Lyric) => void;
  export let onEdit: (l: Lyric) => void;
  export let onDelete: (l: Lyric) => void;
</script>

<article class="card">
  <!-- ✅ Entire top area is now a clickable button -->
  <button class="card-click" type="button" on:click={() => onOpen(lyric)}>
    <div class="card-header">
      <div class="title-section">
        <h3>{lyric.title}</h3>
        {#if lyric.artist}
          <small class="muted">— {lyric.artist}</small>
        {/if}
      </div>
      <span class="content-badge">{lyric.contentType}</span>
    </div>

    <div class="card-content">
      {#if lyric.contentType === "text"}
        <p class="snippet">
          {lyric.content?.slice(0, 100)}
          {(lyric.content?.length ?? 0) > 100 ? "…" : ""}
        </p>
      {/if}

      {#if lyric.contentType === "pdf" || lyric.contentType === "image"}
        <p class="snippet">{lyric.fileName ?? "Uploaded content"}</p>

        {:else if lyric.thumbnailUrl && lyric.thumbnailUrl !== "none"}
          <img src={lyric.thumbnailUrl} alt="thumbnail" />
        {:else if lyric.content && lyric.content !== "" && lyric.content !== "none"}
          <img src={lyric.content} alt="preview" />
      {/if}
    </div>
  </button>

  <!-- ✅ Footer buttons still independent -->
  <div class="card-actions">
    <button class="btn-action btn-open" on:click={() => onOpen(lyric)}
      >Open</button
    >
    <button class="btn-action btn-edit" on:click={() => onEdit(lyric)}
      >Edit</button
    >
    <button class="btn-action btn-delete" on:click={() => onDelete(lyric)}
      >Delete</button
    >
  </div>
</article>

<style>
  .card {
    background: linear-gradient(135deg, #fffef9 0%, #fffbf5 100%);
    border: 2px solid #d4a574;
    padding: 1.25rem;
    border-radius: 8px;
    flex-shrink: 0;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.1);
    position: relative;
    overflow: visible;
    user-select: none;
  }

  .card:hover {
    box-shadow: 0 8px 24px rgba(139, 111, 71, 0.2);
    border-color: #c39464;
    background: linear-gradient(135deg, #fffbf5 0%, #fff9f0 100%);
  }

  /* ✅ Full-card click area */
  .card-click {
    all: unset;
    display: block;
    width: 100%;
    text-align: left;
    cursor: pointer;
    border-radius: 6px;
  }
  .card-click:focus {
    outline: 2px solid #8b6f47;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  h3 {
    margin: 0 0 0.15rem 0;
    font-size: 1.1rem;
    color: #8b6f47;
    font-weight: 700;
    word-break: break-word;
  }

  .muted {
    color: #a0825d;
    font-size: 0.85rem;
    font-style: italic;
  }

  .content-badge {
    background: #f3e4cd;
    color: #8b6f47;
    padding: 0.35rem 0.65rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    border: 1px solid #d4a574;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .snippet {
    color: #5d4e37;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .card-actions {
    display: flex;
    gap: 0.4rem;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px dashed #d4a574;
  }

  .btn-action {
    flex: 1;
    padding: 0.5rem 0.6rem;
    border-radius: 4px;
    border: 1.5px solid;
    background: #fffdf7;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: 0.2s;
  }

  .btn-open {
    border-color: #c39464;
    color: #8b6f47;
  }
  .btn-open:hover {
    background: #c39464;
    color: white;
  }

  .btn-edit {
    border-color: #8b6f47;
    color: #8b6f47;
  }
  .btn-edit:hover {
    background: #8b6f47;
    color: white;
  }

  .btn-delete {
    border-color: #d9534f;
    color: #d9534f;
  }
  .btn-delete:hover {
    background: #d9534f;
    color: white;
  }

  @media (max-width: 480px) {
    .card-actions {
      flex-direction: column;
    }
    .btn-action {
      width: 100%;
    }
  }
</style>
