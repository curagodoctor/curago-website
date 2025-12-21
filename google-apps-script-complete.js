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
  CALM_SHEET_NAME: 'CALM Results',
  EMAIL_SUBJECT_AURA: 'Your AURA Index Results from CuraGo',
  EMAIL_SUBJECT_ATM: 'Your ATM Assessment Results from CuraGo',
  EMAIL_SUBJECT_CALM: 'Your CALM 1.0 Assessment Results from CuraGo',
  FROM_NAME: 'CuraGo Team',
  COMPANY_WEBSITE: 'https://curago.in',
  SUPPORT_EMAIL: 'curagodoctor@gmail.com',
  WHATSAPP_NUMBER: '+917021227203',

  // IMPORTANT: Add your Google Drive folder ID here
  // Instructions to get folder ID:
  // 1. Go to Google Drive
  // 2. Create/open a folder for PDFs
  // 3. Copy the ID from the URL: https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
  DRIVE_FOLDER_ID: '1ztLlzdZgZyJZR1BfICOHBPzbeNRDwTTx',
};

// ============================================================
// CALM SHEET HEADERS (Copy these to row 1 of your CALM Results sheet)
// ============================================================
// Date | Name | Email | Phone Number | Primary Loop | Secondary Loop | Trigger Type |
// Reinforcement | Load Capacity Band | Stability | Anticipatory Score | Control Score |
// Reassurance Score | Avoidance Score | Somatic Score | Cognitive Overload Score | Event ID | PDF URL

// ============================================================
// CORS HANDLER
// ============================================================
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'Google Apps Script is deployed and working',
      timestamp: new Date().toISOString(),
      deployment: 'CORS enabled'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions() {
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
    } else if (data.testType === 'calm_tool') {
      response = handleCalmSubmission(data);
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
// CALM SUBMISSION HANDLER
// ============================================================
function handleCalmSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.CALM_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.CALM_SHEET_NAME + '" not found. Please create it.');
  }

  // Generate PDF and save to Drive
  const pdfFile = savePdfToDrive(generateCalmPdf(data), 'CALM_Results_' + data.name.replace(/\s+/g, '_'));
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
    pdfUrl
  ];

  sheet.appendRow(rowData);
  Logger.log('Data saved to sheet with PDF link');

  // Send email with PDF
  if (data.email && data.email.trim() !== '') {
    sendCalmPdfEmail(data, pdfFile);
    Logger.log('Email sent to: ' + data.email);
  } else {
    Logger.log('No email provided, skipping email send');
  }

  return { success: true, message: 'CALM results saved and email sent', pdfUrl: pdfUrl };
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
// CALM PDF GENERATOR - COMPLETE WITH ALL SECTIONS
// ============================================================
function generateCalmPdf(data) {
  // Get loop descriptions
  const loopDescriptions = {
    'Anticipatory Loop': 'Your anxiety is driven by future-oriented thinking. You tend to mentally rehearse possible outcomes in advance, which creates a sense of preparedness but also keeps anxiety active.',
    'Control-Seeking Loop': 'Your anxiety is shaped by a need to stabilise or control uncertainty. Attempts to manage or neutralise discomfort provide short-term relief but keep attention fixed on the problem.',
    'Reassurance Loop': 'Your anxiety is reinforced through reassurance-seeking. External validation eases anxiety briefly, but over time increases dependence and sensitivity to doubt.',
    'Avoidance Loop': 'Your anxiety persists through avoidance patterns. Avoiding discomfort reduces anxiety momentarily, but teaches the system that anxiety requires withdrawal.',
    'Somatic Sensitivity Loop': 'Your anxiety is strongly influenced by bodily sensations. Physical signals become interpreted as threats, which amplifies awareness and fear.',
    'Cognitive Overload Loop': 'Your anxiety emerges from sustained mental load. Prolonged thinking without recovery reduces cognitive buffer, allowing anxiety to surface during routine stress.'
  };

  // Get trigger architecture content
  const triggerContent = {
    'Internal': {
      title: 'Internal Trigger Pattern',
      description: 'Your anxiety is mostly triggered internally — through thoughts, mental scenarios, or subtle body signals. This explains why anxiety can appear even on days that look calm from the outside.',
      points: [
        'You may have noticed anxiety arriving without a clear external reason.',
        'This can make it harder to explain to others — or even to yourself — why you feel anxious.'
      ]
    },
    'External': {
      title: 'External Trigger Pattern',
      description: 'Your anxiety is mainly triggered by situations or environments, with internal reactions following. This means anxiety usually makes sense in context, even if the reaction feels stronger than expected.',
      points: [
        'You may find that anxiety eases once the situation passes.',
        'Certain environments or demands may consistently stand out as difficult for you.'
      ]
    },
    'Mixed': {
      title: 'Mixed / Neutral Trigger Pattern',
      description: 'Your anxiety shifts between internal and situational triggers. Some days, external stressors play a bigger role. On other days, anxiety seems to arise internally.',
      points: [
        'This can make anxiety feel inconsistent or hard to predict.',
        'You may notice that your experience changes depending on context rather than one fixed cause.'
      ]
    }
  };

  // Get reinforcement content
  const reinforcementContent = {
    'Control': {
      title: 'Control Pattern',
      description: 'When anxiety appears, you tend to respond by trying to manage or stabilise it. This usually brings short-term relief, but keeps attention focused on the problem.',
      points: [
        'You may feel more alert or "on guard" even after anxiety settles.',
        'It can feel like you\'re always one step away from needing to intervene again.'
      ]
    },
    'Reassurance': {
      title: 'Reassurance Pattern',
      description: 'Reassurance reduces anxiety briefly, but over time increases dependence on external confirmation. This explains why reassurance often needs repeating.',
      points: [
        'You may notice relief fading faster than it used to.',
        'Anxiety can feel quieter when someone else confirms things — but louder when you\'re alone.'
      ]
    },
    'Avoidance': {
      title: 'Avoidance Pattern',
      description: 'Avoiding discomfort reduces anxiety in the moment, but teaches the system to withdraw. Over time, this can reduce tolerance.',
      points: [
        'You may feel immediate relief after stepping away from a situation.',
        'Later, similar situations may start to feel harder than before.'
      ]
    },
    'Neutral': {
      title: 'Neutral / Adaptive Pattern',
      description: 'Your coping responses reduce anxiety without strongly reinforcing it. This suggests your system is managing stress without locking into a repeating loop.',
      points: [
        'You may recognise anxiety without feeling overtaken by it.',
        'Anxiety tends to pass without leaving a strong after-effect.'
      ]
    }
  };

  // Get load capacity content
  const loadContent = {
    'Overloaded': {
      title: 'Overloaded',
      description: 'Your current mental and physical demands exceed your recovery capacity. This reduces buffer, making anxiety more likely during routine stress.',
      points: [
        'You may feel that even small demands take more effort than before.',
        'Anxiety may show up more often when rest has been inconsistent.'
      ]
    },
    'Strained': {
      title: 'Strained',
      description: 'You are functioning, but with limited margin. Anxiety increases when stress accumulates or recovery is delayed.',
      points: [
        'You may feel "mostly okay" until several things pile up at once.',
        'There may be less room for error or unexpected demands.'
      ]
    },
    'Balanced': {
      title: 'Balanced',
      description: 'Your load and recovery are reasonably matched. Anxiety is more likely linked to specific situations than exhaustion.',
      points: [
        'You may notice anxiety comes and goes without lingering.',
        'Recovery generally restores your baseline.'
      ]
    }
  };

  // Get stability content
  const stabilityContent = {
    'Stable': {
      title: 'Stable',
      description: 'Anxiety appears, but settles when conditions improve. Your system returns to baseline without much carry-over.',
      points: [
        'Anxiety feels contained rather than spreading.',
        'Stressful periods don\'t permanently shift how you feel.'
      ]
    },
    'Fluctuating': {
      title: 'Fluctuating',
      description: 'Anxiety varies with stress and recovery balance. It\'s not fixed, but it can feel unpredictable.',
      points: [
        'Some weeks feel manageable, others feel unexpectedly harder.',
        'Changes in routine or rest may strongly influence how you feel.'
      ]
    },
    'Escalation-Prone': {
      title: 'Escalation-Prone',
      description: 'Anxiety intensifies when recovery remains insufficient over time. This reflects narrowing capacity, not worsening anxiety itself.',
      points: [
        'You may notice anxiety lingering longer than it used to.',
        'Stress seems to accumulate rather than reset fully.'
      ]
    }
  };

  const trigger = triggerContent[data.triggerType];
  const reinforcement = reinforcementContent[data.reinforcement];
  const load = loadContent[data.loadCapacityBand];
  const stability = stabilityContent[data.stability];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
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
      page-break-after: avoid;
    }
    .logo-img {
      height: 60px;
      margin: 0 0 12px 0;
      display: block;
      margin-left: auto;
      margin-right: auto;
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
    .disclaimer-box {
      background: #fff9e6;
      border: 2px solid #ffd700;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
      font-size: 10pt;
      font-style: italic;
      color: #333;
      page-break-inside: avoid;
    }
    .disclaimer-box strong {
      color: #096b17;
      font-size: 11pt;
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
      page-break-inside: avoid;
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
      page-break-inside: avoid;
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
    .info-box {
      background: #f0f7f1;
      padding: 15px;
      margin: 12px 0;
      border: 1px solid #d0e5d3;
      page-break-inside: avoid;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 10.5pt;
    }
    .cta-box {
      background: #096b17;
      color: white;
      padding: 18px;
      text-align: center;
      margin: 20px 0;
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
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${CONFIG.COMPANY_WEBSITE}/logo.png" alt="CuraGo" class="logo-img" />
    <h1>Your CALM 1.0 Report</h1>
    <p>Personalized Clinical Assessment for ${data.name}</p>
  </div>

  <p class="greeting">Thank you for completing the CALM 1.0 Assessment</p>

  <!-- SECTION 1: ANXIETY LOOP MAP -->
  <div class="section">
    <div class="section-header">
      <h2>Section 1: YOUR ANXIETY LOOP MAP</h2>
    </div>

    <div class="loop-box">
      <h3>${data.secondaryLoop ? 'Dual Loop' : 'Single Loop'}</h3>

      ${!data.secondaryLoop ? `
      <p><strong>Your anxiety follows a ${data.primaryLoop} pattern.</strong></p>
      <p>${loopDescriptions[data.primaryLoop]}</p>
      <p>This means anxiety tends to repeat through a familiar pathway rather than appearing randomly.</p>
      <p>Over time, it's the repetition of this pattern, not intensity, that keeps anxiety present.</p>
      <ul>
        <li>You may notice that anxiety feels predictable in hindsight, even if it feels sudden in the moment.</li>
        <li>This pattern often gives the impression that anxiety has a "mind of its own," when it is actually following the same route each time.</li>
      </ul>
      ` : `
      <p><strong>Your anxiety follows a ${data.primaryLoop} pattern, with a ${data.secondaryLoop} influence.</strong></p>
      <p>${loopDescriptions[data.primaryLoop]}</p>
      <p>${loopDescriptions[data.secondaryLoop]}</p>
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
      <h3>${trigger.title}</h3>
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
      <h3>${reinforcement.title}</h3>
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
      <h3>${load.title}</h3>
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
      <h3>${stability.title}</h3>
      <p>${stability.description}</p>
      <ul>
        ${stability.points.map(point => '<li>' + point + '</li>').join('')}
      </ul>
    </div>
  </div>

  <!-- SECTION 6: CLINICAL PATHWAYS -->
  <div class="section">
    <div class="section-header">
      <h2>Section 6: CLINICAL PATHWAYS</h2>
    </div>

    <div class="info-box">
      <p>Patterns like yours tend to respond best when the underlying loop is addressed rather than symptoms alone.</p>
      <p><em>This section is informational, not prescriptive.</em></p>
      <p style="font-size: 10pt; margin-top: 10px;">• Different approaches work differently depending on the pattern involved.<br>
      • What helps others may not always help you — and that's expected.</p>
    </div>
  </div>

  <!-- SECTION 7: NEXT STEP -->
  <div class="section">
    <div class="section-header">
      <h2>Section 7: NEXT STEP</h2>
    </div>

    <div class="content-box">
      <h3>When Support May Help</h3>
      <p>If you want help applying this map to your specific situation, a clinical consultation can help translate insight into action.</p>
      <p><em>This step is about applying understanding, not about urgency.</em></p>
    </div>

    <div class="content-box">
      <h3>Neutral Path</h3>
      <p>If this report reflects your experience and feels manageable, continuing your current coping strategies may be sufficient.</p>
      <p><em>Understanding your pattern alone can sometimes reduce confusion and self-doubt.</em></p>
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
    <p>Book a consultation with our clinical team to discuss your CALM results</p>
    <p><strong>Visit:</strong> ${CONFIG.COMPANY_WEBSITE}/bookconsultation</p>
    <p><strong>WhatsApp:</strong> ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>

  <!-- DISCLAIMER -->
  <div class="disclaimer-box">
    <p><strong>Disclaimer:</strong> This report offers structured insight into your experience. It is not a diagnosis and does not substitute clinical evaluation.</p>
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
// SEND CALM EMAIL WITH PDF
// ============================================================
function sendCalmPdfEmail(data, pdfFile) {
  const plainBody = `
Hi ${data.name}!

Thank you for completing the CALM 1.0 assessment.

Your detailed results are attached as a PDF document.

QUICK SUMMARY:
Primary Loop: ${data.primaryLoop}
${data.secondaryLoop ? 'Secondary Loop: ' + data.secondaryLoop : ''}
Trigger Type: ${data.triggerType}
Reinforcement: ${data.reinforcement}
Load Status: ${data.loadCapacityBand}
Stability: ${data.stability}

Your complete report includes:
✓ Detailed anxiety loop analysis
✓ Trigger architecture mapping
✓ Reinforcement mechanism explanation
✓ Load vs recovery capacity assessment
✓ Stability and escalation risk analysis
✓ Clinical pathways information
✓ Next step recommendations

Ready to take the next step?
Book a consultation: ${CONFIG.COMPANY_WEBSITE}/bookconsultation
WhatsApp us: ${CONFIG.WHATSAPP_NUMBER}

---
DISCLAIMER: This report offers structured insight into your experience. It is not a diagnosis and does not substitute clinical evaluation.
---

Best regards,
CuraGo Team - Your Partner in Emotional Wellness
${CONFIG.COMPANY_WEBSITE}
  `;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .header { background: #096b17; color: white; padding: 30px; text-align: center; }
    .logo-img { height: 60px; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; }
    .content { padding: 30px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }
    .cta-button { background: #096b17; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    .summary-box { background: #f0f7f1; padding: 20px; margin: 20px 0; border-left: 4px solid #096b17; }
    .disclaimer-box { background: #fff9e6; border: 2px solid #ffd700; padding: 15px; margin: 20px 0; text-align: center; font-size: 13px; font-style: italic; color: #555; }
    .disclaimer-box strong { color: #096b17; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${CONFIG.COMPANY_WEBSITE}/logo.png" alt="CuraGo" class="logo-img" />
    <h1>Your CALM 1.0 Results</h1>
  </div>
  <div class="content">
    <h2>Hi ${data.name}!</h2>
    <p>Thank you for completing the CALM 1.0 assessment.</p>
    <p><strong>Your detailed results are attached as a PDF document.</strong></p>

    <div class="summary-box">
      <h3>Quick Summary</h3>
      <p><strong>Primary Loop:</strong> ${data.primaryLoop}</p>
      ${data.secondaryLoop ? '<p><strong>Secondary Loop:</strong> ' + data.secondaryLoop + '</p>' : ''}
      <p><strong>Trigger Type:</strong> ${data.triggerType}</p>
      <p><strong>Load Status:</strong> ${data.loadCapacityBand}</p>
      <p><strong>Stability:</strong> ${data.stability}</p>
    </div>

    <p>Your complete report includes all 7 sections with detailed analysis and personalized insights.</p>

    <p style="text-align: center;">
      <a href="${CONFIG.COMPANY_WEBSITE}/bookconsultation" class="cta-button">Book Your Consultation</a>
    </p>

    <div class="disclaimer-box">
      <p><strong>Disclaimer:</strong> This report offers structured insight into your experience. It is not a diagnosis and does not substitute clinical evaluation.</p>
    </div>
  </div>
  <div class="footer">
    <p><strong>CuraGo - Your Partner in Emotional Wellness</strong></p>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.WHATSAPP_NUMBER}</p>
  </div>
</body>
</html>
  `;

  GmailApp.sendEmail(
    data.email,
    CONFIG.EMAIL_SUBJECT_CALM,
    plainBody,
    {
      htmlBody: htmlBody,
      name: CONFIG.FROM_NAME,
      attachments: [pdfFile.getBlob()]
    }
  );

  Logger.log('CALM email with PDF sent to: ' + data.email);
}

function authorizeDrive() {
  DriveApp.getRootFolder();
  Logger.log('Drive authorized!');
}
