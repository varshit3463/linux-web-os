<script>
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  // Hardcoded list from references index (kept small for starter)
  const wallpapers = [
    '/references/icons/wallpapers/archwaveinv.png',
    '/references/icons/wallpapers/awesome.png',
    '/references/icons/wallpapers/mountain.png',
    '/references/icons/wallpapers/reflected.png',
    '/references/icons/wallpapers/split.png',
    '/references/icons/wallpapers/sunset.png',
    '/references/icons/wallpapers/svalbard.png',
    '/references/icons/wallpapers/wave.png'
  ]

  let selected = localStorage.getItem('wallpaper') || ''

  function choose(w){
    selected = w
    localStorage.setItem('wallpaper', w)
    dispatch('select', { wallpaper: w })
  }

  function close(){ dispatch('close') }
</script>

<div class="picker">
  <div class="header">
    <div>Choose wallpaper</div>
    <button on:click={close}>Close</button>
  </div>
  <div class="grid">
    {#each wallpapers as w}
      <div class="cell {selected===w? 'sel':''}" on:click={() => choose(w)}>
        <img src={w} alt="wallpaper preview" />
      </div>
    {/each}
  </div>
</div>

<style>
  .picker{ width:720px; max-width:90vw; background:var(--surface); color:var(--text); padding:12px; border-radius:8px }
  .header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
  .grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px }
  .cell{ border-radius:6px; overflow:hidden; cursor:pointer; border:2px solid transparent }
  .cell.sel{ outline:2px solid var(--accent) }
  img{ width:100%; height:90px; object-fit:cover; display:block }
</style>
