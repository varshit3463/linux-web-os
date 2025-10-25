export const commands = [
  { name: 'help', aliases:['h'], args:'', description:'List available commands', example:'help', uiAction:null },
  { name: 'about', aliases:[], args:'', description:'Show about info', example:'about', uiAction:null },
  { name: 'theme', aliases:[], args:'<name>', description:'Set theme', example:'theme dark', uiAction:'theme' }
]
