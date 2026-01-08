# VPS OTP Deployment Guide

This guide explains how to deploy the OTP functionality with Wylto WhatsApp API to your VPS.

## 🎯 What Changed

1. **Added OTP endpoints** to the Express proxy server (`server/proxy-server.js`):
   - `/api/send-otp` - Sends OTP via WhatsApp
   - `/api/verify-otp` - Verifies the OTP

2. **Updated docker-compose.yml** with Wylto environment variables

3. **Environment variables** added to `.env` file

## 📋 Prerequisites

- SSH access to your VPS
- Docker and Docker Compose installed (the `deploy.sh` script handles this)
- Your `.env` file configured with Wylto credentials

## 🚀 Deployment Steps

### Step 1: Check Your Local `.env` File

Make sure your `.env` file contains the Wylto credentials:

```bash
# OTP Configuration (WhatsApp via Wylto)
WYLTO_API_URL=https://server.wylto.com/api/v1/wa/send
WYLTO_API_KEY=q-P4dXYZG0BBdvPOzOmiEMBypMNPX3OGZyrzdklwGcg1BKUezcB0YjYLe0rhfERqmMh0J16Uh2DBqh3dYzt54htXrXjhqEEx
```

### Step 2: Push Code to Git Repository

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Add OTP functionality with Wylto WhatsApp API"

# Push to your repository
git push origin main
```

### Step 3: Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### Step 4: Navigate to Your Project Directory

```bash
cd /path/to/curago-website
```

### Step 5: Pull the Latest Code

```bash
git pull origin main
```

### Step 6: Update the `.env` File on VPS

Create or update the `.env` file on your VPS with the Wylto credentials:

```bash
nano .env
```

Add/update these lines:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_RuHRHJlJDXFp8x
RAZORPAY_KEY_SECRET=fpc4O1VHDj2irYRmBtNvsBJs

# OTP Configuration (WhatsApp via Wylto)
WYLTO_API_URL=https://server.wylto.com/api/v1/wa/send
WYLTO_API_KEY=q-P4dXYZG0BBdvPOzOmiEMBypMNPX3OGZyrzdklwGcg1BKUezcB0YjYLe0rhfERqmMh0J16Uh2DBqh3dYzt54htXrXjhqEEx
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 7: Rebuild and Restart Docker Containers

```bash
# Stop existing containers
docker compose down

# Rebuild with no cache (ensures latest code is used)
docker compose build --no-cache

# Start containers
docker compose up -d
```

### Alternative: Use the Deployment Script

If you prefer, use the existing deployment script:

```bash
sudo bash deploy.sh
```

## 🔍 Verify Deployment

### Check Container Status

```bash
docker compose ps
```

All containers should show `Up` status.

### Check Proxy Server Logs

```bash
docker compose logs -f proxy-server
```

You should see:
```
🚀 Proxy server running on port 3001
📱 OTP endpoints: http://localhost:3001/api/send-otp & /api/verify-otp
🔑 Wylto API configured: Yes
```

### Test the OTP Endpoint

From your VPS, test the endpoint:

```bash
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "whatsapp": "9876543210",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully to your WhatsApp"
}
```

## 🌐 Frontend Integration

Your frontend should call these endpoints through the proxy server:

```javascript
// Example: Send OTP
const response = await fetch('https://curago.in/api/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    whatsapp: '9876543210',
    name: 'User Name'
  })
});

// Example: Verify OTP
const verifyResponse = await fetch('https://curago.in/api/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    whatsapp: '9876543210',
    otp: '123456'
  })
});
```

## 🐛 Troubleshooting

### OTP Not Sending

1. **Check Wylto API Key**:
   ```bash
   docker compose logs proxy-server | grep "Wylto API configured"
   ```
   Should show: `🔑 Wylto API configured: Yes`

2. **Check Container Logs**:
   ```bash
   docker compose logs -f proxy-server
   ```

3. **Verify Environment Variables**:
   ```bash
   docker compose exec proxy-server env | grep WYLTO
   ```

### Container Won't Start

1. **Check if ports are already in use**:
   ```bash
   sudo lsof -i :3001
   sudo lsof -i :80
   sudo lsof -i :443
   ```

2. **View detailed logs**:
   ```bash
   docker compose logs proxy-server
   ```

### Environment Variables Not Loading

Make sure the `.env` file is in the **same directory** as `docker-compose.yml`:

```bash
ls -la | grep .env
```

## 📊 Monitoring

### View All Logs

```bash
docker compose logs -f
```

### View Specific Service Logs

```bash
docker compose logs -f proxy-server
docker compose logs -f website
docker compose logs -f reverse-proxy
```

### Check Service Health

```bash
docker compose ps
docker compose exec proxy-server wget -O- http://localhost:3001/api/health
```

## 🔄 Rolling Back

If something goes wrong, you can quickly roll back:

```bash
# Stop containers
docker compose down

# Checkout previous commit
git log --oneline -5  # Find the commit hash
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose up -d --build
```

## 🎉 Success Checklist

- [ ] Code pushed to Git repository
- [ ] VPS updated with latest code
- [ ] `.env` file contains Wylto credentials
- [ ] Docker containers rebuilt and running
- [ ] Proxy server logs show Wylto API configured
- [ ] Test OTP endpoint returns success
- [ ] Frontend can send and verify OTPs

## 📞 Support

If you encounter issues:

1. Check the logs: `docker compose logs -f proxy-server`
2. Verify environment variables are set correctly
3. Test the Wylto API directly using curl
4. Check your firewall settings (ports 80, 443, 3001)

## 🔐 Security Notes

- Never commit `.env` file to Git (it's in `.gitignore`)
- Use secure passwords for Traefik dashboard
- Consider using Docker secrets for sensitive data in production
- Regularly update Docker images and dependencies
