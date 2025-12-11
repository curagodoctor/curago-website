# 🚀 Quick Start - Fix CORS Now!

## Immediate Solution (5 minutes)

Since you're still getting CORS errors, use the proxy method instead:

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Run Development Server

```bash
vercel dev
```

**Important:** Use `vercel dev` instead of `npm run dev`

This will:
- Start your app on http://localhost:3000
- Enable the `/api/google-sheets-proxy` endpoint
- **Bypass all CORS issues!**

### Step 3: Test Your Form

1. Go to http://localhost:3000
2. Fill out and submit an assessment
3. Check the browser console - you should see:

```
📊 Google Sheets Config: { useProxy: true, endpoint: '/api/google-sheets-proxy', mode: 'Proxy Mode (No CORS issues)' }
✅ AURA results sent to Google Sheets and email sent
```

### Step 4: Verify in Google Sheets

Check your Google Sheet - the data should appear!

## Why This Works

```
❌ Before (Direct):
   localhost:3000 → Google Apps Script (Different origin = CORS error)

✅ Now (Proxy):
   localhost:3000 → localhost:3000/api (Same origin = No CORS!)
   → Vercel Function → Google Apps Script ✅
```

## For Production Deployment

When ready to deploy:

1. Set environment variable in Vercel dashboard:
   - Variable: `GOOGLE_APPS_SCRIPT_URL`
   - Value: Your Apps Script URL

2. Deploy:
   ```bash
   vercel --prod
   ```

Done! No more CORS issues ever.

## Troubleshooting

### "vercel: command not found"
Run: `npm install -g vercel`

### Port 3000 already in use
Stop your other dev server first (`npm run dev`)

### API route not found
Make sure `api/google-sheets-proxy.ts` exists in your project root

## Next Steps

See `SETUP-PROXY.md` for detailed explanation and configuration options.
