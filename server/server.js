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
      name: 'Home',
      type: 'folder',
      children: [
        { id: 1, name: 'Documents', type: 'folder', children: [] },
        { id: 2, name: 'Downloads', type: 'folder', children: [] },
        { id: 3, name: 'Media', type: 'folder', children: [] },
        { id: 4, name: 'Work', type: 'folder', children: [] }
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
    if (item.id === id) return item
    if (item.children) {
      const found = findItemById(item.children, id)
      if (found) return found
    }
  }
  return null
}

function findParentById(items, id, parent = null) {
  for (let item of items) {
    if (item.id === id) return parent
    if (item.children) {
      const found = findParentById(item.children, id, item)
      if (found) return found
    }
  }
  return null
}

function getNextId(items) {
  let maxId = 4
  function traverse(arr) {
    for (let item of arr) {
      if (item.id > maxId) maxId = item.id
      if (item.children) traverse(item.children)
    }
  }
  traverse(items)
  return maxId + 1
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
      id: getNextId([fileSystem]),
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
      id: getNextId([fileSystem]),
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
    const itemId = parseInt(req.params.itemId)
    const fileSystem = readFileSystem()

    const parent = findParentById([fileSystem], itemId)

    if (!parent) {
      return res.status(404).json({ error: 'Item not found' })
    }

    // Remove from parent's children
    parent.children = parent.children.filter(child => child.id !== itemId)

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

// Start server
app.listen(PORT, () => {
  console.log(`✅ File Manager Backend running on http://localhost:${PORT}`)
  console.log(`📁 Data file: ${dataFile}`)
})
