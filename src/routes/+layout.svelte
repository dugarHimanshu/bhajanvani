<script lang="ts">
  // Simple layout with a header
</script>

<header class="site-header" style="justify-content: center;">
  <h1>Bhajan Vani</h1>
</header>

<slot />

<style>
  .site-header { padding: 1rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5e7eb; }
  .site-header h1 { margin: 0; font-size: 2rem; color: #6c5638; font-family: "Georgia", serif; }
</style>