# 🖱️ Context Menu System - Design & Features

## Overview
Right-click context menus that appear in different areas with different options, styled like Arch Linux desktop.

---

## 📍 Menu Locations & Features

### 1. **DESKTOP RIGHT-CLICK MENU** (Empty desktop space)
```
├─ 📁 Open Folder / Paste
├─ 📝 Create New Folder
├─ 📄 Create New File
├─ 🔗 Create Link
├─ 🖼️ Set as Wallpaper
├─ ─────────────────
├─ 📂 Open Terminal Here
├─ ⚙️ Preferences
└─ 🔄 Refresh
```

**Triggers when:** Right-click on empty desktop background (no icons)

---

### 2. **FILE MANAGER - EMPTY SPACE MENU** (Inside file browser, no file selected)
```
├─ 📁 Paste (if clipboard has items)
├─ ─────────────────
├─ 📝 Create New Folder
├─ 📄 Create New File
├─ ─────────────────
├─ 🔄 Refresh
├─ 📂 Open Terminal Here
└─ 📋 Properties
```

**Triggers when:** Right-click on empty area inside file manager window

---

### 3. **FILE MANAGER - FILE/FOLDER MENU** (On a file or folder)
```
├─ 📂 Open / Execute
├─ ✂️ Cut
├─ 📋 Copy
├─ 📌 Paste (if clipboard has items)
├─ ─────────────────
├─ ✏️ Rename
├─ 🗑️ Delete
├─ 🔗 Create Link
├─ ─────────────────
├─ 📂 Open Terminal Here
└─ 📄 Properties
```

**Triggers when:** Right-click on a file or folder inside file manager

---

### 4. **DOCK/APP ICON MENU** (Right-click on app icons in dock)
```
├─ ▶️ Launch / Open
├─ ─────────────────
├─ 📌 Pin to Dock / Unpin
├─ ➕ Add to Desktop
├─ ─────────────────
└─ 📄 Properties
```

**Triggers when:** Right-click on application icon in dock at bottom

---

### 5. **DESKTOP ICON SHORTCUT MENU** (Right-click on desktop icons - if added)
```
├─ ▶️ Open
├─ ✂️ Cut
├─ 📋 Copy
├─ ─────────────────
├─ ✏️ Rename
├─ 🗑️ Delete
├─ ─────────────────
└─ 📄 Properties
```

**Triggers when:** Right-click on a shortcut icon placed on desktop

---

## 🎯 Key Behaviors & Requirements

### Menu Appearance
✅ **Only one menu at a time** - If user right-clicks elsewhere, previous menu disappears and new one appears
✅ **Menu follows cursor** - Appears at exact mouse position (clientX, clientY)
✅ **Stays visible** until one of these happens:
   - User clicks a menu item (executes action, menu closes)
   - User left-clicks outside the menu (menu closes)
   - User right-clicks somewhere else (closes and opens new menu)
   - User presses ESC key (menu closes)
   - Menu item is not available (grayed out/disabled)

### Menu Re-appearance
✅ **Every right-click creates fresh menu** (never sticks or duplicates)
✅ **Context-aware** - Menu items change based on location and selection
✅ **Disabled items** - Some items gray out if not available (e.g., Paste when clipboard empty)
✅ **No memory issues** - Old menus properly cleaned up

### Menu Interactions
✅ **Mouse hover** - Item highlights with color change
✅ **Click to execute** - Perform action and close menu
✅ **ESC key** - Close menu
✅ **Left-click outside** - Close menu
✅ **Right-click while menu open** - Close current, open new menu at cursor

---

## 🔧 Technical Implementation Plan

### State Management
```javascript
let contextMenu = {
  visible: false,
  x: 0,
  y: 0,
  type: null, // 'desktop', 'fileEmpty', 'fileSelected', 'appIcon', 'desktopIcon'
  items: [],
  target: null // reference to what was right-clicked
}
```

### Event Listeners
```
1. @contextmenu on desktop → Show desktop menu
2. @contextmenu on file manager → Show appropriate menu
3. @contextmenu on dock icons → Show app menu
4. @click outside menu → Close menu
5. @keydown (ESC) → Close menu
6. @contextmenu anywhere → Replace current menu (not duplicate)
```

### Menu Components
- Single `ContextMenu.svelte` component (reusable)
- Props: `visible`, `x`, `y`, `items`, `type`
- Smart item builder functions for each location
- Proper cleanup on unmount

### Item Structure
```javascript
{
  id: 'unique-id',
  label: 'Display Name',
  icon: '📁',
  action: functionName,
  disabled: false, // grayed out if true
  separator: false // visual line if true
}
```

---

## 💡 Feature Breakdown

### Essential Features (High Priority)
1. ✅ Desktop empty-space menu
2. ✅ File manager empty-space menu
3. ✅ File manager file/folder menu
4. ✅ App icon menu
5. ✅ Menu appears at cursor
6. ✅ Menu disappears on click outside or ESC
7. ✅ Menu changes based on context
8. ✅ No duplicate/sticking menus

### Medium Priority
9. Cut/Copy/Paste functionality
10. Create new file/folder dialogs
11. Rename functionality
12. Delete with confirmation

### Nice to Have
13. Drag & drop to copy/move
14. Undo/Redo
15. Recent files
16. Favorites/Bookmarks

---

## 🎨 Visual Design (Arch Linux Aesthetic)

```
┌─────────────────────────────┐
│ 📁 Open                     │ ← Icon + Text
├─────────────────────────────┤ ← Separator
│ ✂️ Cut                       │
│ 📋 Copy                     │
│ 📌 Paste (grayed)           │ ← Disabled (grayed)
├─────────────────────────────┤
│ ✏️ Rename                    │
│ 🗑️ Delete                   │
└─────────────────────────────┘

Colors (Arch Linux Blue Theme):
- Background: Dark navy (#1a1a1a or similar)
- Border: Light blue (#5b8def or similar)
- Text: White/light gray
- Hover: Light blue highlight
- Disabled: Gray/muted
- Icons: Emoji for universal compatibility
```

---

## 📋 Implementation Checklist

### Phase 1: Core Structure
- [ ] Create single reusable `ContextMenu.svelte` component
- [ ] Add state management to Desktop component
- [ ] Add right-click event listeners
- [ ] Add click-outside and ESC listeners
- [ ] Build item builder functions for each context

### Phase 2: Desktop Menu
- [ ] Desktop empty-space right-click works
- [ ] Menu appears at cursor
- [ ] Items highlight on hover
- [ ] Click outside closes menu
- [ ] ESC closes menu
- [ ] Right-click again = new menu

### Phase 3: File Manager Integration
- [ ] Empty-space right-click in file manager
- [ ] File/folder right-click in file manager
- [ ] Context-aware menu changes
- [ ] Proper items for each scenario

### Phase 4: App Icon Menu
- [ ] Right-click on dock icons
- [ ] App-specific menu items
- [ ] Launch functionality

### Phase 5: Functionality
- [ ] Cut/Copy/Paste working
- [ ] Create file/folder dialogs
- [ ] Rename functionality
- [ ] Delete with confirmation

---

## ⚠️ Common Pitfalls to Avoid

❌ **Multiple menus stacking** - Use `if visible` in component, close previous before opening new
❌ **Menu not disappearing** - Need click-outside listener, ESC listener, and proper cleanup
❌ **Menu appearing in wrong place** - Always use `clientX`, `clientY` from event
❌ **Items not updating** - Rebuild item list based on context every time menu opens
❌ **Performance issues** - Only render menu when visible, cleanup listeners on unmount
❌ **Clipboard state** - Track clipboard in parent component, pass to menu as prop

---

## 🚀 Ready to Begin?

Should I proceed with:
1. Creating the `ContextMenu.svelte` component?
2. Adding state management to Desktop.svelte?
3. Setting up the event listeners?
4. Building the desktop menu first?

**Waiting for your approval! 👍**
