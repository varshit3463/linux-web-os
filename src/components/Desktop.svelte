<script>
  import { onMount } from 'svelte'
  import Panel from './Panel.svelte'
  import Window from './Window.svelte'
  import Terminal from './Terminal.svelte'
  import Projects from './Projects.svelte'
  import FileManager from './FileManager.svelte'
  import WallpaperPicker from './WallpaperPicker.svelte'
  import Firefox from './Firefox.svelte'
  import DesktopRightClick from './rightclick/DesktopRightClick.svelte'
  import BadApple from './BadApple.svelte'
  import AboutMe from './AboutMe.svelte'
  import '../styles/desktop.css'

  // ========== CONSTANTS & ICONS ==========
  const THEME_KEY = 'theme'
  const WALLPAPER_KEY = 'wallpaper'
  const NAV_INDEX_KEY = 'navIdx'
  const DESKTOP_ORDER_KEY = 'desktopItemsOrder'
  const DESKTOP_POSITIONS_KEY = 'desktopItemsPositions'
  const DEFAULT_WALLPAPER = 'linear-gradient(180deg,#0b0f15,#1b2430)'
  const DESKTOP_REFRESH_INTERVAL = 3000 // 3 seconds instead of 2

  // Icon paths
  const ICONS = {
    archLinux: '/references/icons/arch-linux.svg',
    applications: '/references/icons/applications-all-symbolic.svg',
    firefox: '/references/icons/firefox-icon.svg',
    folder: '/references/icons/folder.svg',
    file: '/references/icons/file.svg',
    terminal: '/references/icons/terminal.svg',
    audio: '/references/icons/audio.svg',
    media: '/references/icons/media.svg',
    settings: '/references/icons/settings-small.svg',
    shutdown: '/references/icons/Shutdown.svg',
    badApple: '/references/icons/badapple.png',
    aboutMe: '/references/icons/aboutme/aboutme.svg'
  }

  let dockApps = [
    { id: 'projects', label: 'Applications', icon: ICONS.applications, alt: 'applications', permanent: true },
    { id: 'firefox', label: 'Firefox', icon: ICONS.firefox, alt: 'firefox', permanent: true },
    { id: 'files', label: 'Files', icon: ICONS.folder, alt: 'files', permanent: true },
    { id: 'terminal', label: 'Terminal', icon: ICONS.terminal, alt: 'terminal', permanent: true }
  ]

  // Map of app configurations for temporary dock icons
  const appConfigs = {
    badapple: { label: 'Bad Apple', icon: ICONS.badApple, alt: 'bad apple' },
    terminal: { label: 'Terminal', icon: ICONS.terminal, alt: 'terminal' },
    files: { label: 'Files', icon: ICONS.folder, alt: 'files' },
    firefox: { label: 'Firefox', icon: ICONS.firefox, alt: 'firefox' },
    projects: { label: 'Applications', icon: ICONS.applications, alt: 'applications' },
    aboutme: { label: 'About Me', icon: ICONS.aboutMe, alt: 'about me' }
  }

  // Computed dock apps: permanent + temporary (open windows not in permanent dock)
  $: displayDockApps = (() => {
    const permanentIds = dockApps.filter(app => app.permanent).map(app => app.id)
    const temporaryApps = []
    
    // Add temporary icons for open windows not in permanent dock
    Object.keys(windows).forEach(appId => {
      if (windows[appId].visible && !permanentIds.includes(appId)) {
        const config = appConfigs[appId]
        if (config) {
          temporaryApps.push({
            id: appId,
            label: config.label,
            icon: config.icon,
            alt: config.alt,
            permanent: false
          })
        }
      }
    })
    
    return [...dockApps, ...temporaryApps]
  })()

  let draggedDockIndex = null

  // ========== MUSIC PLAYER ==========
  let audioPlayer
  let currentTrackIndex = 0
  let tracks = [
    { title: 'Lofi Hip Hop Radio', src: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
    { title: 'Chill Lounge', src: 'https://streaming.exclusive.radio/er/chill/icecast.audio' },
    { title: 'Smooth Jazz', src: 'https://streaming.exclusive.radio/er/jazz/icecast.audio' },
    { title: 'Electronic Dance', src: 'https://streaming.exclusive.radio/er/dance/icecast.audio' }
  ]

  // Reactive statement to update audio when track changes
  $: if (audioPlayer && tracks[currentTrackIndex]) {
    audioPlayer.src = tracks[currentTrackIndex].src
    audioPlayer.load()
    if (isPlaying) {
      audioPlayer.play().catch(err => console.log('Play failed:', err))
    }
  }

  function playAudio() {
    if (audioPlayer) {
      audioPlayer.play().catch(err => console.log('Play failed:', err))
      isPlaying = true
    }
  }

  function pauseAudio() {
    if (audioPlayer) {
      audioPlayer.pause()
      isPlaying = false
    }
  }

  function previousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length
  }

  onMount(() => {
    if (audioPlayer) {
      audioPlayer.volume = 0.3 // Set default volume to 30%
    }
  })

  // ========== DRAG & DROP HANDLERS ==========
  function handleDockDragStart(e, index) {
    draggedDockIndex = index
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDockDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDockDrop(e, dropIndex) {
    e.preventDefault()
    if (draggedDockIndex === null || draggedDockIndex === dropIndex) return
    
    const newDockApps = [...dockApps]
    const [draggedApp] = newDockApps.splice(draggedDockIndex, 1)
    newDockApps.splice(dropIndex, 0, draggedApp)
    
    dockApps = newDockApps
    draggedDockIndex = null
  }

  function handleDockDragEnd() {
    draggedDockIndex = null
  }

  // ========== DESKTOP ITEMS DRAG & DROP ==========
  let draggedDesktopIndex = null
  let draggedDesktopItemId = null
  let dragOffset = { x: 0, y: 0 }

  function handleDesktopItemDragStart(e, index, itemId) {
    draggedDesktopIndex = index
    draggedDesktopItemId = itemId
    isDraggingDesktopItem = true
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('itemId', itemId)
    
    const rect = e.target.closest('.desktop-item').getBoundingClientRect()
    dragOffset.x = e.clientX - rect.left
    dragOffset.y = e.clientY - rect.top
  }

  function handleDesktopDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDesktopDrop(e) {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('itemId')
    if (!itemId) return
    
    const desktopEl = document.querySelector('.desktop')
    const rect = desktopEl.getBoundingClientRect()
    
    const newX = Math.max(0, e.clientX - rect.left - dragOffset.x)
    const newY = Math.max(50, e.clientY - rect.top - dragOffset.y)
    
    itemPositions[itemId] = { x: newX, y: newY }
    itemPositions = itemPositions
    saveItemPositions()
    
    draggedDesktopIndex = null
  }

  function handleDesktopItemDragEnd() {
    draggedDesktopIndex = null
    draggedDesktopItemId = null
    isDraggingDesktopItem = false
  }

  function handleDesktopItemDoubleClick(item) {
    if (item.type === 'folder') {
      fileManagerFolderId = item.id
      openWindow('files')
      bringToFront('files')
    } else if (item.id === 'badapple') {
      openWindow('badapple')
      bringToFront('badapple')
    } else if (item.id === 'aboutme') {
      openWindow('aboutme')
      bringToFront('aboutme')
    }
  }

  function createWindowState() {
    return {
      terminal: { visible: false, minimized: false, zIndex: 100 },
      projects: { visible: false, minimized: false, zIndex: 100 },
      firefox: { visible: false, minimized: false, zIndex: 100 },
      files: { visible: false, minimized: false, zIndex: 100 },
      badapple: { visible: false, minimized: false, zIndex: 100 },
      aboutme: { visible: false, minimized: false, zIndex: 100 }
    }
  }

  // ========== STATE VARIABLES ==========
  let windows = createWindowState()
  let nextZIndex = 101
  let theme = localStorage.getItem(THEME_KEY) || 'dark'
  let wallpaper = localStorage.getItem(WALLPAPER_KEY) || ''
  let navIdx = parseInt(localStorage.getItem(NAV_INDEX_KEY) || '0', 10)
  if (Number.isNaN(navIdx)) navIdx = 0
  let wallpaperPickerOpen = false
  let isPlaying = false
  let rightClickMenuVisible = false
  let rightClickMenuX = 0
  let rightClickMenuY = 0
  let desktopItems = []
  let isDraggingDesktopItem = false
  let itemPositions = {}
  let fileManagerFolderId = null

  // ========== DESKTOP ITEMS MANAGEMENT ==========
  function loadItemPositions() {
    try {
      const saved = localStorage.getItem(DESKTOP_POSITIONS_KEY)
      itemPositions = saved ? JSON.parse(saved) : {}
    } catch (e) {
      console.error('Error loading item positions:', e)
      itemPositions = {}
    }
  }

  function saveItemPositions() {
    try {
      localStorage.setItem(DESKTOP_POSITIONS_KEY, JSON.stringify(itemPositions))
    } catch (e) {
      console.error('Error saving item positions:', e)
    }
  }

  function getItemPosition(itemId, defaultIndex) {
    if (!itemPositions[itemId]) {
      const x = 20 + (defaultIndex % 3) * 120
      const y = 80 + Math.floor(defaultIndex / 3) * 120
      itemPositions[itemId] = { x, y }
      saveItemPositions()
    }
    return itemPositions[itemId]
  }

  async function loadDesktopItems() {
    if (isDraggingDesktopItem) return
    
    try {
      const response = await fetch('http://localhost:3001/api/fs')
      if (!response.ok) throw new Error('Failed to load filesystem')
      
      const fileSystem = await response.json()
      
      const findDesktopFolder = (node) => {
        if (node.name === 'Desktop') return node
        if (node.children) {
          for (const child of node.children) {
            const found = findDesktopFolder(child)
            if (found) return found
          }
        }
        return null
      }
      
      const desktopFolder = findDesktopFolder(fileSystem)
      desktopItems = desktopFolder?.children || []
      console.log('Desktop items loaded:', desktopItems)
    } catch (err) {
      console.error('Error loading desktop items:', err)
    }
  }

  // ========== COLOR & THEME MANAGEMENT ==========

  const WHITE = [255, 255, 255]
  const BLACK = [0, 0, 0]

  $: wallpaperImage = wallpaper ? `url(${wallpaper})` : DEFAULT_WALLPAPER

  function parseRgba(input) {
    const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/i.exec(input ?? '')
    return match ? [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4] || 1)] : null
  }

  function mix(color, target, ratio) {
    return color.map((v, i) => Math.round(v * (1 - ratio) + target[i] * ratio))
  }

  function formatRgba(values, alpha = 1) {
    return `rgba(${values[0]},${values[1]},${values[2]},${alpha})`
  }

  function updateDotVars() {
    const style = getComputedStyle(document.documentElement)
    for (let i = 1; i <= 4; i++) {
      const parsed = parseRgba(style.getPropertyValue(`--theme-col-${i}`))
      if (!parsed) continue
      const [r, g, b] = parsed
      const darker = [Math.round(r * 0.5), Math.round(g * 0.5), Math.round(b * 0.5)]
      document.documentElement.style.setProperty(`--dot-${i}`, formatRgba([r, g, b]))
      document.documentElement.style.setProperty(`--dot-${i}-border`, formatRgba(darker))
    }
  }

  function setNavColor(idx) {
    navIdx = idx
    const style = getComputedStyle(document.documentElement)
    const parsed = parseRgba(style.getPropertyValue(`--theme-col-${idx + 1}`)) ?? [59, 65, 70, 1]
    const [r, g, b] = parsed
    const base = [r, g, b]
    const rgb = `${r},${g},${b}`

    updateDotVars()
    document.documentElement.style.setProperty('--nav-base', rgb)
    document.documentElement.style.setProperty('--nav-opaque', `rgba(${rgb},1)`)

    const pill = base.map((v) => Math.round(v + (255 - v) * 0.6))
    document.documentElement.style.setProperty('--nav-pill', `rgba(${pill.join(',')},0.14)`)
    document.documentElement.style.setProperty('--nav-btn', `rgba(${rgb},1)`)
    document.documentElement.style.setProperty('--nav-accent', `rgba(${rgb},0.18)`)
    document.documentElement.style.setProperty('--nav-border', `rgba(${rgb},0.28)`)

    const surface = mix(base, BLACK, 0.35)
    const surfaceStrong = mix(base, BLACK, 0.45)
    const sidebar = mix(base, BLACK, 0.5)
    const panel = mix(base, WHITE, 0.18)
    const panelHover = mix(base, WHITE, 0.28)
    const border = mix(base, BLACK, 0.6)
    const borderStrong = mix(base, BLACK, 0.7)
    const button = mix(base, WHITE, 0.25)
    const buttonHover = mix(base, WHITE, 0.4)
    const buttonBorder = mix(base, WHITE, 0.1)
    const card = mix(base, WHITE, 0.12)
    const menu = mix(base, BLACK, 0.2)

    document.documentElement.style.setProperty('--app-surface', formatRgba(surface, 0.95))
    document.documentElement.style.setProperty('--app-surface-strong', formatRgba(surfaceStrong, 0.95))
    document.documentElement.style.setProperty('--app-sidebar', formatRgba(sidebar, 0.95))
    document.documentElement.style.setProperty('--app-panel', formatRgba(panel, 0.9))
    document.documentElement.style.setProperty('--app-panel-hover', formatRgba(panelHover, 0.92))
    document.documentElement.style.setProperty('--app-border', formatRgba(border, 0.6))
    document.documentElement.style.setProperty('--app-border-strong', formatRgba(borderStrong, 0.75))
    document.documentElement.style.setProperty('--app-button', formatRgba(button))
    document.documentElement.style.setProperty('--app-button-hover', formatRgba(buttonHover))
    document.documentElement.style.setProperty('--app-button-border', formatRgba(buttonBorder, 0.7))
    document.documentElement.style.setProperty('--app-card', formatRgba(card, 0.35))
    document.documentElement.style.setProperty('--app-menu', formatRgba(menu, 0.95))

    localStorage.setItem(NAV_INDEX_KEY, String(idx))
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
    setNavColor(navIdx)
  }

  // ========== WINDOW MANAGEMENT ==========
  function openWindow(appId, data = {}) {
    if (!windows[appId]) return;
    
    windows = {
      ...windows,
      [appId]: { ...windows[appId], visible: true, minimized: false }
    };
    bringToFront(appId);
  }

  function closeWindow(id) {
    if (!windows[id]) return
    windows = {
      ...windows,
      [id]: { ...windows[id], visible: false, minimized: false }
    }
  }

  function bringToFront(id) {
    if (!windows[id]) return
    windows = {
      ...windows,
      [id]: { ...windows[id], zIndex: nextZIndex }
    }
    nextZIndex++
  }

  function setWindowMinimized(id, minimized) {
    if (!windows[id]) return
    windows = {
      ...windows,
      [id]: { ...windows[id], minimized }
    }
  }

  function handleDockClick(id) {
    const state = windows[id]
    if (!state) return
    if (state.visible) {
      setWindowMinimized(id, !state.minimized)
    } else {
      // Reset file manager to Computer path when opening from dock
      if (id === 'files') {
        fileManagerFolderId = null
      }
      openWindow(id)
    }
  }

  function handleMinimize(event) {
    const { appId, minimized } = event.detail
    if (appId) setWindowMinimized(appId, minimized)
  }

  function openWallpaperPicker() {
    wallpaperPickerOpen = true
  }

  function closeWallpaperPicker() {
    wallpaperPickerOpen = false
  }

  function onWallpaperSelect(event) {
    wallpaper = event.detail.wallpaper ?? ''
    if (wallpaper) {
      localStorage.setItem(WALLPAPER_KEY, wallpaper)
    } else {
      localStorage.removeItem(WALLPAPER_KEY)
    }
    closeWallpaperPicker()
  }

  function handleDesktopContextMenu(e) {
    e.preventDefault()
    rightClickMenuX = e.clientX
    rightClickMenuY = e.clientY
    rightClickMenuVisible = true
  }

  function closeContextMenu() {
    rightClickMenuVisible = false
  }

  function handleDesktopKeyDown(e) {
    if (e.key === 'Escape') {
      closeContextMenu()
    }
  }

  // Custom event handlers from context menu
  function handleOpenTerminal() {
    rightClickMenuVisible = false
    openWindow('terminal')
  }

  function handleOpenFileManager() {
    rightClickMenuVisible = false
    fileManagerFolderId = null
    openWindow('files')
  }

  function handleOpenFirefox() {
    rightClickMenuVisible = false
    openWindow('firefox')
  }

  function handleOpenApplications() {
    rightClickMenuVisible = false
    openWindow('projects')
  }

  // ========== LIFECYCLE ==========
  onMount(() => {
    document.documentElement.setAttribute('data-theme', theme)
    setNavColor(navIdx)
    loadItemPositions()
    loadDesktopItems()

    // Poll for changes every 3 seconds (increased from 2 for better performance)
    const refreshInterval = setInterval(loadDesktopItems, DESKTOP_REFRESH_INTERVAL)

    // Listen for right-click menu events
    window.addEventListener('openTerminal', handleOpenTerminal)
    window.addEventListener('openFileManager', handleOpenFileManager)
    window.addEventListener('openFirefox', handleOpenFirefox)
    window.addEventListener('openApplications', handleOpenApplications)

    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('openTerminal', handleOpenTerminal)
      window.removeEventListener('openFileManager', handleOpenFileManager)
      window.removeEventListener('openFirefox', handleOpenFirefox)
      window.removeEventListener('openApplications', handleOpenApplications)
    }
  })
</script>

<div 
  class="desktop"
  on:dragover={handleDesktopDragOver}
  on:drop={handleDesktopDrop}
  on:contextmenu={handleDesktopContextMenu}
  on:click={closeContextMenu}
>
  <div class="wallpaper" style="background-image: {wallpaperImage}" />

  <!-- Desktop Items Grid -->
  <div class="desktop-items">
    {#each desktopItems as item, index}
      {@const pos = getItemPosition(item.id, index)}
      <div 
        class="desktop-item"
        class:dragging={draggedDesktopItemId === item.id}
        title={item.name}
        draggable="true"
        style="left: {pos.x}px; top: {pos.y}px;"
        on:dragstart={(e) => handleDesktopItemDragStart(e, index, item.id)}
        on:dragend={handleDesktopItemDragEnd}
        on:dblclick={() => handleDesktopItemDoubleClick(item)}
        on:contextmenu|stopPropagation
      >
        <div class="desktop-item-icon">
          {#if item.id === 'badapple'}
            <img src={ICONS.badApple} alt={item.name} />
          {:else if item.id === 'aboutme'}
            <img src={ICONS.aboutMe} alt={item.name} />
          {:else if item.type === 'folder'}
            <img src={ICONS.folder} alt={item.name} />
          {:else}
            <img src={ICONS.file} alt={item.name} />
          {/if}
        </div>
        <div class="desktop-item-label">{item.name}</div>
      </div>
    {/each}
  </div>

  <!-- Top status bar -->
  <div class="statusbar" on:contextmenu|stopPropagation>
    <div class="status-left">
      <img src={ICONS.archLinux} alt="arch" class="status-icon" />
      <div class="dots-wrap" role="group" aria-label="theme colors">
        <div class="status-dots">
          <span class="dot dot-1" role="button" tabindex="0" on:click={() => setNavColor(0)} aria-label="color 1"></span>
          <span class="dot dot-2" role="button" tabindex="0" on:click={() => setNavColor(1)} aria-label="color 2"></span>
          <span class="dot dot-3" role="button" tabindex="0" on:click={() => setNavColor(2)} aria-label="color 3"></span>
          <span class="dot dot-4" role="button" tabindex="0" on:click={() => setNavColor(3)} aria-label="color 4"></span>
        </div>
      </div>
    </div>

    <div class="status-center">
      <div class="music-controls">
        <button class="pbtn" aria-label="previous" on:click={previousTrack}>⏮</button>
        <div class="play-circle" role="group" aria-label="play controls">
          {#if !isPlaying}
            <button class="pbtn play" aria-label="play" aria-pressed="false" on:click={playAudio}>▶</button>
          {:else}
            <button class="pbtn pause" aria-label="pause" aria-pressed="true" on:click={pauseAudio}>⏸</button>
          {/if}
        </div>
        <button class="pbtn" aria-label="next" on:click={nextTrack}>⏭</button>
        <div class="track">{tracks[currentTrackIndex].title}</div>
      </div>
    </div>

    <div class="status-right">
      <div class="icons-wrap">
        <img src={ICONS.audio} alt="audio" class="status-icon" />
        <img src={ICONS.media} alt="media" class="status-icon" />
        <img src={ICONS.settings} alt="settings" class="status-icon" />
        <img src={ICONS.shutdown} alt="power" class="status-icon shutdown" />
      </div>
      <div class="time-wrap">
        <div class="time">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
      </div>
    </div>
  </div>

  <!-- Centered dock (homepage) -->
  <div class="dock" on:contextmenu|stopPropagation>
    {#each displayDockApps as app, index}
      <button 
        class="dock-item" 
        title={app.label} 
        draggable={app.permanent ? "true" : "false"}
        on:dragstart={(e) => app.permanent && handleDockDragStart(e, index)}
        on:dragover={app.permanent ? handleDockDragOver : null}
        on:drop={(e) => app.permanent && handleDockDrop(e, index)}
        on:dragend={app.permanent ? handleDockDragEnd : null}
        on:click={() => handleDockClick(app.id)}
      >
        <img src={app.icon} alt={app.alt} />
        <span class="dock-label">{app.label}</span>
        {#if windows[app.id] && windows[app.id].visible && windows[app.id].minimized}
          <span class="dock-dot"></span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- keep panel for quick toggles but visually minimal -->
  <Panel
    on:openTerminal={() => openWindow('terminal')}
    on:toggleTheme={toggleTheme}
    on:openWallpaper={openWallpaperPicker}
  />

  {#if windows.terminal.visible}
    <Window title="Terminal" appId="terminal" zIndex={windows.terminal.zIndex} minimized={windows.terminal.minimized} on:close={() => closeWindow('terminal')} on:minimize={handleMinimize} on:bringToFront={(e) => bringToFront(e.detail.appId)}>
      <Terminal />
    </Window>
  {/if}

  {#if windows.projects.visible}
    <Window title="Projects" appId="projects" zIndex={windows.projects.zIndex} minimized={windows.projects.minimized} on:close={() => closeWindow('projects')} on:minimize={handleMinimize} on:bringToFront={(e) => bringToFront(e.detail.appId)}>
      <Projects />
    </Window>
  {/if}

  {#if wallpaperPickerOpen}
    <Window title="Wallpapers" on:close={closeWallpaperPicker}>
      <WallpaperPicker on:select={onWallpaperSelect} on:close={closeWallpaperPicker} />
    </Window>
  {/if}

  {#if windows.firefox.visible}
    <Window title="Firefox" appId="firefox" zIndex={windows.firefox.zIndex} minimized={windows.firefox.minimized} on:close={() => closeWindow('firefox')} on:minimize={handleMinimize} on:bringToFront={(e) => bringToFront(e.detail.appId)}>
      <Firefox />
    </Window>
  {/if}

  {#if windows.files.visible}
    <Window title="Files" appId="files" zIndex={windows.files.zIndex} minimized={windows.files.minimized} on:close={() => closeWindow('files')} on:minimize={handleMinimize} on:bringToFront={(e) => bringToFront(e.detail.appId)}>
      <FileManager initialFolderId={fileManagerFolderId} on:openapp={(e) => {
        const detail = e.detail;
        const appId = typeof detail === 'object' ? detail.app : detail;
        const props = typeof detail === 'object' ? detail : {};
        openWindow(appId, props);
      }} />
    </Window>
  {/if}

  {#if windows.badapple?.visible}
    <Window title="Bad Apple" appId="badapple" width={700} height={550} zIndex={windows.badapple.zIndex} minimized={windows.badapple.minimized} on:close={() => closeWindow('badapple')} on:minimize={handleMinimize} on:bringToFront={(e) => bringToFront(e.detail.appId)}>
      <BadApple />
    </Window>
  {/if}

  {#if windows.aboutme?.visible}
    <Window title="About Me" appId="aboutme" width={1200} height={900} zIndex={windows.aboutme.zIndex} minimized={windows.aboutme.minimized} on:close={() => closeWindow('aboutme')} on:minimize={handleMinimize} on:bringToFront={(e) => bringToFront(e.detail.appId)}>
      <AboutMe on:opendetail={(e) => {
        const detail = e.detail;
        openWindow(detail.app);
      }} />
    </Window>
  {/if}

  <!-- Desktop Right-Click Menu -->
  <DesktopRightClick 
    visible={rightClickMenuVisible}
    x={rightClickMenuX}
    y={rightClickMenuY}
  />

  <!-- Hidden Audio Player -->
  <audio 
    bind:this={audioPlayer}
    src={tracks[currentTrackIndex].src}
    preload="none"
    crossorigin="anonymous"
  >
    Your browser does not support the audio element.
  </audio>
</div>