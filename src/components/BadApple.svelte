<script>
  import { onMount, onDestroy } from 'svelte';

  let frames = [];
  let audio;
  let isPlaying = false;
  let isMuted = false;
  let interval;
  let pre; // Reference to the <pre> element
  let currentTime = 0;
  let duration = 0;
  let progressBar; // Reference to progress bar element

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateProgressBar() {
    if (!audio) return;
    currentTime = audio.currentTime;
    duration = audio.duration || 0;
  }

  onMount(async () => {
    try {
      const response = await fetch('/bad-apple-frames.json');
      if (!response.ok) {
        console.error('Failed to load frames.json');
        if(pre) pre.textContent = 'Error: Could not load bad-apple-frames.json. Make sure it is in the /public folder.';
        return;
      }
      frames = await response.json();
      audio = new Audio('/bad_apple.mp3');

      const updateFrame = () => {
        const frameIndex = Math.floor(audio.currentTime * 30); 
        if (frameIndex < frames.length) {
          if (pre) {
            pre.textContent = frames[frameIndex];
          }
        }
      };

      audio.addEventListener('play', () => {
        isPlaying = true;
        interval = setInterval(() => {
          updateFrame();
          updateProgressBar();
        }, 1000 / 30); // 30 FPS
      });

      audio.addEventListener('pause', () => {
        isPlaying = false;
        clearInterval(interval);
      });

      audio.addEventListener('ended', () => {
        isPlaying = false;
        clearInterval(interval);
        if (pre) pre.textContent = frames[0];
      });

      audio.addEventListener('loadedmetadata', () => {
        duration = audio.duration;
      });

      audio.addEventListener('timeupdate', updateProgressBar);

    } catch (error) {
      console.error('Error loading Bad Apple:', error);
      if(pre) pre.textContent = `Error loading animation. \n\n${error.message}`;
    }
  });

  onDestroy(() => {
    if (audio) {
      audio.pause();
      audio.src = '';
      audio = null;
    }
    clearInterval(interval);
  });

  function handleContainerClick() {
     if (!audio || frames.length === 0) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  function togglePlay(e) {
    e.stopPropagation();
    handleContainerClick();
  }

  function toggleMute(e) {
    e.stopPropagation();
    if (!audio) return;
    isMuted = !isMuted;
    audio.muted = isMuted;
  }

  function handleProgressClick(e) {
    e.stopPropagation();
    if (!audio || !progressBar || !duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    updateProgressBar();
  }

  $: {
    const totalChars = 30;
    const progress = duration > 0 ? currentTime / duration : 0;
    const completedChars = Math.floor(progress * totalChars);
    const progressBarText = '='.repeat(completedChars) + '[]' + '-'.repeat(Math.max(0, totalChars - completedChars));
  }

</script>

<div class="bad-apple-container" on:click={handleContainerClick} on:contextmenu|stopPropagation>
  <pre bind:this={pre}>{frames[0] || 'Loading animation frames...'}</pre>
  <div class="controls">
    <button on:click={togglePlay} class="control-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
      {@html isPlaying ? '&#10074;&#10074;' : '&#9654;'}
    </button>
    <button on:click={toggleMute} class="control-btn mute-btn" aria-label={isMuted ? 'Unmute' : 'Mute'}>
      <img src="/references/icons/audio.svg" alt="Mute/Unmute" class:muted={isMuted} />
    </button>
  </div>
  <div 
    class="progress-container" 
    bind:this={progressBar}
    on:click={handleProgressClick}
    on:contextmenu|stopPropagation
  >
    <div class="progress-bar">
      {#if duration > 0}
        {@const totalChars = 30}
        {@const progress = currentTime / duration}
        {@const completedChars = Math.floor(progress * totalChars)}
        <span class="completed">{'='.repeat(completedChars)}</span><span class="cursor">[]</span><span class="remaining">{'-'.repeat(Math.max(0, totalChars - completedChars))}</span>
        <span class="time-display">[{formatTime(currentTime)}/{formatTime(duration)}]</span>
      {:else}
        <span class="remaining">{'-'.repeat(30)}[]</span>
        <span class="time-display">[0:00]</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .bad-apple-container {
    background-color: #000;
    color: #fff;
    font-family: 'Courier New', Courier, monospace;
    white-space: pre;
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    cursor: var(--cursor-pointer);
    position: relative;
  }

  pre {
    margin: 0;
    padding: 0;
    font-size: 1.3vmin;
    line-height: 0.95;
  }

  .controls {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .bad-apple-container:hover .controls {
    opacity: 1;
  }

  .control-btn {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: var(--cursor-pointer);
    transition: transform 0.2s ease;
    padding: 0;
    line-height: 1;
    filter: drop-shadow(0 0 3px rgba(0,0,0,0.7));
  }

  .control-btn:hover {
    transform: scale(1.1);
  }

  .mute-btn img {
    width: 18px;
    height: 18px;
    display: block;
    transition: filter 0.2s ease;
  }

  .mute-btn img.muted {
    filter: grayscale(100%) brightness(0.8);
  }

  .progress-container {
    position: absolute;
    bottom: 45px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: var(--cursor-pointer);
    padding: 5px 10px;
  }

  .bad-apple-container:hover .progress-container {
    opacity: 1;
  }

  .progress-bar {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    color: #0f0;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
    white-space: nowrap;
    user-select: none;
  }

  .completed {
    color: #0f0;
  }

  .cursor {
    color: #0ff;
    font-weight: bold;
    animation: blink 1s infinite;
  }

  .remaining {
    color: #333;
  }

  .time-display {
    color: #0f0;
    margin-left: 5px;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
</style>
