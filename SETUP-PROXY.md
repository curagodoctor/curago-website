# Google Sheets CORS Proxy Setup Guide

## The Problem
Google Apps Script's CORS configuration is notoriously difficult to get working from localhost. Even with correct settings, it can fail.

## The Solution
Use a Vercel serverless function as a proxy. This bypasses CORS entirely by routing requests through your own backend.

## Setup Steps

### 1. Configure Environment Variable

The `.env` file has been created with your Apps Script URL:
```
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycby3qxMvFmHiAa_ZqHS3hpmTkxVGVYAJxf7ZSzk0GG05DPV-xKG3swOBaGXlJ1HbGnY/exec
```

### 2. Test Locally

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run dev server with Vercel functions
vercel dev
```

This will:
- Start your React app on http://localhost:3000
- Enable the serverless function at http://localhost:3000/api/google-sheets-proxy
- **NO CORS issues!**

### 3. How It Works

```
Browser (localhost:3000)
    ↓ POST to /api/google-sheets-proxy (same origin = no CORS)
    ↓
Vercel Serverless Function
    ↓ Forwards request to Google Apps Script
    ↓
Google Apps Script
    ↓ Returns data
    ↓
Vercel Function (adds CORS headers)
    ↓
Browser ✅ No CORS error!
```

### 4. Deploy to Production

When you deploy to Vercel:

1. Set the environment variable in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `GOOGLE_APPS_SCRIPT_URL` = your Apps Script URL

2. Deploy:
```bash
vercel --prod
```

The proxy will work automatically in production!

### 5. Switch Between Proxy and Direct Mode

In `src/utils/googleSheets.ts`:

```typescript
// Use proxy (recommended)
const USE_PROXY = true;

// OR use direct URL (if you fix CORS in Apps Script)
const USE_PROXY = false;
```

## Advantages of Proxy Method

✅ No CORS issues
✅ Works on localhost
✅ Works in production
✅ Can add rate limiting
✅ Can add authentication
✅ Can log requests
✅ Hides your Apps Script URL from client

## Testing

After running `vercel dev`, test in browser console:

```javascript
fetch('/api/google-sheets-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    testType: 'aura_index',
    name: 'Test',
    email: 'test@example.com',
    phoneNumber: '+911234567890',
    scores: { overall: 75, awareness: 80, understanding: 70, regulation: 75, alignment: 75 },
    label: 'Test',
    strengths: ['Test'],
    growth: ['Test'],
    riskFlags: [],
    eventId: 'test_' + Date.now()
  })
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(e => console.error('❌ Error:', e));
```

Expected response:
```json
{
  "success": true,
  "message": "AURA results saved and email sent"
}
```

## Apps Script Requirements

Your Apps Script doesn't need CORS headers when using the proxy! But it still needs:
- `doPost` function to handle requests
- Deployment set to "Anyone" (so the proxy can access it)
- The email and PDF generation functions

That's it! The proxy handles all CORS complexity for you.
