<script>
  import Desktop from '../components/Desktop.svelte'
  import LoadingScreen from '../components/LoadingScreen.svelte'
  export let data
  
  let showLoading = true
  
  function handleLoadingComplete() {
    showLoading = false
  }
</script>

{#if showLoading}
  <LoadingScreen onComplete={handleLoadingComplete} />
{:else}
  <Desktop />
{/if}
