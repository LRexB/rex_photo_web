#!/bin/bash
# Upload all photos from public/photos/ to Cloudflare R2 bucket.
#
# Prerequisites:
#   1. Install wrangler: npm install -g wrangler
#   2. Login: npx wrangler login
#   3. Create R2 bucket 'rex-photos' in Cloudflare Dashboard
#
# Usage: bash scripts/upload-to-r2.sh

BUCKET="rex-photos"
SOURCE_DIR="public/photos"

echo "=================================="
echo " Uploading photos to R2: $BUCKET"
echo "=================================="
echo ""

# Check wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please ensure Node.js is installed and in your PATH."
    exit 1
fi

# Count files
FILE_COUNT=$(find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" -o -name "*.json" -o -name "*.txt" \) | wc -l | tr -d ' ')
echo "Found $FILE_COUNT files to upload"
echo ""

UPLOADED=0
FAILED=0

# Upload each file, preserving directory structure
find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" -o -name "*.json" -o -name "*.txt" \) | while IFS= read -r file; do
    # The R2 key is the path relative to the project root (e.g., "photos/2024.../IMG.jpg")
    # We strip the "public/" prefix so keys start with "photos/"
    key="${file#public/}"

    # Detect content type
    ext="${file##*.}"
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
    if npx wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="$content_type" 2>/dev/null; then
        UPLOADED=$((UPLOADED + 1))
    else
        echo "  ❌ FAILED: $key"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "=================================="
echo " Upload complete!"
echo " Uploaded: $UPLOADED"
echo " Failed:   $FAILED"
echo "=================================="
echo ""
echo "Verify at: https://images.rexbenning.com/photos/gallery-manifest.json"
