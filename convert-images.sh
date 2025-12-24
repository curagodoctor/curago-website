#!/bin/bash

# Image Conversion Script for CuraGo Website
# Converts PNG images to WebP format for better performance

echo "🖼️  Converting PNG images to WebP format..."
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found!"
    echo ""
    echo "Please install webp tools:"
    echo "  macOS:   brew install webp"
    echo "  Ubuntu:  sudo apt-get install webp"
    echo "  Windows: Download from https://developers.google.com/speed/webp/download"
    exit 1
fi

# Navigate to public directory
cd public || exit

# List of PNG files to convert
images=(
    "simral.png"
    "yeshwant.png"
    "sourabh.png"
    "Drswara.png"
    "drutkarsh.png"
    "drharshali.png"
)

converted=0
skipped=0

for img in "${images[@]}"; do
    if [ -f "$img" ]; then
        webp_name="${img%.png}.webp"

        # Check if WebP version already exists
        if [ -f "$webp_name" ]; then
            echo "⏭️  Skipped: $webp_name (already exists)"
            ((skipped++))
        else
            # Convert with quality 85 (good balance of size/quality)
            cwebp -q 85 "$img" -o "$webp_name"

            if [ $? -eq 0 ]; then
                # Get file sizes
                png_size=$(du -h "$img" | cut -f1)
                webp_size=$(du -h "$webp_name" | cut -f1)

                echo "✅ Converted: $img ($png_size) → $webp_name ($webp_size)"
                ((converted++))
            else
                echo "❌ Failed: $img"
            fi
        fi
    else
        echo "⚠️  Not found: $img"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Conversion Summary:"
echo "   ✅ Converted: $converted images"
echo "   ⏭️  Skipped: $skipped images (already exist)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next steps:"
echo "   1. Update your components to use .webp images"
echo "   2. Keep .png files as fallbacks for older browsers"
echo "   3. Run 'npm run build' to rebuild"
echo "   4. Test with Lighthouse again"
echo ""
