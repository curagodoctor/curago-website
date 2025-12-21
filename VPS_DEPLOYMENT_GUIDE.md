# VPS Deployment Guide with Razorpay Payment Verification

This guide covers deploying the payment verification feature to your production VPS.

## Prerequisites

- SSH access to VPS: `root@93.127.213.204`
- Razorpay account with Key ID and Secret
- GitHub repository access

## Step-by-Step Deployment

### Step 1: Connect to VPS

```bash
ssh root@93.127.213.204
```

### Step 2: Navigate to Website Directory

```bash
cd /opt/curago-website
```

### Step 3: Create/Update .env File on VPS

The `.env` file on the VPS needs Razorpay credentials. Create or update it:

```bash
# Edit the .env file
nano .env
```

Add the following content (replace with your actual Razorpay credentials):

```env
# Google Apps Script Configuration
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwAlttxxgXZTAe7DrnTzoEoXoqAQbvLemRpCEhvE_EIhrXr2xc7SLZ6MTE0pXkWPSDs/exec
VITE_USE_PROXY=true
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwAlttxxgXZTAe7DrnTzoEoXoqAQbvLemRpCEhvE_EIhrXr2xc7SLZ6MTE0pXkWPSDs/exec

# Razorpay Configuration (PRODUCTION)
# Get these from: https://dashboard.razorpay.com/app/keys
# ⚠️ USE LIVE MODE CREDENTIALS FOR PRODUCTION
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Important:**
- For production, use **Live Mode** credentials (starts with `rzp_live_`)
- For testing, use **Test Mode** credentials (starts with `rzp_test_`)
- Never commit this file to git

Save and exit:
- Press `Ctrl + O` to save
- Press `Enter` to confirm
- Press `Ctrl + X` to exit

### Step 4: Update Code from GitHub

```bash
# Check current status
git status

# Stash any local changes (like .env file and logs)
git stash

# Pull latest changes from GitHub
git pull origin main

# Restore the stashed .env file
git stash pop

# If there's a conflict, keep the local .env file
# (The .env file should be in .gitignore anyway)
```

**Alternative (if .env gets overwritten):**

```bash
# Just pull the code
git pull origin main

# Re-create .env with production credentials
nano .env
```

### Step 5: Deploy Updated Code

```bash
# Stop current containers
docker compose down

# Build and start with new code
# The --build flag ensures Docker rebuilds with latest code
docker compose up -d --build
```

### Step 6: Verify Deployment

```bash
# Watch logs to ensure successful deployment
docker compose logs -f

# Or watch specific service logs
docker compose logs -f proxy-server
docker compose logs -f website

# Press Ctrl+C to stop watching logs
```

Check if containers are running:

```bash
docker compose ps
```

You should see:
```
NAME               STATUS          PORTS
curago-proxy       Up
curago-website     Up
traefik            Up             0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Step 7: Test Payment Verification

1. **Check proxy server logs:**
   ```bash
   docker compose logs proxy-server | grep "Proxy server running"
   ```

   Should show:
   ```
   🚀 Proxy server running on port 3001
   💳 Payment verification endpoint: http://localhost:3001/api/verify-payment
   ```

2. **Test the verification endpoint:**
   ```bash
   # From inside the VPS, test if the endpoint responds
   docker exec curago-proxy wget -O- http://localhost:3001/api/health
   ```

   Should return:
   ```json
   {"status":"OK","message":"Proxy server is running"}
   ```

3. **Make a test payment:**
   - Go to https://curago.in/calm
   - Click "Start CALM 1.0"
   - Complete payment (use test mode if testing)
   - Verify you're redirected to quiz with payment verification

4. **Check logs for verification:**
   ```bash
   docker compose logs -f proxy-server
   ```

   Look for:
   ```
   💳 Verifying payment: pay_XXX
   ✅ Payment verification successful
   ```

## Troubleshooting

### Issue: "Payment verification service not configured"

**Solution:**
```bash
# Verify .env file exists and has Razorpay credentials
cat .env | grep RAZORPAY

# Restart proxy server to pick up environment variables
docker compose restart proxy-server

# Check logs
docker compose logs proxy-server
```

### Issue: Container not starting

**Solution:**
```bash
# Check detailed logs
docker compose logs proxy-server

# Common issues:
# 1. Syntax error in .env file
# 2. Missing dependencies
# 3. Port conflict

# Rebuild without cache
docker compose down
docker compose build --no-cache proxy-server
docker compose up -d
```

### Issue: Payment verification failing

**Solution:**
```bash
# 1. Verify credentials are correct
docker exec curago-proxy printenv | grep RAZORPAY

# 2. Test Razorpay API manually (from VPS)
curl -u "YOUR_KEY_ID:YOUR_KEY_SECRET" https://api.razorpay.com/v1/payments/pay_XXXXX

# 3. Check if proxy server can reach Razorpay
docker exec curago-proxy wget -O- https://api.razorpay.com/
```

### Issue: .env file keeps getting overwritten by git pull

**Solution:**
```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"

# On VPS, tell git to ignore changes to .env
git update-index --skip-worktree .env
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RAZORPAY_KEY_ID` | Razorpay Key ID (Live/Test) | `rzp_live_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret (Live/Test) | `xxxxxxxxxxxxxx` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Proxy server port | `3001` |

## Security Checklist

- ✅ .env file has correct permissions: `chmod 600 .env`
- ✅ .env file is in .gitignore
- ✅ Using Live Mode credentials in production
- ✅ Key Secret is never exposed in frontend code
- ✅ HTTPS is enabled (Traefik handles this)
- ✅ Payment verification happens server-side only

## Razorpay Dashboard Configuration

### Production Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Switch to **Live Mode** (top-right toggle)
3. Go to **Settings → API Keys**
4. Copy **Key ID** and **Key Secret**
5. Update VPS `.env` file with these credentials

### Payment Button Configuration

1. Go to **Payment Pages → Payment Buttons**
2. Select your CALM payment button
3. Set **Success URL** to:
   ```
   https://curago.in/calm/quiz?uuid=7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94
   ```
4. Razorpay will automatically append `&payment_id=pay_XXX`
5. Save the payment button

## Monitoring and Maintenance

### Check Service Health

```bash
# All services
docker compose ps

# Proxy server health
curl http://localhost:3001/api/health

# Check logs for errors
docker compose logs --tail=100 proxy-server
```

### View Recent Payment Verifications

```bash
# Last 50 log lines with payment info
docker compose logs --tail=50 proxy-server | grep "Verifying payment"
```

### Restart Services

```bash
# Restart proxy server only
docker compose restart proxy-server

# Restart all services
docker compose restart

# Full rebuild and restart
docker compose down && docker compose up -d --build
```

## Quick Deployment Commands

For future updates, use these commands:

```bash
# Quick update script
cd /opt/curago-website && \
git stash && \
git pull origin main && \
git stash pop && \
docker compose down && \
docker compose up -d --build && \
docker compose logs -f
```

Or create a deployment script:

```bash
# Create deploy.sh
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /opt/curago-website

echo "📥 Pulling latest code..."
git stash
git pull origin main
git stash pop || true

echo "🐳 Rebuilding containers..."
docker compose down
docker compose up -d --build

echo "✅ Deployment complete!"
echo "📊 Checking status..."
docker compose ps

echo ""
echo "💡 View logs with: docker compose logs -f"
EOF

chmod +x deploy.sh
```

Then deploy with:
```bash
./deploy.sh
```

## Support

If you encounter issues:
1. Check logs: `docker compose logs -f proxy-server`
2. Verify .env file: `cat .env | grep RAZORPAY`
3. Test health endpoint: `curl http://localhost:3001/api/health`
4. Contact support: curagodoctor@gmail.com

---

**Last Updated:** December 2024
