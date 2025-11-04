<script>
  import '../styles/Settings.css';
  import { settings, defaultWallpapers } from '../lib/settingsStore';
  import { onMount } from 'svelte';

  export let onClose = () => {};

  let currentSettings = {};
  let activeCategory = 'appearance';
  let searchQuery = '';
  let isRecordingShortcut = null;

  // Subscribe to settings store
  settings.subscribe(s => {
    currentSettings = s;
  });

  // Categories configuration
  const categories = [
    {
      id: 'appearance',
      name: 'Appearance',
      icon: '◐',
      section: 'Hardware'
    },
    {
      id: 'window-desktop',
      name: 'Window & Desktop',
      icon: '▢',
      section: 'Hardware'
    },
    {
      id: 'files-storage',
      name: 'Files & Storage',
      icon: '⬢',
      section: 'System'
    },
    {
      id: 'terminal',
      name: 'Terminal & Shortcuts',
      icon: '▶',
      section: 'System'
    },
    {
      id: 'privacy',
      name: 'Privacy & Sync',
      icon: '◆',
      section: 'System'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      icon: '◉',
      section: 'Other'
    },
    {
      id: 'about',
      name: 'About / Reset',
      icon: 'ⓘ',
      section: 'Other'
    }
  ];

  // Group categories by section
  const categoriesBySection = categories.reduce((acc, cat) => {
    if (!acc[cat.section]) acc[cat.section] = [];
    acc[cat.section].push(cat);
    return acc;
  }, {});

  // Theme management
  let newThemeName = '';
  let newThemeColors = {
    accent: '#3498db',
    background: '#1e272e',
    text: '#ecf0f1'
  };
  let showCustomColorPicker = false;

  // Color presets matching desktop (exact colors from desktop.css)
  const navColors = [
    'rgb(30, 137, 187)',   // --theme-col-1: Blue
    'rgb(103, 103, 103)',  // --theme-col-2: Gray
    'rgb(76, 88, 91)',     // --theme-col-3: Dark teal
    'rgb(128, 210, 171)'   // --theme-col-4: Green
  ];

  function setNavColor(index) {
    settings.updateSetting('appearance', 'navColorIndex', index);
    // Save to localStorage and dispatch event for Desktop to apply the theme
    localStorage.setItem('navIdx', String(index));
    window.dispatchEvent(new CustomEvent('navColorChange', { detail: index }));
  }

  function setCustomColor(color) {
    settings.updateSetting('appearance', 'customColor', color);
    settings.updateSetting('appearance', 'navColorIndex', 4); // Use index 4 for custom
    // Save custom color to localStorage
    localStorage.setItem('customNavColor', color);
    localStorage.setItem('navIdx', '4');
    
    // Convert hex to RGB format for Desktop's parseRgba function
    const rgb = hexToRgb(color);
    if (rgb) {
      const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      document.documentElement.style.setProperty('--theme-col-5', rgbString);
      
      // Small delay to ensure CSS is updated before Desktop reads it
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navColorChange', { detail: 4 }));
      }, 10);
    }
  }

  // Helper function to convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function updateTheme(value) {
    settings.updateSetting('appearance', 'theme', value);
  }

  function updateWallpaper(url) {
    settings.updateSetting('appearance', { wallpaper: { ...currentSettings.appearance.wallpaper, current: url } });
    // Apply wallpaper immediately
    localStorage.setItem('wallpaper', url);
    // Dispatch event for Desktop to update
    window.dispatchEvent(new CustomEvent('wallpaperChange', { detail: url }));
  }

  function updateWallpaperFit(fit) {
    settings.updateSetting('appearance', { wallpaper: { ...currentSettings.appearance.wallpaper, fit } });
  }

  function toggleWallpaperRotation() {
    settings.updateSetting('appearance', { 
      wallpaper: { 
        ...currentSettings.appearance.wallpaper, 
        rotation: !currentSettings.appearance.wallpaper.rotation 
      } 
    });
  }

  function updateFontSize(size) {
    settings.updateSetting('appearance', 'fontSize', size);
    // Apply font size globally
    const sizeMap = {
      small: '13px',
      default: '14px',
      large: '16px'
    };
    document.documentElement.style.setProperty('--global-font-size', sizeMap[size] || '14px');
  }

  function updateFontColor(color) {
    settings.updateSetting('appearance', 'fontColor', color);
    // Apply font color globally
    const colorValue = color === 'white' ? '#ecf0f1' : '#1a1a1a';
    document.documentElement.style.setProperty('--global-font-color', colorValue);
  }

  function saveCustomTheme() {
    if (!newThemeName.trim()) return;
    
    const theme = {
      id: Date.now().toString(),
      name: newThemeName,
      colors: { ...newThemeColors }
    };
    
    settings.addCustomTheme(theme);
    newThemeName = '';
  }

  function selectCustomTheme(themeId) {
    settings.updateSetting('appearance', 'selectedCustomTheme', themeId);
    settings.updateSetting('appearance', 'theme', 'custom');
  }

  function deleteCustomTheme(themeId) {
    settings.removeCustomTheme(themeId);
  }

  // Window & Desktop settings
  function toggleSetting(category, key) {
    const currentValue = currentSettings[category][key];
    settings.updateSetting(category, key, !currentValue);
  }

  // Files & Storage
  function updateFileLimit(value) {
    settings.updateSetting('filesStorage', 'perFileLimit', parseInt(value));
  }

  function updateStorageQuota(value) {
    settings.updateSetting('filesStorage', 'totalQuota', parseInt(value));
  }

  function toggleFileType(type) {
    const current = [...currentSettings.filesStorage.allowedFileTypes];
    const index = current.indexOf(type);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(type);
    }
    
    settings.updateSetting('filesStorage', 'allowedFileTypes', current);
  }

  function clearLocalData() {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.clear();
      settings.reset();
      alert('Local data cleared successfully!');
    }
  }

  // Terminal & Shortcuts
  function updateShellBehavior(value) {
    settings.updateSetting('terminal', 'shellBehavior', value);
  }

  function startRecordingShortcut(key) {
    isRecordingShortcut = key;
  }

  function handleKeyPress(event) {
    if (!isRecordingShortcut) return;
    
    event.preventDefault();
    const keys = [];
    
    if (event.ctrlKey) keys.push('Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    if (event.metaKey) keys.push('Super');
    
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      keys.push(key);
    }
    
    if (keys.length > 1) {
      const shortcut = keys.join('+');
      const shortcuts = { ...currentSettings.terminal.shortcuts };
      shortcuts[isRecordingShortcut] = shortcut;
      settings.updateSetting('terminal', 'shortcuts', shortcuts);
      isRecordingShortcut = null;
    }
  }

  function resetShortcuts() {
    if (confirm('Reset all shortcuts to defaults?')) {
      settings.updateSetting('terminal', 'shortcuts', {
        openTerminal: 'Ctrl+Alt+T',
        openFileManager: 'Ctrl+Alt+F',
        openApplications: 'Ctrl+Alt+A',
        openSettings: 'Ctrl+Alt+S',
        openWallpaper: 'Ctrl+Alt+W',
        openMenu: 'Super/Win',
        clearTerminal: 'Ctrl+L'
      });
    }
  }

  // Import/Export
  function exportSettings() {
    const json = settings.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linuxos-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = settings.import(event.target.result);
        if (success) {
          alert('Settings imported successfully!');
        } else {
          alert('Failed to import settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      settings.reset();
      alert('Settings reset successfully!');
    }
  }

  onMount(() => {
    // Apply saved font settings on mount
    if (currentSettings.appearance) {
      const sizeMap = {
        small: '13px',
        default: '14px',
        large: '16px'
      };
      const fontSize = currentSettings.appearance.fontSize || 'default';
      const fontColor = currentSettings.appearance.fontColor || 'white';
      
      document.documentElement.style.setProperty('--global-font-size', sizeMap[fontSize]);
      document.documentElement.style.setProperty('--global-font-color', fontColor === 'white' ? '#ecf0f1' : '#1a1a1a');
    }
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  const fileTypes = [
    { id: 'image', label: 'Images (jpg, png, gif, webp)' },
    { id: 'video', label: 'Videos (mp4, webm, avi)' },
    { id: 'audio', label: 'Audio (mp3, wav, ogg)' },
    { id: 'document', label: 'Documents (pdf, txt, docx)' },
    { id: 'archive', label: 'Archives (zip, tar, gz)' },
    { id: 'code', label: 'Code (js, py, html, css)' }
  ];
</script>

<div class="settings-window" on:contextmenu|stopPropagation|preventDefault>
  <!-- Header -->
  <div class="settings-header">
    <div class="settings-title">
      <span>⚙</span>
      Settings
    </div>
    
    <div class="settings-actions">
      <div class="settings-search">
        <span class="settings-search-icon">⌕</span>
        <input 
          type="text" 
          placeholder="Search settings..."
          bind:value={searchQuery}
        />
      </div>
      
      <div class="settings-header-buttons">
        <button class="settings-header-btn" on:click={() => {}}>Help</button>
        <button class="settings-header-btn" on:click={onClose}>Close</button>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="settings-content">
    <!-- Sidebar -->
    <div class="settings-sidebar">
      {#each Object.entries(categoriesBySection) as [section, cats]}
        <div class="settings-category-section">
          <div class="settings-category-header">{section}</div>
          {#each cats as category}
            <div 
              class="settings-category-item"
              class:active={activeCategory === category.id}
              on:click={() => activeCategory = category.id}
            >
              <div class="settings-category-icon">{category.icon}</div>
              <div class="settings-category-name">{category.name}</div>
            </div>
          {/each}
        </div>
      {/each}
    </div>

    <!-- Main Content -->
    <div class="settings-main">
      
      <!-- APPEARANCE -->
      {#if activeCategory === 'appearance'}
        <div class="settings-section">
          <div class="settings-section-title">◐ Appearance</div>
          <div class="settings-section-description">
            Customize the look and feel of your desktop environment
          </div>

          <div class="settings-grid">
            <!-- Theme Color Selection -->
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Theme Color</div>
                <div class="settings-item-description">Choose a preset color or customize your own</div>
              </div>
              <div class="settings-item-control">
                <div class="nav-colors">
                  {#each navColors as color, i}
                    <button
                      class="nav-dot"
                      class:active={currentSettings.appearance.navColorIndex === i}
                      style="background: {color};"
                      on:click={() => setNavColor(i)}
                      title="Preset {i + 1}"
                    ></button>
                  {/each}
                  <button
                    class="nav-dot custom-dot"
                    class:active={currentSettings.appearance.navColorIndex === 4}
                    on:click={() => {
                      showCustomColorPicker = !showCustomColorPicker;
                      if (showCustomColorPicker) {
                        settings.updateSetting('appearance', 'navColorIndex', 4);
                      }
                    }}
                    title="Custom Color"
                  >
                    <span style="background: {currentSettings.appearance.customColor};"></span>
                  </button>
                </div>
                {#if showCustomColorPicker}
                  <div class="custom-color-picker">
                    <input
                      type="color"
                      value={currentSettings.appearance.customColor}
                      on:input={(e) => setCustomColor(e.target.value)}
                    />
                    <span class="color-value">{currentSettings.appearance.customColor}</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Font Color -->
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Font Color</div>
                <div class="settings-item-description">Set global font color for text</div>
              </div>
              <div class="settings-item-control">
                <div class="radio-group">
                  <div 
                    class="radio-option" 
                    class:active={currentSettings.appearance.fontColor === 'white'}
                    on:click={() => updateFontColor('white')}
                  >
                    <div class="radio-dot"></div>
                    White
                  </div>
                  <div 
                    class="radio-option" 
                    class:active={currentSettings.appearance.fontColor === 'black'}
                    on:click={() => updateFontColor('black')}
                  >
                    <div class="radio-dot"></div>
                    Black
                  </div>
                </div>
              </div>
            </div>

            <!-- Font Size -->
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Font Size</div>
                <div class="settings-item-description">Adjust the system font size</div>
              </div>
              <div class="settings-item-control">
                <div class="radio-group">
                  <div 
                    class="radio-option" 
                    class:active={currentSettings.appearance.fontSize === 'small'}
                    on:click={() => updateFontSize('small')}
                  >
                    <div class="radio-dot"></div>
                    Small
                  </div>
                  <div 
                    class="radio-option" 
                    class:active={currentSettings.appearance.fontSize === 'default'}
                    on:click={() => updateFontSize('default')}
                  >
                    <div class="radio-dot"></div>
                    Default
                  </div>
                  <div 
                    class="radio-option" 
                    class:active={currentSettings.appearance.fontSize === 'large'}
                    on:click={() => updateFontSize('large')}
                  >
                    <div class="radio-dot"></div>
                    Large
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Wallpaper Section -->
          <div style="margin-top: 32px;">
            <h3 style="font-size: 16px; margin-bottom: 12px;">Wallpaper</h3>
            
            <div class="wallpaper-grid">
              {#each defaultWallpapers as wallpaper}
                <div 
                  class="wallpaper-item"
                  class:active={currentSettings.appearance.wallpaper.current === wallpaper.url}
                  on:click={() => updateWallpaper(wallpaper.url)}
                >
                  <img src={wallpaper.url} alt={wallpaper.name} on:error={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3C/svg%3E'} />
                  <div class="wallpaper-item-name">{wallpaper.name}</div>
                </div>
              {/each}
            </div>

            <div class="settings-grid" style="margin-top: 16px;">
              <div class="settings-item">
                <div class="settings-item-info">
                  <div class="settings-item-label">Wallpaper Fit</div>
                  <div class="settings-item-description">How the wallpaper should be displayed</div>
                </div>
                <div class="settings-item-control">
                  <select 
                    class="settings-select"
                    value={currentSettings.appearance.wallpaper.fit}
                    on:change={(e) => updateWallpaperFit(e.target.value)}
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="stretch">Stretch</option>
                    <option value="center">Center</option>
                    <option value="tile">Tile</option>
                  </select>
                </div>
              </div>

              <div class="settings-item">
                <div class="settings-item-info">
                  <div class="settings-item-label">Wallpaper Rotation</div>
                  <div class="settings-item-description">Automatically change wallpaper every {currentSettings.appearance.wallpaper.rotationInterval} minutes</div>
                </div>
                <div class="settings-item-control">
                  <div 
                    class="toggle-switch"
                    class:active={currentSettings.appearance.wallpaper.rotation}
                    on:click={toggleWallpaperRotation}
                  >
                    <div class="toggle-switch-handle"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- WINDOW & DESKTOP -->
      {#if activeCategory === 'window-desktop'}
        <div class="settings-section">
          <div class="settings-section-title">▢ Window & Desktop</div>
          <div class="settings-section-description">
            Configure window behavior and desktop organization
          </div>

          <div class="settings-grid">
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Tiling Mode</div>
                <div class="settings-item-description">Automatically organize windows in a grid layout</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.windowDesktop.tilingMode}
                  on:click={() => toggleSetting('windowDesktop', 'tilingMode')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Snap to Edges</div>
                <div class="settings-item-description">Windows snap to screen edges when dragged near them</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.windowDesktop.snapToEdges}
                  on:click={() => toggleSetting('windowDesktop', 'snapToEdges')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Window Animations</div>
                <div class="settings-item-description">Enable smooth animations when opening/closing windows</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.windowDesktop.windowAnimations}
                  on:click={() => toggleSetting('windowDesktop', 'windowAnimations')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Auto-arrange Desktop Icons</div>
                <div class="settings-item-description">Automatically organize desktop icons in a grid</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.windowDesktop.autoArrangeIcons}
                  on:click={() => toggleSetting('windowDesktop', 'autoArrangeIcons')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- FILES & STORAGE -->
      {#if activeCategory === 'files-storage'}
        <div class="settings-section">
          <div class="settings-section-title">⬢ Files & Storage</div>
          <div class="settings-section-description">
            Manage file upload limits and storage quotas
          </div>

          <div class="settings-grid">
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Per-File Upload Limit</div>
                <div class="settings-item-description">Maximum size for individual file uploads</div>
              </div>
              <div class="settings-item-control">
                <select 
                  class="settings-select"
                  value={currentSettings.filesStorage.perFileLimit}
                  on:change={(e) => updateFileLimit(e.target.value)}
                >
                  <option value="5">5 MB</option>
                  <option value="10">10 MB</option>
                  <option value="25">25 MB</option>
                  <option value="50">50 MB</option>
                  <option value="100">100 MB</option>
                </select>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Total Storage Quota</div>
                <div class="settings-item-description">Maximum total storage allowed</div>
              </div>
              <div class="settings-item-control">
                <select 
                  class="settings-select"
                  value={currentSettings.filesStorage.totalQuota}
                  on:change={(e) => updateStorageQuota(e.target.value)}
                >
                  <option value="50">50 MB</option>
                  <option value="100">100 MB</option>
                  <option value="250">250 MB</option>
                  <option value="500">500 MB</option>
                  <option value="1000">1 GB</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Storage Info -->
          <div class="storage-info">
            <h4 style="font-size: 14px; margin-bottom: 8px;">Storage Usage</h4>
            <div class="storage-bar">
              <div 
                class="storage-bar-fill" 
                style="width: {(currentSettings.filesStorage.usedStorage / currentSettings.filesStorage.totalQuota) * 100}%"
              ></div>
            </div>
            <div class="storage-details">
              <span>{currentSettings.filesStorage.usedStorage} MB used</span>
              <span>{currentSettings.filesStorage.totalQuota} MB total</span>
            </div>
          </div>

          <!-- Allowed File Types -->
          <div style="margin-top: 24px;">
            <h4 style="font-size: 14px; margin-bottom: 12px;">Allowed File Types</h4>
            <div class="checkbox-list">
              {#each fileTypes as type}
                <div class="checkbox-item" on:click={() => toggleFileType(type.id)}>
                  <div class="checkbox" class:checked={currentSettings.filesStorage.allowedFileTypes.includes(type.id)}>
                    <span class="checkbox-icon">✓</span>
                  </div>
                  <span style="font-size: 13px;">{type.label}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Clear Data Button -->
          <div style="margin-top: 24px;">
            <button class="settings-button danger" on:click={clearLocalData}>
              🗑️ Clear All Local Data
            </button>
            <div class="info-box warning" style="margin-top: 12px;">
              Warning: This will permanently delete all locally stored files and settings.
            </div>
          </div>
        </div>
      {/if}

      <!-- TERMINAL & SHORTCUTS -->
      {#if activeCategory === 'terminal'}
        <div class="settings-section">
          <div class="settings-section-title">▶ Terminal & Shortcuts</div>
          <div class="settings-section-description">
            Configure terminal behavior and keyboard shortcuts
          </div>

          <div class="settings-grid">
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Shell Behavior</div>
                <div class="settings-item-description">Choose the terminal shell implementation</div>
              </div>
              <div class="settings-item-control">
                <div class="radio-group">
                  <div 
                    class="radio-option" 
                    class:active={currentSettings.terminal.shellBehavior === 'pseudo'}
                    on:click={() => updateShellBehavior('pseudo')}
                  >
                    <div class="radio-dot"></div>
                    Pseudo Shell
                  </div>
                  <div 
                    class="radio-option" 
                    class:active={currentSettings.terminal.shellBehavior === 'advanced'}
                    on:click={() => updateShellBehavior('advanced')}
                  >
                    <div class="radio-dot"></div>
                    Advanced (WASM)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts -->
          <div style="margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 14px;">Keyboard Shortcuts</h4>
              <button class="settings-button" on:click={resetShortcuts}>
                Reset to Defaults
              </button>
            </div>

            <div class="shortcut-editor">
              {#each Object.entries(currentSettings.terminal.shortcuts) as [key, value]}
                <div class="shortcut-row">
                  <span class="shortcut-name">
                    {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                  </span>
                  <div 
                    class="shortcut-key"
                    on:click={() => startRecordingShortcut(key)}
                  >
                    {isRecordingShortcut === key ? 'Press keys...' : value}
                  </div>
                </div>
              {/each}
            </div>

            <div class="info-box" style="margin-top: 12px;">
              Click on a shortcut to record a new key combination. Press ESC to cancel.
            </div>
          </div>
        </div>
      {/if}

      <!-- PRIVACY & SYNC -->
      {#if activeCategory === 'privacy'}
        <div class="settings-section">
          <div class="settings-section-title">◆ Privacy & Sync</div>
          <div class="settings-section-description">
            Control data storage and synchronization
          </div>

          <div class="settings-grid">
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Local-Only Mode</div>
                <div class="settings-item-description">All files remain in browser storage only</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.privacy.localOnlyMode}
                  on:click={() => toggleSetting('privacy', 'localOnlyMode')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Server Sync</div>
                <div class="settings-item-description">Enable file synchronization with server</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.privacy.serverSync}
                  on:click={() => toggleSetting('privacy', 'serverSync')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Analytics</div>
                <div class="settings-item-description">Help improve the OS by sharing anonymous usage data</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.privacy.analyticsEnabled}
                  on:click={() => toggleSetting('privacy', 'analyticsEnabled')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-box" style="margin-top: 16px;">
            {#if currentSettings.privacy.localOnlyMode}
              <strong>Local-Only Mode Active:</strong> Your files are stored only in your browser's local storage. 
              They will not be uploaded to any server and will be lost if you clear browser data.
            {:else}
              <strong>Server Sync Enabled:</strong> Files can be uploaded to and synchronized with the server. 
              A server connection is required for this feature to work.
            {/if}
          </div>
        </div>
      {/if}

      <!-- ACCESSIBILITY -->
      {#if activeCategory === 'accessibility'}
        <div class="settings-section">
          <div class="settings-section-title">◉ Accessibility</div>
          <div class="settings-section-description">
            Make the system more accessible
          </div>

          <div class="settings-grid">
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">High Contrast</div>
                <div class="settings-item-description">Increase contrast for better visibility</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.accessibility.highContrast}
                  on:click={() => toggleSetting('accessibility', 'highContrast')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Reduced Motion</div>
                <div class="settings-item-description">Minimize animations and transitions</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.accessibility.reducedMotion}
                  on:click={() => toggleSetting('accessibility', 'reducedMotion')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Keyboard Focus Outlines</div>
                <div class="settings-item-description">Show focus indicators for keyboard navigation</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.accessibility.keyboardFocusOutlines}
                  on:click={() => toggleSetting('accessibility', 'keyboardFocusOutlines')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Screen Reader Mode</div>
                <div class="settings-item-description">Optimize interface for screen readers</div>
              </div>
              <div class="settings-item-control">
                <div 
                  class="toggle-switch"
                  class:active={currentSettings.accessibility.screenReaderMode}
                  on:click={() => toggleSetting('accessibility', 'screenReaderMode')}
                >
                  <div class="toggle-switch-handle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- ABOUT / RESET -->
      {#if activeCategory === 'about'}
        <div class="settings-section">
          <div class="settings-section-title">ⓘ About / Reset</div>
          <div class="settings-section-description">
            System information and settings management
          </div>

          <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 18px; margin-bottom: 12px;">Linux Web OS</h3>
            <div style="display: grid; gap: 8px; font-size: 13px; color: #95a5a6;">
              <div><strong>Version:</strong> 1.0.0</div>
              <div><strong>Build:</strong> 2025.11.04</div>
              <div><strong>Engine:</strong> Svelte + Vite</div>
              <div><strong>License:</strong> MIT</div>
            </div>
          </div>

          <div style="display: grid; gap: 12px;">
            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Export Settings</div>
                <div class="settings-item-description">Download your settings as a JSON file</div>
              </div>
              <div class="settings-item-control">
                <button class="settings-button" on:click={exportSettings}>
                  ↓ Export
                </button>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Import Settings</div>
                <div class="settings-item-description">Load settings from a JSON file</div>
              </div>
              <div class="settings-item-control">
                <button class="settings-button" on:click={importSettings}>
                  ↑ Import
                </button>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-item-info">
                <div class="settings-item-label">Reset to Defaults</div>
                <div class="settings-item-description">Restore all settings to their default values</div>
              </div>
              <div class="settings-item-control">
                <button class="settings-button danger" on:click={resetAllSettings}>
                  ↻ Reset All
                </button>
              </div>
            </div>
          </div>

          <div class="info-box warning" style="margin-top: 16px;">
            <strong>Warning:</strong> Resetting settings cannot be undone. Consider exporting your current settings first.
          </div>
        </div>
      {/if}

    </div>
  </div>
</div>
