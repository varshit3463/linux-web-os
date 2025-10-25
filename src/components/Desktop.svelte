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

  let showTerminal = false
  let showProjects = false
  let showWallpaperPicker = false
  let showFirefox = false
  let showFiles = false
  let theme = localStorage.getItem('theme') || 'dark'
  let wallpaper = localStorage.getItem('wallpaper') || ''
  let isPlaying = false
  
  // Track minimized state for each app
  let minimizedApps = {
    terminal: false,
    files: false,
    firefox: false,
    projects: false
  }
 
  const navColors = [
    '59,65,70',
    '71,43,67',
    '57,80,53',
    '91,76,87'
  ]
    // Use theme colors from CSS variables instead of a hard-coded JS array.
    // Helper: parse `rgb(...)` or `rgba(...)` strings into [r,g,b,a]
    function parseRgba(str){
      const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/i.exec(str || '')
      if (!m) return null
      return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10), m[4] !== undefined ? parseFloat(m[4]) : 1]
    }

    let navIdx = parseInt(localStorage.getItem('navIdx') || '0')
    function setNavColor(idx){
      navIdx = idx
      // read the CSS theme color var (e.g. --theme-col-1) and derive RGB parts
      const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--theme-col-${idx+1}`) || ''
      const parts = parseRgba(cssVar) || [59,65,70,1]
      const rgb = parts.slice(0,3).join(',')
      // ensure dot css variables reflect theme vars
      updateDotVars()
      // store the rgb triple for advanced use
      document.documentElement.style.setProperty('--nav-base', rgb)
      // full opaque navbar color (user requested non-transparent navbar)
      document.documentElement.style.setProperty('--nav-opaque', `rgba(${rgb},1)`)
      // compute a lighter 'pill' color (blend towards white) to appear lighter than navbar
      const pill = parts.slice(0,3).map(v => Math.round(v + (255 - v) * 0.6)).join(',')
      document.documentElement.style.setProperty('--nav-pill', `rgba(${pill},0.14)`)
      // dock button background (opaque per request)
      document.documentElement.style.setProperty('--nav-btn', `rgba(${rgb},1)`)
      // subtle accent/border
      document.documentElement.style.setProperty('--nav-accent', `rgba(${rgb},0.18)`)
      // slightly darker border used for rounded rect outlines
      document.documentElement.style.setProperty('--nav-border', `rgba(${rgb},0.28)`)
      localStorage.setItem('navIdx', String(idx))
    }

    function updateDotVars(){
      // read theme color CSS vars `--theme-col-1..4` and export --dot-N and --dot-N-border as rgba strings
      for(let i=1;i<=4;i++){
        const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--theme-col-${i}`) || ''
        const parsed = parseRgba(cssVar)
        if (parsed){
          const rgba = `rgba(${parsed[0]},${parsed[1]},${parsed[2]},1)`
          const dark = [Math.max(0,Math.round(parsed[0]*0.5)),Math.max(0,Math.round(parsed[1]*0.5)),Math.max(0,Math.round(parsed[2]*0.5))]
          const darkRgba = `rgba(${dark[0]},${dark[1]},${dark[2]},1)`
          document.documentElement.style.setProperty(`--dot-${i}`, rgba)
          document.documentElement.style.setProperty(`--dot-${i}-border`, darkRgba)
        } else {
          // fallback: keep existing var if present
          const fall = getComputedStyle(document.documentElement).getPropertyValue(`--dot-${i}`)
          if (!fall) document.documentElement.style.setProperty(`--dot-${i}`, `rgba(59,65,70,1)`)
        }
      }
    }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  function openWallpaperPicker(){ showWallpaperPicker = true }

  function onWallpaperSelect(e){
    wallpaper = e.detail.wallpaper || ''
    if (wallpaper) localStorage.setItem('wallpaper', wallpaper)
    else localStorage.removeItem('wallpaper')
    showWallpaperPicker = false
  }

  onMount(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // initialize nav colors
    setNavColor(navIdx)
    // initialize dot css variables
    updateDotVars()
  })

  function openTerminal() { showTerminal = true }
  function openProjects() { showProjects = true }
  function openApplications() { showProjects = true }
  function openFiles() { showFiles = true }

  // Handle minimize event from Window component
  function handleMinimize(event) {
    const { minimized, appId } = event.detail;
    if (appId) {
      minimizedApps[appId] = minimized;
    }
  }

  // Handle dock icon click - toggle minimize state if app is open
  function handleDockClick(appId, openFn) {
    if (appId === 'terminal' && showTerminal) {
      minimizedApps.terminal = !minimizedApps.terminal;
    } else if (appId === 'files' && showFiles) {
      minimizedApps.files = !minimizedApps.files;
    } else if (appId === 'firefox' && showFirefox) {
      minimizedApps.firefox = !minimizedApps.firefox;
    } else if (appId === 'projects' && showProjects) {
      minimizedApps.projects = !minimizedApps.projects;
    } else {
      // App not open, so open it
      openFn();
    }
  }
</script>

<div class="desktop">
  <div class="wallpaper" style="background-image: {wallpaper ? `url(${wallpaper})` : `linear-gradient(180deg,#0b0f15,#1b2430)`}" />

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
    <!-- 1. Applications -->
    <button class="dock-item" title="Applications" on:click={() => handleDockClick('projects', openApplications)}>
      <img src="/references/icons/applications-all-symbolic.svg" alt="applications" />
      <span class="dock-label">Applications</span>
      {#if showProjects && minimizedApps.projects}
        <span class="dock-dot"></span>
      {/if}
    </button>

    <!-- 2. Firefox -->
    <button class="dock-item" title="Firefox" on:click={() => handleDockClick('firefox', () => (showFirefox = true))}>
      <img src="/references/firefox-icon.svg" alt="firefox" />
      <span class="dock-label">Firefox</span>
      {#if showFirefox && minimizedApps.firefox}
        <span class="dock-dot"></span>
      {/if}
    </button>

    <!-- 3. File Manager -->
    <button class="dock-item" title="Files" on:click={() => handleDockClick('files', openFiles)}>
      <img src="/references/icons/folder.svg" alt="files" />
      <span class="dock-label">Files</span>
      {#if showFiles && minimizedApps.files}
        <span class="dock-dot"></span>
      {/if}
    </button>

    <!-- 4. Terminal -->
    <button class="dock-item" title="Terminal" on:click={() => handleDockClick('terminal', openTerminal)}>
      <img src="/references/icons/terminal.svg" alt="terminal" />
      <span class="dock-label">Terminal</span>
      {#if showTerminal && minimizedApps.terminal}
        <span class="dock-dot"></span>
      {/if}
    </button>
  </div>

  <!-- keep panel for quick toggles but visually minimal -->
  <Panel on:openTerminal={openTerminal} on:toggleTheme={toggleTheme} on:openWallpaper={openWallpaperPicker} />

  {#if showTerminal}
    <Window title="Terminal" appId="terminal" minimized={minimizedApps.terminal} on:close={() => (showTerminal = false)} on:minimize={handleMinimize}>
      <Terminal />
    </Window>
  {/if}

  {#if showProjects}
    <Window title="Projects" appId="projects" minimized={minimizedApps.projects} on:close={() => (showProjects = false)} on:minimize={handleMinimize}>
      <Projects />
    </Window>
  {/if}

  {#if showWallpaperPicker}
    <Window title="Wallpapers" on:close={() => (showWallpaperPicker = false)}>
      <WallpaperPicker on:select={onWallpaperSelect} on:close={() => (showWallpaperPicker = false)} />
    </Window>
  {/if}

  {#if showFirefox}
    <Window title="Firefox" appId="firefox" minimized={minimizedApps.firefox} on:close={() => (showFirefox = false)} on:minimize={handleMinimize}>
      <Firefox />
    </Window>
  {/if}

  {#if showFiles}
    <Window title="Files" appId="files" minimized={minimizedApps.files} on:close={() => (showFiles = false)} on:minimize={handleMinimize}>
      <FileManager />
    </Window>
  {/if}
</div>