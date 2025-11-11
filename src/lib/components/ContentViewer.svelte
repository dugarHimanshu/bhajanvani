<!-- src/lib/components/ContentViewer.svelte -->
<script lang="ts">
  import type { Lyric } from "../types";
  let pdfjsLib = null;
  let pdfWorker = null;
  import { onMount } from 'svelte';

  onMount(async () => {
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    pdfWorker = (await import("pdfjs-dist/legacy/build/pdf.worker.min?url"))
      .default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  });

  export let lyric: Lyric;

  let showFull = false;

  // ✅ Detect heavy base64 data
  const isDataURILarge =
    !!lyric?.content &&
    lyric.content.startsWith?.("data:") &&
    lyric.content.length > 300000;

  const approxSizeKB = lyric?.content
    ? Math.round((lyric.content.length * 3) / 4 / 1024)
    : 0;

  /*--------------✅PDF.js IMPORTS----------- */
  globalThis.DOMMatrix = globalThis.DOMMatrix || window.DOMMatrix;
  globalThis.Path2D = globalThis.Path2D || window.Path2D;

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

  //------------✅Safe PDF loader — no TypeScript errors
  async function renderPDF(url?: string) {
    const container = document.getElementById("pdf-container");
    if (!container) return;

    if (!url) {
      container.innerHTML = "PDF URL missing 😢";
      console.error("❌ PDF URL is undefined");
      return;
    }

    container.innerHTML = "Loading PDF…";

    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      container.innerHTML = "";

      // ✅ Render all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.2 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        container.appendChild(canvas);
      }
    } catch (err) {
      console.error("PDF render error:", err);
      container.innerHTML = "Failed to load PDF 😢";
    }
  }

  // ✅ Trigger PDF rendering when ready
  $: if (
    lyric?.contentType === "pdf" &&
    showFull &&
    typeof lyric.content === "string"
  ) {
    renderPDF(lyric.content);
  }
</script>

<div class="viewer">
  <!-- ✅ TEXT -->
  {#if lyric.contentType === "text"}
    <pre class="text-content">{lyric.content}</pre>
  {/if}

  <!-- ✅ IMAGE -->
  {#if lyric.contentType === "image"}
    {#if isDataURILarge && !showFull}
      <div class="lazy-warning">
        <p>Large image (≈{approxSizeKB} KB). Load?</p>
        <button class="btn-primary" on:click={() => (showFull = true)}>
          Load Image
        </button>
      </div>
    {:else}
      <img
        src={lyric.content}
        alt={lyric.title}
        loading="lazy"
        class="image-content"
      />
    {/if}
  {/if}

  <!-- ✅ PDF -->
  {#if lyric.contentType === "pdf"}
    {#if !showFull}
      <div class="lazy-warning">
        <p>Large PDF (≈{approxSizeKB} KB). Load?</p>
        <button class="btn-primary" on:click={() => (showFull = true)}>
          Load PDF
        </button>
      </div>
    {:else}
      <div id="pdf-container" class="pdf-js-container"></div>
    {/if}
  {/if}
</div>

<style>
  .viewer {
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .text-content {
    white-space: pre-wrap;
    background: #fffbf5;
    padding: 1.5rem;
    border-radius: 8px;
    border: 2px solid rgba(212, 165, 116, 0.3);
    font-family: "Georgia", serif;
    font-size: 1rem;
    line-height: 1.7;
    color: #5d4e37;
  }

  .image-content {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    border: 2px solid #d4a574;
    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.15);
  }

  /* ✅ PDF CANVAS LIST */
  .pdf-js-container {
    width: 100%;
    padding: 1rem;
    background: #faf7f2;
    border-radius: 8px;
  }

  :global(.pdf-js-container canvas) {
    display: block;
    margin: 0 auto 1.5rem auto;
    border-radius: 6px;
    box-shadow: 0 3px 10px rgba(139, 111, 71, 0.2);
    max-width: 100%;
  }

  /* ✅ WARNING */
  .lazy-warning {
    text-align: center;
    border: 2px dashed #d4a574;
    padding: 1rem;
    border-radius: 8px;
    background: #fff8ee;
    color: #8b6f47;
  }

  .btn-primary {
    margin-top: 0.5rem;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    background: #8b6f47;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }
</style>
