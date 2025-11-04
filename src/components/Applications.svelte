<script>
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher()

  const applications = [
    { id: 'terminal', name: 'Terminal', icon: '/references/icons/terminal.svg', description: 'Command line interface', category: 'System' },
    { id: 'files', name: 'Files', icon: '/references/icons/folder.svg', description: 'Browse and manage files', category: 'System' },
    { id: 'firefox', name: 'Firefox', icon: '/references/icons/firefox-icon.svg', description: 'Web browser', category: 'Internet' },
    { id: 'settings', name: 'Settings', icon: '/references/icons/settings-small.svg', description: 'System settings and preferences', category: 'System' },
    { id: 'badapple', name: 'Bad Apple', icon: '/references/icons/badapple.png', description: 'ASCII animation player', category: 'Media' },
    { id: 'aboutme', name: 'About Me', icon: '/references/icons/aboutme/aboutme.svg', description: 'Personal information', category: 'Other' }
  ]

  const categories = ['System', 'Internet', 'Media', 'Other']

  let searchQuery = ''
  
  const filterBySearch = (apps, query) => {
    const q = query.trim().toLowerCase()
    return q === '' ? apps : apps.filter(app => 
      app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
    )
  }

  const groupByCategory = (apps) => 
    categories.map(name => ({ name, apps: apps.filter(app => app.category === name) }))
              .filter(cat => cat.apps.length > 0)

  $: filteredApps = filterBySearch(applications, searchQuery)
  $: filteredCategories = groupByCategory(filteredApps)

  const launchApp = (appId) => dispatch('launch', { appId })
  const handleKeydown = (e, appId) => e.key === 'Enter' && launchApp(appId)
</script>

<div class="applications-container" on:contextmenu|stopPropagation|preventDefault>
  <div class="applications-header">
    <div class="header-title">
      <span class="header-icon">▦</span>
      <span class="header-text">Applications</span>
    </div>
    <div class="search-box">
      <span class="search-icon">⌕</span>
      <input 
        type="text" 
        placeholder="Search applications..." 
        bind:value={searchQuery}
      />
    </div>
  </div>

  <div class="applications-content">
    {#if filteredCategories.length === 0}
      <div class="no-results">
        <span class="no-results-icon">🔍</span>
        <p>No applications found</p>
      </div>
    {:else}
      {#each filteredCategories as category}
        <div class="app-category">
          <div class="category-title">{category.name}</div>
          <div class="app-grid">
            {#each category.apps as app}
              <div 
                class="app-item" 
                on:click={() => launchApp(app.id)}
                on:keydown={(e) => handleKeydown(e, app.id)}
                tabindex="0"
                role="button"
              >
                <div class="app-icon-wrapper">
                  <img src={app.icon} alt={app.name} class="app-icon" />
                </div>
                <div class="app-name">{app.name}</div>
                <div class="app-description">{app.description}</div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .applications-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(20, 24, 28, 0.98);
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', monospace;
    color: rgba(200, 220, 240, 1);
    padding: 0;
    overflow: hidden;
  }

  .applications-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(var(--nav-base), 0.4);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.9);
  }

  .header-text {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.9);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(var(--nav-base), 0.3);
    border-radius: 6px;
    padding: 8px 12px;
    transition: border-color 0.2s ease;
  }

  .search-box:focus-within {
    border-color: rgba(var(--nav-base), 0.6);
    background: rgba(0, 0, 0, 0.4);
  }

  .search-icon {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
  }

  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-family: inherit;
  }

  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .applications-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  .no-results-icon {
    font-size: 48px;
    opacity: 0.3;
  }

  .no-results p {
    font-size: 14px;
    margin: 0;
  }

  .app-category {
    margin-bottom: 28px;
  }

  .app-category:last-child {
    margin-bottom: 0;
  }

  .category-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(var(--nav-base), 1);
    margin-bottom: 12px;
    padding-left: 4px;
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .app-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 12px;
    background: rgba(var(--nav-base), 0.15);
    border: 1px solid rgba(var(--nav-base), 0.25);
    border-radius: 8px;
    cursor: var(--cursor-pointer);
    transition: all 0.2s ease;
    text-align: center;
  }

  .app-item:hover {
    background: rgba(var(--nav-base), 0.35);
    border-color: rgba(var(--nav-base), 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--nav-base), 0.2);
  }

  .app-item:active {
    transform: translateY(0);
  }

  .app-item:focus {
    outline: 2px solid rgba(var(--nav-base), 0.6);
    outline-offset: 2px;
  }

  .app-icon-wrapper {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    background: rgba(var(--nav-base), 0.2);
    border-radius: 12px;
    padding: 8px;
    border: 1px solid rgba(var(--nav-base), 0.3);
  }

  .app-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .app-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 4px;
    letter-spacing: 0.3px;
  }

  .app-description {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.3;
  }

  .applications-content::-webkit-scrollbar {
    width: 8px;
  }

  .applications-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .applications-content::-webkit-scrollbar-thumb {
    background: rgba(var(--nav-base), 0.4);
    border-radius: 4px;
  }

  .applications-content::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--nav-base), 0.6);
  }
</style>
