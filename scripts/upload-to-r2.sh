#!/bin/bash
# Upload photos from public/photos/ to Cloudflare R2 bucket.
#
# Prerequisites:
#   1. Install wrangler: npm install -g wrangler
#   2. Login: npx wrangler login
#   3. Create R2 bucket 'rex-photos' in Cloudflare Dashboard
#
# Usage:
#   Upload everything:        bash scripts/upload-to-r2.sh
#   Upload a single gallery:  bash scripts/upload-to-r2.sh 2024_03_15_SpringPortrait

BUCKET="rex-photos"
SOURCE_DIR="public/photos"
GALLERY="$1"

echo "=================================="
echo " Uploading photos to R2: $BUCKET"
echo "=================================="
echo ""

# Check wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please ensure Node.js is installed and in your PATH."
    exit 1
fi

# Determine what to upload
if [ -n "$GALLERY" ]; then
    GALLERY_DIR="$SOURCE_DIR/$GALLERY"
    if [ ! -d "$GALLERY_DIR" ]; then
        echo "❌ Gallery not found: $GALLERY_DIR"
        echo ""
        echo "Available galleries:"
        ls -1 "$SOURCE_DIR" | grep -v "gallery-manifest.json" | sed 's/^/  /'
        exit 1
    fi
    echo "📁 Incremental upload: $GALLERY"
    SEARCH_DIR="$GALLERY_DIR"
else
    echo "📁 Full upload: all galleries"
    SEARCH_DIR="$SOURCE_DIR"
fi
echo ""

# Count files
FILE_COUNT=$(find "$SEARCH_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" -o -name "*.json" -o -name "*.txt" \) | wc -l | tr -d ' ')
echo "Found $FILE_COUNT files to upload"
echo ""

UPLOADED=0
FAILED=0

# Helper function to upload a single file
upload_file() {
    local file="$1"
    local key="${file#public/}"

    # Detect content type
    local ext="${file##*.}"
    local content_type
    case "$ext" in
        jpg|jpeg) content_type="image/jpeg" ;;
        png) content_type="image/png" ;;
        gif) content_type="image/gif" ;;
        webp) content_type="image/webp" ;;
        json) content_type="application/json" ;;
        txt) content_type="text/plain" ;;
        *) content_type="application/octet-stream" ;;
    esac

    echo "  ⬆ $key"
    if npx wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="$content_type" --remote 2>/dev/null; then
        UPLOADED=$((UPLOADED + 1))
    else
        echo "  ❌ FAILED: $key"
        FAILED=$((FAILED + 1))
    fi
}

# Upload gallery files
find "$SEARCH_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" -o -name "*.json" -o -name "*.txt" \) | while IFS= read -r file; do
    upload_file "$file"
done

# Always re-upload the manifest when doing an incremental upload
MANIFEST="$SOURCE_DIR/gallery-manifest.json"
if [ -n "$GALLERY" ] && [ -f "$MANIFEST" ]; then
    echo ""
    echo "📋 Updating gallery manifest..."
    upload_file "$MANIFEST"
fi

echo ""
echo "=================================="
echo " Upload complete!"
echo " Uploaded: $UPLOADED"
echo " Failed:   $FAILED"
echo "=================================="
echo ""
echo "Verify at: https://images.rexbenning.com/photos/gallery-manifest.json"
