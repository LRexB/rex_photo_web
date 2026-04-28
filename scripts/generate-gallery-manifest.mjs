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
    return {
      description: '',
      tags: []
    }
  }

  const text = await fs.readFile(descriptionPath, 'utf8')
  const normalizedText = text.trim()
  const tags = Array.from(
    new Set(
      Array.from(normalizedText.matchAll(/(^|\s)#([\w-]+)/g), ([, , tag]) => tag.toLowerCase())
    )
  )
  const description = normalizedText
    .replace(/(^|\s)#[\w-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    description,
    tags
  }
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
  // Photos live on R2 and are excluded from git, so public/photos
  // won't exist on CI/CD build servers. Skip gracefully.
  if (!(await fileExists(photosDir))) {
    console.log('No public/photos directory found — skipping manifest generation (photos are on R2)')
    return
  }

  const dirEntries = await fs.readdir(photosDir, { withFileTypes: true })

  const galleryDirs = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))

  const galleries = []

  for (const id of galleryDirs) {
    const galleryDir = path.join(photosDir, id)
    const photos = await getGalleryPhotos(galleryDir)
    const metadata = await readDescription(galleryDir)

    galleries.push({
      id,
      description: metadata.description,
      tags: metadata.tags,
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

