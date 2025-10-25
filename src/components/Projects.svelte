<script>
  import MarkdownIt from 'markdown-it'
  const md = new MarkdownIt()

  const sample = [
    { id:1, title:'Demo Project', summary:'A short demo.', readme:'# Demo\n\nThis is sample.' }
  ]
</script>

<div class="projects-container">
  <div class="projects-header">
    <span class="header-text">$ projects</span>
  </div>

  <div class="projects-content">
    {#each sample as p, idx}
      <div class="project-entry">
        <span class="prefix">➜</span>
        <div class="entry-info">
          <div class="entry-title">{p.title}</div>
          <div class="entry-subtitle">{p.summary}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .projects-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(20, 24, 28, 0.98);
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', monospace;
    color: rgba(200, 220, 240, 1);
    padding: 0;
    overflow: hidden;
  }

  .projects-header {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(var(--nav-base), 0.25);
    background: rgba(15, 18, 22, 0.6);
  }

  .header-text {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.8px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
  }

  .projects-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
  }

  .project-entry {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 16px;
  cursor: var(--cursor-pointer);
    transition: background 0.12s ease, color 0.12s ease;
    border-left: 3px solid transparent;
    color: rgba(200, 220, 240, 0.85);
  }

  .project-entry:hover {
    background: rgba(var(--nav-base), 0.12);
    border-left-color: rgba(var(--nav-base), 0.6);
    color: rgba(var(--nav-base), 1);
  }

  .prefix {
    display: inline-block;
    min-width: 20px;
    font-size: 12px;
    opacity: 0.6;
    font-weight: 600;
  }

  .entry-info {
    flex: 1;
  }

  .entry-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(var(--nav-base), 1);
    letter-spacing: 0.4px;
    line-height: 1.5;
    margin-bottom: 2px;
  }

  .entry-subtitle {
    font-size: 11px;
    color: rgba(200, 220, 240, 0.55);
    letter-spacing: 0.2px;
    line-height: 1.4;
  }

  .projects-content::-webkit-scrollbar {
    width: 6px;
  }

  .projects-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .projects-content::-webkit-scrollbar-thumb {
    background: rgba(var(--nav-base), 0.25);
    border-radius: 3px;
  }

  .projects-content::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--nav-base), 0.45);
  }
</style>
