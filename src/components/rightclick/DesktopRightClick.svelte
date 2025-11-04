<script>
  import '../../styles/rightclick/desktoprightclick.css'

  // Image imports
  const ICONS = {
    terminal: '/references/icons/rightclick/terminal.png',
    folder: '/references/icons/rightclick/folder.png',
    firefox: '/references/icons/rightclick/firefox.png',
    application: '/references/icons/rightclick/application.png',
    refresh: '/references/icons/rightclick/refresh.png'
  }

  // Props
  export let visible = false
  export let x = 0
  export let y = 0

  let clipboard = { items: [], mode: null }

  // Dispatch custom event helper
  const dispatchEvent = (eventName) => {
    window.dispatchEvent(new CustomEvent(eventName))
  }

  // Menu items configuration
  const menuItems = [
    { id: 'terminal', label: 'Terminal', icon: ICONS.terminal, action: () => dispatchEvent('openTerminal') },
    { id: 'file-manager', label: 'File Manager', icon: ICONS.folder, action: () => dispatchEvent('openFileManager') },
    { id: 'firefox', label: 'Firefox', icon: ICONS.firefox, action: () => dispatchEvent('openFirefox') },
    { separator: true },
    { id: 'applications', label: 'Applications', icon: ICONS.application, action: () => dispatchEvent('openApplications') },
    { separator: true },
    { id: 'paste', label: 'Paste', icon: 'V', action: () => {}, disabled: true },
    { separator: true },
    { id: 'settings', label: 'Settings', icon: 'S', action: () => dispatchEvent('openSettings') },
    { id: 'refresh', label: 'Refresh', icon: ICONS.refresh, action: () => location.reload() }
  ]

  function handleItemClick(item) {
    if (!item.disabled && item.action) {
      item.action()
    }
  }
</script>

{#if visible}
  <div class="rightclick-menu" style="left: {x}px; top: {y}px;">
    {#each menuItems as item (item.id || `separator-${Math.random()}`)}
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
