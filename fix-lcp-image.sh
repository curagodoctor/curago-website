#!/bin/bash

# Quick Fix Script for LCP (Largest Contentful Paint)
# This optimizes the largest images that are slowing down your site

echo "🎯 LCP Image Optimization Script"
echo "================================="
echo ""

# Check if tools are installed
if ! command -v magick &> /dev/null; then
    echo "⚠️  ImageMagick not found!"
    echo "   Install: brew install imagemagick"
    exit 1
fi

if ! command -v cwebp &> /dev/null; then
    echo "⚠️  WebP tools not found!"
    echo "   Install: brew install webp"
    exit 1
fi

if ! command -v optipng &> /dev/null; then
    echo "⚠️  OptiPNG not found!"
    echo "   Install: brew install optipng"
    exit 1
fi

echo "✅ All tools installed!"
echo ""

# Define the largest/most critical images
CRITICAL_IMAGES=(
    "public/16b9238802f15faff48f3e863da5ccc19bd1bc5f.png"
    "public/image.png"
    "public/Drswara.png"
    "public/image1.png"
    "public/drharshali.png"
    "public/drutkarsh.png"
)

echo "🖼️  Optimizing ${#CRITICAL_IMAGES[@]} critical images..."
echo ""

TOTAL_BEFORE=0
TOTAL_AFTER=0

for img in "${CRITICAL_IMAGES[@]}"; do
    if [ ! -f "$img" ]; then
        echo "⚠️  Skipping $img (not found)"
        continue
    fi

    filename=$(basename "$img")
    echo "📦 Processing: $filename"

    # Get original size
    BEFORE_SIZE=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    BEFORE_KB=$((BEFORE_SIZE / 1024))
    TOTAL_BEFORE=$((TOTAL_BEFORE + BEFORE_SIZE))

    echo "   Original: ${BEFORE_KB}KB"

    # Step 1: Resize if too large (max 1920px width)
    echo "   → Resizing to max 1920px width..."
    magick "$img" -resize "1920x>" "$img.tmp"
    mv "$img.tmp" "$img"

    # Step 2: Optimize PNG
    echo "   → Optimizing PNG..."
    optipng -quiet -o5 "$img"

    # Step 3: Create WebP version
    echo "   → Creating WebP version..."
    cwebp -quiet -q 85 "$img" -o "${img%.png}.webp" 2>/dev/null || \
    cwebp -quiet -q 85 "$img" -o "${img%.jpg}.webp" 2>/dev/null || \
    cwebp -quiet -q 85 "$img" -o "${img%.jpeg}.webp" 2>/dev/null

    # Get new size
    AFTER_SIZE=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    AFTER_KB=$((AFTER_SIZE / 1024))
    TOTAL_AFTER=$((TOTAL_AFTER + AFTER_SIZE))

    SAVED=$((BEFORE_SIZE - AFTER_SIZE))
    SAVED_KB=$((SAVED / 1024))
    PERCENT=$(( (SAVED * 100) / BEFORE_SIZE ))

    echo "   ✅ Optimized: ${AFTER_KB}KB (saved ${SAVED_KB}KB / ${PERCENT}%)"

    # Check WebP size
    WEBP_FILE="${img%.png}.webp"
    if [ ! -f "$WEBP_FILE" ]; then
        WEBP_FILE="${img%.jpg}.webp"
    fi
    if [ ! -f "$WEBP_FILE" ]; then
        WEBP_FILE="${img%.jpeg}.webp"
    fi

    if [ -f "$WEBP_FILE" ]; then
        WEBP_SIZE=$(stat -f%z "$WEBP_FILE" 2>/dev/null || stat -c%s "$WEBP_FILE" 2>/dev/null)
        WEBP_KB=$((WEBP_SIZE / 1024))
        WEBP_PERCENT=$(( ((BEFORE_SIZE - WEBP_SIZE) * 100) / BEFORE_SIZE ))
        echo "   💎 WebP: ${WEBP_KB}KB (${WEBP_PERCENT}% smaller than original!)"
    fi

    echo ""
done

# Summary
TOTAL_BEFORE_KB=$((TOTAL_BEFORE / 1024))
TOTAL_AFTER_KB=$((TOTAL_AFTER / 1024))
TOTAL_SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
TOTAL_SAVED_KB=$((TOTAL_SAVED / 1024))
TOTAL_PERCENT=$(( (TOTAL_SAVED * 100) / TOTAL_BEFORE ))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Before:  ${TOTAL_BEFORE_KB}KB"
echo "After:   ${TOTAL_AFTER_KB}KB"
echo "Saved:   ${TOTAL_SAVED_KB}KB (${TOTAL_PERCENT}%)"
echo ""

echo "🎉 Optimization complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test the site: npm run build && npm run serve"
echo "2. Run Lighthouse again to check LCP improvement"
echo "3. Use OptimizedImage component with these images"
echo "4. Set priority={true} on the hero/LCP image"
echo ""

echo "💡 Expected Results:"
echo "   LCP: 11.7s → 1.5-2.5s ✅"
echo "   Performance Score: 70 → 85-90 ✅"
echo ""
