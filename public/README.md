# Public Assets Directory

This directory contains static assets served directly by the web server.

## Directory Structure

```
public/
├── images/
│   ├── banner-default.jpg    # [Add your banner image here]
│   └── default-thumbnail.jpg # [Add a default thumbnail here]
└── photos/
    ├── 2024_03_15_SpringPortrait/
    │   ├── description.txt
    │   ├── IMG0001.jpg
    │   └── ...
    └── [More galleries here]
```

## Placeholder Files Needed for Demo

Before deploying, add these images to the `images/` folder:

1. **banner-default.jpg** (1600x600px recommended)
   - Used as the main banner on home page
   - Will be overlaid with opacity gradient

2. **default-thumbnail.jpg** (small placeholder)
   - Used as fallback for missing gallery thumbnails
   - Can be a simple placeholder or watermark

## Photo Galleries

Add your photo galleries in the `photos/` directory following this structure:

```
2024_03_15_SpringPortrait/
├── description.txt          # Gallery description (text file)
├── IMG0001.jpg             # Photo files
├── IMG0002Title.jpg        # Can include optional titles
└── IMG0003Another.jpg
```

See `GALLERY_STRUCTURE.md` for complete details.

## Git Handling

- Binary image files can be large; consider using Git LFS (Large File Storage) for photos
- Setup Git LFS:
  ```bash
  git lfs install
  git lfs track "*.jpg" "*.jpeg" "*.png" "*.tif" "*.cr2" "*.raf" "*.webp"
  git add .gitattributes
  git commit -m "Add Git LFS tracking for image files"
  ```

## Development

During development, this folder is served at `/` so:
- `public/images/banner.jpg` → `/images/banner.jpg`
- `public/photos/gallery/photo.jpg` → `/photos/gallery/photo.jpg`

## Cloudflare Pages

All files in this folder are cached and served globally through Cloudflare's CDN.
Caching rules can be configured in Cloudflare dashboard.
