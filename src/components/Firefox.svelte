<script>
  // Firefox URL from environment variable, falls back to localhost for development
  let firefoxUrl = import.meta.env.VITE_FIREFOX_URL || 'http://localhost:5800'
</script>

<div class="firefox-container" on:contextmenu|stopPropagation>
  {#if firefoxUrl && firefoxUrl !== 'disabled'}
    <iframe src={firefoxUrl} title="Firefox Browser" class="firefox-iframe"></iframe>
  {:else}
    <div class="firefox-disabled">
      <p>🦊 Firefox is not available in production</p>
      <p>This feature requires a separate Docker container</p>
    </div>
  {/if}
</div>

<style>
  .firefox-disabled {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    text-align: center;
    padding: 2rem;
  }
  
  .firefox-disabled p:first-child {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
</style>