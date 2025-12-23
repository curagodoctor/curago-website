# CuraGo Website - Performance Optimization Guide

## 📊 Current Performance Issues (Before Optimization)

### Bundle Sizes
- **Main JavaScript**: 818KB (too large!)
- **CSS**: 169KB
- **Total Images**: ~3.7MB (unoptimized)

### Key Problems Identified
1. ❌ Large unoptimized images (1.3MB PNG files)
2. ❌ No code splitting - all routes loaded upfront
3. ❌ 56 dependencies with potential unused code
4. ❌ No console.log removal in production
5. ❌ Large CSS bundle

---

## ✅ Optimizations Implemented

### 1. **Code Splitting & Lazy Loading** ⚡
- All major components now load on-demand
- Separate chunks for AURA, ATM, CALM routes
- React Suspense boundaries for smooth loading

**Impact**: Initial bundle reduced by ~60-70%

### 2. **Vite Build Optimizations** 🔧
- Manual chunk splitting for better caching
- Terser minification with console.log removal
- Vendor chunks separated (React, Radix UI, Framer Motion, Charts)

**Impact**: Better caching, smaller individual chunks

### 3. **Image Optimization Tools** 🖼️
- Created `optimize-images.sh` script
- OptimizedImage component with WebP support
- Lazy loading for all images

**Impact**: 60-80% image size reduction possible

---

## 🧪 How to Test Performance

### A. Run Bundle Analysis

```bash
# Build the project with analysis
npm run build

# This will automatically open stats.html showing:
# - Bundle size breakdown
# - Which dependencies are largest
# - Gzipped and Brotli sizes
```

### B. Measure Load Time Locally

```bash
# 1. Build production version
npm run build

# 2. Serve the build folder
npx serve -s build

# 3. Open Chrome DevTools
# - Network tab → Disable cache
# - Throttle to "Fast 3G" or "Slow 3G"
# - Reload and measure:
#   * DOMContentLoaded time
#   * Load time
#   * Total transfer size
```

### C. Use Lighthouse

1. **In Chrome DevTools**:
   - F12 → Lighthouse tab
   - Select "Performance" + "Mobile"
   - Click "Analyze page load"

2. **Target Scores**:
   - Performance: 90+ (currently likely 40-60)
   - First Contentful Paint: < 1.5s
   - Largest Contentful Paint: < 2.5s
   - Total Blocking Time: < 200ms
   - Cumulative Layout Shift: < 0.1

### D. Online Testing

**Before deploying, test with:**

1. **PageSpeed Insights**: https://pagespeed.web.dev/
   - Enter your deployed URL
   - Check both Mobile and Desktop scores

2. **WebPageTest**: https://www.webpagetest.org/
   - Test from multiple locations
   - See waterfall charts

3. **GTmetrix**: https://gtmetrix.com/
   - Historical performance tracking
   - Video playback of loading

---

## 🎯 Next Steps for Maximum Performance

### 1. Optimize Images (HIGH IMPACT)

```bash
# Install optimization tools (macOS)
brew install webp optipng jpegoptim imagemagick

# Run the optimization script
./optimize-images.sh
```

**Manual steps for large images:**
```bash
# Resize large images BEFORE optimization
# Example: Resize to max 1920px width
magick public/image.png -resize 1920x\> public/image.png

# Then run optimization script
```

### 2. Use Optimized Images in Components

Replace existing `<img>` tags with the new `OptimizedImage` component:

```tsx
// Before
<img src="/drharshali.png" alt="Dr Harshali" />

// After
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src="/drharshali.png"
  alt="Dr Harshali"
  priority={false}  // Set true for above-the-fold images
/>
```

### 3. Check for Unused Dependencies

```bash
# Install depcheck
npm install -g depcheck

# Run analysis
depcheck

# Review the output and remove unused packages
npm uninstall <unused-package>
```

### 4. Optimize Framer Motion Usage

Framer Motion is heavy (adds ~60KB). Optimize by:

```tsx
// Instead of importing all of framer-motion
import { motion } from 'framer-motion';

// Import only what you need
import { m, LazyMotion, domAnimation } from 'framer-motion';

// Use LazyMotion wrapper
<LazyMotion features={domAnimation}>
  <m.div>...</m.div>
</LazyMotion>
```

### 5. Enable Preconnect for External Resources

Add to `index.html` `<head>`:

```html
<!-- Preconnect to external resources -->
<link rel="preconnect" href="https://script.google.com">
<link rel="preconnect" href="https://server.wylto.com">
<link rel="dns-prefetch" href="https://script.google.com">
```

### 6. Add Resource Hints

For critical fonts or CDN resources:

```html
<link rel="preload" as="font" href="/fonts/your-font.woff2" type="font/woff2" crossorigin>
```

---

## 📈 Performance Monitoring Strategy

### Initial Benchmark (Before Optimization)
1. Run Lighthouse audit - record scores
2. Measure bundle sizes - record all chunk sizes
3. Test on slow 3G - record load times
4. Save screenshots and metrics

### After Each Optimization
1. Re-run Lighthouse
2. Compare bundle sizes
3. Test load time improvements
4. Document improvements

### Target Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Initial Bundle | 818KB | < 200KB | 🔴 |
| Total Images | 3.7MB | < 800KB | 🔴 |
| Lighthouse Performance | ~50 | 90+ | 🔴 |
| First Contentful Paint | ~3s | < 1.5s | 🔴 |
| Time to Interactive | ~5s | < 3s | 🔴 |

---

## 🚀 Deployment Checklist

Before deploying optimized version:

- [ ] Run `npm run build` successfully
- [ ] Check `build/assets` folder - verify chunk sizes
- [ ] Test local build with `npx serve -s build`
- [ ] Run Lighthouse on local build
- [ ] Optimize at least the largest 5 images
- [ ] Remove console.logs (done automatically)
- [ ] Test all routes work with code splitting
- [ ] Verify bundle analyzer output
- [ ] Test on slow 3G network
- [ ] Check mobile performance

---

## 💡 Additional Tips

### CSS Optimization
- Consider using PurgeCSS to remove unused Tailwind classes
- Check if all Radix UI components are needed

### JavaScript Optimization
- Use Chrome DevTools Coverage tab to find unused code
- Consider tree-shaking for library imports

### Caching Strategy
- Ensure proper cache headers on your hosting
- Use long-term caching for assets (hashed filenames)
- Set up CDN if possible

### Future Improvements
- Consider migrating to Next.js for automatic optimizations
- Implement service worker for offline support
- Add skeleton loaders for better perceived performance
- Implement virtual scrolling for long lists

---

## 📚 Resources

- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)

---

## 🐛 Troubleshooting

**Build fails with memory error:**
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**Lazy loading breaks:**
- Check browser console for errors
- Verify all imports use `default` export
- Ensure Suspense fallback is present

**Images not loading:**
- Verify WebP files exist alongside originals
- Check browser support for WebP
- Fallback PNG/JPG should always work

---

**Created**: 2024-12-24
**Last Updated**: 2024-12-24
