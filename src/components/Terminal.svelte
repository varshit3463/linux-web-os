<div class="terminal-container">
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
  import { onMount } from 'svelte';
  import '../styles/terminal.css';

  let inputElement;
  let terminalBody;
  let outputContainer;
  let commandHistory = [];
  let historyIndex = -1;
  let currentPath = '/Computer/liveuser/Home';

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
          'Available commands:',
          '  ls - List files and directories',
          '  cd [dir] - Change directory',
          '  mkdir [dir] - Create a directory',
          '  touch [file] - Create a file',
          '  rm [file/dir] - Remove a file or directory',
          '  cat [file] - Display file content',
          '  pwd - Print working directory',
          '  clear - Clear the terminal',
          '  screenfetch - Display system information'
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

