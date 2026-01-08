# WhatsApp Business API Setup Guide

This guide will help you set up WhatsApp Business API to send OTP messages for the GBSI Assessment.

## Overview

The OTP system sends messages via both Email and WhatsApp:
- **Email**: Handled automatically via Google Apps Script (GmailApp)
- **WhatsApp**: Requires WhatsApp Business API setup (Meta/Facebook)

## Option 1: WhatsApp Cloud API (Recommended - Free Tier Available)

### Step 1: Create Meta Business Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "WhatsApp" product to your app

### Step 2: Get Test Credentials

1. In WhatsApp > Getting Started, you'll see:
   - **Phone Number ID**: Your WhatsApp Business phone number
   - **WhatsApp Business Account ID**
   - **Temporary Access Token** (valid for 24 hours)

2. For production, generate a **Permanent Access Token**:
   - Go to Business Settings > System Users
   - Create a system user
   - Generate token with `whatsapp_business_messaging` permission

### Step 3: Configure in Google Apps Script

Open your Google Apps Script and update the `OTP_CONFIG`:

```javascript
const OTP_CONFIG = {
  COMPANY_NAME: 'CuraGo',
  COMPANY_WEBSITE: 'https://curago.in',
  SUPPORT_EMAIL: 'curagodoctor@gmail.com',
  WHATSAPP_NUMBER: '+919148615951',

  // WhatsApp Cloud API Configuration
  WHATSAPP_API_URL: 'https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages',
  WHATSAPP_API_TOKEN: 'YOUR_PERMANENT_ACCESS_TOKEN',
};
```

### Step 4: Update Phone Number ID

Replace `YOUR_PHONE_NUMBER_ID` with your actual Phone Number ID from Meta dashboard.

Example:
```javascript
WHATSAPP_API_URL: 'https://graph.facebook.com/v18.0/123456789012345/messages',
```

### Step 5: Test WhatsApp Sending

1. Run the `testOTPSend()` function in Google Apps Script
2. Check if WhatsApp message is received
3. Review logs for any errors

### API Endpoint Structure

The WhatsApp Cloud API endpoint format:
```
https://graph.facebook.com/v{VERSION}/{PHONE_NUMBER_ID}/messages
```

Authorization header:
```
Bearer YOUR_ACCESS_TOKEN
```

## Option 2: Twilio (Paid Service - Simpler Setup)

### Step 1: Create Twilio Account

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get a Twilio phone number
3. Enable WhatsApp on your number

### Step 2: Get Credentials

From Twilio Console:
- **Account SID**
- **Auth Token**
- **WhatsApp Number** (format: +14155238886)

### Step 3: Update Google Apps Script

Replace the `sendOTPWhatsApp` function in `docs/GOOGLE-APPS-SCRIPT-OTP.js`:

```javascript
function sendOTPWhatsApp(whatsapp, otp, name) {
  try {
    var phoneNumber = whatsapp.replace(/^\+91/, '').replace(/\D/g, '');
    var fullNumber = '+91' + phoneNumber;

    var accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
    var authToken = 'YOUR_TWILIO_AUTH_TOKEN';
    var twilioWhatsAppNumber = 'YOUR_TWILIO_WHATSAPP_NUMBER'; // e.g., +14155238886

    var message = `Hello ${name},\n\nYour OTP for GBSI Assessment is: *${otp}*\n\nThis OTP will expire in 10 minutes.\n\n- CuraGo Team`;

    var url = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json';

    var payload = {
      From: 'whatsapp:' + twilioWhatsAppNumber,
      To: 'whatsapp:' + fullNumber,
      Body: message
    };

    var options = {
      method: 'post',
      payload: payload,
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(accountSid + ':' + authToken)
      },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    Logger.log('Twilio Response Code: ' + responseCode);
    Logger.log('Twilio Response: ' + response.getContentText());

    return responseCode === 200 || responseCode === 201;

  } catch (error) {
    Logger.log('Twilio error: ' + error.toString());
    return false;
  }
}
```

## Testing

### Test with Meta WhatsApp Cloud API

1. Add your test phone number in Meta dashboard:
   - Go to WhatsApp > API Setup
   - Add phone numbers to test
2. Run `testOTPSend()` function
3. Check your WhatsApp for the message

### Test Production

1. Go through Meta's Business Verification
2. Get your app approved for production use
3. Test with real user phone numbers

## Troubleshooting

### WhatsApp Messages Not Sending

**Check:**
1. Access token is valid and has correct permissions
2. Phone Number ID is correct
3. Test phone number is verified in Meta dashboard
4. API URL format is correct

**Common Errors:**
- `Invalid OAuth access token`: Token expired or invalid
- `Invalid parameter`: Check phone number format (+91XXXXXXXXXX)
- `Unsupported post request`: Check API URL and endpoint

### Logs

Check Google Apps Script logs:
1. Open your script
2. Click "Executions" in left sidebar
3. View detailed logs for each execution

## Production Checklist

- [ ] Meta Business Account verified
- [ ] Permanent access token generated
- [ ] Phone Number ID configured correctly
- [ ] Test messages sent successfully
- [ ] Business verification completed (for unlimited messaging)
- [ ] WhatsApp Business Profile completed
- [ ] Message templates created (if using templates)

## Rate Limits

### Meta WhatsApp Cloud API (Free Tier)
- 1,000 free conversations per month
- Then $0.005 - $0.009 per conversation (varies by country)

### Twilio
- Pay per message (~$0.005 per WhatsApp message)
- No monthly minimums

## Support

For WhatsApp API issues:
- **Meta**: https://developers.facebook.com/support
- **Twilio**: https://www.twilio.com/help/contact

For implementation issues:
- Email: curagodoctor@gmail.com
- Review Google Apps Script logs
