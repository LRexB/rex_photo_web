import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const photosDir = path.join(projectRoot, 'public', 'photos')
const manifestPath = path.join(photosDir, 'gallery-manifest.json')

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.bmp', '.tif', '.tiff', '.heic', '.heif'
])

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function readDescription(galleryDir) {
  const descriptionPath = path.join(galleryDir, 'description.txt')
  if (!(await fileExists(descriptionPath))) {
    return ''
  }

  const text = await fs.readFile(descriptionPath, 'utf8')
  return text.trim()
}

async function getGalleryPhotos(galleryDir) {
  const entries = await fs.readdir(galleryDir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
}

async function generateManifest() {
  const dirEntries = await fs.readdir(photosDir, { withFileTypes: true })

  const galleryDirs = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))

  const galleries = []

  for (const id of galleryDirs) {
    const galleryDir = path.join(photosDir, id)
    const photos = await getGalleryPhotos(galleryDir)
    const description = await readDescription(galleryDir)

    galleries.push({
      id,
      description,
      photos
    })
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    galleries
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`Generated ${path.relative(projectRoot, manifestPath)} with ${galleries.length} galleries`)
}

generateManifest().catch((error) => {
  console.error('Failed to generate gallery manifest:', error)
  process.exit(1)
})
