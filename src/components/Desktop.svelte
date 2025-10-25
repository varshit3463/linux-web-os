<script>
  import { onMount } from 'svelte'
  import Panel from './Panel.svelte'
  import Window from './Window.svelte'
  import Terminal from './Terminal.svelte'
  import Projects from './Projects.svelte'
  import FileManager from './FileManager.svelte'
  import WallpaperPicker from './WallpaperPicker.svelte'
  import Firefox from './Firefox.svelte'
  import '../styles/desktop.css'

  const THEME_KEY = 'theme'
  const WALLPAPER_KEY = 'wallpaper'
  const NAV_INDEX_KEY = 'navIdx'
  const DEFAULT_WALLPAPER = 'linear-gradient(180deg,#0b0f15,#1b2430)'

  const dockApps = [
    { id: 'projects', label: 'Applications', icon: '/references/icons/applications-all-symbolic.svg', alt: 'applications' },
    { id: 'firefox', label: 'Firefox', icon: '/references/icons/firefox-icon.svg', alt: 'firefox' },
    { id: 'files', label: 'Files', icon: '/references/icons/folder.svg', alt: 'files' },
    { id: 'terminal', label: 'Terminal', icon: '/references/icons/terminal.svg', alt: 'terminal' }
  ]

  function createWindowState() {
    return {
      terminal: { visible: false, minimized: false },
      projects: { visible: false, minimized: false },
      firefox: { visible: false, minimized: false },
      files: { visible: false, minimized: false }
    }
  }

  let windows = createWindowState()
  let theme = localStorage.getItem(THEME_KEY) || 'dark'
  let wallpaper = localStorage.getItem(WALLPAPER_KEY) || ''
  let navIdx = parseInt(localStorage.getItem(NAV_INDEX_KEY) || '0', 10)
  if (Number.isNaN(navIdx)) navIdx = 0
  let wallpaperPickerOpen = false
  let isPlaying = false

  $: wallpaperImage = wallpaper ? `url(${wallpaper})` : DEFAULT_WALLPAPER

  function parseRgba(input) {
    const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/i.exec(input ?? '')
    if (!match) return null
    const [, r, g, b, a = '1'] = match
    return [Number(r), Number(g), Number(b), Number(a)]
  }

  const WHITE = [255, 255, 255]
  const BLACK = [0, 0, 0]

  function mix(color, target, ratio) {
    return color.map((value, index) => Math.round(value * (1 - ratio) + target[index] * ratio))
  }

  function formatRgba(values, alpha = 1) {
    return `rgba(${values[0]},${values[1]},${values[2]},${alpha})`
  }

  function updateDotVars() {
    const style = getComputedStyle(document.documentElement)
    for (let i = 1; i <= 4; i += 1) {
      const value = style.getPropertyValue(`--theme-col-${i}`)
      const parsed = parseRgba(value)
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
    const raw = style.getPropertyValue(`--theme-col-${idx + 1}`)
    const parsed = parseRgba(raw) ?? [59, 65, 70, 1]
    const [r, g, b] = parsed
    const base = [r, g, b]
    const rgb = `${r},${g},${b}`

    updateDotVars()

    document.documentElement.style.setProperty('--nav-base', rgb)
    document.documentElement.style.setProperty('--nav-opaque', `rgba(${rgb},1)`)

    const pill = base.map((value) => Math.round(value + (255 - value) * 0.6))
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

  function openWindow(id) {
    if (!windows[id]) return
    windows = {
      ...windows,
      [id]: { visible: true, minimized: false }
    }
  }

  function closeWindow(id) {
    if (!windows[id]) return
    windows = {
      ...windows,
      [id]: { visible: false, minimized: false }
    }
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

  onMount(() => {
    document.documentElement.setAttribute('data-theme', theme)
    setNavColor(navIdx)
  })
</script>

<div class="desktop">
  <div class="wallpaper" style="background-image: {wallpaperImage}" />

  <!-- Top status bar -->
  <div class="statusbar">
    <div class="status-left">
      <img src="/references/icons/arch-linux.svg" alt="arch" class="status-icon" />
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
      <div class="player">
        <button class="pbtn" aria-label="previous">⏮</button>
        <div class="play-circle" role="group" aria-label="play controls">
          {#if !isPlaying}
            <button class="pbtn play" aria-label="play" aria-pressed="false" on:click={() => (isPlaying = true)}>▶</button>
          {:else}
            <button class="pbtn pause" aria-label="pause" aria-pressed="true" on:click={() => (isPlaying = false)}>⏸</button>
          {/if}
        </div>
        <button class="pbtn" aria-label="next">⏭</button>
        <div class="track">Grateful</div>
      </div>
    </div>

    <div class="status-right">
      <div class="icons-wrap">
        <img src="/references/icons/audio.svg" alt="audio" class="status-icon" />
        <img src="/references/icons/notifications.svg" alt="notifications" class="status-icon" />
        <img src="/references/icons/settings-small.svg" alt="settings" class="status-icon" />
        <img src="/references/icons/Shutdown.svg" alt="power" class="status-icon shutdown" />
      </div>
      <div class="time-wrap">
        <div class="time">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
      </div>
    </div>
  </div>

  <!-- Centered dock (homepage) -->
  <div class="dock">
    {#each dockApps as app}
      <button class="dock-item" title={app.label} on:click={() => handleDockClick(app.id)}>
        <img src={app.icon} alt={app.alt} />
        <span class="dock-label">{app.label}</span>
        {#if windows[app.id].visible && windows[app.id].minimized}
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
    <Window title="Terminal" appId="terminal" minimized={windows.terminal.minimized} on:close={() => closeWindow('terminal')} on:minimize={handleMinimize}>
      <Terminal />
    </Window>
  {/if}

  {#if windows.projects.visible}
    <Window title="Projects" appId="projects" minimized={windows.projects.minimized} on:close={() => closeWindow('projects')} on:minimize={handleMinimize}>
      <Projects />
    </Window>
  {/if}

  {#if wallpaperPickerOpen}
    <Window title="Wallpapers" on:close={closeWallpaperPicker}>
      <WallpaperPicker on:select={onWallpaperSelect} on:close={closeWallpaperPicker} />
    </Window>
  {/if}

  {#if windows.firefox.visible}
    <Window title="Firefox" appId="firefox" minimized={windows.firefox.minimized} on:close={() => closeWindow('firefox')} on:minimize={handleMinimize}>
      <Firefox />
    </Window>
  {/if}

  {#if windows.files.visible}
    <Window title="Files" appId="files" minimized={windows.files.minimized} on:close={() => closeWindow('files')} on:minimize={handleMinimize}>
      <FileManager />
    </Window>
  {/if}
</div>