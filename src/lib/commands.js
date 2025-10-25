export const commands = [
  { name: 'help', aliases: ['h'], args: '', description: 'List available commands', example: 'help', uiAction: null },
  { name: 'clear', aliases: ['cls'], args: '', description: 'Clear terminal output', example: 'clear', uiAction: null },
  { name: 'ls', aliases: [], args: '', description: 'List items in the current folder', example: 'ls', uiAction: null },
  { name: 'pwd', aliases: [], args: '', description: 'Print the current path', example: 'pwd', uiAction: null },
  { name: 'cd', aliases: [], args: '<path>', description: 'Change directory (supports .., ., ~)', example: 'cd Documents', uiAction: null },
  { name: 'mkdir', aliases: [], args: '<name>', description: 'Create a new folder in the current directory', example: 'mkdir notes', uiAction: null },
  { name: 'rm', aliases: [], args: '<name>', description: 'Delete a folder or file in the current directory', example: 'rm notes', uiAction: null },
  { name: 'touch', aliases: [], args: '<name>', description: 'Create an empty file in the current directory', example: 'touch todo.txt', uiAction: null },
  { name: 'screenfetch', aliases: [], args: '', description: 'Show system info with Arch-style ASCII art', example: 'screenfetch', uiAction: null },
  { name: 'about', aliases: [], args: '', description: 'Show project information', example: 'about', uiAction: null }
]
