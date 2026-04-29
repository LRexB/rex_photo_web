/**
 * Image hosting configuration.
 * 
 * Photos are hosted on Cloudflare R2 via a custom domain.
 * All image paths in the app should use this base URL.
 * 
 * Set to empty string '' to use relative paths (local/Pages hosting).
 * Set to R2 custom domain for cloud-hosted images.
 */
export const IMAGE_BASE_URL = 'https://images.rexbenning.com'

/**
 * Cloudflare Image Transformation presets.
 * 
 * These use the free tier (5,000 unique transforms/month).
 * Transformed images are cached at the edge — cache hits are free.
 * Using format=auto serves WebP/AVIF based on browser support.
 * 
 * Set TRANSFORMS_ENABLED to false to bypass transforms
 * (e.g., for local development or if the feature is disabled).
 */
export const TRANSFORMS_ENABLED = true

export const IMAGE_TRANSFORMS = {
  /** Landing page gallery cards (280×200px cards) */
  galleryCard: 'width=400,quality=80,format=auto',

  /** Gallery detail grid thumbnails */
  gridThumbnail: 'width=600,quality=80,format=auto',

  /** Lightbox full-size view */
  lightbox: 'width=1600,quality=85,format=auto',
}
