<script>
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  export let title = 'Window';
  export let initialWidth = 800;
  export let initialHeight = 600;
  export let appId = ''; // Unique identifier for the app (e.g., 'terminal', 'files', 'firefox')
  export let minimized = false; // External control of minimized state

  let pos = { x: 0, y: 0 };
  let size = { width: initialWidth, height: initialHeight };
  let dragging = false;
  let resizing = false;
  let start = { x: 0, y: 0 };
  let isMaximized = false;
  let prevPos = { x: 0, y: 0 };
  let prevSize = { width: initialWidth, height: initialHeight };

  onMount(() => {
    // Center the window on mount
    pos.x = (window.innerWidth - size.width) / 2;
    pos.y = (window.innerHeight - size.height) / 2;
  });

  function onMouseDown(e) {
    dragging = true;
    start = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (!dragging && !resizing) return;
    if (dragging) {
      pos.x = e.clientX - start.x;
      pos.y = e.clientY - start.y;
    }
    if (resizing) {
      size.width = Math.max(300, e.clientX - pos.x);
      size.height = Math.max(200, e.clientY - pos.y);
    }
  }

  function onMouseUp() {
    dragging = false;
    resizing = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  function onResizeDown(e) {
    e.preventDefault();
    resizing = true;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function minimize() {
    minimized = !minimized;
    dispatch('minimize', { minimized, appId });
  }

  function maximize() {
    const navbarHeight = 40; // Height of the top navbar
    const dockHeight = 60; // Reduced space for dock - window will be closer to bottom
    
    if (isMaximized) {
      // Restore to previous size and position
      isMaximized = false;
      pos = { ...prevPos };
      size = { ...prevSize };
    } else {
      // Save current position and size before maximizing
      prevPos = { ...pos };
      prevSize = { ...size };
      // Maximize to screen size (accounting for navbar and dock)
      isMaximized = true;
      size.width = window.innerWidth;
      size.height = window.innerHeight - navbarHeight - dockHeight;
      pos.x = 0;
      pos.y = navbarHeight;
    }
  }

  function close() {
    dispatch('close');
  }
</script>

<div
  class="window"
  class:minimized={minimized}
  style="transform:translate({pos.x}px, {pos.y}px); width:{size.width}px; height:{size.height}px; display:{minimized ? 'none' : 'flex'}"
>
  <div class="titlebar" on:mousedown|preventDefault={onMouseDown}>
    <div class="title">{title}</div>
    <div class="controls">
      <button on:click={minimize} title="Minimize" class="btn-minimize">
        <img src="/references/icons/breeze-minimize-symbolic.svg" alt="Minimize" class="icon-default" />
        <img src="/references/icons/breeze-minimize-hover-symbolic.svg" alt="Minimize" class="icon-hover" />
      </button>
      <button on:click={maximize} title="Maximize" class="btn-maximize">
        <img src="/references/icons/breeze-maximized-symbolic.svg" alt="Maximize" class="icon-default" />
        <img src="/references/icons/breeze-maximized-hover-symbolic.svg" alt="Maximize" class="icon-hover" />
      </button>
      <button on:click={close} title="Close" class="btn-close">
        <img src="/references/icons/breeze-close-symbolic.svg" alt="Close" class="icon-default" />
        <img src="/references/icons/breeze-close-hover-symbolic.svg" alt="Close" class="icon-hover" />
      </button>
    </div>
  </div>
  {#if !minimized}
    <div class="content">
      <slot />
    </div>
    <div class="resize-handle" on:mousedown={onResizeDown}></div>
  {/if}
</div>

<style>
  .window {
    position: absolute;
    background: rgba(var(--nav-base), 0.95);
    color: var(--text);
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    will-change: transform;
  }
  .window.minimized {
    height: 24px !important;
    transition: height 0.3s ease;
  }
  .titlebar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 10px;
    background: rgba(var(--nav-base), 0.95);
    cursor: grab;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    height: 24px;
    flex-shrink: 0;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  .content {
    flex: 1;
    padding: 0;
    overflow: visible;
    background: rgba(var(--nav-base), 0.85);
    min-height: 0;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  .controls {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 20px;
    transition: all 0.2s ease;
    position: relative;
  }
  button:hover {
    color: rgba(255, 255, 255, 1);
  }
  button img {
    width: 14px;
    height: 14px;
    position: absolute;
    transition: opacity 0.2s ease;
  }
  button img.icon-default {
    opacity: 1;
  }
  button img.icon-hover {
    opacity: 0;
  }
  button:hover img.icon-default {
    opacity: 0;
  }
  button:hover img.icon-hover {
    opacity: 1;
  }
  .btn-minimize:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .btn-maximize:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .btn-close:hover {
    background: transparent;
  }
  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: se-resize;
    background: transparent;
  }
</style>
