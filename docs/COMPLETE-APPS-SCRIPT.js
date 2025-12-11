// ============================================================
// COMPLETE GOOGLE APPS SCRIPT CODE FOR CURAGO
// ============================================================
// This handles:
// 1. CORS for localhost testing
// 2. Receiving assessment data from website
// 3. Saving to Google Sheets
// 4. Generating PDF reports
// 5. Sending emails with PDF attachments
// ============================================================

// ============================================================
// CONFIGURATION - YOUR DETAILS
// ============================================================
const CONFIG = {
  AURA_SHEET_NAME: 'AURA Results',
  ATM_SHEET_NAME: 'ATM Results',
  EMAIL_SUBJECT_AURA: '🌟 Your AURA Index Results from CuraGo',
  EMAIL_SUBJECT_ATM: '🧠 Your ATM Assessment Results from CuraGo',
  FROM_NAME: 'CuraGo Team',
  COMPANY_WEBSITE: 'https://curago.in',
  SUPPORT_EMAIL: 'curagodoctor@gmail.com',
  WHATSAPP_NUMBER: '+919148615951',
};

// ============================================================
// CORS HANDLER (CRITICAL - Required for localhost testing)
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
    .header p {
      margin: 5px 0;
      opacity: 0.95;
    }
    .score-box {
      background: #f8f9fa;
      border-left: 5px solid #096b17;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .score-label {
      font-weight: bold;
      color: #096b17;
      margin-bottom: 10px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      color: #096b17;
      font-size: 24px;
      border-bottom: 2px solid #096b17;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .list-item {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      border: 1px solid #e0e0e0;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #096b17;
      text-align: center;
      color: #666;
    }
    .whatsapp-link {
      color: #25D366;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌟 Your AURA Index Results</h1>
    <p><strong>${data.name}</strong></p>
    <p>${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Your Overall Score</h2>
    <div class="score-box">
      <div class="score-label">Overall AURA Score: ${data.scores.overall}/100</div>
      <div class="score-label">Interpretation: ${data.label}</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Dimension Breakdown</h2>
    <div class="score-box">
      <div class="score-label">🧘‍♀️ Awareness: ${data.scores.awareness}/100</div>
    </div>
    <div class="score-box">
      <div class="score-label">🧠 Understanding: ${data.scores.understanding}/100</div>
    </div>
    <div class="score-box">
      <div class="score-label">⚖️ Regulation: ${data.scores.regulation}/100</div>
    </div>
    <div class="score-box">
      <div class="score-label">🎯 Alignment: ${data.scores.alignment}/100</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">💪 Your Strengths</h2>
    ${data.strengths.map(s => `<div class="list-item">${s}</div>`).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">🌱 Growth Opportunities</h2>
    ${data.growth.map(g => `<div class="list-item">${g}</div>`).join('')}
  </div>

  ${data.riskFlags.length > 0 ? `
  <div class="section">
    <h2 class="section-title">⚠️ Areas Needing Attention</h2>
    ${data.riskFlags.map(r => `<div class="list-item">${r}</div>`).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>CuraGo - Empowering Emotional Wellness</strong></p>
    <p>Visit us: <a href="${CONFIG.COMPANY_WEBSITE}">${CONFIG.COMPANY_WEBSITE}</a></p>
    <p>Email: <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a></p>
    <p>WhatsApp: <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace('+', '')}" class="whatsapp-link">${CONFIG.WHATSAPP_NUMBER}</a></p>
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Event ID: ${data.eventId}
    </p>
  </div>
</body>
</html>
  `;

  return HtmlService.createHtmlOutput(html).getBlob().setName('AURA_Results_' + data.name.replace(/\s+/g, '_') + '.pdf');
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
    .header p {
      margin: 5px 0;
      opacity: 0.95;
    }
    .pattern-box {
      background: #f8f9fa;
      border-left: 5px solid #096b17;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .pattern-label {
      font-weight: bold;
      color: #096b17;
      font-size: 20px;
      margin-bottom: 10px;
    }
    .confidence {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      color: #096b17;
      font-size: 24px;
      border-bottom: 2px solid #096b17;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .content-box {
      background: white;
      padding: 20px;
      border-radius: 5px;
      border: 1px solid #e0e0e0;
      margin: 15px 0;
    }
    .impact-list {
      list-style-type: none;
      padding: 0;
    }
    .impact-list li {
      background: #f8f9fa;
      padding: 10px;
      margin: 8px 0;
      border-radius: 5px;
      border-left: 3px solid #096b17;
    }
    .action-box {
      background: #e8f5e9;
      border: 2px solid #096b17;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .action-title {
      color: #096b17;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #096b17;
      text-align: center;
      color: #666;
    }
    .whatsapp-link {
      color: #25D366;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 Your ATM Assessment Results</h1>
    <p><strong>${data.name}</strong></p>
    <p>${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Your Attachment Pattern</h2>
    <div class="pattern-box">
      <div class="pattern-label">${data.pattern}</div>
      <div class="confidence">Confidence: ${data.confidence}%</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">📖 What This Means</h2>
    <div class="content-box">
      ${data.explanation}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">🧬 Neurological Basis</h2>
    <div class="content-box">
      ${data.neurological}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">🎯 How This Shows Up In Your Life</h2>
    <ul class="impact-list">
      ${data.impact.map(item => `<li>${item}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2 class="section-title">✨ Your Micro-Action</h2>
    <div class="action-box">
      <div class="action-title">${data.microActionTitle}</div>
      <p>${data.microActionDescription}</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>CuraGo - Empowering Emotional Wellness</strong></p>
    <p>Visit us: <a href="${CONFIG.COMPANY_WEBSITE}">${CONFIG.COMPANY_WEBSITE}</a></p>
    <p>Email: <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a></p>
    <p>WhatsApp: <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace('+', '')}" class="whatsapp-link">${CONFIG.WHATSAPP_NUMBER}</a></p>
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Event ID: ${data.eventId}
    </p>
  </div>
</body>
</html>
  `;

  return HtmlService.createHtmlOutput(html).getBlob().setName('ATM_Results_' + data.name.replace(/\s+/g, '_') + '.pdf');
}

// ============================================================
// EMAIL SENDER - AURA
// ============================================================
function sendAuraPdfEmail(data) {
  const pdfBlob = generateAuraPdf(data);

  const emailBody = `
Dear ${data.name},

Thank you for completing the AURA Index assessment with CuraGo!

Your comprehensive results are attached as a PDF. This report includes:
✅ Your overall AURA score and interpretation
✅ Detailed breakdown across all four dimensions
✅ Personalized strengths and growth opportunities
✅ Actionable insights for your emotional wellness journey

We're here to support you on your path to emotional wellness. If you have any questions about your results or would like to learn more about how CuraGo can help, please don't hesitate to reach out.

📧 Email: ${CONFIG.SUPPORT_EMAIL}
💬 WhatsApp: ${CONFIG.WHATSAPP_NUMBER}
🌐 Website: ${CONFIG.COMPANY_WEBSITE}

Warm regards,
${CONFIG.FROM_NAME}

---
This email was sent because you completed an assessment on CuraGo.
  `;

  GmailApp.sendEmail(
    data.email,
    CONFIG.EMAIL_SUBJECT_AURA,
    emailBody,
    {
      name: CONFIG.FROM_NAME,
      attachments: [pdfBlob]
    }
  );
}

// ============================================================
// EMAIL SENDER - ATM
// ============================================================
function sendAtmPdfEmail(data) {
  const pdfBlob = generateAtmPdf(data);

  const emailBody = `
Dear ${data.name},

Thank you for completing the Attachment Theory Mapper (ATM) assessment with CuraGo!

Your comprehensive results are attached as a PDF. This report includes:
✅ Your identified attachment pattern (${data.pattern})
✅ Detailed explanation of what this means for you
✅ Neurological insights into your attachment style
✅ How this shows up in your daily life
✅ A personalized micro-action to start your growth journey

Understanding your attachment patterns is a powerful step toward building healthier relationships and emotional well-being. We're here to support you every step of the way.

📧 Email: ${CONFIG.SUPPORT_EMAIL}
💬 WhatsApp: ${CONFIG.WHATSAPP_NUMBER}
🌐 Website: ${CONFIG.COMPANY_WEBSITE}

Warm regards,
${CONFIG.FROM_NAME}

---
This email was sent because you completed an assessment on CuraGo.
  `;

  GmailApp.sendEmail(
    data.email,
    CONFIG.EMAIL_SUBJECT_ATM,
    emailBody,
    {
      name: CONFIG.FROM_NAME,
      attachments: [pdfBlob]
    }
  );
}

// ============================================================
// TEST FUNCTIONS
// ============================================================
function testAuraEmailWithPdf() {
  const testData = {
    name: 'Test User',
    email: 'curagodoctor@gmail.com', // ← Change this to your email for testing
    phoneNumber: '+919148615951',
    scores: {
      overall: 75,
      awareness: 80,
      understanding: 70,
      regulation: 75,
      alignment: 75
    },
    label: 'Growing Awareness',
    strengths: [
      'Strong emotional awareness in calm situations',
      'Good understanding of basic emotional triggers'
    ],
    growth: [
      'Practice recognizing emotions during stressful moments',
      'Develop strategies for emotional regulation'
    ],
    riskFlags: [],
    eventId: 'test_' + new Date().getTime()
  };

  sendAuraPdfEmail(testData);
  Logger.log('✅ Test email sent!');
}

function testAtmEmailWithPdf() {
  const testData = {
    name: 'Test User',
    email: 'curagodoctor@gmail.com', // ← Change this to your email for testing
    phoneNumber: '+919148615951',
    pattern: 'Secure Attachment',
    confidence: 85,
    explanation: 'You generally feel comfortable with intimacy and independence.',
    neurological: 'Your attachment system shows balanced activation patterns.',
    impact: [
      'You form healthy, stable relationships',
      'You communicate needs effectively',
      'You balance independence and connection'
    ],
    microActionTitle: 'Maintain Your Balance',
    microActionDescription: 'Continue practicing open communication in your relationships.',
    eventId: 'test_' + new Date().getTime()
  };

  sendAtmPdfEmail(testData);
  Logger.log('✅ Test email sent!');
}
