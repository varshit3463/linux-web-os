<script>
  import { onMount } from 'svelte';
  
  export let onComplete = () => {};
  
  let progress = 0;
  let loaded = false;
  
  onMount(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loaded = true;
          setTimeout(() => {
            onComplete();
          }, 500);
        }, 300);
      }
    }, 100);
    
    return () => clearInterval(interval);
  });
</script>

<div class="loading-screen" class:loaded>
  <div class="arch-container">
    <svg class="arch-logo" viewBox="0 0 65 65" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="arch-mask">
          <rect width="100%" height="100%" fill="white"/>
          <path d="M 32.5 2 L 2 62 L 8 62 L 17 45 C 19 48 22 52 25 56 C 28 52 31 48 33 45 C 35 48 38 52 41 56 C 44 52 47 48 49 45 L 58 62 L 64 62 L 32.5 2 Z M 32.5 14 L 43 38 C 40 42 37 46 34 50 C 32 47 30 44 28 42 C 30 39 32 36 32.5 35 C 32 36 30 39 28 42 C 26 39 24 36 22 33 L 32.5 14 Z" fill="black"/>
        </mask>
        
        <linearGradient id="liquid-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:#1793D1;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0B7EB5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1793D1;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Arch Linux logo outline -->
      <path class="arch-outline" d="M 32.5 2 L 2 62 L 8 62 L 17 45 C 19 48 22 52 25 56 C 28 52 31 48 33 45 C 35 48 38 52 41 56 C 44 52 47 48 49 45 L 58 62 L 64 62 L 32.5 2 Z M 32.5 14 L 43 38 C 40 42 37 46 34 50 C 32 47 30 44 28 42 C 30 39 32 36 32.5 35 C 32 36 30 39 28 42 C 26 39 24 36 22 33 L 32.5 14 Z" 
            fill="none" 
            stroke="#333" 
            stroke-width="0.5"/>
      
      <!-- Liquid fill with mask -->
      <rect 
        class="liquid-fill" 
        x="0" 
        y="{65 - (progress * 0.65)}" 
        width="65" 
        height="{progress * 0.65}" 
        fill="url(#liquid-gradient)"
        mask="url(#arch-mask)"/>
      
      <!-- Liquid wave effect -->
      <path 
        class="liquid-wave"
        d="M 0 {65 - (progress * 0.65)} Q 16.25 {65 - (progress * 0.65) - 2} 32.5 {65 - (progress * 0.65)} T 65 {65 - (progress * 0.65)} L 65 65 L 0 65 Z"
        fill="url(#liquid-gradient)"
        mask="url(#arch-mask)"
        opacity="0.6"/>
    </svg>
    
    <div class="loading-text">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <p class="percentage">{Math.round(progress)}%</p>
      <p class="loading-label">Loading Arch Linux Web OS...</p>
    </div>
  </div>
</div>

<style>
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    transition: opacity 0.5s ease, visibility 0.5s ease;
    opacity: 1;
    visibility: visible;
  }
  
  .loading-screen.loaded {
    opacity: 0;
    visibility: hidden;
  }
  
  .arch-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  
  .arch-logo {
    width: 200px;
    height: 200px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  }
  
  .arch-outline {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .liquid-fill {
    transition: y 0.3s ease, height 0.3s ease;
  }
  
  .liquid-wave {
    animation: wave 2s ease-in-out infinite;
    transition: d 0.3s ease;
  }
  
  @keyframes wave {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(-5px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }
  
  .loading-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    min-width: 300px;
  }
  
  .progress-bar {
    width: 100%;
    height: 4px;
    background: #ccc;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0B7EB5, #1793D1);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  
  .percentage {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    font-family: monospace;
  }
  
  .loading-label {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
</style>
