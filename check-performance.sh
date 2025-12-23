#!/bin/bash

# Performance Check Script for CuraGo Website
# Run this to get a quick performance overview

echo "🔍 CuraGo Website - Performance Analysis"
echo "========================================"
echo ""

# Check if build directory exists
if [ -d "build" ]; then
    echo "📦 Build Directory Analysis:"
    echo "----------------------------"
    echo "Total build size:"
    du -sh build
    echo ""
    echo "Asset sizes:"
    ls -lh build/assets/ 2>/dev/null | grep -E '\.(js|css)$' | awk '{print $9, $5}'
    echo ""
else
    echo "⚠️  No build directory found. Run 'npm run build' first."
    echo ""
fi

# Check public images
echo "🖼️  Image Analysis:"
echo "------------------"
echo "Total public folder size:"
du -sh public
echo ""
echo "Large images (>100KB):"
find public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +100k -exec ls -lh {} \; | awk '{print $9, $5}'
echo ""

# Check for WebP versions
WEBP_COUNT=$(find public -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
IMG_COUNT=$(find public \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | wc -l | tr -d ' ')
echo "WebP images: $WEBP_COUNT / $IMG_COUNT total images"
if [ $WEBP_COUNT -lt $IMG_COUNT ]; then
    echo "💡 Consider running ./optimize-images.sh to create WebP versions"
fi
echo ""

# Node modules size
echo "📚 Dependencies:"
echo "---------------"
echo "node_modules size:"
du -sh node_modules 2>/dev/null || echo "No node_modules found"
echo ""
echo "Total dependencies:"
npm list --depth=0 2>/dev/null | grep -E '^\w' | wc -l | tr -d ' '
echo ""

# Quick suggestions
echo "💡 Quick Wins:"
echo "-------------"
echo "1. Run: npm run build - to create optimized production build"
echo "2. Run: ./optimize-images.sh - to optimize all images"
echo "3. Check: build/stats.html - for detailed bundle analysis (after build)"
echo "4. Test: npx serve -s build - to test production build locally"
echo ""

# Test URLs
echo "🧪 Testing Tools:"
echo "----------------"
echo "After deployment, test with:"
echo "• PageSpeed: https://pagespeed.web.dev/"
echo "• WebPageTest: https://www.webpagetest.org/"
echo "• GTmetrix: https://gtmetrix.com/"
echo ""

echo "✅ Analysis complete!"
echo ""
echo "For detailed optimization guide, see: PERFORMANCE_OPTIMIZATION_GUIDE.md"
