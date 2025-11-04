<script>
  import { createEventDispatcher } from 'svelte';

  export let visible = false;
  export let x = 0;
  export let y = 0;

  const dispatch = createEventDispatcher();

  function handleAction(action) {
    dispatch(action, {});
  }

  const handleItemClick = (item) => {
    if (item.id === 'open') {
      dispatch('open');
    } else if (item.id === 'delete') {
      dispatch('delete');
    } else if (item.id === 'rename') {
      dispatch('rename');
    } else if (item.id === 'openInTerminal') {
      dispatch('openInTerminal');
    }
  };
</script>

<style>
  @import '../../styles/rightclick/FolderRightClick.css';
</style>

{#if visible}
  <div class="context-menu" style="left: {x}px; top: {y}px;" on:contextmenu|preventDefault|stopPropagation>
    <button class="ctx-item" on:click={() => handleAction('open')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Open</span>
    </button>
    <button class="ctx-item" on:click={() => handleAction('openInTerminal')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Open in Terminal</span>
    </button>
    <div class="ctx-separator"></div>
    <button class="ctx-item" on:click={() => handleAction('copy')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Copy</span>
    </button>
    <button class="ctx-item" on:click={() => handleAction('cut')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Cut</span>
    </button>
    <button class="ctx-item" on:click={() => handleAction('paste')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Paste</span>
    </button>
    <div class="ctx-separator"></div>
    <button class="ctx-item" on:click={() => handleAction('delete')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Delete</span>
    </button>
    <button class="ctx-item" on:click={() => handleAction('rename')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Rename</span>
    </button>
    <div class="ctx-separator"></div>
    <button class="ctx-item" on:click={() => handleAction('properties')}>
      <span class="ctx-icon"></span>
      <span class="ctx-label">Properties</span>
    </button>
  </div>
{/if}
