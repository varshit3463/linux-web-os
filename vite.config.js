import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function serveReferences() {
  const referencesDir = path.resolve(__dirname, 'references')
  let outDir = 'dist'

  const mimeTypes = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
  }

  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  return {
    name: 'serve-references',
    configResolved(config) {
      outDir = config.build.outDir
    },
    configureServer(server) {
      server.middlewares.use('/references', (req, res, next) => {
        const requestedPath = decodeURIComponent(req.url.split('?')[0])
        const filePath = path.join(referencesDir, requestedPath)

        if (!filePath.startsWith(referencesDir)) {
          res.statusCode = 403
          res.end()
          return
        }

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            next()
            return
          }

          const ext = path.extname(filePath)
          const contentType = mimeTypes[ext] ?? 'application/octet-stream'
          res.setHeader('Content-Type', contentType)
          const readStream = fs.createReadStream(filePath)
          readStream.on('error', () => {
            res.statusCode = 500
            res.end()
          })
          readStream.pipe(res)
        })
      })
    },
    writeBundle() {
      const targetDir = path.resolve(__dirname, outDir, 'references')
      copyDir(referencesDir, targetDir)
    }
  }
}

export default defineConfig({
  plugins: [svelte(), serveReferences()]
})
