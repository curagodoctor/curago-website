# Complete Email Automation Guide
## Send Assessment Results as PDF via Email

**One document with everything you need to set up automated PDF emails.**

---

## 📋 Table of Contents

1. [Quick Setup (20 minutes)](#quick-setup)
2. [Google Apps Script Code (Copy & Paste)](#google-apps-script-code)
3. [Testing](#testing)
4. [Troubleshooting](#troubleshooting)
5. [Customization](#customization)

---

## Quick Setup

### Step 1: Create Google Sheet (3 min)

1. Go to https://sheets.google.com
2. Create new spreadsheet: **"CuraGo Assessment Results"**
3. Create 2 tabs:
   - **AURA Results**
   - **ATM Results**

**AURA Results - Add these headers in Row 1:**
```
Timestamp | Name | Email | WhatsApp | Overall Score | Awareness | Understanding | Regulation | Alignment | Label | Strengths | Growth Areas | Risk Flags | Event ID
```

**ATM Results - Add these headers in Row 1:**
```
Timestamp | Name | Email | WhatsApp | Pattern | Confidence | Explanation | Neurological | Impact | Micro Action Title | Micro Action Description | Event ID
```

---

### Step 2: Add Apps Script Code (5 min)

1. In Google Sheet, click **Extensions** → **Apps Script**
2. Delete all default code
3. Copy the code from [Section 2 below](#google-apps-script-code)
4. Paste it into the editor
5. Update CONFIG section (lines 8-15) with your details:
   ```javascript
   SUPPORT_EMAIL: 'your-email@curago.in',
   WHATSAPP_NUMBER: '+917021227203',
   ```
6. Click **Save** (disk icon)

---

### Step 3: Deploy as Web App (5 min)

1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Settings:
   - Description: "CuraGo Assessment Results API"
   - Execute as: **Me (your email)**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access**
6. Select your Google account
7. Click **Advanced** → **Go to CuraGo Email Automation (unsafe)**
8. Click **Allow** (grant all permissions)
9. **COPY THE WEB APP URL** (looks like: `https://script.google.com/macros/s/ABC.../exec`)

---

### Step 4: Update Frontend Code (2 min)

Open `src/utils/googleSheets.ts` and update line 5:

```typescript
const GOOGLE_APPS_SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
```

Replace `PASTE_YOUR_WEB_APP_URL_HERE` with the URL you copied in Step 3.

---

### Step 5: Restart Dev Server (1 min)

```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

### Step 6: Test (5 min)

**Test Email Function:**
1. In Apps Script editor, select function: `testAuraEmailWithPdf`
2. Change email on line ~480 to YOUR email
3. Click **Run** ▶️
4. Check your email inbox (and spam folder)
5. Verify you received email with PDF attachment
6. Open PDF to verify formatting

**Test Live Submission:**
1. Go to your website (http://localhost:5173)
2. Complete an assessment (AURA or ATM)
3. Fill the form popup with real details (including email)
4. Submit
5. Check Google Sheet → New row added ✅
6. Check email inbox → Email with PDF received ✅

---

## Google Apps Script Code

**Copy this ENTIRE code and paste it into your Apps Script editor:**

```javascript
// ============================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================
const CONFIG = {
  AURA_SHEET_NAME: 'AURA Results',
  ATM_SHEET_NAME: 'ATM Results',
  EMAIL_SUBJECT_AURA: '🌟 Your AURA Index Results from CuraGo',
  EMAIL_SUBJECT_ATM: '🧠 Your ATM Assessment Results from CuraGo',
  FROM_NAME: 'CuraGo Team',
  COMPANY_WEBSITE: 'https://curago.in',
  SUPPORT_EMAIL: 'support@curago.in',           // ← UPDATE THIS
  WHATSAPP_NUMBER: '+917021227203',             // ← UPDATE THIS IF NEEDED
};

// ============================================================
// CORS HANDLER (Required for localhost testing)
// ============================================================
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

// ============================================================
// WEB APP ENDPOINT (Receives data from website)
// ============================================================
function doPost(e) {
  try {
    Logger.log('📥 Received POST request');
    const data = JSON.parse(e.postData.contents);
    Logger.log('Test type: ' + data.testType);

    let response;

    if (data.testType === 'aura_index') {
      response = handleAuraSubmission(data);
    } else if (data.testType === 'atm_tool') {
      response = handleAtmSubmission(data);
    } else {
      throw new Error('Invalid test type: ' + data.testType);
    }

    // Return with CORS headers
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

// ============================================================
// AURA SUBMISSION HANDLER
// ============================================================
function handleAuraSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AURA_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.AURA_SHEET_NAME + '" not found. Please create it.');
  }

  // Save to Google Sheet
  const rowData = [
    new Date(),
    data.name,
    data.email || '',
    data.phoneNumber,
    data.scores.overall,
    data.scores.awareness,
    data.scores.understanding,
    data.scores.regulation,
    data.scores.alignment,
    data.label,
    data.strengths.join(', '),
    data.growth.join(', '),
    data.riskFlags.join(', '),
    data.eventId
  ];

  sheet.appendRow(rowData);
  Logger.log('✅ Data saved to sheet');

  // Send email with PDF (only if email provided)
  if (data.email && data.email.trim() !== '') {
    sendAuraPdfEmail(data);
    Logger.log('✅ Email sent to: ' + data.email);
  } else {
    Logger.log('ℹ️ No email provided, skipping email send');
  }

  return { success: true, message: 'AURA results saved and email sent' };
}

// ============================================================
// ATM SUBMISSION HANDLER
// ============================================================
function handleAtmSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.ATM_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.ATM_SHEET_NAME + '" not found. Please create it.');
  }

  // Save to Google Sheet
  const rowData = [
    new Date(),
    data.name,
    data.email || '',
    data.phoneNumber,
    data.pattern,
    data.confidence,
    data.explanation,
    data.neurological,
    data.impact.join(', '),
    data.microActionTitle,
    data.microActionDescription,
    data.eventId
  ];

  sheet.appendRow(rowData);
  Logger.log('✅ Data saved to sheet');

  // Send email with PDF (only if email provided)
  if (data.email && data.email.trim() !== '') {
    sendAtmPdfEmail(data);
    Logger.log('✅ Email sent to: ' + data.email);
  } else {
    Logger.log('ℹ️ No email provided, skipping email send');
  }

  return { success: true, message: 'ATM results saved and email sent' };
}

// ============================================================
// AURA PDF GENERATOR
// ============================================================
function generateAuraPdf(data) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #096b17 0%, #64CB81 100%);
      color: white;
      padding: 40px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .greeting {
      font-size: 20px;
      margin-bottom: 20px;
      color: #096b17;
      font-weight: bold;
    }
    .score-section {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 25px;
      border-left: 5px solid #64CB81;
    }
    .score-section h2 {
      margin-top: 0;
      color: #096b17;
    }
    .overall-score {
      text-align: center;
      padding: 30px;
      background: white;
      border-radius: 10px;
      margin: 20px 0;
    }
    .overall-score .number {
      font-size: 72px;
      font-weight: bold;
      color: #096b17;
      line-height: 1;
    }
    .overall-score .label {
      font-size: 20px;
      color: #666;
      margin-top: 10px;
    }
    .pillar {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      font-size: 16px;
    }
    .pillar-name {
      font-weight: bold;
      color: #096b17;
    }
    .insights-box {
      background: #e8f5e9;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .insights-box h3 {
      margin-top: 0;
      color: #096b17;
    }
    .cta-box {
      background: #096b17;
      color: white;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌟 Your AURA Index Results</h1>
    <p>Personalized Emotional Fitness Assessment</p>
  </div>

  <p class="greeting">Hi ${data.name}! 👋</p>
  <p>Thank you for completing the AURA Index assessment. Here are your comprehensive results:</p>

  <div class="score-section">
    <h2>Overall AURA Score</h2>
    <div class="overall-score">
      <div class="number">${Math.round(data.scores.overall)}/100</div>
      <div class="label">${data.label}</div>
    </div>
  </div>

  <div class="score-section">
    <h2>Your Pillar Scores</h2>
    <div class="pillar">
      <span class="pillar-name">Awareness:</span> ${Math.round(data.scores.awareness)}/100
    </div>
    <div class="pillar">
      <span class="pillar-name">Understanding:</span> ${Math.round(data.scores.understanding)}/100
    </div>
    <div class="pillar">
      <span class="pillar-name">Regulation:</span> ${Math.round(data.scores.regulation)}/100
    </div>
    <div class="pillar">
      <span class="pillar-name">Alignment:</span> ${Math.round(data.scores.alignment)}/100
    </div>
  </div>

  ${data.strengths.length > 0 ? `
  <div class="insights-box">
    <h3>✨ Your Strengths</h3>
    <p>${data.strengths.join(', ')}</p>
  </div>
  ` : ''}

  ${data.growth.length > 0 ? `
  <div class="insights-box">
    <h3>🌱 Growth Areas</h3>
    <p>${data.growth.join(', ')}</p>
  </div>
  ` : ''}

  ${data.riskFlags.length > 0 ? `
  <div class="insights-box">
    <h3>⚠️ Attention Areas</h3>
    <p>${data.riskFlags.join(', ')}</p>
  </div>
  ` : ''}

  <div class="cta-box">
    <h3>Ready to take your next step?</h3>
    <p>Book a free 15-minute clarity call with our mental health experts</p>
    <p><strong>Visit:</strong> ${CONFIG.COMPANY_WEBSITE}/contact</p>
    <p><strong>WhatsApp:</strong> ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>

  <div class="footer">
    <strong>CuraGo - Your Partner in Emotional Wellness</strong>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.SUPPORT_EMAIL}</p>
    <p style="font-size: 12px; color: #999; margin-top: 15px;">
      Report generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
</body>
</html>
  `;

  const blob = HtmlService.createHtmlOutput(html)
    .getBlob()
    .setName('AURA_Results_' + data.name.replace(/\s+/g, '_') + '.pdf');

  return blob;
}

// ============================================================
// ATM PDF GENERATOR
// ============================================================
function generateAtmPdf(data) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #096b17 0%, #64CB81 100%);
      color: white;
      padding: 40px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .greeting {
      font-size: 20px;
      margin-bottom: 20px;
      color: #096b17;
      font-weight: bold;
    }
    .pattern-box {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 25px;
      border-left: 5px solid #64CB81;
      text-align: center;
    }
    .pattern-name {
      font-size: 28px;
      font-weight: bold;
      color: #096b17;
      margin-bottom: 15px;
    }
    .confidence {
      font-size: 16px;
      color: #666;
    }
    .section {
      background: #ffffff;
      padding: 25px;
      border-radius: 10px;
      margin-bottom: 20px;
      border: 2px solid #e0e0e0;
    }
    .section h2 {
      margin-top: 0;
      color: #096b17;
    }
    .micro-action-box {
      background: #e8f5e9;
      padding: 25px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .micro-action-box h3 {
      margin-top: 0;
      color: #096b17;
    }
    .micro-action-box h4 {
      color: #096b17;
      margin: 15px 0 10px 0;
    }
    .cta-box {
      background: #096b17;
      color: white;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 Your ATM Assessment Results</h1>
    <p>Anxiety Trigger Mapping</p>
  </div>

  <p class="greeting">Hi ${data.name}! 👋</p>
  <p>Thank you for completing the ATM assessment. Here are your personalized results:</p>

  <div class="pattern-box">
    <div class="pattern-name">${data.pattern}</div>
    <div class="confidence">Confidence Level: ${Math.round(data.confidence * 100)}%</div>
  </div>

  <div class="section">
    <h2>What This Means</h2>
    <p>${data.explanation}</p>
  </div>

  <div class="section">
    <h2>🧬 Why It Happens</h2>
    <p>${data.neurological}</p>
  </div>

  <div class="micro-action-box">
    <h3>💡 Your Personalized Micro-Action</h3>
    <h4>${data.microActionTitle}</h4>
    <p>${data.microActionDescription}</p>
  </div>

  <div class="cta-box">
    <h3>Ready to take your next step?</h3>
    <p>Book a free 15-minute clarity call with our mental health experts</p>
    <p><strong>Visit:</strong> ${CONFIG.COMPANY_WEBSITE}/contact</p>
    <p><strong>WhatsApp:</strong> ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>

  <div class="footer">
    <strong>CuraGo - Your Partner in Emotional Wellness</strong>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.SUPPORT_EMAIL}</p>
    <p style="font-size: 12px; color: #999; margin-top: 15px;">
      Report generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
</body>
</html>
  `;

  const blob = HtmlService.createHtmlOutput(html)
    .getBlob()
    .setName('ATM_Results_' + data.name.replace(/\s+/g, '_') + '.pdf');

  return blob;
}

// ============================================================
// SEND AURA EMAIL WITH PDF
// ============================================================
function sendAuraPdfEmail(data) {
  const pdfBlob = generateAuraPdf(data);

  const plainBody = `
Hi ${data.name}!

Thank you for completing the AURA Index assessment.

Your detailed results are attached as a PDF document.

QUICK SUMMARY:
Overall Score: ${Math.round(data.scores.overall)}/100 - ${data.label}

Pillar Scores:
- Awareness: ${Math.round(data.scores.awareness)}/100
- Understanding: ${Math.round(data.scores.understanding)}/100
- Regulation: ${Math.round(data.scores.regulation)}/100
- Alignment: ${Math.round(data.scores.alignment)}/100

${data.strengths.length > 0 ? 'Strengths: ' + data.strengths.join(', ') : ''}
${data.growth.length > 0 ? 'Growth Areas: ' + data.growth.join(', ') : ''}

Next Steps:
- Book a free clarity call: ${CONFIG.COMPANY_WEBSITE}/contact
- Chat with us on WhatsApp: ${CONFIG.WHATSAPP_NUMBER}

Best regards,
CuraGo Team
${CONFIG.COMPANY_WEBSITE}
  `;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .header { background: linear-gradient(135deg, #096b17 0%, #64CB81 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }
    .cta-button { background: #64CB81; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌟 Your AURA Index Results</h1>
  </div>
  <div class="content">
    <h2>Hi ${data.name}! 👋</h2>
    <p>Thank you for completing the AURA Index assessment.</p>
    <p><strong>Your detailed results are attached as a PDF document.</strong></p>
    <p>Overall Score: <strong>${Math.round(data.scores.overall)}/100</strong> - ${data.label}</p>
    <p style="text-align: center;">
      <a href="${CONFIG.COMPANY_WEBSITE}/contact" class="cta-button">Book Free Clarity Call</a>
    </p>
  </div>
  <div class="footer">
    <p><strong>CuraGo Team</strong></p>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>
</body>
</html>
  `;

  GmailApp.sendEmail(
    data.email,
    CONFIG.EMAIL_SUBJECT_AURA,
    plainBody,
    {
      htmlBody: htmlBody,
      name: CONFIG.FROM_NAME,
      attachments: [pdfBlob]
    }
  );

  Logger.log('✅ AURA email with PDF sent to: ' + data.email);
}

// ============================================================
// SEND ATM EMAIL WITH PDF
// ============================================================
function sendAtmPdfEmail(data) {
  const pdfBlob = generateAtmPdf(data);

  const plainBody = `
Hi ${data.name}!

Thank you for completing the ATM assessment.

Your detailed results are attached as a PDF document.

QUICK SUMMARY:
Anxiety Pattern: ${data.pattern}
Confidence: ${Math.round(data.confidence * 100)}%

${data.explanation}

Your Micro-Action:
${data.microActionTitle}
${data.microActionDescription}

Next Steps:
- Book a free clarity call: ${CONFIG.COMPANY_WEBSITE}/contact
- Chat with us on WhatsApp: ${CONFIG.WHATSAPP_NUMBER}

Best regards,
CuraGo Team
${CONFIG.COMPANY_WEBSITE}
  `;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .header { background: linear-gradient(135deg, #096b17 0%, #64CB81 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }
    .cta-button { background: #64CB81; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 Your ATM Assessment Results</h1>
  </div>
  <div class="content">
    <h2>Hi ${data.name}! 👋</h2>
    <p>Thank you for completing the ATM assessment.</p>
    <p><strong>Your detailed results are attached as a PDF document.</strong></p>
    <p>Pattern: <strong>${data.pattern}</strong></p>
    <p style="text-align: center;">
      <a href="${CONFIG.COMPANY_WEBSITE}/contact" class="cta-button">Book Free Clarity Call</a>
    </p>
  </div>
  <div class="footer">
    <p><strong>CuraGo Team</strong></p>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>
</body>
</html>
  `;

  GmailApp.sendEmail(
    data.email,
    CONFIG.EMAIL_SUBJECT_ATM,
    plainBody,
    {
      htmlBody: htmlBody,
      name: CONFIG.FROM_NAME,
      attachments: [pdfBlob]
    }
  );

  Logger.log('✅ ATM email with PDF sent to: ' + data.email);
}

// ============================================================
// TEST FUNCTIONS
// ============================================================
function testAuraEmailWithPdf() {
  const testData = {
    name: 'Test User',
    email: 'your-email@example.com', // ← CHANGE THIS TO YOUR EMAIL
    phoneNumber: '+919876543210',
    scores: {
      overall: 75,
      awareness: 80,
      understanding: 70,
      regulation: 75,
      alignment: 75
    },
    label: 'Balanced & Reflective',
    strengths: ['Awareness', 'Regulation'],
    growth: ['Understanding'],
    riskFlags: ['Acute stress risk'],
    eventId: 'test_' + Date.now()
  };

  sendAuraPdfEmail(testData);
  Logger.log('✅ Test AURA email sent');
}

function testAtmEmailWithPdf() {
  const testData = {
    name: 'Test User',
    email: 'your-email@example.com', // ← CHANGE THIS TO YOUR EMAIL
    phoneNumber: '+919876543210',
    pattern: 'Overthinking Loop Anxiety',
    confidence: 0.85,
    explanation: 'Your mind starts the anxiety before anything else.',
    neurological: 'Your prefrontal cortex is overloaded with predictions.',
    microActionTitle: 'Label the Thought',
    microActionDescription: 'Right now my mind is running a future story, not a reality.',
    eventId: 'test_' + Date.now()
  };

  sendAtmPdfEmail(testData);
  Logger.log('✅ Test ATM email sent');
}
```

---

## Testing

### Test Email Sending (in Apps Script)

1. In Apps Script editor, select function: `testAuraEmailWithPdf`
2. **Change email on line ~480** to YOUR real email
3. Click **Run** ▶️
4. Check inbox (and spam folder)
5. Verify email received with PDF attachment
6. Open PDF to check formatting

Repeat with `testAtmEmailWithPdf` function.

### Test Full Flow (on Website)

1. Start dev server: `npm run dev`
2. Go to http://localhost:5173
3. Complete AURA assessment
4. Fill form popup (name, WhatsApp, **email**)
5. Submit form
6. Check browser console (F12):
   - Should see: `📤 Sending AURA results to Google Sheets...`
   - Should see: `✅ AURA results sent to Google Sheets and email sent`
7. Check Google Sheet → New row added ✅
8. Check email inbox → Email with PDF received ✅

---

## Troubleshooting

### Issue 1: CORS Error (from localhost)

**Symptom:** Browser console shows "CORS policy" error, OPTIONS request fails

**Solution:** The code above includes CORS handling (`doOptions` function). If you still see errors:
1. Make sure you copied the FULL code including `doOptions()`
2. **Re-deploy** the Web App (Deploy → Manage deployments → Edit → New version)
3. Update frontend with the NEW URL
4. Restart dev server

### Issue 2: No Email Received

**Check these:**
- [ ] Email field was filled in the form (required!)
- [ ] Check spam/junk folder
- [ ] Apps Script → View → Executions → Check for errors
- [ ] Gmail permissions granted during authorization
- [ ] Test function works (`testAuraEmailWithPdf`)

### Issue 3: Data Not Saving to Sheet

**Check these:**
- [ ] Sheet names exact: "AURA Results" and "ATM Results"
- [ ] Headers in Row 1 of both sheets
- [ ] Apps Script → View → Executions → Look for errors
- [ ] Web App URL correct in `src/utils/googleSheets.ts`
- [ ] Dev server restarted after URL change

### Issue 4: PDF is Blank or Malformed

**Solution:**
- The code above is optimized for Google Apps Script
- Don't modify HTML/CSS extensively (Apps Script has limitations)
- If you made changes, try the original code above

### Issue 5: "Sheet not found" Error

**Solution:**
- Check sheet names are EXACTLY: `AURA Results` and `ATM Results`
- Case-sensitive, check for extra spaces
- Make sure sheets are in the SAME spreadsheet as the script

### Checking Execution Logs

1. Apps Script editor → **View** → **Executions**
2. Find recent runs
3. Click on any to see detailed logs
4. Look for error messages

---

## Customization

### Change Email Colors

Find this line in PDF generators:
```javascript
background: linear-gradient(135deg, #096b17 0%, #64CB81 100%);
```

Change to your brand colors:
```javascript
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Change Email Subject

Update CONFIG:
```javascript
EMAIL_SUBJECT_AURA: '✨ Your Custom Subject Here',
```

### Add Company Logo to PDF

In the header section, add:
```html
<div class="header">
  <img src="https://yourwebsite.com/logo.png" style="height: 50px; margin-bottom: 15px;">
  <h1>🌟 Your AURA Index Results</h1>
</div>
```

**Note:** Logo must be publicly accessible URL

### Modify PDF Content

Edit the HTML in `generateAuraPdf()` or `generateAtmPdf()` functions. The code uses simple HTML and CSS that works well with Google Apps Script's PDF converter.

---

## What Happens

1. **User completes assessment** on your website
2. **User fills mandatory popup** with name, WhatsApp, email
3. **User submits form**
4. **Frontend sends data to:**
   - Wylto webhook (existing)
   - Google Sheets (NEW!)
   - GTM/Meta tracking (existing)
5. **Google Apps Script receives data:**
   - Saves to appropriate sheet
   - Generates PDF report
   - Sends email with PDF attachment
6. **User receives:**
   - Email in inbox (within 30 seconds)
   - PDF attachment with full results
   - Links to book clarity call

---

## Cost

**₹0/month** - Completely free!

- Google Sheets: Free
- Apps Script: Free
- Gmail: Free (100 emails/day limit)
- PDF Generation: Free

---

## Support

**If you have issues:**

1. Check Apps Script → View → Executions for errors
2. Check browser console (F12) for frontend errors
3. Verify sheet names and headers match exactly
4. Make sure Web App is deployed and URL is correct
5. Test with test functions first before live testing

---

## Summary Checklist

Setup complete when:

- ✅ Google Sheet created with 2 tabs
- ✅ Headers added to both tabs
- ✅ Apps Script code added and saved
- ✅ CONFIG updated with your details
- ✅ Web App deployed
- ✅ Authorization granted
- ✅ Web App URL copied
- ✅ Frontend code updated with URL
- ✅ Dev server restarted
- ✅ Test email received with PDF
- ✅ Live submission works
- ✅ Data saves to sheet
- ✅ Email received with PDF

---

**That's it! You now have fully automated PDF email reports! 🎉**
