# Photo Gallery Structure Guide

This document explains how to organize your photo galleries for the Rex Photo Web portfolio.

## Directory Structure

Your photos should be organized in a dedicated folder with the following structure:

```
photos/
├── 2024_03_15_SpringPortrait/
│   ├── description.txt
│   ├── IMG0001.jpg
│   ├── IMG0002GoldenHour.jpg
│   ├── IMG0003Sunset.jpg
│   └── IMG0004.jpg
├── 2024_02_28_WinterLandscape/
│   ├── description.txt
│   ├── SNO0001.jpg
│   ├── SNO0002.jpg
│   └── SNO0003FrozenPond.jpg
└── 2024_01_10_FamilyReunion/
    ├── description.txt
    ├── FAM0001.jpg
    ├── FAM0002.jpg
    └── FAM0003.jpg
```

## Gallery Naming Convention

Gallery directories must follow this format:
```
YYYY_MM_DD_JobName
```

### Components:
- **YYYY** - 4-digit year (e.g., 2024)
- **MM** - 2-digit month (01-12)
- **DD** - 2-digit day (01-31)
- **JobName** - Short descriptive name or job title (no spaces, use underscores)

### Examples:
- `2024_03_15_SpringPortrait`
- `2024_02_28_WinterLandscape`
- `2023_12_10_HolidayShoot`
- `2023_09_05_FamilyReunion`
- `2024_01_20_Corporate_Headshots`

## Gallery Description File

Each gallery must include a `description.txt` file in its root directory.

### Example: `2024_03_15_SpringPortrait/description.txt`

```
A collection of intimate spring portrait sessions captured in the blooming gardens.
These images showcase the beauty of seasonal transitions and natural lighting.
Featuring diverse subjects and candid moments from three different sessions throughout March 2024.
```

The description can be multiple lines and will be displayed on the gallery detail page.

## Photo File Naming Convention

Photos within a gallery should follow this naming pattern:

### Basic Format:
```
AAAANNNN.ext
```
- **AAAA** - 0-8 letter/symbol prefix (optional)
- **NNNN** - 0-8 digit sequence (unique identifier)
- **ext** - File extension

Examples:
- `IMG0001.jpg`
- `0001.jpg`
- `A0001.jpg`
- `ABC1234.jpg`

### With Title Format:
```
AAAANNNNTTTT.ext
```
- **AAAA** - Prefix letters/symbols
- **NNNN** - Digit sequence
- **TTTT** - 0-12 character title (no spaces)
- **ext** - File extension

Examples:
- `IMG0001Morning.jpg`
- `IMG0002GoldenHour.jpg`
- `IMG0003Sunset.jpg`
- `SNO0001FrozenPond.jpg`
- `FAM0002Group.jpg`

## Supported Image Formats

The system supports common photography image formats:
- `.jpg` / `.jpeg` - JPEG
- `.png` - PNG
- `.tif` / `.tiff` - TIFF
- `.cr2` - Canon RAW
- `.raf` - Fujifilm RAW
- `.gif` - GIF (animated support)
- `.webp` - WebP

## Photo Metadata

The website will display the following metadata for each photo:
- **Date**: Captured date
- **Camera**: Camera model (Canon, Nikon, etc.)
- **Aperture**: f-stop value (f/1.8, f/2.8, etc.)
- **Shutter Speed**: Exposure duration (1/1000s, 2", etc.)
- **ISO**: Sensor sensitivity (100, 400, 1600, etc.)

This metadata is automatically extracted from the photo's EXIF data.

### For RAW Files

If EXIF extraction doesn't work properly, you can create a `.txt` metadata file:

Example: `IMG0001.metadata.txt`
```
date: 2024-03-15
camera: Canon EOS R5
aperture: f/2.8
shutter: 1/1000s
iso: 100
```

## Organization Tips

1. **Batch Processing**: Process all images from a shoot in the same directory
2. **Consistent Naming**: Use the same prefix pattern for all photos in a gallery
3. **Numbering**: Number sequentially (0001, 0002, etc.) for easy reference
4. **Titles**: Add descriptive titles for significant photos
5. **Metadata**: Ensure EXIF data is preserved during editing/export

## File Size Guidelines

For optimal performance:
- **Original Files**: Can be any size
- **Display Size**: Keep under 4MB for web display
- **Thumbnails**: System will generate; provide source at 1200x800px minimum
- **Archive**: RAW files stored separately from web-ready JPEG versions

## Directory Placement

Photo galleries are stored locally in:
```
/public/photos/
```

The system scans this directory to generate a `gallery-manifest.json`, which is then uploaded alongside the photos to **Cloudflare R2** for serving.

| Resource | Location |
|---|---|
| Local source | `public/photos/` |
| R2 bucket | `rex-photos` |
| Served from | `https://images.rexbenning.com/photos/` |

## Upload Procedure

When adding new galleries:

1. Create directory with proper naming format in `public/photos/`
2. Add `description.txt` file (include `#hashtags` for search)
3. Place image files with proper naming
4. Ensure EXIF metadata is intact (if available)
5. Regenerate the manifest:
   ```bash
   node scripts/generate-gallery-manifest.mjs
   ```
6. Upload to Cloudflare R2:
   ```bash
   bash scripts/upload-to-r2.sh
   ```
7. Verify at `https://images.rexbenning.com/photos/gallery-manifest.json`

**Note:** You do not need to commit photos to git or push to GitHub for them to appear on the site. The upload script sends files directly to R2.

## Example Complete Gallery

Directory: `/public/photos/2024_03_15_SpringPortrait/`

Contents:
```
description.txt
IMG0001.jpg                  (1.2 MB)
IMG0002GoldenHour.jpg        (1.5 MB)
IMG0003Sunset.jpg            (1.3 MB)
IMG0004.jpg                  (1.1 MB)
IMG0005PortraitDetail.jpg    (0.9 MB)
IMG0006.jpg                  (1.4 MB)
```

Description:
```
A collection of intimate spring portrait sessions captured in the blooming gardens.
These images showcase the beauty of seasonal transitions and natural lighting.
Featuring diverse subjects and candid moments from three different sessions throughout March 2024.
```

## Troubleshooting

### Gallery Not Appearing
- Check directory name format (YYYY_MM_DD must be exact)
- Verify description.txt exists
- Ensure at least one valid image file is present
- Check that photos are in allowed formats

### Metadata Not Displaying
- Verify EXIF data wasn't stripped during export
- Check RAW file format compatibility
- Try recreating metadata file if needed

### Images Not Loading
- Verify photos were uploaded to R2: check the Cloudflare R2 dashboard
- Test the URL directly: `https://images.rexbenning.com/photos/{gallery}/{filename}`
- Check CORS policy in R2 bucket settings if browser console shows CORS errors
- Ensure `gallery-manifest.json` was regenerated and uploaded after adding photos
- Verify filenames match those in the manifest (check for extra spaces)

---

For more information, see README.md and the main specifications in specs.txt
