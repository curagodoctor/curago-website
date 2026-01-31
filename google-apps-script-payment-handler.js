// ============================================================
// UPDATED: Razorpay webhook with duplicate detection & amount-based routing
// ============================================================
// GBSI: ₹50 | CALA: ₹150
// ============================================================

const CONFIG = {
  // Email settings
  SUPPORT_EMAIL: 'curagodoctor@gmail.com',
  COMPANY_NAME: 'CuraGo',
  COMPANY_WEBSITE: 'https://curago.in',
  WHATSAPP_NUMBER: '+917021227203',

  // GBSI Assessment (₹50)
  GBSI: {
    AMOUNT: 5000,  // ₹50 in paise
    UUID: 'gbsi-2024-f3c9b8e4-a2d4-4c6a-9f21-8c7e5b2d1a94',
    BASE_URL: 'https://curago.in/gbsi/quiz',
    SHEET_NAME: 'GBSI Payment Sheet',
    ASSESSMENT_NAME: 'GBSI Assessment',
    ASSESSMENT_FULL_NAME: 'Gut-Brain Sensitivity Index',
    COMPLETION_TIME: '10-15 minutes'
  },

  // CALA Assessment (₹150)
  CALA: {
    AMOUNT: 15000,  // ₹150 in paise
    UUID: '7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94',
    BASE_URL: 'https://curago.in/cala/quiz',
    SHEET_NAME: 'CALA Payment Sheet',
    ASSESSMENT_NAME: 'CALA 1.0 Assessment',
    ASSESSMENT_FULL_NAME: 'Clinical Anxiety Loop Assessment',
    COMPLETION_TIME: '10-15 minutes'
  }
};

// ============================================================
// DUPLICATE DETECTION - Check if payment_id already exists
// ============================================================
function isDuplicatePayment(sheet, paymentId) {
  try {
    var data = sheet.getDataRange().getValues();

    // Skip header row, check column C (index 2) which contains payment_id
    for (var i = 1; i < data.length; i++) {
      if (data[i][2] === paymentId) {
        Logger.log('⚠️ Duplicate payment detected: ' + paymentId);
        return true;
      }
    }

    return false;
  } catch (error) {
    Logger.log('Error checking duplicate: ' + error.toString());
    return false;
  }
}

// ============================================================
// MAIN WEBHOOK HANDLER
// ============================================================
function doPost(e) {
  try {
    // 1. Parse the incoming Razorpay payload
    var data = JSON.parse(e.postData.contents);
    var payment = data.payload.payment.entity;

    Logger.log('📥 Received payment webhook: ' + payment.id);
    Logger.log('Amount (paise): ' + payment.amount);

    // 2. Determine assessment type based on amount
    var assessmentConfig = null;
    var assessmentType = '';

    if (payment.amount === CONFIG.GBSI.AMOUNT) {
      assessmentConfig = CONFIG.GBSI;
      assessmentType = 'GBSI';
      Logger.log('✅ Detected GBSI payment (₹50)');
    } else if (payment.amount === CONFIG.CALA.AMOUNT) {
      assessmentConfig = CONFIG.CALA;
      assessmentType = 'CALA';
      Logger.log('✅ Detected CALA payment (₹150)');
    } else {
      // Unknown amount - log error
      Logger.log('❌ Unknown payment amount: ₹' + (payment.amount / 100));
      var errorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Error Log');
      if (!errorSheet) {
        errorSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Error Log');
      }
      errorSheet.appendRow([
        new Date(),
        payment.id,
        payment.amount / 100,
        'Unknown payment amount',
        payment.email || 'N/A'
      ]);
      return ContentService.createTextOutput("Unknown amount").setMimeType(ContentService.MimeType.TEXT);
    }

    // 3. Get the appropriate sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(assessmentConfig.SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      Logger.log('⚠️ Sheet not found, creating: ' + assessmentConfig.SHEET_NAME);
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(assessmentConfig.SHEET_NAME);
      // Add headers
      sheet.appendRow([
        'Timestamp',
        'Order ID',
        'Payment ID',
        'Email',
        'Contact',
        'Amount (₹)',
        'City',
        'WhatsApp',
        'Invoice Sent',
        'Test Link Sent'
      ]);
    }

    // 4. CHECK FOR DUPLICATE - If exists, skip processing
    if (isDuplicatePayment(sheet, payment.id)) {
      Logger.log('🚫 Duplicate payment, skipping: ' + payment.id);
      return ContentService.createTextOutput("Duplicate").setMimeType(ContentService.MimeType.TEXT);
    }

    // 5. Convert Paise to Rupees
    var amountInRupees = payment.amount / 100;

    // 6. Prepare payment data
    var paymentData = {
      timestamp: new Date(),
      orderId: payment.order_id || "N/A",
      paymentId: payment.id,
      email: payment.email,
      contact: payment.contact,
      amount: amountInRupees,
      city: (payment.notes && payment.notes.city) ? payment.notes.city : "",
      whatsapp: (payment.notes && payment.notes.whatsapp) ? payment.notes.whatsapp : "",
      method: payment.method || "online",
      status: payment.status
    };

    // 7. Build test link
    var testLink = assessmentConfig.BASE_URL +
                   '?uuid=' + assessmentConfig.UUID +
                   '&payment_id=' + payment.id;

    // 8. Send email with invoice and test link
    var emailStatus = "No";
    if (payment.email && payment.email.trim() !== '') {
      try {
        sendPaymentEmail(paymentData, testLink, assessmentConfig);
        emailStatus = "Yes";
        Logger.log('✅ Email sent to: ' + payment.email);
      } catch (emailError) {
        emailStatus = "Failed";
        Logger.log('❌ Email error: ' + emailError.toString());
      }
    } else {
      emailStatus = "No Email";
      Logger.log('⚠️ No email address provided');
    }

    // 9. Save to Google Sheet
    var rowData = [
      paymentData.timestamp,
      paymentData.orderId,
      paymentData.paymentId,
      paymentData.email,
      paymentData.contact,
      paymentData.amount,
      paymentData.city,
      paymentData.whatsapp,
      emailStatus,      // Invoice Sent
      emailStatus       // Test Link Sent
    ];

    sheet.appendRow(rowData);
    Logger.log('✅ Payment saved to sheet: ' + assessmentConfig.SHEET_NAME);

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    // Log error
    Logger.log('❌ doPost error: ' + error.toString());
    var errorSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    errorSheet.appendRow([new Date(), "ERROR", error.message, error.toString()]);

    return ContentService.createTextOutput("Error: " + error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

// ============================================================
// SEND EMAIL WITH INVOICE (HTML) - DYNAMIC CONTENT
// ============================================================
function sendPaymentEmail(paymentData, testLink, assessmentConfig) {
  var invoiceDate = Utilities.formatDate(paymentData.timestamp, 'Asia/Kolkata', 'dd MMM yyyy');
  var invoiceTime = Utilities.formatDate(paymentData.timestamp, 'Asia/Kolkata', 'hh:mm a');
  var invoiceNumber = 'INV-' + paymentData.paymentId.toUpperCase();

  // Plain text version
  var plainBody =
`Hi there!

Thank you for your payment of ₹${paymentData.amount} for the CuraGo ${assessmentConfig.ASSESSMENT_NAME}.

PAYMENT CONFIRMATION:
- Invoice #: ${invoiceNumber}
- Payment ID: ${paymentData.paymentId}
- Amount: ₹${paymentData.amount}
- Status: SUCCESSFUL
- Date: ${invoiceDate} at ${invoiceTime}

YOUR SECURE ACCESS LINK:
${testLink}

Use the secure link above to sign in to the test.

IMPORTANT INFORMATION:
- Valid for ONE assessment only
- Takes ${assessmentConfig.COMPLETION_TIME} to complete
- Results will be generated immediately upon completion

Need help?
Email: ${CONFIG.SUPPORT_EMAIL}
WhatsApp: ${CONFIG.WHATSAPP_NUMBER}
Website: ${CONFIG.COMPANY_WEBSITE}

Best regards,
CuraGo Team`;

  // HTML version - CLEAN PROFESSIONAL TEMPLATE
  var htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #000000;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .email-container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      background: #000000;
      color: #ffffff;
      padding: 30px;
      text-align: center;
      border-bottom: 3px solid #000000;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    /* INVOICE BOX */
    .invoice-box {
      border: 2px solid #000000;
      padding: 30px;
      margin: 30px 0;
    }
    .invoice-title {
      text-align: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .invoice-title h2 {
      margin: 0 0 8px 0;
      color: #000000;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .invoice-title p {
      margin: 4px 0;
      color: #555555;
      font-size: 13px;
    }
    .invoice-info {
      margin: 25px 0;
    }
    .invoice-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eeeeee;
    }
    .invoice-label {
      font-weight: 700;
      color: #000000;
      width: 35%;
    }
    .invoice-value {
      color: #333333;
      width: 65%;
      text-align: right;
    }
    .invoice-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
      border: 1px solid #000000;
    }
    .invoice-table th {
      background: #000000;
      color: #ffffff;
      padding: 15px;
      text-align: left;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-table td {
      padding: 15px;
      border-bottom: 1px solid #dddddd;
      font-size: 14px;
    }
    .invoice-table .total-row {
      background: #f5f5f5;
      font-weight: 700;
      font-size: 17px;
      border-top: 2px solid #000000;
    }
    .payment-status {
      background: #f5f5f5;
      border: 2px solid #000000;
      padding: 15px;
      text-align: center;
      font-weight: 700;
      margin-top: 20px;
      font-size: 14px;
      letter-spacing: 0.5px;
    }

    /* CTA BUTTON */
    .cta-section {
      background: #000000;
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
      margin: 35px 0;
    }
    .cta-section h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .cta-section p {
      margin: 0 0 20px 0;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background: #ffffff;
      color: #000000;
      padding: 16px 50px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
      border: 2px solid #ffffff;
      margin-bottom: 15px;
    }
    .cta-section .helper-text {
      margin-top: 15px;
      font-size: 13px;
      opacity: 0.9;
      font-style: italic;
    }

    /* IMPORTANT BOX */
    .important-box {
      background: #f9f9f9;
      border: 2px solid #000000;
      padding: 25px;
      margin: 30px 0;
    }
    .important-box h3 {
      margin: 0 0 15px 0;
      color: #000000;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* SUPPORT SECTION */
    .support-section {
      background: #f9f9f9;
      border: 1px solid #dddddd;
      padding: 25px;
      margin: 30px 0;
    }
    .support-section h4 {
      margin: 0 0 15px 0;
      color: #000000;
      font-size: 16px;
      font-weight: 700;
    }
    .support-section a {
      color: #000000;
      text-decoration: underline;
      font-weight: 600;
    }
    .support-item {
      margin: 10px 0;
      padding: 5px 0;
    }

    /* FOOTER */
    .footer {
      background: #f5f5f5;
      text-align: center;
      padding: 30px;
      border-top: 2px solid #000000;
      color: #666666;
      font-size: 13px;
    }
    .footer strong {
      color: #000000;
    }
  </style>
</head>
<body>
  <div class="email-container">

    <!-- Header -->
    <div class="header">
      <h1>PAYMENT CONFIRMATION</h1>
      <p>${assessmentConfig.ASSESSMENT_NAME} Access</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Dear Customer,</p>
      <p>Thank you for your payment. Your ${assessmentConfig.ASSESSMENT_NAME} (${assessmentConfig.ASSESSMENT_FULL_NAME}) access has been confirmed.</p>

      <!-- INVOICE -->
      <div class="invoice-box">
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p>${CONFIG.COMPANY_NAME}</p>
          <p>Invoice Number: ${invoiceNumber}</p>
        </div>

        <div class="invoice-info">
          <div class="invoice-row">
            <div class="invoice-label">Billed To</div>
            <div class="invoice-value">${paymentData.email}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">Invoice Date</div>
            <div class="invoice-value">${invoiceDate} at ${invoiceTime}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">Transaction ID</div>
            <div class="invoice-value" style="font-size: 11px; word-break: break-all;">${paymentData.paymentId}</div>
          </div>
          ${paymentData.contact ? '<div class="invoice-row"><div class="invoice-label">Contact Number</div><div class="invoice-value">' + paymentData.contact + '</div></div>' : ''}
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th style="text-align: center; width: 60px;">QTY</th>
              <th style="text-align: right; width: 120px;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${assessmentConfig.ASSESSMENT_NAME}</strong><br>
                <span style="color: #666; font-size: 12px;">${assessmentConfig.ASSESSMENT_FULL_NAME}</span>
              </td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">₹${paymentData.amount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2" style="text-align: right; padding-right: 15px;">TOTAL PAID</td>
              <td style="text-align: right;">₹${paymentData.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="payment-status">
          PAYMENT STATUS: SUCCESSFUL (${paymentData.method.toUpperCase()})
        </div>
      </div>

      <!-- CTA -->
      <div class="cta-section">
        <h3>ACCESS YOUR ASSESSMENT</h3>
        <p>Click the button below to begin your assessment</p>
        <a href="${testLink}" class="cta-button">Start Assessment</a>
        <p class="helper-text">Use the secure link above to sign in to the test</p>
      </div>

      <!-- IMPORTANT INFORMATION -->
      <div class="important-box">
        <h3>Important Information</h3>
        <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.9;">
          <li>Assessment link is valid for one-time use only</li>
          <li>Expected completion time: ${assessmentConfig.COMPLETION_TIME}</li>
          <li>Results will be generated immediately upon completion</li>
          <li>Save this email for your records</li>
        </ul>
      </div>

      <!-- SUPPORT -->
      <div class="support-section">
        <h4>Customer Support</h4>
        <div class="support-item">
          <strong>Email:</strong> <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a>
        </div>
        <div class="support-item">
          <strong>WhatsApp:</strong> <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/\+/g, '')}">${CONFIG.WHATSAPP_NUMBER}</a>
        </div>
        <div class="support-item">
          <strong>Website:</strong> <a href="${CONFIG.COMPANY_WEBSITE}">${CONFIG.COMPANY_WEBSITE}</a>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>${CONFIG.COMPANY_NAME}</strong></p>
      <p>Mental Wellness Solutions</p>
      <p style="margin-top: 15px;">${CONFIG.COMPANY_WEBSITE}</p>
      <p style="margin-top: 15px; font-size: 11px; color: #999999;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  // Send email
  GmailApp.sendEmail(
    paymentData.email,
    'Your CuraGo ' + assessmentConfig.ASSESSMENT_NAME + ' - Invoice & Access Link',
    plainBody,
    {
      htmlBody: htmlBody,
      name: 'CuraGo Team'
    }
  );
}

// ============================================================
// TEST FUNCTIONS
// ============================================================

// Test GBSI email (₹50)
function testGbsiEmail() {
  var testPaymentData = {
    timestamp: new Date(),
    orderId: 'order_gbsi_test123',
    paymentId: 'pay_gbsi_test456ABC',
    email: 'raghavendra@doctorite.ai', // ⚠️ CHANGE THIS TO YOUR EMAIL
    contact: '+919876543210',
    amount: 50,
    city: 'Bangalore',
    whatsapp: '+919876543210',
    method: 'card',
    status: 'captured'
  };

  var testLink = CONFIG.GBSI.BASE_URL +
                 '?uuid=' + CONFIG.GBSI.UUID +
                 '&payment_id=' + testPaymentData.paymentId;

  sendPaymentEmail(testPaymentData, testLink, CONFIG.GBSI);

  Logger.log('✅ GBSI test email sent to: ' + testPaymentData.email);
  Logger.log('Test link: ' + testLink);
}

// Test CALA email (₹150)
function testCalaEmail() {
  var testPaymentData = {
    timestamp: new Date(),
    orderId: 'order_cala_test123',
    paymentId: 'pay_cala_test456ABC',
    email: 'raghavendra@doctorite.ai', // ⚠️ CHANGE THIS TO YOUR EMAIL
    contact: '+919876543210',
    amount: 150,
    city: 'Bangalore',
    whatsapp: '+919876543210',
    method: 'upi',
    status: 'captured'
  };

  var testLink = CONFIG.CALA.BASE_URL +
                 '?uuid=' + CONFIG.CALA.UUID +
                 '&payment_id=' + testPaymentData.paymentId;

  sendPaymentEmail(testPaymentData, testLink, CONFIG.CALA);

  Logger.log('✅ CALA test email sent to: ' + testPaymentData.email);
  Logger.log('Test link: ' + testLink);
}
