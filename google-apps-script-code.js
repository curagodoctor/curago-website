// ============================================================
// Google Apps Script Code for CuraGo Assessment PDFs
// ============================================================
// Instructions:
// 1. Go to https://script.google.com
// 2. Create a new project or open your existing one
// 3. Replace ALL code with this file's contents
// 4. Update CONFIG.DRIVE_FOLDER_ID with your Google Drive folder ID
// 5. Save the project
// 6. Deploy → New deployment → Web app → "Who has access" = "Anyone"
// 7. Copy the deployment URL and update vite.config.ts
// ============================================================

const CONFIG = {
  AURA_SHEET_NAME: 'AURA Results',
  ATM_SHEET_NAME: 'ATM Results',
  EMAIL_SUBJECT_AURA: 'Your AURA Index Results from CuraGo',
  EMAIL_SUBJECT_ATM: 'Your ATM Assessment Results from CuraGo',
  FROM_NAME: 'CuraGo Team',
  COMPANY_WEBSITE: 'https://curago.in',
  SUPPORT_EMAIL: 'curagodoctor@gmail.com',
  WHATSAPP_NUMBER: '+919148615951',

  // IMPORTANT: Add your Google Drive folder ID here
  // Instructions to get folder ID:
  // 1. Go to Google Drive
  // 2. Create/open a folder for PDFs
  // 3. Copy the ID from the URL: https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
  DRIVE_FOLDER_ID: '1ztLlzdZgZyJZR1BfICOHBPzbeNRDwTTx', // Leave empty to save in root, or paste folder ID here
};

// ============================================================
// CORS HANDLER
// ============================================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'Google Apps Script is deployed and working',
      timestamp: new Date().toISOString(),
      deployment: 'CORS enabled'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ============================================================
// WEB APP ENDPOINT
// ============================================================
function doPost(e) {
  try {
    Logger.log('Received POST request');
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

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
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

  // Generate PDF and save to Drive
  const pdfFile = savePdfToDrive(generateAuraPdf(data), 'AURA_Results_' + data.name.replace(/\s+/g, '_'));
  const pdfUrl = pdfFile.getUrl();

  // Save to Google Sheet with PDF link
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
    data.eventId,
    pdfUrl // PDF link in last column
  ];

  sheet.appendRow(rowData);
  Logger.log('Data saved to sheet with PDF link');

  // Send email with PDF
  if (data.email && data.email.trim() !== '') {
    sendAuraPdfEmail(data, pdfFile);
    Logger.log('Email sent to: ' + data.email);
  } else {
    Logger.log('No email provided, skipping email send');
  }

  return { success: true, message: 'AURA results saved and email sent', pdfUrl: pdfUrl };
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

  // Generate PDF and save to Drive
  const pdfFile = savePdfToDrive(generateAtmPdf(data), 'ATM_Results_' + data.name.replace(/\s+/g, '_'));
  const pdfUrl = pdfFile.getUrl();

  // Save to Google Sheet with PDF link
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
    data.eventId,
    pdfUrl // PDF link in last column
  ];

  sheet.appendRow(rowData);
  Logger.log('Data saved to sheet with PDF link');

  // Send email with PDF
  if (data.email && data.email.trim() !== '') {
    sendAtmPdfEmail(data, pdfFile);
    Logger.log('Email sent to: ' + data.email);
  } else {
    Logger.log('No email provided, skipping email send');
  }

  return { success: true, message: 'ATM results saved and email sent', pdfUrl: pdfUrl };
}

// ============================================================
// SAVE PDF TO GOOGLE DRIVE
// ============================================================
function savePdfToDrive(blob, fileName) {
  const folder = CONFIG.DRIVE_FOLDER_ID
    ? DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID)
    : DriveApp.getRootFolder();

  const file = folder.createFile(blob);
  file.setName(fileName + '.pdf');
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file;
}

// ============================================================
// AURA PDF GENERATOR (Clean Design - No Emojis, No Gradients)
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
      background: #096b17;
      color: white;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: normal;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #096b17;
      font-weight: bold;
    }
    .score-section {
      background: #f8f9fa;
      padding: 25px;
      margin-bottom: 20px;
      border-left: 4px solid #096b17;
    }
    .score-section h2 {
      margin-top: 0;
      color: #096b17;
      font-size: 20px;
    }
    .overall-score {
      text-align: center;
      padding: 25px;
      background: white;
      margin: 15px 0;
      border: 1px solid #e0e0e0;
    }
    .overall-score .number {
      font-size: 48px;
      font-weight: bold;
      color: #096b17;
      line-height: 1;
    }
    .overall-score .label {
      font-size: 16px;
      color: #666;
      margin-top: 10px;
    }
    .pillar {
      background: white;
      padding: 12px;
      margin: 8px 0;
      border: 1px solid #e0e0e0;
      font-size: 14px;
    }
    .pillar-name {
      font-weight: bold;
      color: #096b17;
    }
    .insights-box {
      background: #f0f7f1;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #d0e5d3;
    }
    .insights-box h3 {
      margin-top: 0;
      color: #096b17;
      font-size: 16px;
    }
    .cta-box {
      background: #096b17;
      color: white;
      padding: 20px;
      text-align: center;
      margin: 25px 0;
    }
    .cta-box h3 {
      margin-top: 0;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your AURA Index Results</h1>
    <p>Personalized Emotional Fitness Assessment</p>
  </div>

  <p class="greeting">Hi ${data.name}!</p>
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
    <h3>Your Strengths</h3>
    <p>${data.strengths.join(', ')}</p>
  </div>
  ` : ''}

  ${data.growth.length > 0 ? `
  <div class="insights-box">
    <h3>Growth Areas</h3>
    <p>${data.growth.join(', ')}</p>
  </div>
  ` : ''}

  ${data.riskFlags.length > 0 ? `
  <div class="insights-box">
    <h3>Attention Areas</h3>
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
    <p style="margin-top: 10px;">
      Report generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
</body>
</html>
  `;

  return Utilities.newBlob(html, 'text/html', 'temp.html').getAs('application/pdf');
}

// ============================================================
// ATM PDF GENERATOR (Clean Design - No Emojis, No Gradients)
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
      background: #096b17;
      color: white;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: normal;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #096b17;
      font-weight: bold;
    }
    .pattern-box {
      background: #f8f9fa;
      padding: 25px;
      margin-bottom: 20px;
      border-left: 4px solid #096b17;
      text-align: center;
    }
    .pattern-name {
      font-size: 22px;
      font-weight: bold;
      color: #096b17;
      margin-bottom: 10px;
    }
    .confidence {
      font-size: 14px;
      color: #666;
    }
    .section {
      background: #ffffff;
      padding: 20px;
      margin-bottom: 15px;
      border: 1px solid #e0e0e0;
    }
    .section h2 {
      margin-top: 0;
      color: #096b17;
      font-size: 18px;
    }
    .micro-action-box {
      background: #f0f7f1;
      padding: 20px;
      margin: 20px 0;
      border: 1px solid #d0e5d3;
    }
    .micro-action-box h3 {
      margin-top: 0;
      color: #096b17;
      font-size: 16px;
    }
    .micro-action-box h4 {
      color: #096b17;
      margin: 10px 0;
      font-size: 15px;
    }
    .cta-box {
      background: #096b17;
      color: white;
      padding: 20px;
      text-align: center;
      margin: 25px 0;
    }
    .cta-box h3 {
      margin-top: 0;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your ATM Assessment Results</h1>
    <p>Anxiety Trigger Mapping</p>
  </div>

  <p class="greeting">Hi ${data.name}!</p>
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
    <h2>Why It Happens</h2>
    <p>${data.neurological}</p>
  </div>

  <div class="micro-action-box">
    <h3>Your Personalized Micro-Action</h3>
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
    <p style="margin-top: 10px;">
      Report generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
</body>
</html>
  `;

  return Utilities.newBlob(html, 'text/html', 'temp.html').getAs('application/pdf');
}

// ============================================================
// SEND AURA EMAIL WITH PDF
// ============================================================
function sendAuraPdfEmail(data, pdfFile) {
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
    .header { background: #096b17; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }
    .cta-button { background: #64CB81; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your AURA Index Results</h1>
  </div>
  <div class="content">
    <h2>Hi ${data.name}!</h2>
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
      attachments: [pdfFile.getBlob()]
    }
  );

  Logger.log('AURA email with PDF sent to: ' + data.email);
}

// ============================================================
// SEND ATM EMAIL WITH PDF
// ============================================================
function sendAtmPdfEmail(data, pdfFile) {
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
    .header { background: #096b17; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }
    .cta-button { background: #64CB81; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your ATM Assessment Results</h1>
  </div>
  <div class="content">
    <h2>Hi ${data.name}!</h2>
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
      attachments: [pdfFile.getBlob()]
    }
  );

  Logger.log('ATM email with PDF sent to: ' + data.email);
}
