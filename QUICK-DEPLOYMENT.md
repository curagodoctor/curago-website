# Quick VPS Deployment Guide - OTP Feature

## ✅ What's Ready

All code changes are complete and ready to deploy:

1. ✅ **OTP endpoints** added to proxy server (`server/proxy-server.js`)
2. ✅ **Wylto WhatsApp API** integrated with your API key
3. ✅ **Docker Compose** configured with environment variables
4. ✅ **Traefik routing** set up for `/api/*` requests
5. ✅ **Frontend** already calling the correct endpoints

## 🚀 Deploy to VPS (5 Steps)

### Step 1: Push Code to Git
```bash
git add .
git commit -m "Add OTP functionality with Wylto WhatsApp API"
git push origin main
```

### Step 2: SSH to VPS
```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### Step 3: Navigate to Project & Pull
```bash
cd /path/to/curago-website
git pull origin main
```

### Step 4: Update .env File
```bash
nano .env
```

Add these lines (or verify they exist):
```bash
# OTP Configuration
WYLTO_API_URL=https://server.wylto.com/api/v1/wa/send
WYLTO_API_KEY=q-P4dXYZG0BBdvPOzOmiEMBypMNPX3OGZyrzdklwGcg1BKUezcB0YjYLe0rhfERqmMh0J16Uh2DBqh3dYzt54htXrXjhqEEx
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Rebuild & Restart Docker
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## ✅ Verify Deployment

### Check Container Status
```bash
docker compose ps
```
All should show "Up"

### Check Logs
```bash
docker compose logs -f proxy-server
```

Look for:
```
🚀 Proxy server running on port 3001
📱 OTP endpoints: http://localhost:3001/api/send-otp & /api/verify-otp
🔑 Wylto API configured: Yes
```

### Test OTP Endpoint
```bash
curl -X POST https://curago.in/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","whatsapp":"9876543210","name":"Test"}'
```

Expected: `{"success":true,"message":"OTP sent successfully to your WhatsApp"}`

## 🎯 How It Works

```
User Browser (curago.in)
    ↓
    | POST /api/send-otp
    ↓
Traefik (Reverse Proxy)
    ↓
    | Routes /api/* requests
    ↓
Proxy Server (Container)
    ↓
    | Calls Wylto API
    ↓
Wylto WhatsApp API
    ↓
User receives OTP on WhatsApp
```

## 🔧 Troubleshooting

### If OTP not sending:
```bash
# Check environment variables
docker compose exec proxy-server env | grep WYLTO

# Check logs for errors
docker compose logs proxy-server | grep -i "wylto\|otp\|error"
```

### If API not accessible:
```bash
# Test from VPS internally
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","whatsapp":"9876543210","name":"Test"}'

# Check Traefik routing
docker compose logs reverse-proxy | grep api
```

### If containers won't start:
```bash
# View detailed logs
docker compose logs

# Check if ports are in use
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3001
```

## 📞 Quick Commands

```bash
# View all logs
docker compose logs -f

# Restart everything
docker compose restart

# Stop everything
docker compose down

# Rebuild specific service
docker compose up -d --build proxy-server

# Check service health
docker compose exec proxy-server wget -O- http://localhost:3001/api/health
```

## ⚠️ Important Notes

- The `.env` file is NOT in Git (it's in .gitignore)
- You must manually update `.env` on the VPS after pulling code
- OTP storage is in-memory (resets on container restart)
- For production, consider using Redis for OTP storage

## 🎉 That's It!

Once deployed, users can:
1. Enter their info on the GBSI quiz
2. Receive OTP on WhatsApp via Wylto
3. Verify OTP to access the quiz
4. Complete the assessment

For detailed troubleshooting, see `VPS-OTP-DEPLOYMENT-GUIDE.md`
