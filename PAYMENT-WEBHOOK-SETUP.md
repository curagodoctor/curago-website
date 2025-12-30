# CuraGo Payment Webhook Setup Guide

## Overview
This guide will help you set up automatic invoice generation and test link delivery when users make payments through Razorpay.

## What This Does
1. ✅ Receives payment notifications from Razorpay
2. ✅ Saves payment details to Google Sheets
3. ✅ Generates professional invoice PDF
4. ✅ Sends email with invoice + test link
5. ✅ Test link format: `https://curago.in/cala/quiz?uuid=7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94&payment_id=pay_xxxxx`

---

## Step 1: Create Google Sheet

1. Go to your existing Google Spreadsheet (where you have AURA, ATM, CALA Results sheets)
2. Create a **new sheet** called: `CALA Payment Sheet`
3. Add these **column headers** in Row 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Order ID | Payment ID | Email | Phone | Amount (₹) | City | WhatsApp | Invoice Sent | Test Link Sent |

---

## Step 2: Deploy Google Apps Script

### Option A: Add to Existing Project (Recommended)
1. Go to https://script.google.com
2. Open your existing CuraGo project (where you have AURA/ATM/CALA code)
3. Click the **+ button** next to "Files"
4. Select **Script** → Name it: `PaymentWebhook`
5. Copy the entire contents of `google-apps-script-payment-handler.js`
6. Paste into the new script file
7. Click **Save** (💾 icon)

### Option B: Create New Project
1. Go to https://script.google.com
2. Click **New Project**
3. Name it: `CuraGo Payment Handler`
4. Copy the entire contents of `google-apps-script-payment-handler.js`
5. Paste into the editor
6. Click **Save**
7. Go to **Project Settings** → **Script ID** → Copy it
8. In your spreadsheet: **Extensions** → **Apps Script** → Paste the Script ID

---

## Step 3: Configure Settings

Edit the `CONFIG` object in the script:

```javascript
const CONFIG = {
  PAYMENT_SHEET_NAME: 'CALA Payment Sheet', // ✅ Match your sheet name

  EMAIL_SUBJECT: 'Your CuraGo CALA 1.0 Assessment - Invoice & Access Link',
  FROM_NAME: 'CuraGo Team',
  COMPANY_NAME: 'CuraGo',
  COMPANY_WEBSITE: 'https://curago.in',
  SUPPORT_EMAIL: 'curagodoctor@gmail.com', // ✅ Your support email
  WHATSAPP_NUMBER: '+919148615951', // ✅ Your WhatsApp number

  ASSESSMENT_NAME: 'CALA 1.0 - Clinical Anxiety Loop Assessment',
  TEST_UUID: '7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94', // ✅ Your UUID
  BASE_TEST_URL: 'https://curago.in/cala/quiz',

  COMPANY_ADDRESS: 'Bangalore, Karnataka, India', // ✅ Update
  COMPANY_GST: '', // ✅ Add GST if applicable

  DRIVE_FOLDER_ID: '1ztLlzdZgZyJZR1BfICOHBPzbeNRDwTTx', // ✅ Your folder ID
};
```

---

## Step 4: Deploy as Web App

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Configure:
   - **Description**: `Payment Webhook Handler`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` ⚠️ (Important!)
4. Click **Deploy**
5. Click **Authorize access**
6. Choose your Google account
7. Click **Advanced** → **Go to [Project Name] (unsafe)**
8. Click **Allow**
9. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXX/exec
   ```

---

## Step 5: Set Up Razorpay Webhook

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to: **Settings** → **Webhooks**
3. Click **+ Add New Webhook**
4. Configure:
   - **Webhook URL**: Paste the Web App URL from Step 4
   - **Alert Email**: Your email
   - **Active Events**: Check ✅ `payment.captured`
   - **Secret**: Leave blank (or generate one for security)
5. Click **Create Webhook**

---

## Step 6: Test the Integration

### Method 1: Test from Script Editor
1. In Apps Script, find the function: `testPaymentEmailFlow()`
2. Edit line 384 to use your email:
   ```javascript
   email: 'your-email@example.com', // Change this!
   ```
3. Click **Run** → Select `testPaymentEmailFlow`
4. Check your email for invoice + test link

### Method 2: Real Payment Test
1. Make a test payment through Razorpay (any amount)
2. Check the **CALA Payment Sheet** - new row should appear
3. Check email inbox - you should receive invoice + test link
4. Click the test link - it should open: `https://curago.in/cala/quiz?uuid=...&payment_id=...`

---

## Step 7: Verify Everything Works

### Checklist:
- [ ] Payment appears in Google Sheet
- [ ] Invoice Sent column shows "Yes"
- [ ] Test Link Sent column shows "Yes"
- [ ] Email received with invoice PDF attached
- [ ] Email contains personalized test link
- [ ] Test link includes correct payment_id
- [ ] Test link includes correct uuid

---

## How It Works (User Journey)

```
1. User clicks "Pay Now" on your website
   ↓
2. Razorpay payment window opens
   ↓
3. User completes payment (any amount: ₹299, ₹499, etc.)
   ↓
4. Razorpay sends webhook to Google Apps Script
   ↓
5. Script saves payment to Google Sheet
   ↓
6. Script generates invoice PDF with actual amount paid
   ↓
7. Script sends email with:
   - Invoice PDF attached
   - Test link: https://curago.in/cala/quiz?uuid=XXX&payment_id=YYY
   - Instructions to use payment email/phone
   ↓
8. User receives email within seconds
   ↓
9. User clicks test link
   ↓
10. Frontend verifies:
    - UUID matches
    - payment_id is valid (via backend API)
    - Email/phone match payment details
   ↓
11. User takes assessment
   ↓
12. Results generated and emailed
```

---

## Email Preview

**Subject:** Your CuraGo CALA 1.0 Assessment - Invoice & Access Link

**Contents:**
- ✅ Payment confirmation (amount, payment ID, date/time)
- ✅ Big green "START ASSESSMENT NOW" button
- ✅ Clear instructions with credentials (email + phone)
- ✅ Warning that credentials must match exactly
- ✅ Invoice PDF attached
- ✅ Support contact details

---

## Important Notes

### 1. Dynamic Pricing ✅
The code **automatically uses the amount from Razorpay**, so it works for:
- ₹299 (standard price)
- ₹499 (if you increase price)
- ₹99 (if you run a discount)
- Any custom amount

### 2. Email Credentials
The user **MUST** use the exact email and phone from payment:
- Email is case-sensitive
- Phone must include country code if payment had it
- Validation happens in frontend (QuizFlow.tsx:161-185)

### 3. One-Time Use
- Each payment_id allows **only ONE quiz attempt**
- After completion, quiz is locked for that payment_id
- User must make new payment to retake

### 4. UUID Security
- The UUID `7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94` is currently hardcoded
- All test links use the same UUID
- Frontend validates this UUID before allowing access

---

## Troubleshooting

### Problem: Email not sent
**Check:**
1. Gmail account has less than 100 emails sent today (Google quota)
2. Email address in payment is valid
3. Check "Invoice Sent" column - shows error message if failed
4. Run `testPaymentEmailFlow()` to test email functionality

### Problem: Payment not appearing in sheet
**Check:**
1. Sheet name matches: `CALA Payment Sheet`
2. Webhook URL is correct in Razorpay
3. Web app deployed with "Who has access" = Anyone
4. Check Apps Script → Executions to see errors

### Problem: Invoice PDF not generating
**Check:**
1. Google Drive folder ID is correct
2. Apps Script has Drive permissions
3. Check Apps Script → Executions for error logs

### Problem: Test link not working
**Check:**
1. Test UUID in QuizFlow.tsx matches CONFIG.TEST_UUID
2. Payment verification API is working
3. Frontend can reach backend at `/api/verify-payment`

---

## Advanced: Get Webhook URL Programmatically

Run this function in Apps Script:

```javascript
function getWebhookUrl() {
  const url = ScriptApp.getService().getUrl();
  Logger.log('Your webhook URL: ' + url);
  return url;
}
```

Then check **View** → **Logs** to see the URL.

---

## Security Considerations

### Current Setup:
- ✅ Payment verification via Razorpay API (backend)
- ✅ Email/phone double-validation (frontend)
- ✅ One quiz per payment_id enforcement
- ✅ UUID access control

### Optional Enhancements:
1. **Webhook Secret**: Add Razorpay webhook secret validation
2. **Dynamic UUIDs**: Generate unique UUID per payment (requires codebase update)
3. **Rate Limiting**: Prevent abuse of webhook endpoint
4. **Email Verification**: Send OTP to verify email ownership

---

## Need Help?

If you encounter issues:

1. **Check Apps Script Logs**:
   - Apps Script Editor → **View** → **Logs**
   - Or **Executions** → View error details

2. **Check Sheet Columns**:
   - "Invoice Sent" shows error messages
   - "Test Link Sent" shows status

3. **Test Manually**:
   - Run `testPaymentEmailFlow()` function
   - Check if email works in isolation

4. **Verify Razorpay Webhook**:
   - Razorpay Dashboard → Webhooks → View webhook logs
   - Check if webhook is being triggered

---

## Summary

You now have a complete automated system:

1. ✅ User pays → Webhook triggered
2. ✅ Payment saved → Invoice generated
3. ✅ Email sent → User receives link instantly
4. ✅ Dynamic pricing → Works with any amount
5. ✅ Secure access → Email/phone validation
6. ✅ One-time use → Prevents abuse

**Next Steps:**
1. Deploy the script (Steps 1-4)
2. Set up Razorpay webhook (Step 5)
3. Test with real payment (Step 6)
4. Monitor first few payments to ensure everything works
5. Enjoy automated invoice delivery! 🎉
