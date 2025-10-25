<script>
  import { onMount } from 'svelte'
  import { commands } from '../lib/commands.js'

  let input = ''
  let lines = ["Welcome to the pseudo-shell. Type 'help' for commands."]
  let history = []
  let historyIndex = -1

  function run(cmd){
    lines = [...lines, `> ${cmd}`]
    history.push(cmd)
    historyIndex = history.length

    const tok = cmd.trim().split(/\s+/)
    const name = tok[0]
    if(!name) return
    if(name === 'help'){
      lines = [...lines, ...commands.map(c=>`${c.name} - ${c.description}`)]
    } else if(name === 'about'){
      lines = [...lines, 'Linux Web Portfolio — terminal-first demo']
    } else {
      lines = [...lines, `Unknown command: ${name}`]
    }
    input = ''
  }

  function onKey(e){
    if(e.key === 'Enter') run(input)
    else if(e.key === 'ArrowUp'){
      if(historyIndex > 0) historyIndex--
      input = history[historyIndex] || ''
    } else if(e.key === 'ArrowDown'){
      if(historyIndex < history.length-1) historyIndex++
      input = history[historyIndex] || ''
    }
  }
</script>

<div class="terminal">
  <div class="output">
    {#each lines as l}
      <div class="line">{l}</div>
    {/each}
  </div>
  <div class="input">
    <span class="prompt">$</span>
    <input bind:value={input} on:keydown={onKey} />
  </div>
</div>

<style>
  .terminal{ height:100%; display:flex; flex-direction:column; background:var(--surface); color:var(--text); font-family:monospace }
  .output{ padding:8px; flex:1; overflow:auto }
  .input{ display:flex; padding:8px; border-top:1px solid var(--nav-accent, rgba(255,255,255,.04)) }
  .prompt{ margin-right:8px }
  input{ flex:1; background:transparent; border:none; color:inherit; outline:none }
</style>
