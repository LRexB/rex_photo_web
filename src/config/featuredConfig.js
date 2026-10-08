/**
 * Featured Gallery Configuration
 * 
 * You can specify which gallery is showcased in the "Featured Gallery" row
 * on the home page using one of the following methods:
 * 
 * METHOD 1: Explicit ID (Highest Priority)
 * Set `FEATURED_GALLERY_ID` below to any gallery folder name (e.g. '2026_05_09_Quebec City Photo Tour')
 * or a partial match (e.g. 'Quebec City Photo Tour').
 * 
 * METHOD 2: Hashtag in description.txt (Content-driven)
 * Add `#featured` anywhere in your gallery's `description.txt` file.
 * The system automatically detects the tag and features that gallery!
 * 
 * METHOD 3: Automatic Fallback
 * If `FEATURED_GALLERY_ID` is null/empty and no gallery has `#featured`,
 * the most recent gallery in your portfolio is automatically featured.
 */

// Set to a gallery folder ID, partial name, or null for auto:
export const FEATURED_GALLERY_ID = '2026_10_07_Battered Technology'

// Slideshow rotation interval in milliseconds (e.g., 4500 = 4.5 seconds per photo)
export const FEATURED_ROTATION_INTERVAL = 4500

// Whether the slideshow should auto-rotate (can still be navigated manually)
export const FEATURED_AUTO_ROTATE = true

/**
 * Resolves which gallery object to showcase in the Featured Gallery row.
 * 
 * @param {Array} galleries - Array of gallery objects (e.g. from scanGalleries())
 * @returns {Object|null} The resolved gallery object, or null
 */
export function resolveFeaturedGallery(galleries) {
  if (!Array.isArray(galleries) || galleries.length === 0) {
    return null
  }

  // 1. Check explicit ID/name from config
  if (FEATURED_GALLERY_ID && typeof FEATURED_GALLERY_ID === 'string') {
    const target = FEATURED_GALLERY_ID.trim().toLowerCase()

    // Check exact ID match first
    const exactMatch = galleries.find((g) => g.id.toLowerCase() === target)
    if (exactMatch) return exactMatch

    // Check partial ID or display name match
    const partialMatch = galleries.find((g) => {
      const idLower = g.id.toLowerCase()
      const nameLower = (g.name || '').toLowerCase()
      return idLower.includes(target) || nameLower.includes(target)
    })
    if (partialMatch) return partialMatch
  }

  // 2. Check for gallery tagged with 'featured' (from #featured in description.txt)
  const tagged = galleries.find(
    (g) => Array.isArray(g.tags) && g.tags.includes('featured')
  )
  if (tagged) return tagged

  // 3. Fallback to the latest gallery (galleries are already sorted by date descending)
  return galleries[0] || null
}
