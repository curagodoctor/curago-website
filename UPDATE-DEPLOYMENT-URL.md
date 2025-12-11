# Update Google Apps Script Deployment URL

## Problem
The proxy server is getting "Page not found" (404) from Google Apps Script, which means the deployment URL is wrong or outdated.

## Solution

### Step 1: Get the Current Deployment URL

1. Go to https://script.google.com
2. Open your CuraGo project
3. Click **Deploy** → **Manage deployments**
4. Find the **Active** deployment (green dot)
5. Click on it and copy the **Web app URL**
6. It should look like: `https://script.google.com/macros/s/SOME_LONG_ID_HERE/exec`

**IMPORTANT**: Make sure you copy the FULL URL including `/exec` at the end!

### Step 2: Update the Proxy Server

Edit the file: `server/proxy-server.js`

Find line 10:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzm96I8BCUDFBeCWbGHYqLzbeHQ-KetMDXb7Mpku7BOqrtJ8jRJAa94uw83DPFee6fK/exec';
```

Replace with your NEW deployment URL:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_NEW_URL_HERE';
```

### Step 3: Test Locally (Optional)

Before deploying, you can test if the URL works:

```bash
cd server
npm install
node proxy-server.js
```

In another terminal:
```bash
# Test GET
curl http://localhost:3001/api/google-sheets

# Should return:
# {"status":"OK","message":"Google Apps Script is deployed and working",...}
```

If it works, press Ctrl+C to stop the server.

### Step 4: Deploy to VPS

```bash
git add server/proxy-server.js
git commit -m "fix: Update Google Apps Script deployment URL"
git push origin main
```

Then on your VPS:
```bash
git pull origin main
docker compose down
docker compose up -d --build
```

### Step 5: Verify

Test the production endpoint:
```bash
curl https://curago.in/api/google-sheets
```

Should return the same JSON response.

## Common Issues

### Issue: "Who has access" not set to "Anyone"
- The deployment must be set to "Anyone"
- If you change this setting, you MUST create a NEW deployment
- Old deployments don't inherit the new setting

### Issue: Multiple deployments exist
- Only ONE deployment should be active
- Archive old deployments to avoid confusion

### Issue: URL still returns 404
- Make sure you copied the EXACT URL including `/exec`
- Make sure you're using the Web App URL, not the Script URL
- Try creating a brand new deployment
