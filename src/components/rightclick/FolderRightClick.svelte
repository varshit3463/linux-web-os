<script>
  import { createEventDispatcher } from 'svelte';
  import '../../styles/rightclick/FolderRightClick.css';

  export let visible = false;
  export let x = 0;
  export let y = 0;

  const dispatch = createEventDispatcher();

  const menuItems = [
    { id: 'open', label: 'Open' },
    { id: 'openInTerminal', label: 'Open in Terminal' },
    { separator: true },
    { id: 'copy', label: 'Copy' },
    { id: 'cut', label: 'Cut' },
    { id: 'paste', label: 'Paste' },
    { separator: true },
    { id: 'delete', label: 'Delete' },
    { id: 'rename', label: 'Rename' },
    { separator: true },
    { id: 'properties', label: 'Properties' }
  ];

  const handleAction = (action) => dispatch(action, {});
</script>

{#if visible}
  <div class="context-menu" style="left: {x}px; top: {y}px;" on:contextmenu|preventDefault|stopPropagation>
    {#each menuItems as item}
      {#if item.separator}
        <div class="ctx-separator"></div>
      {:else}
        <button class="ctx-item" on:click={() => handleAction(item.id)}>
          <span class="ctx-icon"></span>
          <span class="ctx-label">{item.label}</span>
        </button>
      {/if}
    {/each}
  </div>
{/if}
