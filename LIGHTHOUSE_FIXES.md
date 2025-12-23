# 🔥 Lighthouse Issues - Action Plan

## Current Scores
- ⚠️ Performance: **70** (Target: 90+)
- ✅ Accessibility: **90**
- 🔴 Best Practices: **58** (Needs work)
- ✅ SEO: **92**

## 🔴 CRITICAL Performance Issues

### 1. LCP: 11.7s (Target: < 2.5s) - PRIORITY #1

**Problem:** Largest Contentful Paint is taking 11.7 seconds!

**Root Cause:** Large unoptimized image(s) loading slowly

**Fix Steps:**

#### A. Identify the LCP element
```bash
# In Chrome DevTools:
# 1. Right-click → Inspect
# 2. Click "Lighthouse" tab
# 3. In the report, scroll to "Largest Contentful Paint element"
# 4. It will show you exactly which image/element is causing this
```

#### B. Optimize the LCP image immediately

```bash
# Install tools if not already installed
brew install imagemagick webp optipng

# For the 1.3MB PNG (likely culprit):
cd public

# Step 1: Resize to reasonable dimensions (if it's huge)
magick 16b9238802f15faff48f3e863da5ccc19bd1bc5f.png -resize 1920x\> temp.png
mv temp.png 16b9238802f15faff48f3e863da5ccc19bd1bc5f.png

# Step 2: Optimize PNG
optipng -o5 16b9238802f15faff48f3e863da5ccc19bd1bc5f.png

# Step 3: Create WebP version (80% smaller!)
cwebp -q 85 16b9238802f15faff48f3e863da5ccc19bd1bc5f.png -o 16b9238802f15faff48f3e863da5ccc19bd1bc5f.webp

# Expected: 1.3MB → ~200-300KB
```

#### C. Use OptimizedImage component for LCP image

In the component where this image is used:

```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

// Replace <img> with:
<OptimizedImage
  src="/16b9238802f15faff48f3e863da5ccc19bd1bc5f.png"
  alt="..."
  width={1920}  // Add explicit dimensions!
  height={1080} // Prevents layout shift
  priority={true}  // ⭐ CRITICAL: Set true for LCP image!
/>
```

**Expected Result:** LCP: 11.7s → **1.5-2.5s** (8-10 second improvement!)

---

### 2. Image Elements Missing Width/Height

**Problem:** Images don't have explicit dimensions, can cause layout shift

**Fix:** Update OptimizedImage.tsx to require dimensions

```tsx
// Current OptimizedImage.tsx needs these props to be required:
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width: number;      // ⭐ Make required (remove ?)
  height: number;     // ⭐ Make required (remove ?)
  priority?: boolean;
}
```

Then update usage to always include dimensions:

```tsx
// Example for team member photos
<OptimizedImage
  src="/drharshali.png"
  alt="Dr Harshali"
  width={400}   // ⭐ Add actual dimensions
  height={400}  // ⭐ Prevents layout shift
  priority={false}
/>
```

---

### 3. Improve Image Delivery: 1,172 KiB savings

**Action:** Optimize ALL images (not just LCP)

```bash
# Run the optimization script
./optimize-images.sh

# Manual optimization for largest images:
cd public

# For each large image:
for img in image.png Drswara.png image1.png drharshali.png drutkarsh.png; do
  echo "Optimizing $img..."

  # Resize if too large
  magick "$img" -resize 1920x\> "temp-$img"
  mv "temp-$img" "$img"

  # Optimize
  optipng -o5 "$img" 2>/dev/null || jpegoptim --max=85 "$img" 2>/dev/null

  # Create WebP
  cwebp -q 85 "$img" -o "${img%.*}.webp"
done

echo "Done! Check file sizes:"
ls -lh *.png *.jpg *.webp 2>/dev/null
```

**Expected Savings:** 3,500 KiB → ~1,000 KiB (70% reduction)

---

### 4. Reduce Unused JavaScript: 260 KiB savings

**Problem:** Some imported code isn't being used

**Investigation:**

```bash
# Check bundle analysis
npm run analyze

# In Chrome DevTools:
# 1. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
# 2. Type "Show Coverage"
# 3. Click record, reload page
# 4. Look for red bars (unused code)
```

**Common culprits:**

#### A. Framer Motion - Tree Shake Better

```tsx
// BEFORE (imports everything - 115KB)
import { motion } from 'framer-motion';

// AFTER (imports only what's needed - ~60KB)
import { m, LazyMotion, domAnimation } from 'framer-motion';

// Wrap in LazyMotion
<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }}>
    {/* content */}
  </m.div>
</LazyMotion>
```

#### B. Lucide Icons - Import Individually

```tsx
// BEFORE (imports all icons)
import * as Icons from 'lucide-react';

// AFTER (import only what you need)
import { Phone, Mail, MapPin } from 'lucide-react';
```

#### C. Check for unused Radix UI components

```bash
# Find which Radix components are actually used
npx depcheck

# Remove unused ones from package.json
```

---

### 5. Render Blocking Requests: 150ms savings

**Problem:** CSS/JS blocks initial render

**Fix:** Add preload hints to critical resources

In `index.html` (before closing `</head>`):

```html
<!-- Preload critical CSS -->
<link rel="preload" as="style" href="/assets/index-[hash].css">

<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://script.google.com">
<link rel="preconnect" href="https://server.wylto.com">
<link rel="dns-prefetch" href="https://script.google.com">
<link rel="dns-prefetch" href="https://server.wylto.com">
```

---

### 6. Enormous Network Payloads: 3,696 KiB total

**Problem:** Total page size is too large

**Breakdown:**
- Images: ~3,500 KiB (95% of the problem!)
- JavaScript: ~200-300 KiB
- CSS: ~130 KiB

**Fix:** Image optimization will solve 95% of this!

**Target:** 3,696 KiB → **< 1,500 KiB**

---

## 🟡 Best Practices Issues

### 1. Uses Deprecated APIs (1 warning)

**Find the issue:**

```bash
# Check browser console for deprecation warnings
# Common culprits:
# - String.prototype.substr (use substring instead)
# - document.write
# - Synchronous XMLHttpRequest
```

**Fix:** Search your code for deprecated APIs:

```bash
# Search for common deprecated APIs
grep -r "substr(" src/
grep -r "document.write" src/
```

---

### 2. Uses Third-Party Cookies (10 cookies)

**Problem:** Third-party cookies (likely Google Analytics, tracking)

**Investigation:**

```bash
# Check what's setting cookies
# In Chrome DevTools:
# Application tab → Cookies → Check domains
```

**Note:** This is often from analytics/tracking scripts. May not be fixable if you need the tracking.

---

### 3. robots.txt Issues (92 errors)

**Fix:** Check your robots.txt file

```bash
# If you have a robots.txt in public/:
cat public/robots.txt

# Or create a proper one:
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
EOF
```

---

## ✅ What's Already Good

- **Total Blocking Time: 50ms** ✅ (Thanks to code splitting!)
- **Cumulative Layout Shift: 0** ✅ (No layout shifts)
- **Accessibility: 90** ✅ (Great!)
- **SEO: 92** ✅ (Excellent!)

---

## 📋 Action Checklist (Priority Order)

### Priority 1: Fix LCP (11.7s → < 2.5s)
- [ ] Install image tools: `brew install imagemagick webp optipng`
- [ ] Identify LCP image in Chrome DevTools
- [ ] Optimize the LCP image specifically
- [ ] Add explicit width/height to all images
- [ ] Set `priority={true}` on LCP image
- [ ] Test: Should drop LCP to ~1.5-2.5s

### Priority 2: Optimize All Images (1,172 KiB savings)
- [ ] Run `./optimize-images.sh`
- [ ] Manually optimize the 6 largest images
- [ ] Replace all `<img>` with `<OptimizedImage>`
- [ ] Add width/height to all images
- [ ] Test: Should save ~2-2.5MB

### Priority 3: Reduce JavaScript (260 KiB savings)
- [ ] Run `npm run analyze` to identify large chunks
- [ ] Optimize Framer Motion imports (LazyMotion)
- [ ] Import Lucide icons individually
- [ ] Check for unused dependencies with `npx depcheck`
- [ ] Test: Should save ~200-260KB

### Priority 4: Fix Render Blocking (150ms savings)
- [ ] Add preconnect links to index.html
- [ ] Add preload for critical CSS
- [ ] Test: Should improve FCP by ~150ms

### Priority 5: Fix Best Practices Issues
- [ ] Find and fix deprecated APIs (check console)
- [ ] Create/fix robots.txt
- [ ] Review third-party cookies (may not be fixable)

---

## 🎯 Expected Results After Fixes

| Metric | Current | After Fixes | Target |
|--------|---------|-------------|--------|
| Performance Score | 70 | **90-95** ✅ | 90+ |
| LCP | 11.7s 🔴 | **1.5-2.5s** ✅ | < 2.5s |
| FCP | 2.7s 🟡 | **< 1.5s** ✅ | < 1.5s |
| Total Size | 3,696 KiB 🔴 | **< 1,500 KiB** ✅ | < 1,500 KiB |
| Image Size | ~3,500 KiB 🔴 | **~700 KiB** ✅ | < 1,000 KiB |

---

## 🧪 Testing After Each Fix

```bash
# 1. Make the fix
# 2. Build
npm run build

# 3. Serve locally
npm run serve

# 4. Run Lighthouse again
# Chrome DevTools → Lighthouse → Analyze

# 5. Compare scores - should see improvement!
```

---

## 💡 Quick Wins (Do These First!)

1. **Optimize the LCP image** → Immediate 8-10 second improvement!
2. **Add width/height to images** → Prevents layout shift
3. **Set priority on hero images** → Loads critical content first
4. **Run optimize-images.sh** → 70% image size reduction

These 4 actions alone should get you to **Performance: 85-90**!

---

**Created:** 2024-12-24
**Based on:** Lighthouse audit results
**Priority:** Fix LCP FIRST - it's the biggest issue!
