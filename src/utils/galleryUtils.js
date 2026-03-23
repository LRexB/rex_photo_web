import { parse } from 'exifr'

let galleryManifestCache = null

const EXIF_TAGS_TO_PICK = [
  'DateTimeOriginal',
  'CreateDate',
  'ModifyDate',
  'DateTimeDigitized',
  'MetadataDate',
  'Make',
  'Model',
  'LensModel',
  'Lens',
  'FNumber',
  'ApertureValue',
  'ExposureTime',
  'ShutterSpeedValue',
  'PhotographicSensitivity',
  'ISOSpeedRatings',
  'ISO',
  'ISOSpeed'
]

function pickFirstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function formatMetadataDate(rawDate) {
  if (!rawDate) {
    return 'Unknown'
  }

  const parsedDate = rawDate instanceof Date ? rawDate : new Date(rawDate)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown'
  }

  return parsedDate.toLocaleDateString()
}

function formatCameraName(make, model) {
  const parts = [make, model]
    .filter(Boolean)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return 'Unknown'
  }

  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0]
  }

  return parts.join(' ')
}

function formatAperture(fNumber, apertureValue) {
  const aperture = pickFirstDefined(fNumber, apertureValue)
  if (typeof aperture !== 'number' || Number.isNaN(aperture)) {
    return 'Unknown'
  }

  return `f/${Number(aperture.toFixed(1))}`
}

function formatShutterSpeed(exposureTime, shutterSpeedValue) {
  if (typeof exposureTime === 'number' && Number.isFinite(exposureTime) && exposureTime > 0) {
    if (exposureTime >= 1) {
      return `${Number(exposureTime.toFixed(1))}s`
    }

    return `1/${Math.round(1 / exposureTime)}s`
  }

  if (typeof shutterSpeedValue === 'number' && Number.isFinite(shutterSpeedValue)) {
    const derivedExposureTime = 2 ** (-shutterSpeedValue)
    if (derivedExposureTime > 0) {
      return `1/${Math.round(1 / derivedExposureTime)}s`
    }
  }

  return 'Unknown'
}

function normalizePhotoMetadata(exifData) {
  if (!exifData) {
    return {
      date: 'Unknown',
      camera: 'Unknown',
      fStop: 'Unknown',
      shutter: 'Unknown',
      iso: 'Unknown'
    }
  }

  const captureDate = pickFirstDefined(
    exifData.DateTimeOriginal,
    exifData.CreateDate,
    exifData.DateTimeDigitized,
    exifData.ModifyDate,
    exifData.MetadataDate
  )
  const isoValue = pickFirstDefined(
    exifData.PhotographicSensitivity,
    exifData.ISOSpeedRatings,
    exifData.ISO,
    exifData.ISOSpeed
  )

  return {
    date: formatMetadataDate(captureDate),
    camera: formatCameraName(exifData.Make, exifData.Model),
    fStop: formatAperture(exifData.FNumber, exifData.ApertureValue),
    shutter: formatShutterSpeed(exifData.ExposureTime, exifData.ShutterSpeedValue),
    iso: isoValue ? isoValue.toString() : 'Unknown'
  }
}

function normalizeGalleryTags(tags) {
  if (!Array.isArray(tags)) {
    return []
  }

  return Array.from(
    new Set(
      tags
        .filter(Boolean)
        .map((tag) => tag.toString().trim().toLowerCase().replace(/^#/, ''))
        .filter(Boolean)
    )
  )
}

async function loadGalleryManifest() {
  if (galleryManifestCache) {
    return galleryManifestCache
  }

  try {
    const response = await fetch('/photos/gallery-manifest.json', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Manifest request failed: ${response.status}`)
    }

    const manifest = await response.json()
    galleryManifestCache = manifest
    return manifest
  } catch (error) {
    console.error('Could not load gallery manifest:', error)
    galleryManifestCache = { galleries: [] }
    return galleryManifestCache
  }
}

/**
 * Parse a gallery directory name in various date formats
 * @param {string} dirName - Directory name to parse
 * @returns {object} Parsed gallery information
 */
export function parseGalleryName(dirName) {
  // Try YYYY_MM_DD_JobName format first
  let match = dirName.match(/^(\d{4})_(\d{2})_(\d{2})_(.+)$/)
  
  if (match) {
    const [, year, month, day, jobName] = match
    return {
      date: `${year}-${month}-${day}`,
      jobName: jobName,
      displayName: jobName.replace(/_/g, ' '),
      id: dirName
    }
  }
  
  // Try YY_MM_DD_JobName format (like 25_08_22EveningShots)
  match = dirName.match(/^(\d{2})_(\d{2})_(\d{2})(.+)$/)
  if (match) {
    const [, yearShort, month, day, jobName] = match
    // Assume 20xx for years 00-99
    const year = yearShort.length === 2 ? `20${yearShort}` : yearShort
    return {
      date: `${year}-${month}-${day}`,
      jobName: jobName,
      displayName: jobName.replace(/_/g, ' '),
      id: dirName
    }
  }
  
  // Fallback: no date parsing, just use the name
  return {
    date: new Date().toISOString().split('T')[0], // Today's date as fallback
    jobName: dirName,
    displayName: dirName.replace(/_/g, ' '),
    id: dirName
  }
}

/**
 * Parse a photo filename in various formats
 * @param {string} fileName - File name to parse
 * @returns {object} Parsed photo information
 */
export function parsePhotoFilename(fileName) {
  // Try the standard pattern first: AAAANNNN.ext or AAAANNNNTTTT.ext
  let match = fileName.match(/^([a-zA-Z0-9\-_]*?)(\d{0,8})(.*?)\.([a-zA-Z0-9]+)$/)
  
  if (match) {
    const [, prefix, number, title, ext] = match
    return {
      filename: fileName,
      prefix: prefix,
      number: number,
      title: title || 'Untitled',
      extension: ext,
      displayTitle: title && title.length > 0 ? title.replace(/_/g, ' ') : fileName
    }
  }
  
  // Fallback: just extract extension and use filename as title
  match = fileName.match(/^(.+)\.([a-zA-Z0-9]+)$/)
  if (match) {
    const [, name, ext] = match
    return {
      filename: fileName,
      prefix: '',
      number: '',
      title: name,
      extension: ext,
      displayTitle: name
    }
  }
  
  // If nothing matches, return basic info
  return {
    filename: fileName,
    prefix: '',
    number: '',
    title: fileName,
    extension: '',
    displayTitle: fileName
  }
}

/**
 * Sort galleries by date in descending order (most recent first)
 * @param {array} galleries - Array of gallery objects
 * @returns {array} Sorted galleries
 */
export function sortGalleriesByDate(galleries) {
  return [...galleries].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
}

/**
 * Filter galleries by date range
 * @param {array} galleries - Array of gallery objects
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {array} Filtered galleries
 */
export function filterGalleriesByDateRange(galleries, startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return galleries.filter(gallery => {
    const galleryDate = new Date(gallery.date)
    return galleryDate >= start && galleryDate <= end
  })
}

/**
 * Extract EXIF metadata from an image (requires EXIF library)
 * This is a placeholder for future implementation
 * @param {File} imageFile - Image file object
 * @returns {Promise<object>} Metadata object
 */
export async function extractImageMetadata(imageFile) {
  // This would use a library like exifjs to extract metadata
  // For now, returning mock data
  return {
    date: new Date().toISOString(),
    camera: 'Unknown',
    fStop: 'f/Unknown',
    shutter: 'Unknown',
    iso: 'Unknown'
  }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Scan for galleries by checking for description.txt files
 * @returns {Promise<array>} Array of gallery objects
 */
export async function scanGalleries() {
  const galleries = []

  const manifest = await loadGalleryManifest()
  const galleryItems = Array.isArray(manifest.galleries) ? manifest.galleries : []

  for (const gallery of galleryItems) {
    const id = gallery.id
    if (!id) {
      continue
    }

    try {
      const parsed = parseGalleryName(id)
      if (parsed) {
        // Use first photo as thumbnail when available
        let thumbnail = '/images/default-thumbnail.jpg'
        const photos = Array.isArray(gallery.photos) ? gallery.photos : []
        if (photos.length > 0) {
          thumbnail = `/photos/${id}/${photos[0]}`
        }

        galleries.push({
          id,
          date: parsed.date,
          name: parsed.displayName,
          description: (gallery.description || '').trim(),
          tags: normalizeGalleryTags(gallery.tags),
          thumbnail
        })
      }
    } catch (error) {
      // Gallery doesn't exist or can't be accessed, skip it
      console.log(`Gallery ${id} not found, skipping`)
    }
  }

  return sortGalleriesByDate(galleries)
}

/**
 * Get photos for a specific gallery
 * @param {string} galleryId - Gallery ID
 * @returns {Promise<array>} Array of photo objects
 */
export async function getGalleryPhotos(galleryId) {
  const photos = []

  const manifest = await loadGalleryManifest()
  const gallery = Array.isArray(manifest.galleries)
    ? manifest.galleries.find((item) => item.id === galleryId)
    : null

  const potentialFiles = Array.isArray(gallery?.photos) ? gallery.photos : []

  for (const filename of potentialFiles) {
    try {
      const imageUrl = `/photos/${galleryId}/${filename}`
      const response = await fetch(imageUrl)
      if (response.ok) {
        const parsed = parsePhotoFilename(filename)

        // Extract EXIF metadata
        let metadata = normalizePhotoMetadata(null)

        try {
          const imageBlob = await response.blob()
          const exifData = await parse(imageBlob, {
            xmp: true,
            pick: EXIF_TAGS_TO_PICK
          })

          if (exifData) {
            metadata = normalizePhotoMetadata(exifData)
          }
        } catch (exifError) {
          console.log(`Could not extract EXIF from ${filename}:`, exifError.message)
        }

        photos.push({
          id: parsed.number || filename.replace(/\./g, '_').replace(/\s/g, '_'),
          filename,
          title: parsed.displayTitle,
          thumbnail: imageUrl,
          fullsize: imageUrl,
          metadata
        })
      }
    } catch (error) {
      // File doesn't exist, continue
      console.log(`Could not load ${filename}:`, error.message)
    }
  }

  return photos
}

export default {
  parseGalleryName,
  parsePhotoFilename,
  sortGalleriesByDate,
  filterGalleriesByDateRange,
  formatDate
}
