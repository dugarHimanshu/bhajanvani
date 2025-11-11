<!--src\routes\+page.svelte-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  onMount(() => {
    window.location.replace(`${base}/lyrics`);
  });
</script>

<div class="container" aria-label="Redirecting to lyrics library">
  <div>
    <h1>Lyrics Hub</h1>
    <p>Loading the lyrics library…</p>
    <p>If not redirected, <a href={`${base}/lyrics`}>click here</a>.</p>
  </div>
</div>

<style>
  .container {
    display: flex;
    place-items: center;
    height: 100vh;
    text-align: center;
  }
  a {
    color: #0a58ca;
    text-decoration: none;
    font-weight: bold;
  }
</style>
