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
  CALA_SHEET_NAME: 'CALA Results',
  GBSI_SHEET_NAME: 'GBSI Results',
  PRIORITY_CIRCLE_SHEET_NAME: 'Priority Circle 365',
  CONSULTATION_BOOKING_SHEET_NAME: 'Consultation Bookings',
  EMAIL_SUBJECT_AURA: 'Your AURA Index Results from CuraGo',
  EMAIL_SUBJECT_ATM: 'Your ATM Assessment Results from CuraGo',
  EMAIL_SUBJECT_CALA: 'Your CALA 1.0 Assessment Results from CuraGo',
  EMAIL_SUBJECT_GBSI: 'Your GBSI Assessment Results from CuraGo',
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
    } else if (data.testType === 'cala_tool') {
      response = handleCalaSubmission(data);
    } else if (data.testType === 'gbsi_tool') {
      response = handleGbsiSubmission(data);
    } else if (data.testType === 'priority_circle') {
      response = handlePriorityCircleSubmission(data);
    } else if (data.testType === 'consultation_booking') {
      response = handleConsultationBookingSubmission(data);
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

// ============================================================
// CALA SUBMISSION HANDLER
// ============================================================
function handleCalaSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.CALA_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.CALA_SHEET_NAME + '" not found. Please create it.');
  }

  // Generate PDF and save to Drive
  const pdfFile = savePdfToDrive(generateCalaPdf(data), 'CALA_Results_' + data.name.replace(/\s+/g, '_'));
  const pdfUrl = pdfFile.getUrl();

  // Save to Google Sheet with PDF link
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

  sheet.appendRow(rowData);
  Logger.log('Data saved to sheet with PDF link');

  // Send email with PDF
  if (data.email && data.email.trim() !== '') {
    sendCalaPdfEmail(data, pdfFile);
    Logger.log('Email sent to: ' + data.email);
  } else {
    Logger.log('No email provided, skipping email send');
  }

  return { success: true, message: 'CALA results saved and email sent', pdfUrl: pdfUrl };
}

// ============================================================
// CALA PDF GENERATOR - WITH COMPLETE CONTENT
// ============================================================
function generateCalaPdf(data) {
  // Get loop descriptions
  const getLoopDescription = function(loopName) {
    const descriptions = {
      'Anticipatory Loop': 'Your anxiety is driven by future-oriented thinking. You tend to mentally rehearse possible outcomes in advance, which creates a sense of preparedness but also keeps anxiety active.',
      'Control-Seeking Loop': 'Your anxiety is shaped by a need to stabilise or control uncertainty. Attempts to manage or neutralise discomfort provide short-term relief but keep attention fixed on the problem.',
      'Reassurance Loop': 'Your anxiety is reinforced through reassurance-seeking. External validation eases anxiety briefly, but over time increases dependence and sensitivity to doubt.',
      'Avoidance Loop': 'Your anxiety persists through avoidance patterns. Avoiding discomfort reduces anxiety momentarily, but teaches the system that anxiety requires withdrawal.',
      'Somatic Sensitivity Loop': 'Your anxiety is strongly influenced by bodily sensations. Physical signals become interpreted as threats, which amplifies awareness and fear.',
      'Cognitive Overload Loop': 'Your anxiety emerges from sustained mental load. Prolonged thinking without recovery reduces cognitive buffer, allowing anxiety to surface during routine stress.'
    };
    return descriptions[loopName] || '';
  };

  // Get trigger content
  const getTriggerContent = function(triggerType) {
    const content = {
      'Internal': {
        description: 'Your anxiety is mostly triggered internally — through thoughts, mental scenarios, or subtle body signals. This explains why anxiety can appear even on days that look calm from the outside.',
        points: [
          'You may have noticed anxiety arriving without a clear external reason.',
          'This can make it harder to explain to others — or even to yourself — why you feel anxious.'
        ]
      },
      'External': {
        description: 'Your anxiety is mainly triggered by situations or environments, with internal reactions following. This means anxiety usually makes sense in context, even if the reaction feels stronger than expected.',
        points: [
          'You may find that anxiety eases once the situation passes.',
          'Certain environments or demands may consistently stand out as difficult for you.'
        ]
      },
      'Mixed': {
        description: 'Your anxiety shifts between internal and situational triggers. Some days, external stressors play a bigger role. On other days, anxiety seems to arise internally.',
        points: [
          'This can make anxiety feel inconsistent or hard to predict.',
          'You may notice that your experience changes depending on context rather than one fixed cause.'
        ]
      }
    };
    return content[triggerType] || content['Mixed'];
  };

  // Get reinforcement content
  const getReinforcementContent = function(reinforcement) {
    const content = {
      'Control': {
        description: 'When anxiety appears, you tend to respond by trying to manage or stabilise it. This usually brings short-term relief, but keeps attention focused on the problem.',
        points: [
          'You may feel more alert or "on guard" even after anxiety settles.',
          'It can feel like you\'re always one step away from needing to intervene again.'
        ]
      },
      'Reassurance': {
        description: 'Reassurance reduces anxiety briefly, but over time increases dependence on external confirmation. This explains why reassurance often needs repeating.',
        points: [
          'You may notice relief fading faster than it used to.',
          'Anxiety can feel quieter when someone else confirms things — but louder when you\'re alone.'
        ]
      },
      'Avoidance': {
        description: 'Avoiding discomfort reduces anxiety in the moment, but teaches the system to withdraw. Over time, this can reduce tolerance.',
        points: [
          'You may feel immediate relief after stepping away from a situation.',
          'Later, similar situations may start to feel harder than before.'
        ]
      },
      'Neutral': {
        description: 'Your coping responses reduce anxiety without strongly reinforcing it. This suggests your system is managing stress without locking into a repeating loop.',
        points: [
          'You may recognise anxiety without feeling overtaken by it.',
          'Anxiety tends to pass without leaving a strong after-effect.'
        ]
      }
    };
    return content[reinforcement] || content['Neutral'];
  };

  // Get load capacity content
  const getLoadContent = function(loadCapacity) {
    const content = {
      'Overloaded': {
        description: 'Your current mental and physical demands exceed your recovery capacity. This reduces buffer, making anxiety more likely during routine stress.',
        points: [
          'You may feel that even small demands take more effort than before.',
          'Anxiety may show up more often when rest has been inconsistent.'
        ]
      },
      'Strained': {
        description: 'You are functioning, but with limited margin. Anxiety increases when stress accumulates or recovery is delayed.',
        points: [
          'You may feel "mostly okay" until several things pile up at once.',
          'There may be less room for error or unexpected demands.'
        ]
      },
      'Balanced': {
        description: 'Your load and recovery are reasonably matched. Anxiety is more likely linked to specific situations than exhaustion.',
        points: [
          'You may notice anxiety comes and goes without lingering.',
          'Recovery generally restores your baseline.'
        ]
      }
    };
    return content[loadCapacity] || content['Balanced'];
  };

  // Get stability content
  const getStabilityContent = function(stability) {
    const content = {
      'Stable': {
        description: 'Anxiety appears, but settles when conditions improve. Your system returns to baseline without much carry-over.',
        points: [
          'Anxiety feels contained rather than spreading.',
          'Stressful periods don\'t permanently shift how you feel.'
        ]
      },
      'Fluctuating': {
        description: 'Anxiety varies with stress and recovery balance. It\'s not fixed, but it can feel unpredictable.',
        points: [
          'Some weeks feel manageable, others feel unexpectedly harder.',
          'Changes in routine or rest may strongly influence how you feel.'
        ]
      },
      'Escalation-Prone': {
        description: 'Anxiety intensifies when recovery remains insufficient over time. This reflects narrowing capacity, not worsening anxiety itself.',
        points: [
          'You may notice anxiety lingering longer than it used to.',
          'Stress seems to accumulate rather than reset fully.'
        ]
      }
    };
    return content[stability] || content['Stable'];
  };

  const trigger = getTriggerContent(data.triggerType);
  const reinforcement = getReinforcementContent(data.reinforcement);
  const load = getLoadContent(data.loadCapacityBand);
  const stability = getStabilityContent(data.stability);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 30px;
      max-width: 900px;
      margin: 0 auto;
      font-size: 11pt;
    }
    .header {
      background: #096b17;
      color: white;
      padding: 25px;
      text-align: center;
      margin-bottom: 25px;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24pt;
      font-weight: bold;
    }
    .header p {
      margin: 0;
      font-size: 12pt;
      opacity: 0.95;
    }
    .greeting {
      font-size: 14pt;
      margin-bottom: 15px;
      color: #096b17;
      font-weight: bold;
    }
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-header {
      background: #f8f9fa;
      padding: 12px 15px;
      margin-bottom: 12px;
      border-left: 4px solid #096b17;
    }
    .section-header h2 {
      margin: 0;
      color: #096b17;
      font-size: 14pt;
      font-weight: bold;
    }
    .loop-box {
      background: #096b17;
      color: white;
      padding: 18px;
      margin: 12px 0;
    }
    .loop-box h3 {
      margin: 0 0 10px 0;
      font-size: 13pt;
      font-weight: bold;
    }
    .loop-box p {
      margin: 8px 0;
      font-size: 10.5pt;
      line-height: 1.5;
    }
    .loop-box ul {
      margin: 8px 0 0 18px;
      padding: 0;
    }
    .loop-box li {
      margin: 5px 0;
      font-size: 10pt;
    }
    .content-box {
      background: white;
      padding: 15px;
      margin: 12px 0;
      border: 1px solid #e0e0e0;
    }
    .content-box h3 {
      margin: 0 0 10px 0;
      color: #096b17;
      font-size: 12pt;
      font-weight: bold;
    }
    .content-box p {
      margin: 8px 0;
      font-size: 10.5pt;
      line-height: 1.5;
    }
    .content-box ul {
      margin: 8px 0 0 18px;
      padding: 0;
    }
    .content-box li {
      margin: 5px 0;
      font-size: 10pt;
    }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    .score-item {
      background: white;
      padding: 10px;
      border: 1px solid #e0e0e0;
      font-size: 10pt;
    }
    .score-label {
      font-weight: bold;
      color: #096b17;
    }
    .cta-box {
      background: #096b17;
      color: white;
      padding: 18px;
      text-align: center;
      margin: 20px 0;
    }
    .cta-box h3 {
      margin: 0 0 10px 0;
      font-size: 13pt;
    }
    .cta-box p {
      margin: 6px 0;
      font-size: 10.5pt;
    }
    .footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 18px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your CALA 1.0 Report</h1>
    <p>Personalized Clinical Assessment for ${data.name}</p>
  </div>

  <p class="greeting">Thank you for completing the CALA 1.0 Assessment</p>

  <!-- SECTION 1: ANXIETY LOOP MAP -->
  <div class="section">
    <div class="section-header">
      <h2>Section 1: YOUR ANXIETY LOOP MAP</h2>
    </div>

    <div class="loop-box">
      <h3>${data.secondaryLoop ? 'Dual Loop' : 'Single Loop'}</h3>

      ${!data.secondaryLoop ? `
      <p><strong>Your anxiety follows a ${data.primaryLoop} pattern.</strong></p>
      <p>${getLoopDescription(data.primaryLoop)}</p>
      <p>This means anxiety tends to repeat through a familiar pathway rather than appearing randomly.</p>
      <p>Over time, it's the repetition of this pattern, not intensity, that keeps anxiety present.</p>
      <ul>
        <li>You may notice that anxiety feels predictable in hindsight, even if it feels sudden in the moment.</li>
        <li>This pattern often gives the impression that anxiety has a "mind of its own," when it is actually following the same route each time.</li>
      </ul>
      ` : `
      <p><strong>Your anxiety follows a ${data.primaryLoop} pattern, with a ${data.secondaryLoop} influence.</strong></p>
      <p>${getLoopDescription(data.primaryLoop)}</p>
      <p>${getLoopDescription(data.secondaryLoop)}</p>
      <p>The primary loop explains how anxiety usually begins for you.</p>
      <p>The secondary loop explains why it tends to continue or return.</p>
      <ul>
        <li>This can feel like anxiety starts for one reason, but stays for another.</li>
        <li>You may recognise that even when the original trigger settles, anxiety doesn't fully switch off.</li>
      </ul>
      `}
    </div>
  </div>

  <!-- SECTION 2: TRIGGER ARCHITECTURE -->
  <div class="section">
    <div class="section-header">
      <h2>Section 2: TRIGGER ARCHITECTURE</h2>
    </div>

    <div class="content-box">
      <h3>${data.triggerType} Trigger Pattern</h3>
      <p>${trigger.description}</p>
      <ul>
        ${trigger.points.map(point => '<li>' + point + '</li>').join('')}
      </ul>
    </div>
  </div>

  <!-- SECTION 3: WHAT KEEPS THE LOOP GOING -->
  <div class="section">
    <div class="section-header">
      <h2>Section 3: WHAT KEEPS THE LOOP GOING</h2>
    </div>

    <div class="content-box">
      <h3>${data.reinforcement} Pattern</h3>
      <p>${reinforcement.description}</p>
      <ul>
        ${reinforcement.points.map(point => '<li>' + point + '</li>').join('')}
      </ul>
    </div>
  </div>

  <!-- SECTION 4: LOAD VS RECOVERY CAPACITY -->
  <div class="section">
    <div class="section-header">
      <h2>Section 4: LOAD VS RECOVERY CAPACITY</h2>
    </div>

    <div class="content-box">
      <h3>${data.loadCapacityBand}</h3>
      <p>${load.description}</p>
      <ul>
        ${load.points.map(point => '<li>' + point + '</li>').join('')}
      </ul>
    </div>
  </div>

  <!-- SECTION 5: STABILITY & ESCALATION RISK -->
  <div class="section">
    <div class="section-header">
      <h2>Section 5: STABILITY & ESCALATION RISK</h2>
    </div>

    <div class="content-box">
      <h3>${data.stability}</h3>
      <p>${stability.description}</p>
      <ul>
        ${stability.points.map(point => '<li>' + point + '</li>').join('')}
      </ul>
    </div>
  </div>

  <!-- LOOP INTENSITY SCORES -->
  <div class="section">
    <div class="section-header">
      <h2>Your Loop Intensity Scores</h2>
    </div>

    <div class="score-grid">
      <div class="score-item">
        <span class="score-label">Anticipatory:</span> ${data.loopScores.anticipatory}
      </div>
      <div class="score-item">
        <span class="score-label">Control:</span> ${data.loopScores.control}
      </div>
      <div class="score-item">
        <span class="score-label">Reassurance:</span> ${data.loopScores.reassurance}
      </div>
      <div class="score-item">
        <span class="score-label">Avoidance:</span> ${data.loopScores.avoidance}
      </div>
      <div class="score-item">
        <span class="score-label">Somatic:</span> ${data.loopScores.somatic}
      </div>
      <div class="score-item">
        <span class="score-label">Cognitive Overload:</span> ${data.loopScores.cognitiveOverload}
      </div>
    </div>
  </div>

  <!-- CTA BOX -->
  <div class="cta-box">
    <h3>Ready to Take the Next Step?</h3>
    <p>Book a consultation with our clinical team to discuss your CALA results</p>
    <p><strong>Visit:</strong> ${CONFIG.COMPANY_WEBSITE}/contact</p>
    <p><strong>WhatsApp:</strong> ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>

  <div class="footer">
    <strong>CuraGo - Your Partner in Emotional Wellness</strong>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.SUPPORT_EMAIL}</p>
    <p style="margin-top: 8px;">
      Report generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
</body>
</html>
  `;

  return Utilities.newBlob(html, 'text/html', 'temp.html').getAs('application/pdf');
}

// ============================================================
// SEND CALA EMAIL WITH PDF
// ============================================================
function sendCalaPdfEmail(data, pdfFile) {
  const plainBody = `
Hi ${data.name}!

Thank you for completing the CALA 1.0 assessment.

Your detailed results are attached as a PDF document.

QUICK SUMMARY:
Primary Loop: ${data.primaryLoop}
${data.secondaryLoop ? 'Secondary Loop: ' + data.secondaryLoop : ''}
Trigger Pattern: ${data.triggerType}
Reinforcement: ${data.reinforcement}
Load vs Recovery: ${data.loadCapacityBand}
Stability: ${data.stability}

Next Steps:
- Book a consultation: ${CONFIG.COMPANY_WEBSITE}/contact
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
    <h1>Your CALA 1.0 Results</h1>
  </div>
  <div class="content">
    <h2>Hi ${data.name}!</h2>
    <p>Thank you for completing the CALA 1.0 assessment.</p>
    <p><strong>Your detailed results are attached as a PDF document.</strong></p>
    <p>Primary Loop: <strong>${data.primaryLoop}</strong></p>
    <p style="text-align: center;">
      <a href="${CONFIG.COMPANY_WEBSITE}/contact" class="cta-button">Book Consultation</a>
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
    CONFIG.EMAIL_SUBJECT_CALA,
    plainBody,
    {
      htmlBody: htmlBody,
      name: CONFIG.FROM_NAME,
      attachments: [pdfFile.getBlob()]
    }
  );

  Logger.log('CALA email with PDF sent to: ' + data.email);
}

// ============================================================
// GBSI SUBMISSION HANDLER
// ============================================================
function handleGbsiSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.GBSI_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.GBSI_SHEET_NAME + '" not found. Please create it.');
  }

  // Generate PDF and save to Drive
  const pdfFile = savePdfToDrive(generateGbsiPdf(data), 'GBSI_Results_' + data.name.replace(/\s+/g, '_'));
  const pdfUrl = pdfFile.getUrl();

  // Save to Google Sheet with PDF link
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

  sheet.appendRow(rowData);
  Logger.log('Data saved to sheet with PDF link');

  // Send email with PDF
  if (data.email && data.email.trim() !== '') {
    sendGbsiPdfEmail(data, pdfFile);
    Logger.log('Email sent to: ' + data.email);
  } else {
    Logger.log('No email provided, skipping email send');
  }

  return { success: true, message: 'GBSI results saved and email sent', pdfUrl: pdfUrl };
}

// ============================================================
// GBSI PDF GENERATOR - COMPREHENSIVE VERSION WITH ALL DETAILS
// ============================================================
function generateGbsiPdf(data) {
  // Helper function to get alarming signs as readable text
  const getAlarmingSignsText = function(signs) {
    const mapping = {
      'weightLoss': 'Unintended weight loss (>5kg in 6 months)',
      'bloodInStool': 'Blood in stool or black/tarry stool',
      'difficultySwallowing': 'Difficulty swallowing or feeling food "stuck"',
      'persistentVomiting': 'Persistent vomiting',
      'nightSymptoms': 'Symptoms that wake you up from deep sleep'
    };

    return signs
      .filter(function(sign) { return sign !== 'none'; })
      .map(function(sign) { return mapping[sign] || sign; })
      .join(', ');
  };

  // Get comprehensive result content based on result type
  const getResultContent = function() {
    switch(data.resultType) {
      case 'clinicalPriority':
        var alarmingSigns = getAlarmingSignsText(data.alarmingSigns);
        var reasons = [];
        if (alarmingSigns) reasons.push(alarmingSigns);
        if (data.age === 'over50') reasons.push('your age');
        if (data.familyHistory.includes('colorectalCancer')) reasons.push('your family history of colorectal cancer');

        return {
          title: 'Urgent Surgical Evaluation Recommended',
          color: '#dc2626',
          mainText: 'Based on your reports of <strong>' + reasons.join(', ') + '</strong>, we cannot categorize this as simple IBS.',
          detailText: 'As a Surgical Gastroenterologist, I recommend a physical examination and likely an Endoscopy/Colonoscopy to rule out structural issues immediately.',
          warning: 'This assessment does not replace professional medical advice. Please seek immediate medical attention.',
          recommendations: [
            'Book an urgent consultation with a gastroenterologist',
            'Get a physical examination as soon as possible',
            'Discuss Endoscopy/Colonoscopy with your doctor',
            'Bring this report to your consultation'
          ]
        };

      case 'brainGutOverdrive':
        var symptoms = [];
        if (data.brainFog === 'yesFrequently') symptoms.push('"Brain Fog"');
        if (data.stressLevel > 7) symptoms.push('high stress levels');

        return {
          title: 'Your Axis is Hypersensitive',
          subtitle: data.ibsType && data.ibsType !== 'none' ? 'IBS Type: ' + data.ibsType : '',
          color: '#7c3aed',
          mainText: 'You meet the Rome IV criteria for IBS. ' + (symptoms.length > 0 ? 'Your ' + symptoms.join(' and ') + ' suggest ' : '') + 'your Vagus nerve is in a state of hyper-vigilance.',
          detailText: 'Your reports are likely "Normal" because the issue is <strong>communication, not anatomy</strong>.',
          brainGutInfo: 'Your Brain-Gut Axis Score: ' + data.axisScore + '/3<br>Brain-Gut Sensitivity: <strong>' + data.brainGutSensitivity.toUpperCase() + '</strong>',
          recommendations: [
            'Start the 12-Month Gut-Brain Recalibration Program',
            'Learn vagus nerve regulation techniques',
            'Personalized dietary modifications based on your triggers',
            'Consider consultation for a comprehensive treatment plan'
          ]
        };

      case 'mechanicalMetabolic':
        var issues = [];
        if (data.refluxFrequency === 'dailyNightly') issues.push('Daily/Nightly Reflux or Acidity');
        if (data.fullnessFactor === 'yes') issues.push('Early Satiety (Uncomfortable Fullness)');
        if (data.fattyLiver === 'yes') issues.push('Fatty Liver Disease');

        var detailParts = [];
        if (data.fattyLiver === 'yes') detailParts.push('Your liver is struggling to process the metabolic load, which is why you may feel sluggish.');
        if (data.refluxFrequency === 'dailyNightly') detailParts.push('Your frequent reflux needs to be addressed to prevent complications.');
        if (data.fullnessFactor === 'yes') detailParts.push('The early fullness suggests your digestive motility may be affected.');

        return {
          title: 'Upper GI Dysfunction & Metabolic Load',
          color: '#ea580c',
          mainText: 'Your symptoms point toward <strong>Functional Dyspepsia or GERD</strong>' + (data.fattyLiver === 'yes' ? ', complicated by Fatty Liver' : '') + '.',
          detailText: detailParts.join(' '),
          issuesList: issues,
          recommendations: [
            'Custom Diet & Lifestyle Protocol for upper GI health',
            'Metabolic load management strategies',
            data.fattyLiver === 'yes' ? 'Liver health optimization program' : 'Digestive health monitoring',
            'Book consultation for personalized treatment plan'
          ]
        };

      case 'allClear':
        var habits = [];
        if (data.dietaryHabits.lateNightDinners) habits.push('Late night dinners');
        if (data.dietaryHabits.highCaffeine) habits.push('High caffeine intake');
        if (data.dietaryHabits.frequentJunk) habits.push('Frequent junk/processed food');
        if (data.dietaryHabits.skipBreakfast) habits.push('Skipping breakfast');

        return {
          title: "You're Doing Great!",
          subtitle: 'But Watch the Habits',
          color: '#16a34a',
          mainText: 'You don\'t meet the criteria for IBS or serious pathology. Your symptoms are likely <strong>"Lifestyle Gastritis"</strong>.',
          habits: habits,
          recommendations: [
            'Reduce late-night meals (eat at least 3 hours before bed)',
            'Limit caffeine intake, especially on an empty stomach',
            'Minimize processed and junk food consumption',
            'Maintain regular meal times and don\'t skip breakfast',
            'Stay hydrated and manage stress levels'
          ]
        };

      default:
        return {
          title: 'Assessment Complete',
          color: '#096b17',
          mainText: 'Your GBSI assessment has been completed.',
          detailText: ''
        };
    }
  };

  const resultContent = getResultContent();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 30px;
      max-width: 900px;
      margin: 0 auto;
      font-size: 11pt;
    }
    .header {
      background: #096b17;
      color: white;
      padding: 25px;
      text-align: center;
      margin-bottom: 25px;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24pt;
      font-weight: bold;
    }
    .header p {
      margin: 0;
      font-size: 12pt;
      opacity: 0.95;
    }
    .greeting {
      font-size: 14pt;
      margin-bottom: 15px;
      color: #096b17;
      font-weight: bold;
    }
    .result-box {
      background: ${resultContent.color};
      color: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .result-title {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: ${resultContent.subtitle ? '8px' : '12px'};
    }
    .result-subtitle {
      font-size: 14pt;
      margin-bottom: 12px;
      opacity: 0.95;
    }
    .result-text {
      font-size: 11pt;
      line-height: 1.6;
      margin: 10px 0;
    }
    .section {
      background: #ffffff;
      padding: 18px;
      margin-bottom: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      page-break-inside: avoid;
    }
    .section h2 {
      margin: 0 0 12px 0;
      color: #096b17;
      font-size: 14pt;
      font-weight: bold;
    }
    .section h3 {
      margin: 12px 0 8px 0;
      color: #096b17;
      font-size: 12pt;
      font-weight: bold;
    }
    .info-box {
      background: #f0f7f1;
      padding: 15px;
      margin: 12px 0;
      border-left: 4px solid #096b17;
      border-radius: 4px;
    }
    .info-box h4 {
      margin: 0 0 8px 0;
      color: #096b17;
      font-size: 11pt;
      font-weight: bold;
    }
    .info-box ul {
      margin: 8px 0 0 18px;
      padding: 0;
    }
    .info-box li {
      margin: 4px 0;
      font-size: 10.5pt;
    }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .score-item {
      background: #f8f9fa;
      padding: 12px;
      border-left: 3px solid #096b17;
      border-radius: 4px;
    }
    .score-label {
      font-weight: bold;
      color: #096b17;
      font-size: 10pt;
    }
    .score-value {
      font-size: 11pt;
      margin-top: 5px;
      color: #333;
    }
    .recommendations {
      background: #f8f9fa;
      padding: 18px;
      margin: 15px 0;
      border-radius: 6px;
    }
    .recommendations h3 {
      margin: 0 0 12px 0;
      color: #096b17;
      font-size: 13pt;
      font-weight: bold;
    }
    .recommendations ul {
      margin: 0;
      padding-left: 20px;
    }
    .recommendations li {
      margin: 8px 0;
      font-size: 10.5pt;
      line-height: 1.5;
    }
    .warning-box {
      background: #fef2f2;
      border: 2px solid #fca5a5;
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
      color: #991b1b;
      font-weight: 500;
      page-break-inside: avoid;
    }
    .cta-box {
      background: #096b17;
      color: white;
      padding: 18px;
      text-align: center;
      margin: 20px 0;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .cta-box h3 {
      margin: 0 0 10px 0;
      font-size: 13pt;
    }
    .cta-box p {
      margin: 6px 0;
      font-size: 10.5pt;
    }
    .footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 18px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your GBSI Assessment Results</h1>
    <p>Gut-Brain Sensitivity Index - Comprehensive Report</p>
  </div>

  <p class="greeting">Hi ${data.name}!</p>
  <p style="margin-bottom: 20px;">Thank you for completing the GBSI assessment. Here is your comprehensive personalized report:</p>

  <!-- Main Result Box -->
  <div class="result-box">
    <div class="result-title">${resultContent.title}</div>
    ${resultContent.subtitle ? '<div class="result-subtitle">' + resultContent.subtitle + '</div>' : ''}
    <div class="result-text">${resultContent.mainText}</div>
    ${resultContent.detailText ? '<div class="result-text" style="margin-top: 12px;">' + resultContent.detailText + '</div>' : ''}
    ${resultContent.brainGutInfo ? '<div class="result-text" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.3);">' + resultContent.brainGutInfo + '</div>' : ''}
  </div>

  <!-- Warning Box (if applicable) -->
  ${resultContent.warning ? `
  <div class="warning-box">
    <strong>⚠️ IMPORTANT:</strong> ${resultContent.warning}
  </div>
  ` : ''}

  <!-- Key Issues Identified (for Mechanical/Metabolic) -->
  ${resultContent.issuesList && resultContent.issuesList.length > 0 ? `
  <div class="info-box">
    <h4>Key Issues Identified:</h4>
    <ul>
      ${resultContent.issuesList.map(function(issue) { return '<li>' + issue + '</li>'; }).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- Dietary Habits (for All Clear) -->
  ${resultContent.habits && resultContent.habits.length > 0 ? `
  <div class="info-box">
    <h4>Habits to Watch Out For:</h4>
    <ul>
      ${resultContent.habits.map(function(habit) { return '<li>' + habit + '</li>'; }).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- Brain-Gut Axis Assessment -->
  <div class="section">
    <h2>Brain-Gut Axis Assessment</h2>
    <div class="score-grid">
      <div class="score-item">
        <div class="score-label">Axis Score</div>
        <div class="score-value">${data.axisScore}/3</div>
      </div>
      <div class="score-item">
        <div class="score-label">Brain-Gut Sensitivity</div>
        <div class="score-value">${data.brainGutSensitivity.toUpperCase()}</div>
      </div>
      ${data.ibsType && data.ibsType !== 'none' ? `
      <div class="score-item">
        <div class="score-label">IBS Classification</div>
        <div class="score-value">${data.ibsType}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Detailed Assessment Data -->
  <div class="section">
    <h2>Your Assessment Details</h2>
    <div class="score-grid">
      <div class="score-item">
        <div class="score-label">Age Range</div>
        <div class="score-value">${data.age}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Pain Frequency</div>
        <div class="score-value">${data.painFrequency}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Pain Relief Factor</div>
        <div class="score-value">${data.reliefFactor === 'yes' ? 'Related to Stool' : 'No Relation'}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Stool Type (Bristol)</div>
        <div class="score-value">${data.bristolType.replace('type', 'Type ')}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Reflux/Acidity</div>
        <div class="score-value">${data.refluxFrequency}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Early Fullness</div>
        <div class="score-value">${data.fullnessFactor === 'yes' ? 'Yes' : 'No'}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Fatty Liver</div>
        <div class="score-value">${data.fattyLiver === 'yes' ? 'Yes' : data.fattyLiver === 'no' ? 'No' : "Don't Know"}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Stress Level</div>
        <div class="score-value">${data.stressLevel}/10</div>
      </div>
      <div class="score-item">
        <div class="score-label">Brain Fog</div>
        <div class="score-value">${data.brainFog === 'yesFrequently' ? 'Yes, Frequently' : 'No'}</div>
      </div>
    </div>

    <!-- Family History -->
    <h3 style="margin-top: 15px;">Family History</h3>
    <p style="font-size: 10.5pt; margin: 5px 0;">${data.familyHistory.filter(function(h) { return h !== 'none'; }).length > 0 ? data.familyHistory.filter(function(h) { return h !== 'none'; }).map(function(h) { return h === 'colorectalCancer' ? 'Colorectal Cancer' : h === 'ibd' ? 'IBD (Ulcerative Colitis/Crohn\'s)' : h === 'celiac' ? 'Celiac Disease' : h; }).join(', ') : 'None reported'}</p>

    <!-- Dietary Habits -->
    <h3 style="margin-top: 15px;">Dietary Habits</h3>
    <p style="font-size: 10.5pt; margin: 5px 0;">
      ${data.dietaryHabits.lateNightDinners ? 'Late Night Dinners, ' : ''}${data.dietaryHabits.highCaffeine ? 'High Caffeine, ' : ''}${data.dietaryHabits.frequentJunk ? 'Frequent Junk Food, ' : ''}${data.dietaryHabits.skipBreakfast ? 'Skip Breakfast' : ''}${(!data.dietaryHabits.lateNightDinners && !data.dietaryHabits.highCaffeine && !data.dietaryHabits.frequentJunk && !data.dietaryHabits.skipBreakfast) ? 'No concerning habits reported' : ''}
    </p>
  </div>

  <!-- Recommendations -->
  ${resultContent.recommendations && resultContent.recommendations.length > 0 ? `
  <div class="recommendations">
    <h3>Recommended Next Steps</h3>
    <ul>
      ${resultContent.recommendations.map(function(rec) { return '<li>' + rec + '</li>'; }).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- CTA Box -->
  <div class="cta-box">
    <h3>Ready to Take Your Next Step?</h3>
    <p>Book a consultation with our gastroenterology experts</p>
    <p><strong>Visit:</strong> ${CONFIG.COMPANY_WEBSITE}/contact</p>
    <p><strong>WhatsApp:</strong> ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>

  <div class="footer">
    <strong>CuraGo - Your Partner in Gut Health</strong>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.SUPPORT_EMAIL}</p>
    <p style="margin-top: 8px;">
      Report generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
    <p style="margin-top: 8px; font-size: 8pt; font-style: italic;">
      This assessment provides educational insights and does not replace professional medical advice.
    </p>
  </div>
</body>
</html>
  `;

  return Utilities.newBlob(html, 'text/html', 'temp.html').getAs('application/pdf');
}

// ============================================================
// SEND GBSI EMAIL WITH PDF
// ============================================================
function sendGbsiPdfEmail(data, pdfFile) {
  // Get result type text
  const getResultText = function() {
    switch(data.resultType) {
      case 'clinicalPriority':
        return 'Urgent Surgical Evaluation Recommended';
      case 'brainGutOverdrive':
        return 'Your Axis is Hypersensitive';
      case 'mechanicalMetabolic':
        return 'Upper GI Dysfunction & Metabolic Load';
      case 'allClear':
        return "You're Doing Great!";
      default:
        return 'Assessment Complete';
    }
  };

  const plainBody = `
Hi ${data.name}!

Thank you for completing the GBSI (Gut-Brain Sensitivity Index) Assessment.

Your comprehensive results report is attached as a PDF document.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Result: ${getResultText()}
${data.ibsType && data.ibsType !== 'none' ? 'IBS Classification: ' + data.ibsType : ''}
Brain-Gut Sensitivity: ${data.brainGutSensitivity.toUpperCase()}
Axis Score: ${data.axisScore}/3

Assessment Details:
• Pain Frequency: ${data.painFrequency}
• Stool Type: ${data.bristolType}
• Stress Level: ${data.stressLevel}/10
• Brain Fog: ${data.brainFog === 'yesFrequently' ? 'Yes, Frequently' : 'No'}
${data.refluxFrequency === 'dailyNightly' ? '• Reflux: Daily/Nightly' : ''}
${data.fattyLiver === 'yes' ? '• Fatty Liver: Yes' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please review the attached PDF for your complete personalized report including detailed explanations and recommended next steps.

NEXT STEPS:
→ Book a consultation: ${CONFIG.COMPANY_WEBSITE}/contact
→ WhatsApp us: ${CONFIG.WHATSAPP_NUMBER}
→ Visit our website: ${CONFIG.COMPANY_WEBSITE}

Best regards,
CuraGo Team
Your Partner in Gut Health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.hasRedFlags ? '⚠️ IMPORTANT: Your results indicate red flags that require professional medical evaluation. Please seek immediate medical attention.' : ''}
  `;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .header { background: #096b17; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background-color: white; max-width: 600px; margin: 0 auto; }
    .summary-box { background: #f8f9fa; border-left: 4px solid #096b17; padding: 20px; margin: 20px 0; }
    .summary-box h3 { margin-top: 0; color: #096b17; }
    .summary-item { margin: 8px 0; }
    .summary-item strong { color: #096b17; }
    ${data.hasRedFlags ? '.warning-box { background: #fef2f2; border: 2px solid #fca5a5; padding: 15px; margin: 15px 0; color: #991b1b; border-radius: 5px; }' : ''}
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }
    .cta-button { background: #096b17; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 5px; }
    .cta-button:hover { background: #075110; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your GBSI Assessment Results</h1>
    <p>Gut-Brain Sensitivity Index</p>
  </div>
  <div class="content">
    <h2>Hi ${data.name}!</h2>
    <p>Thank you for completing the GBSI assessment.</p>
    <p><strong>Your comprehensive results report is attached as a PDF document.</strong></p>

    <div class="summary-box">
      <h3>Quick Summary</h3>
      <div class="summary-item"><strong>Result:</strong> ${getResultText()}</div>
      ${data.ibsType && data.ibsType !== 'none' ? '<div class="summary-item"><strong>IBS Type:</strong> ' + data.ibsType + '</div>' : ''}
      <div class="summary-item"><strong>Brain-Gut Sensitivity:</strong> ${data.brainGutSensitivity.toUpperCase()}</div>
      <div class="summary-item"><strong>Axis Score:</strong> ${data.axisScore}/3</div>
      <div class="summary-item"><strong>Stress Level:</strong> ${data.stressLevel}/10</div>
    </div>

    ${data.hasRedFlags ? `
    <div class="warning-box">
      <strong>⚠️ IMPORTANT:</strong> Your results indicate red flags that require professional medical evaluation. Please seek immediate medical attention.
    </div>
    ` : ''}

    <p style="text-align: center; margin-top: 30px;">
      <a href="${CONFIG.COMPANY_WEBSITE}/contact" class="cta-button">Book Consultation</a>
      <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}" class="cta-button">WhatsApp Us</a>
    </p>
  </div>
  <div class="footer">
    <p><strong>CuraGo - Your Partner in Gut Health</strong></p>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.WHATSAPP_NUMBER}</p>
    <p style="margin-top: 10px; font-size: 12px; color: #999;">
      This assessment provides educational insights and does not replace professional medical advice.
    </p>
  </div>
</body>
</html>
  `;

  GmailApp.sendEmail(
    data.email,
    CONFIG.EMAIL_SUBJECT_GBSI,
    plainBody,
    {
      htmlBody: htmlBody,
      name: CONFIG.FROM_NAME,
      attachments: [pdfFile.getBlob()]
    }
  );

  Logger.log('GBSI email with PDF sent to: ' + data.email);
}

// ============================================================
// PRIORITY CIRCLE 365 SUBMISSION HANDLER
// ============================================================
function handlePriorityCircleSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.PRIORITY_CIRCLE_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.PRIORITY_CIRCLE_SHEET_NAME + '" not found. Please create it.');
  }

  // Prepare row data to match the columns:
  // Timestamp, Name, WhatsApp Number, Email, Age, City, Area of Residence,
  // Has Gut-Brain Problem, Problem Description, Preferred Option, Status, Notes
  const timestamp = new Date();
  const rowData = [
    timestamp,
    data.name || '',
    data.phoneNumber || '',
    data.email || '',
    data.age || '',
    data.city || '',
    data.area || '',
    data.hasGutBrainProblem || '',
    data.problemDescription || '',
    data.preferredOption || '',
    'Pending Review', // Status
    '' // Notes (empty for now)
  ];

  sheet.appendRow(rowData);
  Logger.log('Priority Circle 365 application saved to sheet');

  return {
    success: true,
    message: 'Priority Circle 365 application submitted successfully',
    timestamp: timestamp.toISOString()
  };
}

// ============================================================
// CONSULTATION BOOKING SUBMISSION HANDLER
// ============================================================
function handleConsultationBookingSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.CONSULTATION_BOOKING_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.CONSULTATION_BOOKING_SHEET_NAME + '" not found. Please create it.');
  }

  // Prepare row data to match the columns:
  // Timestamp, Name, WhatsApp Number, Email, Consultation Type, Preferred Date, Preferred Time, Status, Notes
  const timestamp = new Date();
  const rowData = [
    timestamp,
    data.name || '',
    data.phoneNumber || '',
    data.email || '',
    data.consultationType || '',
    data.preferredDate || '',
    data.preferredTime || '',
    'Pending Confirmation', // Status
    '' // Notes (empty for now)
  ];

  sheet.appendRow(rowData);
  Logger.log('Consultation booking saved to sheet');

  return {
    success: true,
    message: 'Consultation booking submitted successfully',
    timestamp: timestamp.toISOString()
  };
}
