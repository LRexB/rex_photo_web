/**
 * Utility functions for handling photo galleries and metadata
 */

/**
 * Parse a gallery directory name in format YYYY_MM_DD_JobName
 * @param {string} dirName - Directory name to parse
 * @returns {object} Parsed gallery information
 */
export function parseGalleryName(dirName) {
  const match = dirName.match(/^(\d{4})_(\d{2})_(\d{2})_(.+)$/)
  
  if (!match) {
    return null
  }

  const [, year, month, day, jobName] = match
  return {
    date: `${year}-${month}-${day}`,
    jobName: jobName,
    displayName: jobName.replace(/_/g, ' '),
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
  // List of gallery IDs to check - update this list as you add new galleries
  const galleryIds = [
    '2024_12_01_NewYorkTrip',
    '2024_03_15_SpringPortrait', 
    '2024_02_28_WinterLandscape',
    '2023_12_10_HolidayShoot',
    '2023_09_05_FamilyReunion'
  ]

  const galleries = []

  for (const id of galleryIds) {
    try {
      // Try to fetch the description file
      const response = await fetch(`/photos/${id}/description.txt`)
      if (response.ok) {
        const description = await response.text()
        const parsed = parseGalleryName(id)
        if (parsed) {
          galleries.push({
            id,
            date: parsed.date,
            name: parsed.displayName,
            description: description.trim(),
            thumbnail: `/photos/${id}/thumbnail.jpg` // Will fallback if not found
          })
        }
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
  
  // List of potential photo filenames to check
  // Update this list as you add new photos to galleries
  const potentialFiles = [
    // Generic patterns
    'IMG0001.jpg', 'IMG0002.jpg', 'IMG0003.jpg',
    // New York Trip photos
    'DSCF1941.jpg', 'DSCF1994.jpg', 'DSCF2019.jpg', 'DSCF2100.jpg', 'DSCF2320.jpg',
    'Benning_R_SunBasking_01.jpg', 'NY Pedestrian Sign by Rex Benning.jpg',
    // Other gallery photos
    'SNO0001.jpg', 'SNO0002.jpg', 'SNO0003.jpg',
    'HOL0001.jpg', 'HOL0002.jpg', 'HOL0003.jpg',
    'FAM0001.jpg', 'FAM0002.jpg', 'FAM0003.jpg'
  ]

  for (const filename of potentialFiles) {
    try {
      const response = await fetch(`/photos/${galleryId}/${filename}`)
      if (response.ok) {
        const parsed = parsePhotoFilename(filename)
        photos.push({
          id: parsed.number || filename.replace(/\./g, '_').replace(/\s/g, '_'),
          filename,
          title: parsed.displayTitle,
          thumbnail: `/photos/${galleryId}/${filename}`,
          fullsize: `/photos/${galleryId}/${filename}`,
          metadata: {
            date: '2024-01-01', // Would extract from EXIF in production
            camera: 'Unknown',
            fStop: 'f/Unknown',
            shutter: 'Unknown',
            iso: 'Unknown'
          }
        })
      }
    } catch (error) {
      // File doesn't exist, continue
    }
  }

  return photos
}

export default {
  parseGalleryName,
  parsePhotoFilename,
  sortGalleriesByDate,
  filterGalleriesByDateRange,
  extractImageMetadata,
  formatDate
}
