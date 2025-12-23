#!/bin/bash

# Image Optimization Script for CuraGo Website
# This script optimizes all images in the public directory

echo "🖼️  Starting image optimization..."

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing is recommended for optimization."
    echo "   Install: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    echo ""
fi

# Function to optimize PNG files
optimize_png() {
    local file="$1"
    local filename=$(basename "$file")
    local dir=$(dirname "$file")

    echo "  📦 Optimizing $filename..."

    # Create WebP version (much smaller, ~80% reduction)
    if command -v cwebp &> /dev/null; then
        cwebp -q 85 "$file" -o "${file%.png}.webp"
        echo "    ✅ Created WebP: ${filename%.png}.webp"
    fi

    # Optimize original PNG
    if command -v optipng &> /dev/null; then
        optipng -o5 "$file"
        echo "    ✅ Optimized PNG: $filename"
    fi
}

# Function to optimize JPG files
optimize_jpg() {
    local file="$1"
    local filename=$(basename "$file")

    echo "  📦 Optimizing $filename..."

    # Create WebP version
    if command -v cwebp &> /dev/null; then
        cwebp -q 85 "$file" -o "${file%.jpg}.webp"
        echo "    ✅ Created WebP: ${filename%.jpg}.webp"
    fi

    # Optimize original JPG
    if command -v jpegoptim &> /dev/null; then
        jpegoptim --max=85 "$file"
        echo "    ✅ Optimized JPG: $filename"
    fi
}

# Process all images in public directory
find public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read file; do
    case "$file" in
        *.png)
            optimize_png "$file"
            ;;
        *.jpg|*.jpeg)
            optimize_jpg "$file"
            ;;
    esac
done

echo ""
echo "🎉 Image optimization complete!"
echo ""
echo "📊 Next steps:"
echo "  1. Check the new WebP files in the public folder"
echo "  2. Update your components to use WebP with PNG fallbacks"
echo "  3. Consider resizing very large images before optimization"
echo ""
echo "💡 Tips:"
echo "  - Install optimization tools:"
echo "    brew install webp optipng jpegoptim imagemagick"
echo "  - For best results, resize images to their display size first"
echo "  - Use <picture> elements with WebP + fallback"
