# Payment Verification Setup Guide

This guide explains how to set up and test the Razorpay payment verification system for the CALM 1.0 quiz.

## Overview

After a user completes payment through Razorpay, they are redirected to the quiz page with a `payment_id` parameter. The system verifies this payment with Razorpay's API before allowing access to the quiz.

## Flow Diagram

```
User clicks "Start CALM 1.0"
         ↓
Razorpay Payment Page
         ↓
Payment Success
         ↓
Redirect to: /calm/quiz?uuid=XXX&payment_id=pay_XXX
         ↓
QuizFlow Component Loads
         ↓
Verify UUID
         ↓
Verify Payment ID with Razorpay API
         ↓
Allow Access to Quiz (if verified)
```

## Setup Instructions

### 1. Get Your Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Navigate to **Settings → API Keys**
3. Copy your **Key ID** and **Key Secret**
   - **Note:** For testing, use Test Mode credentials
   - For production, switch to Live Mode credentials

### 2. Configure Environment Variables

Open the `.env` file in your project root and update the Razorpay credentials:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important:**
- Never commit your `.env` file to git
- Use Test credentials for development
- Use Live credentials only in production

### 3. Configure Razorpay Payment Button Redirect URL

In your Razorpay Dashboard:

1. Go to **Payment Pages → Payment Buttons**
2. Select your CALM payment button
3. Update the **Success URL** to:
   ```
   https://curago.in/calm/quiz?uuid=7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94
   ```
4. Razorpay will automatically append `&payment_id=pay_XXX` to this URL

⚠️ **Note:** Make sure to use `&` (not `?`) before `payment_id` since the UUID parameter already uses `?`

### 4. Start the Proxy Server

The proxy server handles payment verification API calls:

```bash
# In a separate terminal window
cd server
node proxy-server.js
```

You should see:
```
🚀 Proxy server running on port 3001
📍 Proxying to: [Google Apps Script URL]
🔗 Google Sheets endpoint: http://localhost:3001/api/google-sheets
💳 Payment verification endpoint: http://localhost:3001/api/verify-payment
```

### 5. Start the Development Server

```bash
# In your main project directory
npm run dev
```

The Vite dev server will proxy `/api/verify-payment` requests to the proxy server.

## How It Works

### Backend (Proxy Server)

The proxy server (`server/proxy-server.js`) provides a `/api/verify-payment` endpoint that:

1. Receives the `payment_id` from the frontend
2. Creates Basic Auth credentials using Razorpay Key ID and Secret
3. Calls Razorpay's Payment API: `GET https://api.razorpay.com/v1/payments/{payment_id}`
4. Checks if payment status is `captured` or `authorized`
5. Returns verification result to the frontend

### Frontend (QuizFlow Component)

The QuizFlow component (`src/components/assessment/calm/QuizFlow.tsx`):

1. Parses URL parameters (handles malformed URLs with multiple `?`)
2. Validates the UUID
3. Extracts the `payment_id` parameter
4. Calls `/api/verify-payment` endpoint
5. Shows loading screen during verification
6. Allows quiz access only if payment is verified

### Payment Verification States

The quiz shows different screens based on verification status:

- **Verifying Payment:** Loading spinner while checking payment
- **Access Denied:** Invalid or missing UUID
- **Payment Verification Failed:** Invalid or incomplete payment
- **Quiz Access:** Payment verified successfully

## Testing

### Test with Razorpay Test Mode

1. Ensure you're using Test Mode credentials in `.env`
2. Click "Start CALM 1.0" on the landing page
3. Use Razorpay's test card details:
   - Card Number: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name: Any name
4. Complete the payment
5. You should be redirected to the quiz with payment verification

### Verify in Browser Console

Open browser console to see verification logs:
```
URL params: { uuid: "7f3c9b8e...", paymentId: "pay_XXX" }
Verifying payment: pay_XXX
Payment verification response: { success: true, valid: true, ... }
✅ Payment verified successfully
```

### Test Error Cases

1. **Missing payment_id:**
   - URL: `/calm/quiz?uuid=7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94`
   - Expected: "Payment ID not found" error

2. **Invalid payment_id:**
   - URL: `/calm/quiz?uuid=7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94&payment_id=invalid`
   - Expected: "Failed to verify payment" error

3. **Missing UUID:**
   - URL: `/calm/quiz?payment_id=pay_XXX`
   - Expected: "Access Denied" message

## Razorpay API Response

The verification endpoint returns payment details:

```json
{
  "success": true,
  "valid": true,
  "payment": {
    "id": "pay_XXX",
    "status": "captured",
    "amount": 299,
    "currency": "INR",
    "method": "card",
    "email": "user@example.com",
    "contact": "+919876543210",
    "created_at": 1234567890
  }
}
```

### Payment Statuses

- ✅ **captured:** Payment successful and captured
- ✅ **authorized:** Payment authorized (auto-capture enabled)
- ❌ **failed:** Payment failed
- ❌ **pending:** Payment still in progress
- ❌ **refunded:** Payment was refunded

## Security Best Practices

1. **Never expose Key Secret in frontend:** All verification happens in the backend proxy server
2. **Use HTTPS in production:** Ensures encrypted communication
3. **Validate both UUID and payment_id:** Prevents unauthorized access
4. **Log verification attempts:** Monitor for suspicious activity
5. **Rate limit API calls:** Prevent abuse of verification endpoint

## Troubleshooting

### Issue: "Payment verification service not configured"

**Solution:** Make sure Razorpay credentials are set in `.env` and proxy server is restarted.

### Issue: "Unable to verify payment"

**Solution:**
- Check if proxy server is running on port 3001
- Verify `.env` credentials are correct
- Check browser console for error details

### Issue: Payment ID not appearing in URL

**Solution:**
- Check Razorpay Payment Button success URL configuration
- Ensure you're using `?uuid=XXX` not `&uuid=XXX` as the base URL
- Razorpay will append `&payment_id=pay_XXX` automatically

### Issue: URL has two `?` marks

**Solution:** The code handles this automatically by replacing additional `?` with `&` during parsing.

## Production Deployment

### Environment Setup

1. Set production Razorpay credentials in production `.env`
2. Update Razorpay Payment Button success URL to production domain
3. Ensure proxy server is running and accessible
4. Configure CORS to restrict allowed origins (optional but recommended)

### Server Configuration

Update `server/proxy-server.js` CORS settings for production:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://curago.in', // Your production domain
  credentials: true
}));
```

## API Reference

### POST /api/verify-payment

Verify a Razorpay payment ID.

**Request:**
```json
{
  "payment_id": "pay_XXX"
}
```

**Response (Success):**
```json
{
  "success": true,
  "valid": true,
  "payment": {
    "id": "pay_XXX",
    "status": "captured",
    "amount": 299,
    "currency": "INR",
    ...
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to verify payment",
  "details": "..."
}
```

## Support

For issues or questions:
- Email: curagodoctor@gmail.com
- WhatsApp: +917021227203

---

**Last Updated:** December 2024
