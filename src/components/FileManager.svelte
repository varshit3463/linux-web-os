<script>
  import { onMount } from 'svelte';
  import '../styles/FileManager.css';

  const API_URL = 'http://localhost:3001/api';

  // Props
  export let initialFolderId = null;

  let fileSystem = null;
  let currentFolderId = initialFolderId;
  let loading = true;
  let error = null;
  let newItemName = '';
  let showNewFolderInput = false;
  let contextMenu = null;
  let selectedItemId = null;

  const shortcuts = [
    { id: 'computer', label: 'Computer', icon: '/references/icons/filemanager/computer.png' },
    { id: 'liveuser', label: 'liveuser', icon: '/references/icons/filemanager/live-user.png' },
    { id: 'desktop', label: 'Desktop', icon: '/references/icons/filemanager/desktop.png' },
    { id: 'recent', label: 'Recent', icon: '/references/icons/filemanager/recent.png' },
    { id: 'trash', label: 'Trash', icon: '/references/icons/filemanager/trash.png' },
    { id: 'documents', label: 'Documents', icon: '/references/icons/filemanager/document.png' },
    { id: 'music', label: 'Music', icon: '/references/icons/filemanager/music.png' },
    { id: 'pictures', label: 'Pictures', icon: '/references/icons/filemanager/picture.png' },
    { id: 'videos', label: 'Videos', icon: '/references/icons/filemanager/movies.png' },
    { id: 'downloads', label: 'Downloads', icon: '/references/icons/filemanager/downloads.png' }
  ];

  // --- Reactive State ---
  $: currentFolder = fileSystem ? findNodeById(currentFolderId, fileSystem) : null;
  $: folderContents = currentFolder?.children || [];
  $: path = fileSystem ? getPathById(currentFolderId, fileSystem) : [];
  $: pathDisplay = path ? path.map((f) => f.name).join(' / ') : '';
  $: statusInfo = `${folderContents.length} items`;
  $: canNavigateBack = path && path.length > 1;

  // --- Helper Functions ---
  const normalize = (value) => value?.toString().toLowerCase().replace(/[\s_-]+/g, '');

  function findNodeById(id, node) {
    if (!node) return null;
    if (String(node.id) === String(id)) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(id, child);
        if (found) return found;
      }
    }
    return null;
  }

  function findNodeByName(name, node) {
    if (!node) return null;
    if (node.name && normalize(node.name) === normalize(name)) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByName(name, child);
        if (found) return found;
      }
    }
    return null;
  }

  function getPathById(id, node, currentPath = []) {
    if (node.id === id) {
      return [...currentPath, node];
    }
    if (node.children) {
      for (const child of node.children) {
        const result = getPathById(id, child, [...currentPath, node]);
        if (result) return result;
      }
    }
    return null;
  }

  function getFolderIcon(folderName) {
    const name = folderName.toLowerCase();
  if (name.includes('computer')) return '/references/icons/filemanager/computer.png';
  if (name.includes('liveuser') || name.includes('live user')) return '/references/icons/folder-green.svg';
  if (name === 'home') return '/references/icons/folder-favorites.svg';
    if (name === 'desktop') return '/references/icons/folder-drawing.svg';
    if (name.includes('document')) return '/references/icons/folder-documents.svg';
    if (name.includes('download')) return '/references/icons/folder-downloads.svg';
    if (name.includes('music')) return '/references/icons/folder-green.svg';
    if (name.includes('picture') || name.includes('image')) return '/references/icons/folder-images.svg';
  if (name.includes('video') || name.includes('vedio')) return '/references/icons/folder-video.svg';
    if (name.includes('public')) return '/references/icons/folder-image.svg';
    if (name.includes('template')) return '/references/icons/folder-grey.svg';
    if (name.includes('game')) return '/references/icons/folder-games.svg';
    return '/references/icons/folder.svg';
  }

  // --- API Functions ---
  async function loadFileSystem() {
    try {
      loading = true;
      const response = await fetch(`${API_URL}/fs`);
      if (!response.ok) throw new Error('Failed to load filesystem');
      fileSystem = await response.json();
      if (!findNodeById(currentFolderId, fileSystem)) {
        currentFolderId = fileSystem?.id ?? null;
        const rootNode = findNodeById(currentFolderId, fileSystem);
        if (rootNode?.children?.length === 1) {
          currentFolderId = rootNode.children[0].id;
        }
      }
      error = null;
    } catch (err) {
      error = err.message;
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function createFolder() {
    if (!newItemName.trim()) return;
    try {
      const response = await fetch(`${API_URL}/fs/folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: currentFolderId, name: newItemName.trim() }),
      });
      if (!response.ok) throw new Error('Failed to create folder');
      await loadFileSystem(); // Reload to get new structure
      newItemName = '';
      showNewFolderInput = false;
    } catch (err) {
      error = err.message;
      console.error(err);
    }
  }

  async function deleteItem(itemId) {
    if (!itemId) return;
    try {
      const response = await fetch(`${API_URL}/fs/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      await loadFileSystem(); // Reload
      selectedItemId = null; // Deselect after deleting
      contextMenu = null;
    } catch (err) {
      error = err.message;
      console.error(err);
    }
  }

  // --- Navigation Functions ---
  function openFolder(folder) {
    if (folder.type === 'folder') {
      currentFolderId = folder.id;
    }
  }

  function openSelectedItem() {
    if (selectedItemId) {
      const itemToOpen = findNodeById(selectedItemId, fileSystem);
      if (itemToOpen && itemToOpen.type === 'folder') {
        openFolder(itemToOpen);
      }
    }
    closeContextMenu();
  }

  function navigateBack() {
    if (canNavigateBack) {
      const parent = path[path.length - 2];
      currentFolderId = parent.id;
    }
  }

  function resolveLocationNode(locationId) {
    if (!fileSystem) return null;
    const direct = findNodeById(locationId, fileSystem);
    if (direct) return direct;

    const shortcut = shortcuts.find((s) => s.id === locationId);
    const fallbackNames = [fileSystem?.name, shortcut?.label, locationId].filter(Boolean);
    const nameMap = {
      computer: fileSystem?.name ?? 'Computer',
      liveuser: 'liveuser',
      home: 'Home',
      desktop: 'Desktop',
      recent: 'Recent',
      trash: 'Trash',
      documents: 'Documents',
      music: 'Music',
      pictures: 'Pictures',
      videos: 'Videos',
      downloads: 'Downloads'
    };
    if (nameMap[locationId]) fallbackNames.unshift(nameMap[locationId]);

    for (const candidate of fallbackNames) {
      const targetNode = findNodeByName(candidate, fileSystem);
      if (targetNode) {
        return targetNode;
      }
    }
    return null;
  }

  function navigateToLocation(locationId) {
    const targetNode = resolveLocationNode(locationId);
    if (targetNode) {
      currentFolderId = targetNode.id;
    }
  }

  function isShortcutActive(locationId) {
    if (!fileSystem || !currentFolder) return false;
    const targetNode = resolveLocationNode(locationId);
    if (!targetNode) {
      return normalize(currentFolder.name) === normalize(locationId);
    }
    if (targetNode.id === currentFolderId) return true;
    return path?.some((segment) => segment.id === targetNode.id);
  }

  // --- UI Event Handlers ---
  function handleRightClick(e, itemId) {
    e.preventDefault();
    selectedItemId = itemId;
    const mainElement = document.querySelector('.file-manager-main');
    if (!mainElement) return;
    const rect = mainElement.getBoundingClientRect();
    contextMenu = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      showNewFolderInput = false;
      newItemName = '';
      contextMenu = null;
    } else if (e.key === 'Delete' && selectedItemId) {
      deleteItem(selectedItemId);
    }
  }

  function handleInputKeydown(e) {
    if (e.key === 'Enter') {
      createFolder();
    }
  }

  onMount(loadFileSystem);

  // Handle initial folder ID changes
  $: if (fileSystem && initialFolderId && findNodeById(initialFolderId, fileSystem)) {
    currentFolderId = initialFolderId;
  }

</script>

<svelte:window on:click={closeContextMenu} on:keydown={handleKeyDown} />

<div class="file-manager" on:click={(e) => { if (e.target.classList.contains('file-manager-main') || e.target.classList.contains('fm-content')) selectedItemId = null; }}>
  <div class="fm-sidebar">
    <div class="sidebar-section">
      <div class="sidebar-title">Places</div>
      {#each shortcuts as shortcut (shortcut.id)}
        <button
          class="sidebar-item"
          class:active={isShortcutActive(shortcut.id)}
          on:click={() => navigateToLocation(shortcut.id)}
        >
          <img src={shortcut.icon} alt={shortcut.label} class="sidebar-icon" />
          <span class="sidebar-label">{shortcut.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="file-manager-main">
    {#if loading}
      <div class="loading">Loading filesystem...</div>
    {:else if error}
      <div class="error">Error: {error}</div>
    {:else if currentFolder}
      <div class="fm-toolbar">
        <div class="toolbar-left">
          <button class="nav-btn" on:click={navigateBack} disabled={!canNavigateBack} title="Go back">
            ←
          </button>
          <input type="text" class="address-bar" value={pathDisplay} readonly />
        </div>
        <div class="toolbar-right">
          <button class="action-btn" on:click={() => (showNewFolderInput = true)}>
            + Folder
          </button>
        </div>
      </div>

      {#if showNewFolderInput}
        <div class="input-container">
          <input
            type="text"
            placeholder="Folder name..."
            bind:value={newItemName}
            on:keydown={handleInputKeydown}
            autofocus
          />
          <div class="input-actions">
            <button class="create-btn" on:click={createFolder}>Create</button>
            <button class="cancel-btn" on:click={() => (showNewFolderInput = false)}>
              Cancel
            </button>
          </div>
        </div>
      {/if}

      <div class="fm-wrapper">
        <div class="fm-content">
          {#if folderContents.length === 0}
            <div class="empty-state">
              <span class="empty-icon">📁</span>
              <span class="empty-text">This folder is empty</span>
            </div>
          {:else}
            <div class="grid-container">
              {#each folderContents as item (item.id)}
                <div
                  class="grid-item"
                  class:active={selectedItemId === item.id}
                  on:click|stopPropagation={() => selectedItemId = item.id}
                  on:dblclick={() => openFolder(item)}
                  on:contextmenu={(e) => handleRightClick(e, item.id)}
                  role="button"
                  tabindex="0"
                >
                  {#if item.type === 'folder'}
                    <img src={getFolderIcon(item.name)} alt="folder" class="grid-icon" />
                  {:else}
                    <span class="grid-icon">📄</span>
                  {/if}
                  <span class="grid-label">{item.name}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="fm-statusbar">
          <span class="status-text">{statusInfo}</span>
        </div>
      </div>

      {#if contextMenu}
        <div class="context-menu" style="left: {contextMenu.x}px; top: {contextMenu.y}px;">
          <button class="ctx-item" on:click={openSelectedItem}>Open</button>
          <button class="ctx-item" on:click={() => deleteItem(selectedItemId)}>
            Delete
          </button>
          <button class="ctx-item" on:click={closeContextMenu}>Properties</button>
        </div>
      {/if}
    {/if}
  </div>
</div>
