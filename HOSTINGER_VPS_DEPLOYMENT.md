# 🚀 Hostinger VPS Deployment Guide

## ✅ Fixed React Build Issue

**Problem:** White screen with "Cannot read properties of undefined (reading 'createContext')"
**Cause:** Code splitting was breaking React dependencies
**Fix:** ✅ Simplified code splitting - React now loads correctly

---

## 📦 Build & Upload to Hostinger VPS

### Step 1: Build Production Files
```bash
npm run build
```

**Expected output:**
```
✓ built in 5.55s
```

This creates the `/build` folder with your production files.

---

### Step 2: Upload to Hostinger VPS

#### Option A: Using FTP/SFTP (Recommended)

**Using FileZilla or any FTP client:**

1. **Connect to your VPS:**
   - Host: Your VPS IP or domain
   - Username: Your SSH username
   - Password: Your SSH password
   - Port: 22 (SFTP) or 21 (FTP)

2. **Upload files:**
   - Navigate to your web root (usually `/var/www/html` or `/home/username/public_html`)
   - Upload ALL files from `/build` folder
   - Make sure to include:
     - `index.html`
     - `/assets` folder (all JS/CSS files)
     - All image files (.webp, .png, etc.)
     - `_headers` file

3. **Set correct permissions:**
   ```bash
   chmod 755 /var/www/html
   chmod 644 /var/www/html/*
   chmod 755 /var/www/html/assets
   chmod 644 /var/www/html/assets/*
   ```

---

#### Option B: Using SCP (Command Line)

```bash
# From your local machine
cd /Users/raghavendra/curago-website

# Upload to VPS (replace with your details)
scp -r build/* username@your-vps-ip:/var/www/html/

# Example:
# scp -r build/* root@192.168.1.100:/var/www/html/
```

---

#### Option C: Using rsync (Best for updates)

```bash
# First time or full sync
rsync -avz --delete build/ username@your-vps-ip:/var/www/html/

# Example:
# rsync -avz --delete build/ root@192.168.1.100:/var/www/html/
```

---

### Step 3: Configure Web Server

#### For Apache (.htaccess)

Create `/var/www/html/.htaccess`:

```apache
# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript
</IfModule>

# Cache static assets for 1 year
<IfModule mod_expires.c>
  ExpiresActive On

  # Images
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"

  # CSS and JavaScript
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"

  # Fonts
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"

  # HTML - no cache
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Add cache control headers
<IfModule mod_headers.c>
  # Cache images for 1 year
  <FilesMatch "\.(jpg|jpeg|png|webp|svg|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Cache CSS/JS for 1 year
  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Don't cache HTML
  <FilesMatch "\.(html)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>

# Redirect all requests to index.html for SPA routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Upload this .htaccess file to `/var/www/html/.htaccess`**

---

#### For Nginx

Edit your Nginx config (usually `/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript text/html text/plain application/json;
    gzip_min_length 1000;

    # Cache static assets for 1 year
    location ~* \.(jpg|jpeg|png|webp|svg|ico|css|js|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        expires 0;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # SPA routing - redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**After editing:**
```bash
# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

### Step 4: Verify Deployment

1. **Check files uploaded:**
   ```bash
   ssh username@your-vps-ip
   ls -la /var/www/html/
   ```

   Should see:
   - `index.html`
   - `assets/` folder
   - All image files
   - `.htaccess` (if using Apache)

2. **Open your website:**
   - Visit http://your-domain.com
   - Should see your site loading (not white screen!)

3. **Check browser console:**
   - Press F12
   - Console should be clear (no errors)

4. **Test performance:**
   - Run Lighthouse
   - Should see improved scores

---

### Step 5: Verify Cache Headers

1. Open your site in Chrome
2. Press F12 → Network tab
3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Click any image
5. Check Response Headers
6. Should see: `Cache-Control: public, max-age=31536000, immutable`

---

## 🔧 Troubleshooting

### White Screen / Blank Page

**Check:**
1. Are all files uploaded? (especially `/assets` folder)
2. Are file permissions correct? (644 for files, 755 for folders)
3. Is `.htaccess` uploaded? (for Apache)
4. Check browser console for errors

**Fix:**
```bash
# SSH into VPS
ssh username@your-vps-ip

# Check files exist
ls -la /var/www/html/
ls -la /var/www/html/assets/

# Fix permissions
chmod 755 /var/www/html
chmod 644 /var/www/html/*
chmod 755 /var/www/html/assets
chmod 644 /var/www/html/assets/*

# Restart web server
sudo systemctl restart apache2
# OR
sudo systemctl restart nginx
```

---

### 404 Errors on Refresh

**Problem:** Refreshing the page on `/team` or `/contact` shows 404

**Fix:** Ensure `.htaccess` (Apache) or Nginx config has SPA routing configured (see Step 3 above)

---

### Images Not Loading

**Check:**
1. Are image files uploaded to `/var/www/html/`?
2. Are filenames correct (case-sensitive)?
3. Check browser console for 404 errors

**Fix:**
```bash
# List images
ls -la /var/www/html/*.webp
ls -la /var/www/html/*.png

# Upload missing images
scp build/*.webp username@your-vps-ip:/var/www/html/
scp build/*.png username@your-vps-ip:/var/www/html/
```

---

### Cache Headers Not Working

**Apache:**
```bash
# Enable required modules
sudo a2enmod expires
sudo a2enmod headers
sudo systemctl restart apache2
```

**Nginx:**
- Check config syntax: `sudo nginx -t`
- Reload: `sudo systemctl reload nginx`

---

## 📋 Quick Deploy Checklist

- [ ] Run `npm run build` locally ✅
- [ ] Upload all files from `/build` to VPS
- [ ] Upload `.htaccess` (Apache) or configure Nginx
- [ ] Set correct file permissions
- [ ] Restart web server
- [ ] Test site in browser (no white screen)
- [ ] Check browser console (no errors)
- [ ] Verify cache headers
- [ ] Run Lighthouse test

---

## 🚀 One-Command Deploy Script

Create `deploy.sh` in your project:

```bash
#!/bin/bash

# Build
echo "Building..."
npm run build

# Deploy to VPS (replace with your details)
echo "Uploading to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  build/ username@your-vps-ip:/var/www/html/

echo "Deployed! Visit http://your-domain.com"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Then deploy with:
```bash
./deploy.sh
```

---

## 📊 Expected Performance

After deployment:

- **LCP:** 2.5-3.0s (was 8.2s)
- **Performance Score:** 85-95 (was 51-60)
- **Cache:** 292 KiB saved on repeat visits
- **No white screen!** ✅

---

## 🆘 Still Having Issues?

1. **Check Apache/Nginx error logs:**
   ```bash
   # Apache
   sudo tail -f /var/log/apache2/error.log

   # Nginx
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check file permissions:**
   ```bash
   ls -la /var/www/html/
   ```

   Files should be `644`, folders `755`

3. **Verify web server is running:**
   ```bash
   sudo systemctl status apache2
   # OR
   sudo systemctl status nginx
   ```

---

**Your site should now work perfectly on Hostinger VPS!** ✅
