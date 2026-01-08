# OTP Implementation Guide - GBSI Assessment

## Overview

The GBSI (Gut-Brain Sensitivity Index) assessment includes OTP-based authentication via **WhatsApp only**. This ensures that only verified users with valid WhatsApp numbers can access the assessment.

**⚠️ IMPORTANT: OTP is sent ONLY via WhatsApp (not email). Email is collected for user identification and result delivery.**

**🚫 NO Google Apps Script Required**: This implementation uses direct WhatsApp Cloud API integration.

## Architecture

```
Frontend (React/TypeScript)
    ↓
Vercel API (/api/send-otp, /api/verify-otp)
    ↓
Meta WhatsApp Cloud API (Direct)
    ↓
User receives OTP via WhatsApp
```

## Components

### 1. Frontend Components

**File**: `src/components/assessment/gbsi/GbsiQuizFlow.tsx`

**Features**:
- User information form (Name, WhatsApp, Email)
- Client-side validation
- OTP request flow
- OTP verification flow
- Error handling and user feedback

**User Flow**:
1. User lands on GBSI landing page
2. Clicks "Start Free Assessment"
3. Fills in: Name, WhatsApp Number (+91), Email
4. Clicks "Send OTP"
5. Receives OTP via WhatsApp only
6. Enters 6-digit OTP
7. Upon verification, test begins

### 2. Backend API Endpoints

#### `/api/send-otp`

**Purpose**: Generate and send OTP to user

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "whatsapp": "9876543210"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "OTP sent successfully to your WhatsApp"
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Failed to send OTP to WhatsApp. Please check your number and try again."
}
```

#### `/api/verify-otp`

**Purpose**: Verify the OTP entered by user

**Request**:
```json
{
  "email": "john@example.com",
  "whatsapp": "9876543210",
  "otp": "123456"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "OTP verified successfully."
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining."
}
```

### 3. OTP Utility Functions

**File**: `api/utils/otp.ts`

**Features**:
- Generate random 6-digit OTP
- Store OTP with expiration (10 minutes)
- Verify OTP with attempt tracking (max 3 attempts)
- Automatic cleanup of expired OTPs
- In-memory storage (upgradable to Redis)

**Functions**:
- `generateOTP()`: Generate 6-digit OTP
- `storeOTP(email, whatsapp, otp)`: Store with expiration
- `verifyOTP(email, whatsapp, inputOtp)`: Verify and track attempts
- `cleanupExpiredOTPs()`: Automatic cleanup

### 4. WhatsApp Sending (Direct API)

**File**: `api/utils/whatsapp.ts`

**Purpose**: Send OTP via Meta WhatsApp Cloud API directly

**Function**: `sendOTPViaWhatsApp()`
- Direct integration with Meta WhatsApp Cloud API
- No Google Apps Script required
- Sends WhatsApp message with OTP
- Returns boolean success status

**Features**:
- Direct API call to Meta WhatsApp Cloud
- Configurable via environment variables
- Professional OTP message format
- Automatic phone number formatting

## Setup Instructions

### Step 1: Configure WhatsApp Cloud API

Follow the detailed guide in `docs/WHATSAPP-DIRECT-API-SETUP.md`

**Quick Start**:
1. Create Meta for Developers app
2. Add WhatsApp product
3. Get Phone Number ID and Access Token
4. Add test phone number (for development)
5. Configure environment variables

### Step 2: Update Environment Variables

Add to your `.env` file:

```bash
# WhatsApp Cloud API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
WHATSAPP_API_TOKEN=YOUR_PERMANENT_ACCESS_TOKEN
```

For Vercel deployment, add these as environment variables in your project settings.

### Step 3: Test the System

#### Test WhatsApp API:

You can test the WhatsApp API directly using curl:

```bash
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "919876543210",
    "type": "text",
    "text": {
      "body": "Test OTP: 123456"
    }
  }'
```

#### Test Frontend Flow:
1. Go to GBSI landing page
2. Click "Start Free Assessment"
3. Fill in form with your email and WhatsApp
4. Click "Send OTP"
5. Check your WhatsApp for OTP
6. Enter OTP and verify

### Step 4: Production Deployment

1. Complete Meta Business Verification (for unlimited messaging)
2. Generate permanent system user access token
3. Configure environment variables in Vercel:
   - `WHATSAPP_API_URL`
   - `WHATSAPP_API_TOKEN`
4. Deploy to Vercel
5. Test with real users

## Security Features

### OTP Generation
- Random 6-digit code (100,000 to 999,999)
- Cryptographically secure random generation

### Storage
- In-memory storage with automatic expiration
- OTP expires after 10 minutes
- Automatic cleanup of expired OTPs

### Verification
- Maximum 3 verification attempts
- OTP deleted after successful verification
- OTP deleted after max attempts exceeded

### Input Validation
- Email format validation
- 10-digit phone number validation
- 6-digit OTP format validation

## Error Handling

### Frontend
- Displays user-friendly error messages
- Shows remaining attempts
- Allows changing details before OTP verification
- Loading states during API calls

### Backend
- Validates all inputs
- Handles Google Apps Script errors
- Logs errors for debugging
- Returns appropriate HTTP status codes

### Google Apps Script
- Try-catch blocks for all operations
- Detailed error logging
- Graceful degradation (WhatsApp failure doesn't block email)

## Monitoring & Debugging

### Check Logs

**Backend (Vercel)**:
```bash
vercel logs
```

**Browser Console**:
- Open browser DevTools (F12)
- Check Network tab for API calls
- Review Console for error messages

### Common Issues

**OTP Not Received on WhatsApp**:
- Verify WhatsApp API credentials are correct
- Check phone number format (+91XXXXXXXXXX)
- Ensure test phone number is added in Meta dashboard (for development)
- Review WhatsApp Business API logs in Meta for Developers
- Check Vercel function logs for API errors

**API Errors**:
- **Invalid OAuth access token**: Token expired or invalid - generate new one
- **Invalid parameter**: Check phone number format (no +, no spaces)
- **Unsupported post request**: Verify API URL and Phone Number ID

**OTP Verification Failing**:
- Check if OTP is expired (>10 minutes)
- Verify exact email and WhatsApp used
- Check attempt count (max 3)
- Review backend logs

## Scalability

### Current Implementation
- **Storage**: In-memory (cleared on server restart)
- **Limit**: Based on serverless function memory
- **Suitable for**: Small to medium traffic

### Upgrade Path (for high traffic)

#### Redis Storage:
```typescript
// Replace in-memory Map with Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function storeOTP(email, whatsapp, otp) {
  const key = `otp:${email}:${whatsapp}`;
  await redis.setex(key, 600, JSON.stringify({
    otp,
    attempts: 0,
    expiresAt: Date.now() + 600000
  }));
}
```

## Cost Breakdown

### WhatsApp Cloud API (Meta)
- **Free Tier**: 1,000 conversations/month
- **After Free Tier**: $0.005 - $0.009 per conversation (varies by country)
- **India**: ~$0.0088 per service conversation

### Serverless Functions (Vercel)
- Free tier: 100GB-hours compute
- Typically sufficient for OTP operations
- Pro plan: $20/month (if needed)

## Compliance

### Data Privacy
- OTP data stored temporarily (10 minutes)
- Automatic deletion after verification
- No persistent storage of sensitive data

### GDPR Considerations
- Minimal data collection (email, phone)
- Clear purpose (authentication)
- Short retention period
- User consent required

## Future Enhancements

- [ ] SMS fallback option
- [ ] Rate limiting per email/phone
- [ ] Resend OTP functionality
- [ ] OTP via voice call
- [ ] Multi-language support
- [ ] Redis/database storage for scalability
- [ ] Email template customization
- [ ] Analytics dashboard

## Support

For implementation issues:
- Email: curagodoctor@gmail.com
- Review logs in Google Apps Script
- Check Vercel function logs

## Files Reference

- Frontend Form: `src/components/assessment/gbsi/GbsiQuizFlow.tsx`
- Send OTP API: `api/send-otp.ts`
- Verify OTP API: `api/verify-otp.ts`
- OTP Utils: `api/utils/otp.ts`
- WhatsApp Utils: `api/utils/whatsapp.ts` (NEW - Direct API)
- WhatsApp Setup Guide: `docs/WHATSAPP-DIRECT-API-SETUP.md` (NEW)
- This Guide: `docs/OTP-IMPLEMENTATION-GUIDE.md`
