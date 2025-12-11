# Google Apps Script Deployment Verification

## Current Issue

Getting error: `{"success":false,"error":"Unexpected token < in JSON at position 0"}`

This means Google Apps Script is returning HTML (error page) instead of JSON.

## Common Causes

1. **Wrong deployment URL** - Using an old deployment URL
2. **Apps Script has errors** - Check the execution logs
3. **Authorization needed** - Script needs permission to access Drive/Gmail
4. **Deployment not set to "Anyone"** - Access restricted

## Step-by-Step Fix

### Step 1: Verify Apps Script Deployment

1. Go to https://script.google.com
2. Open your CuraGo project
3. Click **Deploy** → **Manage deployments**
4. Check the **Active** deployment (should have a green dot)
5. **IMPORTANT**: Copy the EXACT Web app URL (it should end with `/exec`)

The URL should look like:
```
https://script.google.com/macros/s/AKfycbzm96I8BCUDFBeCWbGHYqLzbeHQ-KetMDXb7Mpku7BOqrtJ8jRJAa94uw83DPFee6fK/exec
```

### Step 2: Verify "Who has access" Setting

1. In the deployment settings, check **"Who has access"**
2. It MUST be set to: **"Anyone"**
3. If it says "Only myself" or anything else, change it to "Anyone"
4. If you change this, you need to create a **NEW deployment**

### Step 3: Check Apps Script Execution Logs

1. In Apps Script editor, go to **Executions** (left sidebar)
2. Look for recent executions that failed
3. Click on them to see the error details
4. Common errors:
   - `Sheet "AURA Results" not found` - Create the sheet in your spreadsheet
   - `You do not have permission to call DriveApp` - Need to re-authorize
   - `TypeError: Cannot read property 'postData' of undefined` - Wrong HTTP method (should be POST)

### Step 4: Test the Deployment URL Directly

Open a new browser tab and paste this (replace with your actual URL):

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

You should see:
```json
{
  "status": "OK",
  "message": "Google Apps Script is deployed and working",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "deployment": "CORS enabled"
}
```

If you see an HTML error page or get redirected to a login page:
- **HTML error page** → There's an error in the Apps Script code
- **Login page** → Deployment is not set to "Anyone"

### Step 5: Update the Proxy Server URL

If you got a NEW deployment URL in Step 1, update it in:

**File**: `server/proxy-server.js` (line 11)
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_NEW_DEPLOYMENT_URL_HERE';
```

### Step 6: Re-authorize Drive Access (if needed)

If you're getting Drive permission errors:

1. In Apps Script editor, add this test function temporarily:
```javascript
function testDriveAccess() {
  const folderId = '1ztLlzdZgZyJZR1BfICOHBPzbeNRDwTTx';
  const folder = DriveApp.getFolderById(folderId);
  Logger.log('Folder name: ' + folder.getName());
}
```

2. Run this function (it will ask for permissions)
3. Authorize it
4. Delete the test function
5. Create a **NEW deployment** (old deployments don't inherit new permissions)

### Step 7: Verify Sheets Exist

Your Google Spreadsheet MUST have these sheets:
- **AURA Results** (exact name, case-sensitive)
- **ATM Results** (exact name, case-sensitive)

If they don't exist, create them.

### Step 8: Redeploy on VPS

After fixing the Apps Script:

```bash
# On your VPS
cd /path/to/curago-website
git pull origin main
docker compose down
docker compose up -d --build
```

## Quick Test

Test with curl:

```bash
# Test GET (should work)
curl https://curago.in/api/google-sheets

# Test POST (should work)
curl -X POST https://curago.in/api/google-sheets \
  -H "Content-Type: application/json" \
  -d '{"testType":"aura_index","name":"Test User","email":"test@example.com","phoneNumber":"1234567890","scores":{"overall":75,"awareness":70,"understanding":75,"regulation":80,"alignment":75},"label":"Moderate","strengths":["Good awareness"],"growth":["Improve regulation"],"riskFlags":[],"eventId":"test-123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "AURA results saved and email sent",
  "pdfUrl": "https://drive.google.com/file/d/..."
}
```

## Still Not Working?

Check the Docker logs:

```bash
# On your VPS
docker logs curago-proxy --tail 100
```

This will show the actual HTML response from Google Apps Script, which will tell you exactly what the error is.
