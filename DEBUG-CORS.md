# CORS Debugging Checklist

## 1. Verify Apps Script Deployment

1. Open Apps Script: https://script.google.com
2. Click **Deploy** → **Manage deployments**
3. Check settings:
   - ✅ **Execute as**: Me (your email)
   - ✅ **Who has access**: **Anyone** (CRITICAL!)
4. After EVERY code change:
   - Click **Deploy** → **New deployment**
   - Get new URL and update frontend

## 2. Test Deployment (Browser)

Visit this URL directly in browser:
```
https://script.google.com/macros/s/AKfycbxxzdtG0LtqIExvMWy3t06aq9pg0_vbvB478zEwSAXKxI1eIQPtMfrFYtDz4gWCTMy2/exec
```

Expected result:
```json
{
  "status": "OK",
  "message": "Google Apps Script is deployed and working",
  "timestamp": "...",
  "deployment": "CORS enabled for POST requests"
}
```

If you get this, deployment is working!

## 3. Test from Browser Console

Open browser console (F12) and run:

### Test 1: OPTIONS (Preflight)
```javascript
fetch('https://script.google.com/macros/s/AKfycbxxzdtG0LtqIExvMWy3t06aq9pg0_vbvB478zEwSAXKxI1eIQPtMfrFYtDz4gWCTMy2/exec', {
  method: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => {
  console.log('✅ Preflight status:', r.status);
  console.log('✅ CORS headers:', r.headers.get('access-control-allow-origin'));
  return r.text();
})
.then(data => console.log('Response:', data))
.catch(e => console.error('❌ Preflight failed:', e));
```

### Test 2: POST Request
```javascript
fetch('https://script.google.com/macros/s/AKfycbxxzdtG0LtqIExvMWy3t06aq9pg0_vbvB478zEwSAXKxI1eIQPtMfrFYtDz4gWCTMy2/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    testType: 'aura_index',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '+911234567890',
    scores: {
      overall: 75,
      awareness: 80,
      understanding: 70,
      regulation: 75,
      alignment: 75
    },
    label: 'Test',
    strengths: ['Test'],
    growth: ['Test'],
    riskFlags: [],
    eventId: 'test_' + Date.now()
  })
})
.then(r => {
  console.log('✅ POST status:', r.status);
  return r.json();
})
.then(data => console.log('✅ Response:', data))
.catch(e => console.error('❌ POST failed:', e));
```

## 4. Check Network Tab

In Browser DevTools → Network tab:

1. Filter by "Fetch/XHR"
2. Submit your form
3. Look for the Google Apps Script request
4. Check:
   - **Request Method**: Should see OPTIONS then POST
   - **Status Code**: Should be 200
   - **Response Headers**: Should include `access-control-allow-origin: *`

## 5. Common Issues

### Issue: "doGet" in execution logs but sending POST
- **Cause**: Testing by visiting URL in browser
- **Fix**: Use fetch() tests above instead

### Issue: CORS error despite correct headers
- **Cause**: Deployment "Who has access" not set to "Anyone"
- **Fix**: Redeploy with "Anyone" access

### Issue: Old code still running
- **Cause**: Using old deployment URL
- **Fix**: Create NEW deployment after code changes

### Issue: OPTIONS request fails
- **Cause**: `doOptions` function not deployed
- **Fix**: Redeploy the script

## 6. Apps Script Code Requirements

Make sure your Apps Script has ALL three functions:

```javascript
// Handle GET (for testing)
function doGet(e) { ... }

// Handle OPTIONS (preflight)
function doOptions(e) { ... }

// Handle POST (actual data)
function doPost(e) { ... }
```

## 7. Expected Execution Log

When it works, you should see in Apps Script executions:
1. **OPTIONS** request (preflight) - Status: OK
2. **POST** request (your data) - Status: OK

NOT just "doGet" requests.
