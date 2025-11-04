<div class="terminal-container" on:contextmenu|stopPropagation>
  <div class="terminal-header">
    <span class="header-text">$ bash</span>
  </div>
  <div 
    class="terminal-content" 
    bind:this={terminalBody} 
    on:click={() => inputElement.focus()}
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputElement.focus(); }}
    role="button"
    tabindex="0"
    aria-label="Terminal content area, click to focus input"
  >
    <div class="terminal-output" bind:this={outputContainer}></div>
    <div class="terminal-input-line">
      <span class="prompt">
        <span class="user">hvar@arch</span>
        <span class="separator">:</span>
        <span class="path">~</span>
        <span class="arrow">$</span>
      </span>
      <input
        type="text"
        class="terminal-input"
        bind:this={inputElement}
        on:keydown={handleKeydown}
      />
    </div>
  </div>
</div>

<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import '../styles/terminal.css';

  const dispatch = createEventDispatcher();

  export let initialPosition = { x: 150, y: 150 };
  export let initialSize = { width: 400, height: 300 };
  export let initialPath = null;

  let inputElement;
  let terminalBody;
  let outputContainer;
  let commandHistory = [];
  let historyIndex = -1;
  let currentPath;

  $: currentPath = initialPath || '~/';
  
  function generateScreenfetch() {
    const art = [
      '                   -`',
      '                  .o+`',
      '                 `ooo/`',
      '                `+oooo:',
      '               `+oooooo:',
      '               -+oooooo+:',
      '             `/:--:++oooo+:',
      '            `/++++/+++++++:',
      '           `/++++++++++++++:',
      '          `/+++ooooooooooooo/`',
      '         ./ooosssso++osssssso+`',
      '        .oossssso-````/ossssss+`',
      '       -osssssso.      :ssssssso.',
      '      :osssssss/        osssso+++.',
      '     /ossssssss/        +ssssooo/-',
      '   `/ossssso+/-        -:/+osssso+-',
      '  `+sso+:-`                 `.-/+oso:',
      ' `++:.                           `-/+/',
      ' `.`                                 `/'
    ];

    const specs = {
      user: "hvar@arch",
      os: "Arch Linux",
      kernel: "x86_64 Linux 6.1.1-arch1-1",
      uptime: "1h 23m",
      packages: "777",
      shell: "bash 5.1.16",
      de: "GNOME 43.2",
      wm: "Mutter",
      font: "Cantarell 11",
      disk: "12G / 32G (38%)",
      cpu: "Intel Core i7-8550U @ 8x 4GHz",
      gpu: "Intel Corporation UHD Graphics 620",
      ram: "3417MiB / 15897MiB"
    };

    const specLines = [
      `<span class="info-user">${specs.user}</span>`,
      `OS: <span class="info-value">${specs.os}</span>`,
      `Kernel: <span class="info-value">${specs.kernel}</span>`,
      `Uptime: <span class="info-value">${specs.uptime}</span>`,
      `Packages: <span class="info-value">${specs.packages}</span>`,
      `Shell: <span class="info-value">${specs.shell}</span>`,
      `DE: <span class="info-value">${specs.de}</span>`,
      `WM: <span class="info-value">${specs.wm}</span>`,
      `Font: <span class="info-value">${specs.font}</span>`,
      `Disk: <span class="info-value">${specs.disk}</span>`,
      `CPU: <span class="info-value">${specs.cpu}</span>`,
      `GPU: <span class="info-value">${specs.gpu}</span>`,
      `RAM: <span class="info-value">${specs.ram}</span>`
    ];

    let output = '<pre class="screenfetch-output">';
    const maxLines = Math.max(art.length, specLines.length);

    for (let i = 0; i < maxLines; i++) {
      const artLine = art[i] || '';
      const specLine = specLines[i] || '';
      output += `<span class="ascii-art">${artLine.padEnd(35)}</span>         <span class="info-label">${specLine}</span>\n`;
    }

    output += '</pre>';
    return output;
  }

  const screenfetchOutput = generateScreenfetch();

  const welcomeMessage = `
    <div class="motd">Welcome to Arch Linux!</div>
    <div class="motd">Type 'help' to see available commands.</div>
  `;

  onMount(() => {
    printToTerminal(screenfetchOutput, { wrap: false });
    printToTerminal(welcomeMessage, { wrap: false });
    if (inputElement) {
      inputElement.focus();
    }
  });

  function printToTerminal(html, options = {}) {
    const { wrap = true } = options;
    const snippet = wrap ? `<div class="terminal-line">${html}</div>` : html;
    outputContainer.insertAdjacentHTML('beforeend', snippet);
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      const command = inputElement.value;
      inputElement.value = '';
      commandHistory.unshift(command);
      historyIndex = -1;
      executeCommand(command);
    } else if (event.key === 'ArrowUp') {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputElement.value = commandHistory[historyIndex];
      }
    } else if (event.key === 'ArrowDown') {
      if (historyIndex > 0) {
        historyIndex--;
        inputElement.value = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        inputElement.value = '';
      }
    } else if (event.key === 'l' && event.ctrlKey) {
        event.preventDefault();
        clearTerminal();
    }
  }

  function getPrompt(path) {
    const baseRoot = '/Computer/liveuser/Home';
    const userLine = 'hvar@arch/liveuser/Home';
    const pathForPrompt = path === baseRoot ? '~' : (path.split('/').pop() || '/');
    return `<span class="prompt">
        <span class="prompt-bracket">[</span>
        <span class="user">${userLine}</span>
        <span class="separator"> </span>
        <span class="path">${pathForPrompt}</span>
        <span class="prompt-bracket">]</span>
        <span class="arrow">$</span>
      </span>`;
  }

  async function executeCommand(command) {
    const trimmed = command.trim();
    const [cmd, ...args] = trimmed.split(' ');
    let displayCommand = trimmed;

    if (cmd === 'cd' && args.length > 0) {
      displayCommand = `cd ${args.join(' ')}`;
    }

    const commandLineHtml = `${getPrompt(currentPath)} ${displayCommand}`;
    printToTerminal(commandLineHtml);

    switch (cmd) {
      case 'help': {
        const helpLines = [
          '<div class="help-section"><span class="help-header">FILE SYSTEM COMMANDS:</span></div>',
          '  <span class="help-cmd">ls</span>                    - List files and directories',
          '  <span class="help-cmd">cd [dir]</span>              - Change directory (use ~ for home, .. for parent)',
          '  <span class="help-cmd">pwd</span>                   - Print working directory',
          '  <span class="help-cmd">mkdir [name]</span>          - Create a new directory',
          '  <span class="help-cmd">touch [name]</span>          - Create a new file',
          '  <span class="help-cmd">rm [name]</span>             - Remove a file or directory',
          '  <span class="help-cmd">cat [file]</span>            - Display file contents',
          '  <span class="help-cmd">mv [from] [to]</span>        - Move or rename a file/directory',
          '  <span class="help-cmd">cp [from] [to]</span>        - Copy a file/directory',
          '',
          '<div class="help-section"><span class="help-header">APPLICATION COMMANDS:</span></div>',
          '  <span class="help-cmd">filemanager</span>           - Open file manager',
          '  <span class="help-cmd">settings</span>              - Open system settings',
          '  <span class="help-cmd">aboutme</span>               - Open about me page',
          '  <span class="help-cmd">badapple</span>              - Open Bad Apple animation',
          '  <span class="help-cmd">wallpaper</span>             - Open wallpaper picker',
          '  <span class="help-cmd">apps</span>                  - Open applications menu',
          '',
          '<div class="help-section"><span class="help-header">SYSTEM COMMANDS:</span></div>',
          '  <span class="help-cmd">screenfetch</span>           - Display system information',
          '  <span class="help-cmd">clear</span>                 - Clear the terminal screen',
          '  <span class="help-cmd">history</span>               - Show command history',
          '  <span class="help-cmd">echo [text]</span>           - Print text to terminal',
          '  <span class="help-cmd">date</span>                  - Show current date and time',
          '  <span class="help-cmd">whoami</span>                - Display current user',
          '',
          '<div class="help-section"><span class="help-header">KEYBOARD SHORTCUTS:</span></div>',
          '  <span class="help-shortcut">Ctrl+Alt+T</span>        - Open Terminal',
          '  <span class="help-shortcut">Ctrl+Alt+F</span>        - Open File Manager',
          '  <span class="help-shortcut">Ctrl+Alt+A</span>        - Open Applications',
          '  <span class="help-shortcut">Ctrl+Alt+S</span>        - Open Settings',
          '  <span class="help-shortcut">Ctrl+Alt+W</span>        - Open Wallpaper Picker',
          '  <span class="help-shortcut">Super/Win Key</span>     - Open Applications',
          '  <span class="help-shortcut">Ctrl+L</span>            - Clear terminal (in terminal)',
          '',
          '<div class="help-tip">💡 Tip: Use ↑/↓ arrow keys to navigate command history, Ctrl+L to clear</div>'
        ];
        helpLines.forEach(line => printToTerminal(line));
        break;
      }
      case 'clear':
        clearTerminal();
        break;
      case 'screenfetch':
        printToTerminal(screenfetchOutput, { wrap: false });
        break;
      case 'pwd':
        printToTerminal(currentPath);
        break;
      case 'ls':
        try {
          const response = await fetch(`http://localhost:3001/api/fs/ls?path=${encodeURIComponent(currentPath)}`);
          if (!response.ok) throw new Error(await response.text());
          const items = await response.json();
          const spacer = '&nbsp;&nbsp;&nbsp;&nbsp;';
          const output = items
            .map(item => `<span class="${item.type}">${item.name}</span>`)
            .join(spacer);
          printToTerminal(output);
        } catch (error) {
          printToTerminal(`<span class="error">ls: ${error.message}</span>`);
        }
        break;
      case 'cd':
        const targetPath = args[0];
        if (!targetPath) {
            currentPath = '/Computer/liveuser/Home';
            updatePrompt();
            break;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/fs/cd`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPath, targetPath }),
            });
            if (!response.ok) throw new Error(await response.text());
            const { newPath } = await response.json();
            currentPath = newPath;
      updatePrompt();
        } catch (error) {
      printToTerminal(`<span class="error">${error.message}</span>`);
        }
        break;
    case 'mkdir':
    case 'touch':
        const name = args[0];
        if (!name) {
            printToTerminal(`<div class="error">${cmd}: missing operand</div>`);
            break;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/fs/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: currentPath, name, type: cmd === 'mkdir' ? 'folder' : 'file' }),
            });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      printToTerminal(`<span class="error">${cmd}: ${error.message}</span>`);
        }
        break;
    case 'rm':
        const itemNameToRemove = args[0];
        if (!itemNameToRemove) {
            printToTerminal(`<div class="error">rm: missing operand</div>`);
            break;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/fs/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: currentPath, name: itemNameToRemove }),
            });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      printToTerminal(`<span class="error">rm: ${error.message}</span>`);
        }
        break;
    case 'cat':
    const fileName = args[0];
        if (!fileName) {
      printToTerminal(`<span class="error">cat: missing operand</span>`);
            break;
        }
         try {
            const response = await fetch(`http://localhost:3001/api/fs/cat?path=${encodeURIComponent(currentPath)}&name=${encodeURIComponent(fileName)}`);
            if (!response.ok) throw new Error(await response.text());
            const { content } = await response.json();
            // Use <pre> to preserve whitespace from file content
      printToTerminal(`<pre>${content}</pre>`, { wrap: false });
        } catch (error) {
      printToTerminal(`<span class="error">cat: ${error.message}</span>`);
        }
        break;
      case 'settings':
        printToTerminal('Opening Settings...');
        dispatch('openapp', 'settings');
        break;
      case 'filemanager':
        printToTerminal('Opening File Manager...');
        dispatch('openapp', 'filemanager');
        break;
      case 'aboutme':
        printToTerminal('Opening About Me...');
        dispatch('openapp', 'aboutme');
        break;
      case 'badapple':
        printToTerminal('Opening Bad Apple...');
        dispatch('openapp', 'badapple');
        break;
      case 'wallpaper':
        printToTerminal('Opening Wallpaper Picker...');
        dispatch('openapp', 'wallpaper');
        break;
      case 'apps':
        printToTerminal('Opening Applications...');
        dispatch('openapp', 'applications');
        break;
      case 'history':
        if (commandHistory.length === 0) {
          printToTerminal('No command history available.');
        } else {
          commandHistory.slice().reverse().forEach((cmd, i) => {
            printToTerminal(`  ${commandHistory.length - i}: ${cmd}`);
          });
        }
        break;
      case 'echo':
        printToTerminal(args.join(' '));
        break;
      case 'date':
        const now = new Date();
        printToTerminal(now.toString());
        break;
      case 'whoami':
        printToTerminal('hvar');
        break;
      case 'mv':
        const [fromMv, toMv] = args;
        if (!fromMv || !toMv) {
          printToTerminal(`<span class="error">mv: missing operand</span>`);
          break;
        }
        try {
          const response = await fetch(`http://localhost:3001/api/fs/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: currentPath, from: fromMv, to: toMv }),
          });
          if (!response.ok) throw new Error(await response.text());
        } catch (error) {
          printToTerminal(`<span class="error">mv: ${error.message}</span>`);
        }
        break;
      case 'cp':
        const [fromCp, toCp] = args;
        if (!fromCp || !toCp) {
          printToTerminal(`<span class="error">cp: missing operand</span>`);
          break;
        }
        try {
          const response = await fetch(`http://localhost:3001/api/fs/copy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: currentPath, from: fromCp, to: toCp }),
          });
          if (!response.ok) throw new Error(await response.text());
        } catch (error) {
          printToTerminal(`<span class="error">cp: ${error.message}</span>`);
        }
        break;
      case '':
        break;
      default:
    printToTerminal(`<span class="error">command not found: ${cmd}</span>`);
    }
    updatePrompt();
  }

  function updatePrompt() {
    const promptContainer = document.querySelector('.terminal-input-line .prompt');
    if (promptContainer) {
        promptContainer.innerHTML = getPrompt(currentPath);
    }
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  function clearTerminal() {
    outputContainer.innerHTML = '';
    printToTerminal(screenfetchOutput, { wrap: false });
    printToTerminal(welcomeMessage, { wrap: false });
  }

</script>

