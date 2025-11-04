const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// File system data storage
const dataFile = path.join(__dirname, 'filesystem.json')

// Initialize filesystem data
const defaultFileSystem = {
  id: 0,
  name: 'Computer',
  type: 'folder',
  children: [
    {
      id: 100,
      name: 'liveuser',
      type: 'folder',
      children: [
        {
          id: 101,
          name: 'Home',
          type: 'folder',
          children: [
            { id: 1, name: 'Documents', type: 'folder', children: [] },
            { id: 2, name: 'Downloads', type: 'folder', children: [] },
            { id: 3, name: 'Pictures', type: 'folder', children: [] },
            { id: 4, name: 'Videos', type: 'folder', children: [] },
            { id: 5, name: 'Desktop', type: 'folder', children: [
              { id: 1001, name: 'test', type: 'folder', children: [] },
              { id: 1002, name: 'rsit', type: 'folder', children: [] }
            ]}
          ]
        }
      ]
    }
  ]
}

// Initialize file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify(defaultFileSystem, null, 2))
}

// Utility functions
function readFileSystem() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading filesystem:', error)
    return defaultFileSystem
  }
}

function writeFileSystem(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing filesystem:', error)
    return false
  }
}

function findItemById(items, id) {
  for (let item of items) {
    // Compare both as strings to handle mixed ID types
    if (String(item.id) === String(id)) return item
    if (item.children) {
      const found = findItemById(item.children, id)
      if (found) return found
    }
  }
  return null
}

function findParentById(items, id, parent = null) {
  for (let item of items) {
    // Compare both as strings to handle mixed ID types
    if (String(item.id) === String(id)) return parent
    if (item.children) {
      const found = findParentById(item.children, id, item)
      if (found) return found
    }
  }
  return null
}

function findItemByPath(root, fsPath) {
  const parts = fsPath.split('/').filter(p => p);
  let current = root;

  if (parts.length === 0) return root;
  if (parts[0] !== root.name) return null;

  for (let i = 1; i < parts.length; i++) {
    if (!current || !current.children) return null;
    const part = parts[i];
    const found = current.children.find(child => child.name === part);
    if (!found) return null;
    current = found;
  }
  return current;
}


function getNextId(items) {
  let maxId = 0;
  function traverse(arr) {
    for (let item of arr) {
      // Handle both string and numeric IDs
      const itemId = typeof item.id === 'string' ? parseInt(item.id) || 0 : item.id;
      if (itemId > maxId) maxId = itemId;
      if (item.children) traverse(item.children);
    }
  }
  traverse([items]);
  return maxId + 1;
}

// ==================== API ENDPOINTS ====================

// GET: Get entire file system
app.get('/api/fs', (req, res) => {
  try {
    const fs = readFileSystem()
    res.json(fs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read filesystem' })
  }
})

// Terminal API: ls
app.get('/api/fs/ls', (req, res) => {
    const fsPath = req.query.path;
    if (!fsPath) {
        return res.status(400).send('Path is required');
    }
    const fileSystem = readFileSystem();
    const node = findItemByPath(fileSystem, fsPath);
    if (node && node.type === 'folder') {
        res.json(node.children || []);
    } else {
        res.status(404).send('Directory not found');
    }
});

// Terminal API: cd
app.post('/api/fs/cd', (req, res) => {
    const { currentPath, targetPath } = req.body;
    if (!targetPath) {
        return res.status(400).json({ error: 'Target path is required' });
    }

    let newPath;
    if (targetPath === '..') {
        const parts = currentPath.split('/');
        if (parts.length > 2) { // Can't go above /Computer/liveuser
            parts.pop();
            newPath = parts.join('/');
        } else {
            newPath = currentPath;
        }
    } else if (targetPath.startsWith('/')) {
        newPath = targetPath;
    } else {
        newPath = path.join(currentPath, targetPath).replace(/\\/g, '/');
    }

    newPath = path.normalize(newPath).replace(/\\/g, '/');
    
    if (newPath === '.' || newPath === '') {
        newPath = '/Computer/liveuser/Home';
    }

    const fileSystem = readFileSystem();
    const node = findItemByPath(fileSystem, newPath);

    if (node && node.type === 'folder') {
        res.json({ newPath });
    } else {
        res.status(404).send(`cd: no such file or directory: ${targetPath}`);
    }
});

// Terminal API: create (mkdir, touch)
app.post('/api/fs/create', (req, res) => {
    const { path: fsPath, name, type } = req.body;
    const fileSystem = readFileSystem();
    const parentNode = findItemByPath(fileSystem, fsPath);

    if (!parentNode || parentNode.type !== 'folder') {
        return res.status(404).send('Parent directory not found');
    }

    if (parentNode.children.some(child => child.name === name)) {
        return res.status(409).send(`A ${type} with that name already exists.`);
    }

    const newItem = {
        id: getNextId(fileSystem),
        name,
        type,
    };

    if (type === 'folder') {
        newItem.children = [];
    } else {
        newItem.content = '';
    }

    parentNode.children.push(newItem);
    if (writeFileSystem(fileSystem)) {
        res.status(201).json(newItem);
    } else {
        res.status(500).send('Failed to write to filesystem');
    }
});

// Terminal API: delete (rm)
app.delete('/api/fs/delete', (req, res) => {
    const { path: fsPath, name } = req.body;
    const fileSystem = readFileSystem();
    const parentNode = findItemByPath(fileSystem, fsPath);

    if (!parentNode || parentNode.type !== 'folder') {
        return res.status(404).send('Directory not found');
    }

    const itemIndex = parentNode.children.findIndex(child => child.name === name);

    if (itemIndex === -1) {
        return res.status(404).send('File or directory not found');
    }

    parentNode.children.splice(itemIndex, 1);

    if (writeFileSystem(fileSystem)) {
        res.status(200).send('Item deleted successfully');
    } else {
        res.status(500).send('Failed to write to filesystem');
    }
});

// Terminal API: cat
app.get('/api/fs/cat', (req, res) => {
    const { path: fsPath, name } = req.query;
    const fileSystem = readFileSystem();
    const parentNode = findItemByPath(fileSystem, fsPath);

    if (!parentNode || parentNode.type !== 'folder') {
        return res.status(404).send('Directory not found');
    }

    const file = parentNode.children.find(child => child.name === name && child.type === 'file');

    if (!file) {
        return res.status(404).send('File not found');
    }

    res.json({ content: file.content || '' });
});

// Terminal API: move (mv)
app.post('/api/fs/move', (req, res) => {
    const { path: fsPath, from, to } = req.body;
    const fileSystem = readFileSystem();
    const parentNode = findItemByPath(fileSystem, fsPath);

    if (!parentNode || parentNode.type !== 'folder') {
        return res.status(404).send('Directory not found');
    }

    const itemIndex = parentNode.children.findIndex(child => child.name === from);
    if (itemIndex === -1) {
        return res.status(404).send(`mv: cannot stat '${from}': No such file or directory`);
    }

    const item = parentNode.children[itemIndex];
    
    // Check if destination already exists
    if (parentNode.children.some(child => child.name === to)) {
        return res.status(409).send(`mv: cannot move '${from}' to '${to}': File exists`);
    }

    // Rename the item
    item.name = to;

    if (writeFileSystem(fileSystem)) {
        res.status(200).send('Item moved successfully');
    } else {
        res.status(500).send('Failed to write to filesystem');
    }
});

// Terminal API: copy (cp)
app.post('/api/fs/copy', (req, res) => {
    const { path: fsPath, from, to } = req.body;
    const fileSystem = readFileSystem();
    const parentNode = findItemByPath(fileSystem, fsPath);

    if (!parentNode || parentNode.type !== 'folder') {
        return res.status(404).send('Directory not found');
    }

    const sourceItem = parentNode.children.find(child => child.name === from);
    if (!sourceItem) {
        return res.status(404).send(`cp: cannot stat '${from}': No such file or directory`);
    }

    // Check if destination already exists
    if (parentNode.children.some(child => child.name === to)) {
        return res.status(409).send(`cp: cannot copy '${from}' to '${to}': File exists`);
    }

    // Deep clone the item
    const copiedItem = JSON.parse(JSON.stringify(sourceItem));
    copiedItem.id = getNextId(fileSystem);
    copiedItem.name = to;

    // If it's a folder, update all child IDs recursively
    if (copiedItem.type === 'folder' && copiedItem.children) {
        function updateChildIds(items) {
            items.forEach(item => {
                item.id = getNextId(fileSystem);
                if (item.children) {
                    updateChildIds(item.children);
                }
            });
        }
        updateChildIds(copiedItem.children);
    }

    parentNode.children.push(copiedItem);

    if (writeFileSystem(fileSystem)) {
        res.status(201).json(copiedItem);
    } else {
        res.status(500).send('Failed to write to filesystem');
    }
});

// GET: Get specific folder contents
app.get('/api/fs/:folderId', (req, res) => {
  try {
    const fileSystem = readFileSystem()
    const folderId = parseInt(req.params.folderId)
    
    // Find folder
    const folder = findItemById([fileSystem], folderId)
    
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' })
    }
    
    res.json({
      id: folder.id,
      name: folder.name,
      type: folder.type,
      children: folder.children || []
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get folder' })
  }
})

// POST: Create new folder
app.post('/api/fs/folder', (req, res) => {
  try {
    const { parentId, name } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' })
    }

    const fileSystem = readFileSystem()
    const parentFolder = findItemById([fileSystem], parentId)

    if (!parentFolder) {
      return res.status(404).json({ error: 'Parent folder not found' })
    }

    const newFolder = {
      id: getNextId(fileSystem),
      name: name.trim(),
      type: 'folder',
      children: []
    }

    if (!parentFolder.children) {
      parentFolder.children = []
    }

    parentFolder.children.push(newFolder)

    if (writeFileSystem(fileSystem)) {
      res.status(201).json(newFolder)
    } else {
      res.status(500).json({ error: 'Failed to save filesystem' })
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    res.status(500).json({ error: 'Failed to create folder' })
  }
})

// POST: Create new file
app.post('/api/fs/file', (req, res) => {
  try {
    const { parentId, name, content = '' } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'File name is required' })
    }

    const fileSystem = readFileSystem()
    const parentFolder = findItemById([fileSystem], parentId)

    if (!parentFolder) {
      return res.status(404).json({ error: 'Parent folder not found' })
    }

    const newFile = {
      id: getNextId(fileSystem),
      name: name.trim(),
      type: 'file',
      content: content
    }

    if (!parentFolder.children) {
      parentFolder.children = []
    }

    parentFolder.children.push(newFile)

    if (writeFileSystem(fileSystem)) {
      res.status(201).json(newFile)
    } else {
      res.status(500).json({ error: 'Failed to save filesystem' })
    }
  } catch (error) {
    console.error('Error creating file:', error)
    res.status(500).json({ error: 'Failed to create file' })
  }
})

// DELETE: Delete folder or file
app.delete('/api/fs/:itemId', (req, res) => {
  try {
    const itemId = req.params.itemId
    const fileSystem = readFileSystem()

    const parent = findParentById([fileSystem], itemId)

    if (!parent) {
      return res.status(404).json({ error: 'Item not found' })
    }

    // Remove from parent's children (compare as strings)
    parent.children = parent.children.filter(child => String(child.id) !== String(itemId))

    if (writeFileSystem(fileSystem)) {
      res.json({ success: true, message: 'Item deleted' })
    } else {
      res.status(500).json({ error: 'Failed to save filesystem' })
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

// PUT: Update file content
app.put('/api/fs/:fileId', (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId)
    const { content } = req.body

    const fileSystem = readFileSystem()
    const file = findItemById([fileSystem], fileId)

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    if (file.type !== 'file') {
      return res.status(400).json({ error: 'Can only update files' })
    }

    file.content = content

    if (writeFileSystem(fileSystem)) {
      res.json(file)
    } else {
      res.status(500).json({ error: 'Failed to save filesystem' })
    }
  } catch (error) {
    console.error('Error updating file:', error)
    res.status(500).json({ error: 'Failed to update file' })
  }
})

// POST: Rename folder or file
app.post('/api/fs/rename', (req, res) => {
  try {
    const { id, newName } = req.body;
    
    if (!id || !newName || newName.trim() === '') {
      return res.status(400).json({ message: 'ID and new name are required' });
    }

    const fileSystem = readFileSystem();
    const item = findItemById([fileSystem], id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the name
    item.name = newName.trim();
    
    if (writeFileSystem(fileSystem)) {
      res.status(200).json(item);
    } else {
      res.status(500).json({ message: 'Failed to save filesystem' });
    }
  } catch (error) {
    console.error('Error renaming item:', error);
    res.status(500).json({ message: 'Failed to rename item' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ File Manager Backend running on http://localhost:${PORT}`)
  console.log(`📁 Data file: ${dataFile}`)
})
