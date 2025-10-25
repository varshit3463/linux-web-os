<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  function openTerminal(){ dispatch('openTerminal') }
  function toggleTheme(){ dispatch('toggleTheme') }
  function openWallpaper(){ dispatch('openWallpaper') }
</script>

<div class="panel top">Linux Web Portfolio</div>
<div class="panel bottom"></div>

<style>
  .panel{ position:fixed; left:0; right:0; height:36px; display:flex; align-items:center; padding:0 12px; color:var(--text) }
  .top{ top:0; background:rgba(0,0,0,.08) }
  .bottom{ bottom:0; justify-content:center; background:rgba(0,0,0,.06) }
  .dock button{ margin:0 6px }
</style>
