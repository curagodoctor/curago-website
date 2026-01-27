# Payment Integration Setup Guide for GBSI & CALA

## Summary of Changes

Your GBSI quiz now uses the **same payment-gated workflow as CALA**:
- ✅ External payment system redirects to quiz with UUID + payment_id
- ✅ No OTP verification required
- ✅ Credentials screen with Copy/Download/Share
- ✅ One-time quiz completion check to prevent payment_id reuse

---

## 📊 Google Sheets Setup

### **You DON'T need to create new sheets!**

You need to **ADD a column** to your existing sheets:

### **1. CALA Results Sheet**

Add a new column in position **18** with header **"Payment ID"**:

| Current Columns | ... | Event ID (17) | **Payment ID (18)** ← ADD THIS | PDF URL (19) |
|---|---|---|---|---|

**Steps:**
1. Open your "CALA Results" sheet
2. Right-click on column R (which currently has "PDF URL")
3. Click "Insert 1 column left"
4. In the new column R1 (row 1), type the header: **Payment ID**
5. PDF URL will automatically shift to column S

### **2. GBSI Results Sheet**

Add a new column in position **26** with header **"Payment ID"**:

| Current Columns | ... | Event ID (25) | **Payment ID (26)** ← ADD THIS | PDF URL (27) |
|---|---|---|---|---|

**Steps:**
1. Open your "GBSI Results" sheet
2. Right-click on column Z (which currently has "PDF URL")
3. Click "Insert 1 column left"
4. In the new column Z1 (row 1), type the header: **Payment ID**
5. PDF URL will automatically shift to column AA

---

## 💻 Google Apps Script Setup

### **Option 1: Manual Code Addition (Recommended)**

Open your `google-apps-script-code.js` in Google Apps Script editor and make these 4 changes:

#### **Change 1: Modify doPost function (around line 86)**

Find:
```javascript
let response;

if (data.testType === 'aura_index') {
```

Replace with:
```javascript
let response;

// Handle payment completion check action
if (data.action === 'check_completion') {
  response = handleCheckCompletion(data);
} else if (data.testType === 'aura_index') {
```

#### **Change 2: Add handleCheckCompletion function (after doPost, around line 122)**

Add this complete function:
```javascript
/**
 * Check if a payment_id has already been used to complete a quiz
 * Searches both CALA and GBSI sheets for the payment_id
 */
function handleCheckCompletion(data) {
  try {
    const paymentId = data.payment_id;

    if (!paymentId) {
      return {
        success: false,
        error: 'payment_id is required'
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const calaSheet = ss.getSheetByName(CONFIG.CALA_SHEET_NAME);
    const gbsiSheet = ss.getSheetByName(CONFIG.GBSI_SHEET_NAME);

    // Check CALA sheet (payment_id is in column 18)
    if (calaSheet) {
      const calaData = calaSheet.getDataRange().getValues();
      for (var i = 1; i < calaData.length; i++) { // Skip header row
        if (calaData[i][17] === paymentId) { // Column 18 (index 17)
          Logger.log('Payment ID found in CALA sheet: ' + paymentId);
          return {
            success: true,
            completed: true,
            quiz_type: 'cala',
            payment_id: paymentId
          };
        }
      }
    }

    // Check GBSI sheet (payment_id is in column 26)
    if (gbsiSheet) {
      const gbsiData = gbsiSheet.getDataRange().getValues();
      for (var j = 1; j < gbsiData.length; j++) { // Skip header row
        if (gbsiData[j][25] === paymentId) { // Column 26 (index 25)
          Logger.log('Payment ID found in GBSI sheet: ' + paymentId);
          return {
            success: true,
            completed: true,
            quiz_type: 'gbsi',
            payment_id: paymentId
          };
        }
      }
    }

    // Payment ID not found in any sheet
    Logger.log('Payment ID not found in any sheet: ' + paymentId);
    return {
      success: true,
      completed: false,
      payment_id: paymentId
    };

  } catch (error) {
    Logger.log('ERROR in handleCheckCompletion: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
```

#### **Change 3: Modify handleCalaSubmission (around line 1560-1579)**

Find:
```javascript
const rowData = [
  new Date(),
  data.name,
  data.email || '',
  data.phoneNumber,
  data.primaryLoop,
  data.secondaryLoop || 'None',
  data.triggerType,
  data.reinforcement,
  data.loadCapacityBand,
  data.stability,
  data.loopScores.anticipatory,
  data.loopScores.control,
  data.loopScores.reassurance,
  data.loopScores.avoidance,
  data.loopScores.somatic,
  data.loopScores.cognitiveOverload,
  data.eventId,
  pdfUrl // PDF link in last column
];
```

Replace with (adds `data.payment_id` before `pdfUrl`):
```javascript
const rowData = [
  new Date(),
  data.name,
  data.email || '',
  data.phoneNumber,
  data.primaryLoop,
  data.secondaryLoop || 'None',
  data.triggerType,
  data.reinforcement,
  data.loadCapacityBand,
  data.stability,
  data.loopScores.anticipatory,
  data.loopScores.control,
  data.loopScores.reassurance,
  data.loopScores.avoidance,
  data.loopScores.somatic,
  data.loopScores.cognitiveOverload,
  data.eventId,
  data.payment_id || '', // Payment ID column
  pdfUrl // PDF link in last column
];
```

#### **Change 4: Modify handleGbsiSubmission (around line 2120-2147)**

Find:
```javascript
const rowData = [
  new Date(),
  data.name,
  data.email || '',
  data.phoneNumber,
  data.age,
  data.alarmingSigns.join(', '),
  data.familyHistory.join(', '),
  data.painFrequency,
  data.reliefFactor,
  data.bristolType,
  data.refluxFrequency,
  data.fullnessFactor,
  data.fattyLiver,
  data.stressLevel,
  data.brainFog,
  data.dietaryHabits.lateNightDinners ? 'Yes' : 'No',
  data.dietaryHabits.highCaffeine ? 'Yes' : 'No',
  data.dietaryHabits.frequentJunk ? 'Yes' : 'No',
  data.dietaryHabits.skipBreakfast ? 'Yes' : 'No',
  data.resultType,
  data.ibsType || 'N/A',
  data.hasRedFlags ? 'Yes' : 'No',
  data.brainGutSensitivity,
  data.axisScore,
  data.eventId,
  pdfUrl // PDF link in last column
];
```

Replace with (adds `data.payment_id` before `pdfUrl`):
```javascript
const rowData = [
  new Date(),
  data.name,
  data.email || '',
  data.phoneNumber,
  data.age,
  data.alarmingSigns.join(', '),
  data.familyHistory.join(', '),
  data.painFrequency,
  data.reliefFactor,
  data.bristolType,
  data.refluxFrequency,
  data.fullnessFactor,
  data.fattyLiver,
  data.stressLevel,
  data.brainFog,
  data.dietaryHabits.lateNightDinners ? 'Yes' : 'No',
  data.dietaryHabits.highCaffeine ? 'Yes' : 'No',
  data.dietaryHabits.frequentJunk ? 'Yes' : 'No',
  data.dietaryHabits.skipBreakfast ? 'Yes' : 'No',
  data.resultType,
  data.ibsType || 'N/A',
  data.hasRedFlags ? 'Yes' : 'No',
  data.brainGutSensitivity,
  data.axisScore,
  data.eventId,
  data.payment_id || '', // Payment ID column
  pdfUrl // PDF link in last column
];
```

### **After Making Changes:**
1. Save the script (File → Save or Ctrl+S)
2. Deploy → Manage deployments → Edit the active deployment → Version: New version
3. Click "Deploy"
4. Copy the new deployment URL if it changes

---

## 🔗 Razorpay Redirect URL Configuration

After payment is successful on your external payment website, configure Razorpay to redirect to:

### **For GBSI:**
```
https://yourdomain.com/gbsi/quiz?uuid=gbsi-2024-f3c9b8e4-a2d4-4c6a-9f21-8c7e5b2d1a94&payment_id={PAYMENT_ID}
```

### **For CALA:**
```
https://yourdomain.com/calm/quiz?uuid=7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94&payment_id={PAYMENT_ID}
```

**Replace:**
- `yourdomain.com` with your actual domain (e.g., `curago.in`)
- `{PAYMENT_ID}` with the actual payment ID variable from your payment system

### **Important UUID Values:**
- **GBSI UUID:** `gbsi-2024-f3c9b8e4-a2d4-4c6a-9f21-8c7e5b2d1a94`
- **CALA UUID:** `7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94`

These UUIDs are hardcoded for security and must match exactly.

---

## ✅ Testing Checklist

### **1. Test Invalid UUID**
Visit: `https://yourdomain.com/gbsi/quiz?uuid=wrong-uuid&payment_id=test123`
- Should show "Access Denied" screen

### **2. Test Valid UUID but No Payment ID**
Visit: `https://yourdomain.com/gbsi/quiz?uuid=gbsi-2024-f3c9b8e4-a2d4-4c6a-9f21-8c7e5b2d1a94`
- Should show "Payment verification failed" error

### **3. Test First-Time Payment**
Visit: `https://yourdomain.com/gbsi/quiz?uuid=gbsi-2024-f3c9b8e4-a2d4-4c6a-9f21-8c7e5b2d1a94&payment_id=unique_test_123`
- Should show credentials screen with Copy/Download/Share options
- Complete the quiz
- Check Google Sheets - should see the payment_id saved in column 26

### **4. Test Duplicate Payment ID**
Visit the same URL from step 3 again:
- Should show "Quiz Already Taken" screen
- Should NOT allow retaking the quiz

### **5. Test Different Payment ID**
Visit: `https://yourdomain.com/gbsi/quiz?uuid=gbsi-2024-f3c9b8e4-a2d4-4c6a-9f21-8c7e5b2d1a94&payment_id=unique_test_456`
- Should work normally (new payment = new quiz attempt allowed)

---

## 📝 Summary of What Changed

### **Frontend Changes (Already Done):**
- ✅ GbsiQuizFlow.tsx - Removed OTP verification
- ✅ GbsiQuizFlow.tsx - Added UUID + payment_id verification
- ✅ GbsiQuizFlow.tsx - Added credentials screen
- ✅ GbsiQuizFlow.tsx - Added one-time completion check
- ✅ App.tsx - Updated to pass payment_id to Google Sheets

### **Backend Changes (You Need to Do):**
- ⏳ Add "Payment ID" column to CALA Results sheet (position 18)
- ⏳ Add "Payment ID" column to GBSI Results sheet (position 26)
- ⏳ Add `handleCheckCompletion` function to google-apps-script-code.js
- ⏳ Modify `doPost` to handle check_completion action
- ⏳ Modify `handleCalaSubmission` to save payment_id
- ⏳ Modify `handleGbsiSubmission` to save payment_id
- ⏳ Redeploy the Google Apps Script

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the Google Apps Script logs (Executions → View execution)
2. Check browser console for frontend errors
3. Verify the UUID and payment_id are in the URL correctly
4. Ensure the "Payment ID" columns are in the correct positions (18 for CALA, 26 for GBSI)
