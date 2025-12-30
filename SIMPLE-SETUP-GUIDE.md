# Simple Setup Guide - Payment Email with Invoice & Test Link

## What This Does

When a user pays through Razorpay:
1. ✅ Payment saved to Google Sheet (already working)
2. ✅ Email sent immediately with:
   - Invoice displayed in email (HTML, no PDF)
   - Test link with payment_id
   - Instructions to use payment email/phone

---

## Setup (3 Simple Steps)

### Step 1: Update Your Existing Google Apps Script

1. Go to https://script.google.com
2. Open your existing CuraGo project
3. Find your current `doPost` function
4. **Replace it completely** with the code from `updated-payment-script.js`
5. Update the CONFIG section:

```javascript
const CONFIG = {
  SUPPORT_EMAIL: 'curagodoctor@gmail.com',        // ✅ Your email
  COMPANY_NAME: 'CuraGo',
  COMPANY_WEBSITE: 'https://curago.in',
  WHATSAPP_NUMBER: '+919148615951',               // ✅ Your WhatsApp

  TEST_UUID: '7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94',  // ✅ Your UUID
  BASE_TEST_URL: 'https://curago.in/cala/quiz',
};
```

6. Click **Save** (💾)

---

### Step 2: Test It

1. Find the function `testEmail()` at the bottom
2. Change line 252 to your email:
   ```javascript
   email: 'your-email@example.com',  // ⚠️ Put your real email here
   ```
3. Click **Run** → Select `testEmail`
4. Authorize permissions if asked
5. Check your email - you should receive invoice + test link

---

### Step 3: Done!

That's it! Your webhook is already configured in Razorpay.

Next payment will automatically:
- Save to sheet ✅
- Send email with invoice ✅
- Include test link ✅

---

## How the Email Looks

**Subject:** Your CuraGo CALA 1.0 Assessment - Invoice & Access Link

**Content:**
```
✅ Payment Successful!

┌─────────────────────────────────────┐
│           INVOICE                    │
│  CuraGo                              │
│  Invoice #: INV-PAY_XXXXX           │
├─────────────────────────────────────┤
│  From: CuraGo                        │
│  To: user@email.com                  │
│  Date: 30 Dec 2024                   │
├─────────────────────────────────────┤
│  CALA 1.0 Assessment         ₹299   │
│  TOTAL PAID:                 ₹299   │
├─────────────────────────────────────┤
│  ✅ PAYMENT SUCCESSFUL              │
└─────────────────────────────────────┘

🎯 START ASSESSMENT NOW (green button)

⚠️ IMPORTANT:
You MUST use these credentials:
📧 Email: user@email.com
📱 Phone: +919876543210

These must match EXACTLY to unlock the test.
```

---

## Key Points

### ✅ No PDF
- Invoice is HTML in email body
- Users see it immediately
- No download needed

### ✅ No Separate Webhook
- Uses your existing `doPost` function
- Just adds email sending after saving to sheet
- One script does everything

### ✅ Dynamic Pricing
- Uses actual amount from Razorpay
- Works with ₹299, ₹499, or any price you set

### ✅ Test Link Format
```
https://curago.in/cala/quiz?uuid=7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94&payment_id=pay_xxxxx
```

---

## What Changed from Before

| Before | After |
|--------|-------|
| No email sent | ✅ Email sent automatically |
| Manual test link sharing | ✅ Auto-sent in email |
| No invoice | ✅ Invoice in email HTML |
| PDF generation | ❌ Removed (not needed) |
| Separate webhook script | ❌ Removed (integrated in existing) |

---

## Troubleshooting

**Email not received?**
- Check Gmail quota (max 100 emails/day)
- Check "Invoice Sent" column in sheet
- Run `testEmail()` function to test

**Test link not working?**
- UUID must match in QuizFlow.tsx
- Payment verification API must be working

**Invoice shows wrong amount?**
- It uses `payment.amount / 100` from Razorpay
- This is automatic, no config needed

---

## That's It!

You're done. Next payment will automatically trigger the email with invoice and test link! 🎉

No PDFs, no complex setup, just one simple script update.
