# Debug Steps - API Not Being Called

## What I Fixed

✅ **Email is now REQUIRED** (changed from optional)
✅ **Removed the if-check** that was skipping the API call
✅ **Both AURA and ATM updated**

---

## Steps to Test Now

### 1. Restart Dev Server (IMPORTANT!)

```bash
# Stop the server (Ctrl+C)
npm run dev
```

Wait for it to fully restart.

---

### 2. Open Browser Console

1. Open your website: http://localhost:5173
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Click **Clear console** button (🚫 icon)

---

### 3. Complete Assessment & Submit

1. Complete AURA or ATM assessment
2. Form popup will show
3. Fill all fields:
   - **Name:** Your name
   - **WhatsApp:** 10 digits
   - **Email:** Your email (**now required!**)
4. Click Submit

---

### 4. Watch Console for These Messages

**You SHOULD see (in order):**

```
✅ AURA assessment webhook sent successfully
📤 Sending AURA results to Google Sheets... {name: "...", email: "...", testType: "aura_index"}
✅ AURA results sent to Google Sheets and email sent
```

**If you see:**
```
❌ Failed to send AURA results to Google Sheets: [error message]
```
→ Copy the error message and check below

---

## Common Issues & Solutions

### Issue 1: CORS Error Still Showing

**Error:**
```
Access to fetch at 'https://script.google.com/...' has been blocked by CORS policy
```

**Solution:**
1. Your Apps Script doesn't have the `doOptions()` function
2. Open your Apps Script editor
3. Make sure you have this function at the TOP (after CONFIG):

```javascript
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}
```

4. **Re-deploy:** Deploy → Manage deployments → Edit → New version → Deploy
5. **Copy NEW URL** and update `src/utils/googleSheets.ts` line 5
6. **Restart dev server**

---

### Issue 2: No Console Messages at All

**Symptom:** Nothing appears in console when you submit

**Possible causes:**

**A) Web App URL is wrong**
- Check `src/utils/googleSheets.ts` line 5
- Must match your deployed Web App URL exactly
- Should look like: `https://script.google.com/macros/s/ABC.../exec`

**B) Import error**
- Check browser console for red errors about `sendAuraResultsToGoogleSheets`
- Make sure file saved properly

**C) Dev server not restarted**
- Stop server (Ctrl+C)
- Start again: `npm run dev`

---

### Issue 3: Network Tab Shows Failed Request

**How to check:**
1. F12 → **Network** tab
2. Submit form
3. Look for request to `script.google.com`
4. Click on it to see details

**Status 405 (Method Not Allowed):**
- CORS issue - see Issue 1 above

**Status 404 (Not Found):**
- Wrong URL - check `src/utils/googleSheets.ts`

**Status 403 (Forbidden):**
- Authorization issue in Apps Script
- Re-authorize: Deploy → New deployment → Grant permissions

**Status 500 (Internal Server Error):**
- Error in Apps Script code
- Check Apps Script → View → Executions for error details

---

### Issue 4: Request Succeeds But No Email/Data

**Symptom:** Console shows success but no email received and no data in sheet

**Solutions:**

**Check Google Sheet:**
1. Open your Google Sheet
2. Check tabs are named EXACTLY: `AURA Results` and `ATM Results`
3. Check Row 1 has headers
4. Look for new row with data

**Check Email:**
1. Check spam/junk folder
2. Make sure you entered a valid email
3. Check Apps Script → View → Executions for errors

**Check Apps Script Logs:**
1. Apps Script editor → View → Executions
2. Find recent execution
3. Click on it to see logs
4. Look for errors like "Sheet not found" or "Cannot send email"

---

## Quick Test

Want to test the API directly? Run this in browser console:

```javascript
fetch('YOUR_WEB_APP_URL_HERE', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    testType: 'aura_index',
    name: 'Test User',
    email: 'your@email.com',
    phoneNumber: '+919999999999',
    scores: { overall: 75, awareness: 80, understanding: 70, regulation: 75, alignment: 75 },
    label: 'Test',
    strengths: ['Test'],
    growth: [],
    riskFlags: [],
    eventId: 'test123'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Response:', d))
.catch(e => console.error('❌ Error:', e));
```

Replace `YOUR_WEB_APP_URL_HERE` with your actual URL.

**Expected response:**
```javascript
{success: true, message: "AURA results saved and email sent"}
```

---

## Checklist

Before asking for help, verify:

- [ ] Dev server restarted after changes
- [ ] Browser cache cleared (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Email field now shows `*` (required)
- [ ] Email validation error shows if left empty
- [ ] `src/utils/googleSheets.ts` has correct URL
- [ ] Apps Script has `doOptions()` function
- [ ] Apps Script was re-deployed after adding `doOptions()`
- [ ] Frontend uses NEW URL from re-deployment
- [ ] Google Sheet tabs named exactly: `AURA Results` / `ATM Results`
- [ ] Apps Script → View → Executions shows recent runs

---

## Current Status

After the changes I made:

✅ Email is now REQUIRED (shows * mark)
✅ Form won't submit without email
✅ API call happens unconditionally (no if-check)
✅ Console logs added for debugging

**What you need to do:**
1. Restart dev server
2. Try submitting form
3. Check browser console for messages
4. Tell me what you see!

---

**Next:** Complete a test assessment and tell me what shows in the browser console!
