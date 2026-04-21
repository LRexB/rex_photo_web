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
