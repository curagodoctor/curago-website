# VPS Deployment Guide

Complete guide for deploying updates to the CuraGo website on production VPS.

## Server Details

- **VPS IP:** `93.127.213.204`
- **SSH User:** `root`
- **Project Path:** `/opt/curago-website`
- **Domain:** `https://curago.in`
- **Git Branch:** `main`

---

## Quick Deployment (Most Common)

```bash
# Connect to VPS
ssh root@93.127.213.204

# Navigate to project
cd /opt/curago-website

# Deploy
git pull origin main && docker compose down && docker compose up -d --build

# Verify
docker compose ps
```

---

## Standard Deployment Process

### Step 1: Connect to VPS

```bash
ssh root@93.127.213.204
```

### Step 2: Navigate to Project Directory

```bash
cd /opt/curago-website
```

### Step 3: Update Environment Variables (If Needed)

If your changes require new environment variables:

```bash
# Edit .env file
nano .env

# Add/update variables, then save:
# Ctrl+O, Enter, Ctrl+X
```

### Step 4: Pull Latest Code

```bash
# Check current status
git status

# Pull latest changes
git pull origin main
```

### Step 5: Deploy

**Standard deployment:**
```bash
docker compose down
docker compose up -d --build
```

**Full rebuild (if dependencies changed):**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Step 6: Verify Deployment

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# Test website
curl -I https://curago.in
```

---

## Deployment Scenarios

### Scenario 1: Frontend Changes Only

```bash
cd /opt/curago-website
git pull origin main
docker compose restart website
docker compose logs -f website
```

### Scenario 2: Backend/API Changes

```bash
cd /opt/curago-website
git pull origin main
docker compose restart proxy-server
docker compose logs -f proxy-server
```

### Scenario 3: New Dependencies or Config Changes

```bash
cd /opt/curago-website
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

### Scenario 4: Environment Variables Updated

```bash
cd /opt/curago-website
nano .env  # Update variables
docker compose down
docker compose up -d
docker compose logs -f
```

### Scenario 5: Emergency Rollback

```bash
cd /opt/curago-website
git log --oneline -5  # Find previous commit
git reset --hard <commit-hash>
docker compose down
docker compose up -d --build
```

---

## Automated Deployment Script

Create a reusable script for easier deployments:

```bash
# Create deploy.sh
cat > /opt/curago-website/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying CuraGo Website..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /opt/curago-website

echo -e "\n${YELLOW}1. Pulling latest code...${NC}"
git pull origin main

echo -e "\n${YELLOW}2. Stopping containers...${NC}"
docker compose down

echo -e "\n${YELLOW}3. Rebuilding & starting...${NC}"
docker compose up -d --build

echo -e "\n${YELLOW}4. Waiting for startup...${NC}"
sleep 5

echo -e "\n${YELLOW}5. Container status:${NC}"
docker compose ps

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Logs: docker compose logs -f"
echo "🌐 Test: curl -I https://curago.in"
EOF

chmod +x /opt/curago-website/deploy.sh
```

**Usage:**
```bash
cd /opt/curago-website
./deploy.sh
```

---

## Monitoring & Logs

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f website
docker compose logs -f proxy-server
docker compose logs -f reverse-proxy

# Last N lines
docker compose logs --tail=50

# Search for errors
docker compose logs | grep -i error

# Follow logs with timestamp
docker compose logs -f --timestamps
```

### Check Container Status

```bash
# List all containers
docker compose ps

# Detailed container info
docker ps

# Container resource usage
docker stats

# Check specific service health
docker exec curago-proxy wget -O- http://localhost:3001/api/health
```

---

## Troubleshooting

### Issue: Containers not starting

**Check logs:**
```bash
docker compose logs
```

**Common fixes:**
```bash
# Restart all services
docker compose restart

# Full rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Issue: Changes not reflecting

**Clear cache and rebuild:**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d

# Also clear browser cache: Ctrl+Shift+R
```

### Issue: Port already in use

**Find what's using the port:**
```bash
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3001

# Stop the conflicting service or container
docker compose down
```

### Issue: Disk space full

**Clean up Docker:**
```bash
# Remove unused containers, networks, images
docker system prune -a

# Check disk usage
df -h
du -sh /opt/curago-website/*
```

### Issue: Git pull fails

**Stash local changes:**
```bash
git stash
git pull origin main
git stash pop

# Or reset to remote
git fetch origin
git reset --hard origin/main
```

### Issue: Environment variables not loading

**Restart containers:**
```bash
docker compose down
docker compose up -d

# Verify variables are loaded
docker exec curago-proxy printenv
```

### Issue: SSL certificate issues

**Check Traefik logs:**
```bash
docker compose logs reverse-proxy | grep -i cert

# Restart Traefik
docker compose restart reverse-proxy
```

---

## Health Checks

### Website Health

```bash
# Check homepage
curl -I https://curago.in

# Check specific pages
curl -I https://curago.in/calm
curl -I https://curago.in/aura

# Check API health
curl https://curago.in/api/health
```

### Container Health

```bash
# All containers status
docker compose ps

# Specific health checks
docker exec curago-proxy wget -qO- http://localhost:3001/api/health
docker exec curago-website wget -qO- http://localhost/health

# Resource usage
docker stats --no-stream
```

---

## Maintenance Tasks

### Regular Maintenance

```bash
# Clean up old Docker resources (monthly)
docker system prune -a

# Check logs size
du -sh /opt/curago-website/logs/*

# Rotate/clear old logs
cd /opt/curago-website/logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz *.log
rm *.log
```

### Backup

```bash
# Backup .env file
cp /opt/curago-website/.env /opt/curago-website/.env.backup

# Backup Let's Encrypt certificates
tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz /opt/curago-website/letsencrypt/
```

---

## Environment Variables Reference

Current environment variables in `.env`:

```env
# Google Apps Script
VITE_GOOGLE_APPS_SCRIPT_URL=<your_script_url>
VITE_USE_PROXY=true
GOOGLE_APPS_SCRIPT_URL=<your_script_url>

# Razorpay (for payment features)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

**Important:**
- Never commit `.env` to git
- Use `rzp_live_` for production, `rzp_test_` for testing
- Keep backup of `.env` file

---

## Service Architecture

```
Internet
   ↓
Traefik (reverse-proxy) - Port 80/443
   ↓
   ├─→ Website (nginx) - Port 80
   │   └─→ Static React App
   │
   └─→ Proxy Server (node) - Port 3001
       └─→ API endpoints (/api/*)
```

**Services:**
- `reverse-proxy`: Traefik - SSL/TLS & routing
- `website`: Nginx - Static site hosting
- `proxy-server`: Node.js - API proxy server

---

## Quick Reference Commands

### Deployment
```bash
# Quick deploy
./deploy.sh

# Manual deploy
git pull && docker compose down && docker compose up -d --build
```

### Logs
```bash
# All logs
docker compose logs -f

# Recent errors
docker compose logs --tail=100 | grep -i error
```

### Status
```bash
# Container status
docker compose ps

# Resource usage
docker stats
```

### Restart
```bash
# All services
docker compose restart

# Specific service
docker compose restart website
```

### Emergency
```bash
# Stop everything
docker compose down

# Force stop
docker compose kill

# Start fresh
docker compose down && docker compose up -d --build
```

---

## Support Contacts

- **Email:** curagodoctor@gmail.com
- **WhatsApp:** +917021227203

---

## Additional Documentation

- **Payment Verification Setup:** `PAYMENT_VERIFICATION_SETUP.md`
- **502 Error Fix:** `QUICK_FIX_502.md`
- **Fix Script:** `fix-deployment.sh`

---

**Last Updated:** December 2024
