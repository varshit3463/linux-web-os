import { writable } from 'svelte/store';

// Default wallpapers (8 Arch-inspired presets)
const defaultWallpapers = [
  { id: 'archwaveinv', name: 'Arch Wave Inverted', url: '/references/icons/wallpapers/archwaveinv.png' },
  { id: 'awesome', name: 'Awesome', url: '/references/icons/wallpapers/awesome.png' },
  { id: 'mountain', name: 'Mountain', url: '/references/icons/wallpapers/mountain.png' },
  { id: 'reflected', name: 'Reflected', url: '/references/icons/wallpapers/reflected.png' },
  { id: 'split', name: 'Split', url: '/references/icons/wallpapers/split.png' },
  { id: 'sunset', name: 'Sunset', url: '/references/icons/wallpapers/sunset.png' },
  { id: 'svalbard', name: 'Svalbard', url: '/references/icons/wallpapers/svalbard.png' },
  { id: 'wave', name: 'Wave', url: '/references/icons/wallpapers/wave.png' }
];

// Default settings
const defaultSettings = {
  // Appearance
  appearance: {
    theme: 'dark', // 'dark' | 'light' | 'custom'
    navColorIndex: 0, // 0-3 for the 4 preset colors, or 'custom'
    customColor: '#3498db', // Custom theme color
    customThemes: [],
    selectedCustomTheme: null,
    wallpaper: {
      current: defaultWallpapers[0].url,
      fit: 'cover', // 'cover' | 'contain' | 'stretch' | 'center' | 'tile'
      rotation: false,
      rotationInterval: 30 // minutes
    },
    fontSize: 'default', // 'small' | 'default' | 'large'
    fontColor: 'white' // 'white' | 'black'
  },

  // Window & Desktop
  windowDesktop: {
    tilingMode: false,
    snapToEdges: true,
    windowAnimations: true,
    autoArrangeIcons: false
  },

  // Files & Storage
  filesStorage: {
    perFileLimit: 10, // MB
    totalQuota: 100, // MB
    allowedFileTypes: ['image', 'video', 'audio', 'document', 'archive', 'code'],
    usedStorage: 0 // MB
  },

  // Terminal & Shortcuts
  terminal: {
    shellBehavior: 'pseudo', // 'pseudo' | 'advanced'
    shortcuts: {
      openTerminal: 'Ctrl+Alt+T',
      openFileManager: 'Ctrl+Alt+F',
      openApplications: 'Ctrl+Alt+A',
      openSettings: 'Ctrl+Alt+S',
      openWallpaper: 'Ctrl+Alt+W',
      openMenu: 'Super/Win',
      clearTerminal: 'Ctrl+L'
    }
  },

  // Privacy & Sync
  privacy: {
    localOnlyMode: true,
    serverSync: false,
    analyticsEnabled: false
  },

  // Accessibility
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    keyboardFocusOutlines: true,
    screenReaderMode: false
  }
};

// Load settings from localStorage
const loadSettings = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('linuxos-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new settings are included
        return mergeDeep(defaultSettings, parsed);
      } catch (e) {
        console.error('Failed to parse settings:', e);
        return defaultSettings;
      }
    }
  }
  return defaultSettings;
};

// Deep merge helper
function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Create the store
function createSettingsStore() {
  const { subscribe, set, update } = writable(loadSettings());

  return {
    subscribe,
    set,
    update,

    // Update a specific setting
    updateSetting: (category, key, value) => {
      update(settings => {
        const newSettings = { ...settings };
        if (typeof key === 'string') {
          newSettings[category][key] = value;
        } else if (typeof key === 'object') {
          newSettings[category] = { ...newSettings[category], ...key };
        }
        // Auto-save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('linuxos-settings', JSON.stringify(newSettings));
        }
        return newSettings;
      });
    },

    // Save settings to localStorage
    save: () => {
      update(settings => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('linuxos-settings', JSON.stringify(settings));
        }
        return settings;
      });
    },

    // Reset to defaults
    reset: () => {
      set(defaultSettings);
      if (typeof window !== 'undefined') {
        localStorage.setItem('linuxos-settings', JSON.stringify(defaultSettings));
      }
    },

    // Export settings as JSON
    export: () => {
      let currentSettings;
      update(s => {
        currentSettings = s;
        return s;
      });
      return JSON.stringify(currentSettings, null, 2);
    },

    // Import settings from JSON
    import: (jsonString) => {
      try {
        const imported = JSON.parse(jsonString);
        const merged = mergeDeep(defaultSettings, imported);
        set(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem('linuxos-settings', JSON.stringify(merged));
        }
        return true;
      } catch (e) {
        console.error('Failed to import settings:', e);
        return false;
      }
    },

    // Add custom theme
    addCustomTheme: (theme) => {
      update(settings => {
        const newSettings = { ...settings };
        newSettings.appearance.customThemes.push(theme);
        // Auto-save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('linuxos-settings', JSON.stringify(newSettings));
        }
        return newSettings;
      });
    },

    // Remove custom theme
    removeCustomTheme: (themeId) => {
      update(settings => {
        const newSettings = { ...settings };
        newSettings.appearance.customThemes = newSettings.appearance.customThemes.filter(
          t => t.id !== themeId
        );
        if (newSettings.appearance.selectedCustomTheme === themeId) {
          newSettings.appearance.selectedCustomTheme = null;
          newSettings.appearance.theme = 'dark';
        }
        // Auto-save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('linuxos-settings', JSON.stringify(newSettings));
        }
        return newSettings;
      });
    }
  };
}

export const settings = createSettingsStore();
export { defaultWallpapers };
