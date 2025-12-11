# Hostinger VPS Deployment Guide

## Overview

Your CuraGo application needs two parts to work on Hostinger VPS:
1. **Frontend** (static React build) - Served by Nginx/Apache
2. **Backend Proxy** (Node.js server) - Handles Google Apps Script requests

## Architecture

```
User Browser
    ↓
Nginx (port 80/443) → Frontend (React app)
                    → /api/* → Node.js Proxy (port 3001)
                              ↓
                         Google Apps Script
                              ↓
                         Google Sheets + Drive
```

## Step 1: Setup Node.js Proxy Server

### 1.1 SSH into your Hostinger VPS

```bash
ssh your-username@your-vps-ip
```

### 1.2 Create directory for the proxy server

```bash
mkdir -p /home/your-username/curago-proxy
cd /home/your-username/curago-proxy
```

### 1.3 Upload files to VPS

Upload these files from your local `server/` folder:
- `proxy-server.js`
- `package.json`

You can use SCP:
```bash
# Run this on your local machine
scp server/* your-username@your-vps-ip:/home/your-username/curago-proxy/
```

### 1.4 Install dependencies

```bash
cd /home/your-username/curago-proxy
npm install
```

### 1.5 Test the proxy server

```bash
npm start
```

You should see:
```
🚀 Proxy server running on port 3001
📍 Proxying to: https://script.google.com/macros/s/...
🔗 Endpoint: http://localhost:3001/api/google-sheets
```

Press Ctrl+C to stop.

## Step 2: Setup PM2 (Process Manager)

Keep the proxy server running in the background:

### 2.1 Install PM2 globally

```bash
npm install -g pm2
```

### 2.2 Start proxy server with PM2

```bash
cd /home/your-username/curago-proxy
pm2 start proxy-server.js --name curago-proxy
```

### 2.3 Setup PM2 to start on boot

```bash
pm2 startup
pm2 save
```

### 2.4 Check status

```bash
pm2 status
pm2 logs curago-proxy
```

## Step 3: Configure Nginx Reverse Proxy

### 3.1 Edit Nginx configuration

```bash
sudo nano /etc/nginx/sites-available/curago.in
```

### 3.2 Add proxy configuration

Add this inside your `server` block:

```nginx
server {
    listen 80;
    server_name curago.in www.curago.in;

    # Root directory for your React app
    root /home/your-username/public_html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3.3 Test and reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 4: Deploy Frontend

### 4.1 Build your React app locally

```bash
# On your local machine
npm run build
```

### 4.2 Upload build files to VPS

```bash
# Upload the build directory
scp -r build/* your-username@your-vps-ip:/home/your-username/public_html/
```

## Step 5: Test Everything

### 5.1 Check proxy server is running

```bash
pm2 status
```

Should show `curago-proxy` with status `online`.

### 5.2 Test API endpoint

```bash
curl http://localhost:3001/api/health
```

Should return: `{"status":"OK","message":"Proxy server is running"}`

### 5.3 Test from browser

Visit: https://curago.in

Fill out an assessment and submit. Check:
1. Browser console for any errors
2. Google Sheet for the new row
3. Email for the PDF
4. Google Drive for the PDF file

## Troubleshooting

### Proxy server not starting

```bash
# Check logs
pm2 logs curago-proxy

# Restart
pm2 restart curago-proxy
```

### CORS errors

```bash
# Check if proxy is running
pm2 status

# Check Nginx config
sudo nginx -t

# Check if port 3001 is listening
netstat -tuln | grep 3001
```

### 502 Bad Gateway

```bash
# Make sure proxy server is running
pm2 status

# Check if Node.js is installed
node --version

# Restart everything
pm2 restart curago-proxy
sudo systemctl reload nginx
```

## Maintenance Commands

```bash
# View logs
pm2 logs curago-proxy

# Restart proxy
pm2 restart curago-proxy

# Stop proxy
pm2 stop curago-proxy

# List all PM2 processes
pm2 list

# Monitor resources
pm2 monit
```

## Updating the Application

When you make changes:

1. **Frontend changes**:
   ```bash
   npm run build
   scp -r build/* your-username@your-vps-ip:/home/your-username/public_html/
   ```

2. **Backend proxy changes**:
   ```bash
   scp server/proxy-server.js your-username@your-vps-ip:/home/your-username/curago-proxy/
   pm2 restart curago-proxy
   ```

## Security Notes

1. ✅ Never commit `.env` files with sensitive data
2. ✅ Keep your Google Apps Script URL secret (it's in the proxy server code)
3. ✅ Use HTTPS (setup SSL with Let's Encrypt)
4. ✅ Keep Node.js and npm updated
5. ✅ Regularly update dependencies: `npm audit fix`

## SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d curago.in -d www.curago.in

# Auto-renewal is setup by default, test it:
sudo certbot renew --dry-run
```

## Done!

Your application should now be fully deployed and working on Hostinger VPS with:
- ✅ No CORS issues
- ✅ PDF generation and storage
- ✅ Email sending
- ✅ Data saving to Google Sheets
