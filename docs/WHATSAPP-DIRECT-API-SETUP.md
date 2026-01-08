# WhatsApp Direct API Setup Guide (No Google Apps Script)

This guide explains how to set up WhatsApp OTP sending using Meta WhatsApp Cloud API directly, without Google Apps Script.

## Overview

The GBSI assessment sends OTP verification codes via WhatsApp using Meta's WhatsApp Cloud API. This is a direct integration that doesn't require Google Apps Script.

## Prerequisites

- Meta Business Account
- Facebook Developer Account
- Phone number for WhatsApp Business

## Step 1: Create Meta for Developers App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** as the app type
4. Fill in app details:
   - **App Name**: CuraGo GBSI Assessment
   - **App Contact Email**: curagodoctor@gmail.com
5. Click **Create App**

## Step 2: Add WhatsApp Product

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. This will take you to the WhatsApp Getting Started page

## Step 3: Get Your Credentials

### Phone Number ID

1. In WhatsApp > Getting Started, you'll see:
   - **Phone Number ID** (e.g., `123456789012345`)
   - Copy this number

2. Your API URL will be:
   ```
   https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
   ```

### Access Token

**For Testing (24 hours validity):**
1. In WhatsApp > Getting Started
2. Copy the **Temporary Access Token**
3. Use this for development/testing

**For Production (Permanent):**
1. Go to **Business Settings** → **System Users**
2. Click **Add** to create a new system user
3. Name it (e.g., "CuraGo OTP Service")
4. Click **Add Assets** → Select your app
5. Enable **Full Control**
6. Click **Generate New Token**
7. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
8. Click **Generate Token**
9. **Copy and save this token securely** (you won't see it again!)

## Step 4: Configure Environment Variables

Update your `.env` file with the credentials:

```bash
# WhatsApp Cloud API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0/123456789012345/messages
WHATSAPP_API_TOKEN=YOUR_PERMANENT_ACCESS_TOKEN
```

### For Vercel Deployment

Add these as environment variables in Vercel:

1. Go to your project settings in Vercel
2. Navigate to **Environment Variables**
3. Add:
   - **Name**: `WHATSAPP_API_URL`
   - **Value**: `https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`
4. Add:
   - **Name**: `WHATSAPP_API_TOKEN`
   - **Value**: Your permanent access token
5. Click **Save**
6. Redeploy your application

## Step 5: Test WhatsApp Sending

### Add Test Phone Number

During development, you need to add test phone numbers:

1. Go to WhatsApp > API Setup
2. Scroll to **To** field
3. Click **Manage phone number list**
4. Add your phone number with country code (e.g., +919876543210)
5. You'll receive a verification code on WhatsApp
6. Enter the code to verify

### Test the Integration

1. Complete the GBSI form with your test phone number
2. Click "Send OTP"
3. Check your WhatsApp for the OTP message

Expected message format:
```
Hello [Name],

Your OTP for GBSI Assessment is: *123456*

This OTP will expire in 10 minutes.

- CuraGo Team
```

## Step 6: Production Setup

### Business Verification

For unlimited messaging, complete Meta Business Verification:

1. Go to **Business Settings** → **Security Center**
2. Start business verification process
3. Provide required documents:
   - Business registration
   - Tax ID
   - Business address proof
4. Wait for approval (typically 1-3 business days)

### Message Template (Optional)

For better deliverability, create an approved message template:

1. Go to WhatsApp > Message Templates
2. Click **Create Template**
3. Template details:
   - **Name**: `gbsi_otp`
   - **Category**: AUTHENTICATION
   - **Language**: English
4. Template content:
   ```
   Hello {{1}},

   Your OTP for GBSI Assessment is: *{{2}}*

   This OTP will expire in 10 minutes.

   - CuraGo Team
   ```
5. Submit for approval
6. Update code to use template once approved

## API Endpoint Details

### Request Format

```bash
POST https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Body (Text Message)
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "text",
  "text": {
    "body": "Your OTP message here"
  }
}
```

### Response (Success)
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "919876543210",
      "wa_id": "919876543210"
    }
  ],
  "messages": [
    {
      "id": "wamid.XXXXX"
    }
  ]
}
```

## Rate Limits

### Free Tier
- 1,000 conversations/month
- Then $0.005 - $0.009 per conversation (varies by country)

### After Business Verification
- Unlimited messaging
- Pay-per-conversation pricing applies

## Troubleshooting

### Error: "Invalid OAuth access token"
- Token expired (temporary tokens last 24 hours)
- Solution: Generate a permanent system user token

### Error: "Unsupported post request"
- Check API URL format
- Verify Phone Number ID is correct
- Ensure endpoint path is `/messages`

### Error: "Invalid parameter"
- Phone number format must be: country code + number (no + or spaces)
- Example: `919876543210` not `+91 9876543210`

### Message Not Received
- Verify phone number is added to test list (for development)
- Check WhatsApp Business Account status
- Review API response for error details
- Ensure recipient has WhatsApp installed

## Security Best Practices

1. **Never commit tokens to Git**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Rotate tokens regularly**
   - Generate new system user tokens every 90 days
   - Revoke old tokens

3. **Use different tokens for dev/prod**
   - Test with temporary tokens
   - Production with permanent tokens

4. **Monitor API usage**
   - Check Meta Business Suite analytics
   - Set up usage alerts

## Cost Estimation

### India Pricing (Example)
- Service conversations: ~$0.0088 per conversation
- Free tier: 1,000 conversations/month

### Monthly Cost Estimate
- 100 OTPs/day = 3,000/month
- Cost: (3,000 - 1,000) × $0.0088 = $17.60/month

## Support

### Meta Support
- Developer Support: https://developers.facebook.com/support
- WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp

### CuraGo Support
- Email: curagodoctor@gmail.com
- Check server logs for detailed error messages

## Files Reference

- WhatsApp Utility: `api/utils/whatsapp.ts`
- Send OTP API: `api/send-otp.ts`
- Environment Config: `.env.example`
- This Guide: `docs/WHATSAPP-DIRECT-API-SETUP.md`

## Next Steps

1. ✅ Complete Meta app setup
2. ✅ Get Phone Number ID and Access Token
3. ✅ Configure environment variables
4. ✅ Test with your phone number
5. ✅ Complete business verification for production
6. ✅ Deploy to Vercel with environment variables
7. ✅ Monitor usage and costs

---

**Note**: This setup replaces Google Apps Script. OTP is sent directly from your Vercel serverless function to Meta WhatsApp Cloud API.
