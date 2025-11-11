<script lang="ts">
  import { base } from "$app/paths";

  export const prerender = true;
</script>

<nav>
  <a href={`${base}/`}>Home</a>
  <a href={`${base}/lyrics`}>Lyrics</a>
</nav>

<header class="site-header" style="justify-content: center;">
  <h1>Bhajan Vani</h1>
</header>

<slot />

<style>
  nav {
    padding: 0.5rem 1rem;
    display: flex;
    gap: 1rem;
    background: #f8f1e8;
    border-bottom: 1px solid #e5e7eb;
  }

  nav a {
    text-decoration: none;
    color: #6c5638;
    font-weight: bold;
  }

  .site-header {
    padding: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .site-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #6c5638;
    font-family: "Georgia", serif;
  }
</style>
