<script>
  import '../../styles/rightclick/desktoprightclick.css'

  // Props
  export let visible = false
  export let x = 0
  export let y = 0

  let menuElement
  let items = []
  let clipboard = { items: [], mode: null }

  // Build menu items for desktop
  function buildMenuItems() {
    return [
      { id: 'terminal', label: 'Terminal', icon: '/references/icons/rightclick/terminal.png', action: () => handleTerminal() },
      { id: 'file-manager', label: 'File Manager', icon: '/references/icons/rightclick/folder.png', action: () => handleFileManager() },
      { id: 'firefox', label: 'Firefox', icon: '/references/icons/rightclick/firefox.png', action: () => handleFirefox() },
      { separator: true },
      { id: 'create-folder', label: 'Create Folder', icon: '/references/icons/rightclick/folder.png', action: () => handleCreateFolder() },
      { id: 'applications', label: 'Applications', icon: '/references/icons/rightclick/application.png', action: () => handleApplications() },
      { separator: true },
      { id: 'copy', label: 'Copy', icon: 'C', action: () => handleCopy(), disabled: true },
      { id: 'paste', label: 'Paste', icon: 'V', action: () => handlePaste(), disabled: clipboard.items.length === 0 },
      { separator: true },
      { id: 'settings', label: 'Settings', icon: 'S', action: () => handleSettings(), disabled: true },
      { id: 'refresh', label: 'Refresh', icon: '/references/icons/rightclick/refresh.png', action: () => handleRefresh() }
    ]
  }

  // Action handlers
  function handleTerminal() {
    console.log('Open terminal')
    const event = new CustomEvent('openTerminal', { detail: {} })
    window.dispatchEvent(event)
  }

  function handleFileManager() {
    console.log('Open file manager')
    const event = new CustomEvent('openFileManager', { detail: {} })
    window.dispatchEvent(event)
  }

  function handleFirefox() {
    console.log('Open Firefox')
    const event = new CustomEvent('openFirefox', { detail: {} })
    window.dispatchEvent(event)
  }

  function handleCreateFolder() {
    console.log('Create folder')
  }

  function handleApplications() {
    console.log('Open applications')
    const event = new CustomEvent('openApplications', { detail: {} })
    window.dispatchEvent(event)
  }

  function handleCopy() {
    console.log('Copy (not implemented yet)')
  }

  function handlePaste() {
    console.log('Paste')
  }

  function handleSettings() {
    console.log('Settings (not implemented yet)')
  }

  function handleRefresh() {
    console.log('Refresh')
    location.reload()
  }

  function handleItemClick(item) {
    if (!item.disabled && item.action) {
      item.action()
    }
  }

  // Update items when visible changes
  $: if (visible) {
    items = buildMenuItems()
  }
</script>

{#if visible}
  <div class="rightclick-menu" bind:this={menuElement} style="left: {x}px; top: {y}px;">
    {#each items as item (item.id || `separator-${Math.random()}`)}
      {#if item.separator}
        <div class="rightclick-separator"></div>
      {:else}
        <button
          class="rightclick-item"
          disabled={item.disabled}
          on:click={() => handleItemClick(item)}
        >
          <span class="rightclick-icon">
            {#if item.icon.startsWith('/')}
              <img src={item.icon} alt={item.label} />
            {:else}
              {item.icon}
            {/if}
          </span>
          <span class="rightclick-label">{item.label}</span>
          {#if item.shortcut}
            <span class="rightclick-shortcut">{item.shortcut}</span>
          {/if}
        </button>
      {/if}
    {/each}
  </div>
{/if}

<style>
  /* Styles imported from desktoprightclick.css */
</style>
