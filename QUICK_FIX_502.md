# Quick Fix for 502 Bad Gateway Error

If you're getting a **502 Bad Gateway** error when accessing `/api/verify-payment`, follow these steps:

## Problem

The error occurs because:
1. The containers need to be rebuilt with the new code and dependencies
2. Environment variables need to be loaded in the proxy-server container
3. Docker network needs to be recreated for proper communication

## Solution

### On Your VPS (Quick Method)

```bash
# Connect to VPS
ssh root@93.127.213.204

# Navigate to project
cd /opt/curago-website

# Pull latest code
git pull origin main

# Make fix script executable
chmod +x fix-deployment.sh

# Run the fix script
./fix-deployment.sh
```

The script will:
- ✅ Verify .env file exists with Razorpay credentials
- ✅ Stop all containers
- ✅ Rebuild without cache
- ✅ Start containers
- ✅ Test connectivity between services
- ✅ Verify environment variables are loaded

### Manual Method (If Script Fails)

If the automated script doesn't work, run these commands manually:

```bash
# 1. Ensure .env file has Razorpay credentials
cat .env | grep RAZORPAY

# Should show:
# RAZORPAY_KEY_ID=rzp_live_xxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx

# 2. Stop containers
docker compose down

# 3. Remove containers and networks
docker compose rm -f

# 4. Rebuild from scratch
docker compose build --no-cache

# 5. Start services
docker compose up -d

# 6. Wait 10 seconds
sleep 10

# 7. Check if proxy-server is running
docker compose ps | grep proxy-server

# 8. Test proxy-server health
docker exec curago-proxy wget -O- http://localhost:3001/api/health

# Should return:
# {"status":"OK","message":"Proxy server is running"}

# 9. Test from website container
docker exec curago-website wget -O- http://proxy-server:3001/api/health

# 10. Check proxy-server logs
docker compose logs proxy-server | grep "Proxy server running"

# Should show:
# 🚀 Proxy server running on port 3001
# 💳 Payment verification endpoint: http://localhost:3001/api/verify-payment
```

## Verify Environment Variables in Container

```bash
# Check if Razorpay credentials are loaded in proxy-server
docker exec curago-proxy printenv | grep RAZORPAY

# Should show (with your actual values):
# RAZORPAY_KEY_ID=rzp_live_xxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

## Test the API Endpoint

### From VPS

```bash
# Test health endpoint
curl http://localhost/api/health

# Or from outside
curl https://curago.in/api/health
```

### From Browser Console

```javascript
// Test payment verification endpoint
fetch('https://curago.in/api/verify-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ payment_id: 'pay_test123' })
})
.then(r => r.json())
.then(console.log)
```

Expected response (for invalid payment_id):
```json
{
  "success": false,
  "error": "Failed to verify payment"
}
```

## Common Issues

### Issue 1: Environment variables not loaded

**Symptom:** `Payment verification service not configured` error

**Solution:**
```bash
# Verify .env file on VPS
cat /opt/curago-website/.env

# Recreate containers to load env vars
docker compose down
docker compose up -d
```

### Issue 2: Containers can't communicate

**Symptom:** 502 Bad Gateway or `ECONNREFUSED`

**Solution:**
```bash
# Recreate network
docker compose down
docker network prune -f
docker compose up -d
```

### Issue 3: Old cached build

**Symptom:** Changes not reflecting

**Solution:**
```bash
# Force rebuild without cache
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Issue 4: Port conflict

**Symptom:** Container fails to start

**Solution:**
```bash
# Check what's using port 3001
docker compose logs proxy-server

# Restart specific service
docker compose restart proxy-server
```

## Monitoring

### Watch Logs in Real-Time

```bash
# All services
docker compose logs -f

# Only proxy-server
docker compose logs -f proxy-server

# Only website
docker compose logs -f website

# Filter for payment verification
docker compose logs -f proxy-server | grep "Verifying payment"
```

### Check Service Status

```bash
# List all containers
docker compose ps

# Check if services are healthy
docker compose ps | grep "Up"
```

## Final Verification

After fixing, test the complete flow:

1. **Go to:** https://curago.in/calm
2. **Click:** "Start CALM 1.0"
3. **Make test payment** (use Razorpay test mode)
4. **Verify redirect** to quiz page
5. **Check logs:**
   ```bash
   docker compose logs proxy-server | tail -20
   ```
6. **Should see:**
   ```
   💳 Verifying payment: pay_XXX
   ✅ Payment verification successful
   ```

## Still Having Issues?

If you're still getting errors:

1. **Share these logs:**
   ```bash
   docker compose logs proxy-server > proxy-logs.txt
   docker compose logs website > website-logs.txt
   docker compose ps > containers-status.txt
   ```

2. **Test connectivity:**
   ```bash
   # From inside website container
   docker exec curago-website ping proxy-server -c 3
   ```

3. **Check Razorpay credentials:**
   - Verify they're correct on Razorpay dashboard
   - Ensure you're using Live mode for production
   - Test with Razorpay API directly:
     ```bash
     curl -u "KEY_ID:KEY_SECRET" https://api.razorpay.com/v1/payments
     ```

---

**Need Help?**
- Email: curagodoctor@gmail.com
- WhatsApp: +917021227203
