export const commands = [
  { name: 'help', aliases: ['h'], args: '', description: 'List available commands', example: 'help', uiAction: null },
  { name: 'clear', aliases: ['cls'], args: '', description: 'Clear terminal output', example: 'clear', uiAction: null },
  
  // File System Commands
  { name: 'ls', aliases: [], args: '', description: 'List items in the current folder', example: 'ls', uiAction: null },
  { name: 'pwd', aliases: [], args: '', description: 'Print the current path', example: 'pwd', uiAction: null },
  { name: 'cd', aliases: [], args: '<path>', description: 'Change directory (supports .., ., ~)', example: 'cd Documents', uiAction: null },
  { name: 'mkdir', aliases: [], args: '<name>', description: 'Create a new folder in the current directory', example: 'mkdir notes', uiAction: null },
  { name: 'rm', aliases: [], args: '<name>', description: 'Delete a folder or file in the current directory', example: 'rm notes', uiAction: null },
  { name: 'touch', aliases: [], args: '<name>', description: 'Create an empty file in the current directory', example: 'touch todo.txt', uiAction: null },
  { name: 'cat', aliases: [], args: '<file>', description: 'Display file contents', example: 'cat readme.txt', uiAction: null },
  { name: 'mv', aliases: [], args: '<from> <to>', description: 'Move or rename a file/directory', example: 'mv old.txt new.txt', uiAction: null },
  { name: 'cp', aliases: [], args: '<from> <to>', description: 'Copy a file/directory', example: 'cp file.txt backup.txt', uiAction: null },
  
  // Application Commands
  { name: 'filemanager', aliases: [], args: '', description: 'Open file manager application', example: 'filemanager', uiAction: null },
  { name: 'settings', aliases: [], args: '', description: 'Open system settings', example: 'settings', uiAction: null },
  { name: 'aboutme', aliases: [], args: '', description: 'Open about me page', example: 'aboutme', uiAction: null },
  { name: 'badapple', aliases: [], args: '', description: 'Open Bad Apple animation', example: 'badapple', uiAction: null },
  { name: 'wallpaper', aliases: [], args: '', description: 'Open wallpaper picker', example: 'wallpaper', uiAction: null },
  { name: 'apps', aliases: [], args: '', description: 'Open applications menu', example: 'apps', uiAction: null },
  
  // System Commands
  { name: 'screenfetch', aliases: [], args: '', description: 'Show system info with Arch-style ASCII art', example: 'screenfetch', uiAction: null },
  { name: 'history', aliases: [], args: '', description: 'Show command history', example: 'history', uiAction: null },
  { name: 'echo', aliases: [], args: '<text>', description: 'Print text to terminal', example: 'echo Hello World', uiAction: null },
  { name: 'date', aliases: [], args: '', description: 'Show current date and time', example: 'date', uiAction: null },
  { name: 'whoami', aliases: [], args: '', description: 'Display current user', example: 'whoami', uiAction: null },
  { name: 'about', aliases: [], args: '', description: 'Show project information', example: 'about', uiAction: null }
]
